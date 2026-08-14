import { Component } from 'react';
import { Button, Typography } from '@mui/material';
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
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-500" strokeWidth={1.5} />
            </div>
            <Typography variant="h5" sx={{ mb: 1 }}>
              Algo deu errado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Ocorreu um erro inesperado. Tente recarregar a página ou voltar ao início.
            </Typography>
            {this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-left">
                <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#991b1b', wordBreak: 'break-all' }}>
                  {this.state.error.message}
                </Typography>
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="contained"
                startIcon={<RotateCcw size={16} />}
                onClick={this.handleReset}
              >
                Tentar novamente
              </Button>
              <Button
                variant="outlined"
                onClick={() => { this.handleReset(); window.location.hash = '#/dashboard'; }}
              >
                Voltar ao Início
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}