import { Component, type ReactNode } from "react";

interface Props {
  fallback?: (error: Error, reset: () => void) => ReactNode;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      const { fallback } = this.props;
      if (fallback) return fallback(this.state.error, this.reset);
      return (
        <div className="h-screen w-screen bg-[#0A0A0F] text-[#E8E0D0] flex flex-col items-center justify-center gap-6 p-8">
          <h1 className="font-display text-4xl tracking-wide">
            Something broke
          </h1>
          <p className="text-[11px] uppercase tracking-[0.32em] text-[#9a9286] max-w-md text-center">
            {this.state.error.message ||
              "Your browser may have disabled WebGL or run out of memory."}
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="px-6 py-3 rounded-full bg-[#C9A96E] text-[#0A0A0F] text-[10px] uppercase tracking-[0.32em] font-medium"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
