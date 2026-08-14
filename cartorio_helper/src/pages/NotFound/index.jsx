import { useNavigate } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
          <FileQuestion size={32} className="text-indigo-500" strokeWidth={1.5} />
        </div>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          404
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Página não encontrada
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          A página que você está procurando não existe ou foi movida.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Home size={16} />}
          onClick={() => navigate('/dashboard')}
        >
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
}