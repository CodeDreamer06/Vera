"use client";

import type { ReactNode } from "react";
import { Component } from "react";

import { ErrorCard } from "@/components/ui/ErrorCard";

interface Props {
  panel: string;
  plantId?: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: unknown;
}

export class PanelErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // noop for hackathon scope
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorCard
          error={this.state.error}
          context={{ panel: this.props.panel, plantId: this.props.plantId }}
          onRetry={() => this.setState({ hasError: false, error: null })}
          onReopen={() => this.setState({ hasError: false, error: null })}
          onReset={async () => {
            const { repository } = await import("@/lib/storage/repository");
            await repository.clearAll();
            window.location.reload();
          }}
        />
      );
    }

    return this.props.children;
  }
}
