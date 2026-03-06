import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  action: z.enum(["status", "distance"]).optional(),
});

const commandSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("toggleRelay") }),
  z.object({
    action: z.literal("setOnTime"),
    value: z.number().int().min(1),
  }),
  z.object({
    action: z.literal("setOffTime"),
    value: z.number().int().min(1),
  }),
  z.object({ action: z.literal("distance") }),
]);

const timeoutMs = Number(process.env.ESP8266_TIMEOUT_MS ?? 2500);
const distancePath = process.env.ESP8266_DISTANCE_PATH ?? "/distance";

const getBaseUrl = () => {
  const baseUrl = process.env.ESP8266_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error("ESP8266_BASE_URL is not configured");
  }

  return baseUrl.replace(/\/$/, "");
};

const parseNumberFromText = (text: string): number | null => {
  const match = text.match(/-?\d+(?:\.\d+)?/);
  if (!match) {
    return null;
  }

  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
};

const callEsp = async (path: string) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await response.text();
    return { ok: response.ok, status: response.status, text };
  } finally {
    clearTimeout(timer);
  }
};

const fetchDistance = async () => {
  const result = await callEsp(distancePath);
  if (!result.ok) {
    throw new Error(`distance request failed with ${result.status}`);
  }

  const value = parseNumberFromText(result.text);
  if (value === null) {
    throw new Error("distance endpoint returned non-numeric payload");
  }

  return value;
};

const fetchStatus = async () => {
  try {
    const ping = await callEsp("/");
    return {
      connected: true,
      httpStatus: ping.status,
      configured: true,
    };
  } catch {
    return {
      connected: false,
      configured: true,
    };
  }
};

export async function GET(request: Request) {
  try {
    getBaseUrl();
  } catch {
    return NextResponse.json({ configured: false, connected: false });
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.parse({
      action: searchParams.get("action") ?? undefined,
    });

    if (parsed.action === "distance") {
      const distanceCm = await fetchDistance();
      return NextResponse.json({
        configured: true,
        connected: true,
        distanceCm,
      });
    }

    const status = await fetchStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        connected: false,
        error: (error as Error).message,
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  try {
    getBaseUrl();
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const parsed = commandSchema.parse(body);

    if (parsed.action === "toggleRelay") {
      const result = await callEsp("/relaySwitch");
      if (!result.ok) {
        throw new Error(`relay toggle failed with ${result.status}`);
      }

      return NextResponse.json({
        ok: true,
        relayRaw: result.text,
        relayState: result.text.trim().toUpperCase() === "ON",
      });
    }

    if (parsed.action === "setOnTime") {
      const result = await callEsp(`/changeOnTime?val=${parsed.value}`);
      if (!result.ok) {
        throw new Error(`setOnTime failed with ${result.status}`);
      }
      return NextResponse.json({ ok: true, response: result.text });
    }

    if (parsed.action === "setOffTime") {
      const result = await callEsp(`/changeOffTime?val=${parsed.value}`);
      if (!result.ok) {
        throw new Error(`setOffTime failed with ${result.status}`);
      }
      return NextResponse.json({ ok: true, response: result.text });
    }

    const distanceCm = await fetchDistance();
    return NextResponse.json({ ok: true, distanceCm });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 502 },
    );
  }
}
