import { Typography } from '@mui/material';
import { ExternalLink } from 'lucide-react';

export default function ConsultaCRM() {
  return (
    <div>
      <div className="mb-6">
        <Typography variant="h4" gutterBottom>Consulta CRM</Typography>
        <Typography variant="body2" color="text.secondary">
          Consulte médicos no portal do CREMERJ
        </Typography>
      </div>

      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <ExternalLink size={14} className="text-slate-400" strokeWidth={1.5} />
            <Typography variant="caption" color="text.secondary">
              portal.cremerj.org.br
            </Typography>
          </div>
        </div>
        <webview
          src="https://portal.cremerj.org.br/busca-medicos"
          style={{ width: '100%', height: 'calc(100vh - 280px)', minHeight: 500 }}
        />
      </div>
    </div>
  );
}
