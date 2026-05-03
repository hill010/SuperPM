"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-base flex items-center justify-center p-6">
          <div className="bg-surface rounded-2xl border border-border p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-error/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-error" />
            </div>
            <h1 className="text-xl font-bold text-text-primary mb-3">
              出错了
            </h1>
            <p className="text-sm text-text-secondary mb-6">
              {this.state.error?.message || "页面遇到了一些问题，请刷新重试。"}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}