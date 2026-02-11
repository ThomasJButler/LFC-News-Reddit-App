/**
 * Error Boundary — catches JavaScript errors in the component tree.
 * Must be a class component (React requirement for getDerivedStateFromError).
 * Tailwind-styled fallback with recovery options.
 */

import React from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex items-center justify-center min-h-[400px] px-4 py-8"
        >
          <Card className={cn(
            'max-w-lg w-full',
            'border-destructive/20 bg-card/80 backdrop-blur-sm',
            'shadow-lg shadow-destructive/5',
          )}>
            <CardContent className="flex flex-col items-center text-center pt-8 pb-6 px-6">
              {/* Icon with warning pulse */}
              <div className={cn(
                'flex items-center justify-center',
                'w-16 h-16 mb-5 rounded-full',
                'bg-destructive/10 ring-1 ring-destructive/30',
              )}>
                <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
              </div>

              <h2 className="text-xl font-bold text-foreground mb-2 tracking-tight">
                Something went wrong
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
                We encountered an unexpected error. This has been logged and we&apos;ll look into it.
              </p>

              {/* Dev-only error details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="w-full mb-6 text-left">
                  <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    Error details (development only)
                  </summary>
                  <pre className={cn(
                    'mt-2 p-3 rounded-lg text-xs overflow-auto max-h-48',
                    'bg-secondary/50 text-muted-foreground font-mono',
                    'border border-border/50',
                  )}>
                    <strong>Error:</strong> {this.state.error.toString()}
                    {this.state.errorInfo && (
                      <>
                        {'\n\n'}
                        <strong>Component Stack:</strong>
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </details>
              )}

              <div className="flex items-center gap-3">
                <Button
                  onClick={this.handleReset}
                  variant="default"
                  className={cn(
                    'gap-2 font-semibold',
                    'shadow-md shadow-primary/20',
                    'active:scale-[0.97] transition-all',
                  )}
                  aria-label="Try to recover from the error"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="gap-2 active:scale-[0.97] transition-all"
                  aria-label="Reload the page"
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
