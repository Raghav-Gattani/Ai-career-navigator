import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-error/30 shadow-sm flex flex-col gap-3 my-4">
          <div className="flex items-center gap-2 text-error font-bold text-sm">
            <span className="material-symbols-outlined text-xl">error</span>
            <span>{this.props.title || 'Simulation Display Encountered An Issue'}</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {this.state.error?.message || 'A component error occurred while rendering the interactive visualization.'}
          </p>
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                this.props.onReset?.()
              }}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              <span>Recover & Reload</span>
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
