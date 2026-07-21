import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography } from '@mui/material';
import { Upload, FileText, Search, Tags, FileBadge } from 'lucide-react';

const TOOLS = [
  { label: 'Upload de Arquivos', path: '/upload', icon: Upload, desc: 'Processar arquivos XML de remessa' },
  { label: 'Formatador de Texto', path: '/formatter', icon: FileText, desc: 'Limpar e formatar textos' },
  { label: 'Etiquetas', path: '/etiquetas', icon: Tags, desc: 'Gerar texto de averbação de CPF' },
  { label: 'Consulta CRM', path: '/consulta', icon: Search, desc: 'Consultar médicos no CRM' },
  { label: 'Leitor de Certidões', path: '/certidao', icon: FileBadge, desc: 'Extrair dados de certidões em PDF' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-8">
        <Typography variant="h4" gutterBottom>
          Início
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Selecione uma ferramenta para começar
        </Typography>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map(({ label, path, icon: IconComp, desc }) => (
          <Card
            key={path}
            onClick={() => navigate(path)}
            className="cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                <IconComp size={20} className="text-indigo-500" strokeWidth={1.5} />
              </div>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                {label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {desc}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
