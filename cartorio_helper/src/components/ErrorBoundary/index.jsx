import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <div className="max-w-md w-full">
            <h1 className="text-[var(--color-ink)] text-[var(--text-display)] flex items-center gap-2">
              <AlertTriangle size={20} strokeWidth={1.75} aria-hidden="true" className="text-[var(--color-error)]" />
              Algo deu errado
            </h1>
            <p className="mt-1 text-[var(--text-sm)] text-[var(--color-muted)]">
              Ocorreu um erro inesperado nesta tela.
            </p>
            <p className="notice mt-4">
              {String(this.state.error)}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="btn" onClick={this.handleReset}>
                <RotateCcw size={15} strokeWidth={1.75} aria-hidden="true" />
                Tentar novamente
              </button>
              <button
                type="button"
                className="btn btn--quiet"
                onClick={() => { this.handleReset(); window.location.hash = '#/dashboard'; }}
              >
                Voltar para o início
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
