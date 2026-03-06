#!/usr/bin/env python3
import argparse
import base64
import io
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image


def load_interpreter(model_path: Path):
    try:
        from tflite_runtime.interpreter import Interpreter  # type: ignore
    except ImportError:
        from tensorflow.lite.python.interpreter import Interpreter  # type: ignore

    interpreter = Interpreter(model_path=str(model_path))
    interpreter.allocate_tensors()
    return interpreter


def decode_input_image(image_data: str) -> Image.Image:
    if image_data.startswith("data:image"):
        try:
            image_data = image_data.split(",", 1)[1]
        except IndexError as exc:
            raise ValueError("invalid-data-url") from exc

    try:
        raw = base64.b64decode(image_data, validate=True)
    except Exception as exc:
        raise ValueError("invalid-image-base64") from exc

    try:
        image = Image.open(io.BytesIO(raw))
        return image.convert("RGB")
    except Exception as exc:
        raise ValueError("invalid-image-bytes") from exc


def preprocess(image: Image.Image, input_details):
    _, height, width, channels = input_details["shape"]
    if channels != 3:
        raise ValueError("unsupported-input-channels")

    resized = image.resize((int(width), int(height)))
    input_dtype = np.dtype(input_details["dtype"])
    array = np.asarray(resized)

    if input_dtype == np.float32:
        array = array.astype(np.float32) / 255.0
    elif input_dtype == np.uint8:
        array = array.astype(np.uint8)
    else:
        raise ValueError(f"unsupported-input-dtype:{input_dtype}")

    return np.expand_dims(array, axis=0)


def dequantize_output(scores: np.ndarray, output_details):
    quant_scale, quant_zero_point = output_details.get("quantization", (0.0, 0))
    if quant_scale and scores.dtype != np.float32:
        return quant_scale * (scores.astype(np.float32) - quant_zero_point)
    return scores.astype(np.float32)


def run(args):
    model_path = Path(args.model).expanduser().resolve()
    labels_path = Path(args.labels).expanduser().resolve()

    if not model_path.exists():
        raise FileNotFoundError(f"missing-model:{model_path}")
    if not labels_path.exists():
        raise FileNotFoundError(f"missing-labels:{labels_path}")

    payload = json.load(sys.stdin)
    image_data = payload.get("imageDataUrlOrBlobKey")
    if not isinstance(image_data, str) or not image_data:
        raise ValueError("missing-imageDataUrlOrBlobKey")

    with labels_path.open("r", encoding="utf-8") as f:
        labels = [line.strip() for line in f if line.strip()]
    if not labels:
        raise ValueError("empty-labels-file")

    interpreter = load_interpreter(model_path)
    input_details = interpreter.get_input_details()[0]
    output_details = interpreter.get_output_details()[0]

    image = decode_input_image(image_data)
    model_input = preprocess(image, input_details)

    interpreter.set_tensor(input_details["index"], model_input)
    interpreter.invoke()

    output = interpreter.get_tensor(output_details["index"])
    if output.ndim < 2:
        raise ValueError("unexpected-output-shape")
    scores = dequantize_output(output[0], output_details)

    top_k = max(1, int(args.top_k))
    top_indices = np.argsort(scores)[::-1][:top_k]

    results = []
    for index in top_indices:
        idx = int(index)
        confidence = float(scores[idx])
        confidence = max(0.0, min(1.0, confidence))
        label = labels[idx] if idx < len(labels) else f"class_{idx}"
        results.append({"label": label, "confidence": confidence})

    prediction = {
        "label": results[0]["label"],
        "confidence": results[0]["confidence"],
        "topPredictions": results,
    }
    print(json.dumps(prediction))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True)
    parser.add_argument("--labels", required=True)
    parser.add_argument("--top-k", type=int, default=3)
    args = parser.parse_args()

    try:
        run(args)
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
