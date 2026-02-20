import { Component } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/primitives/Button'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
  message: string
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    message: '',
  }

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unexpected error',
    }
  }

  componentDidCatch(error: unknown) {
    console.error('[ui.error-boundary]', error)
  }

  reset = () => {
    this.setState({ hasError: false, message: '' })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="min-h-[40vh] flex items-center justify-center px-4 py-10">
        <div className="card max-w-md w-full p-5 space-y-3">
          <h2 className="text-base font-semibold text-neutral-900">Something went wrong</h2>
          <p className="text-sm text-neutral-600">
            This screen hit an unexpected error. You can retry or return to dashboard.
          </p>
          {this.state.message && (
            <pre className="text-xs bg-neutral-50 border border-neutral-200 rounded p-2.5 text-neutral-600 overflow-auto">
              {this.state.message}
            </pre>
          )}
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={this.reset}>
              Retry screen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                this.reset()
                window.location.assign('/')
              }}
            >
              Go home
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
