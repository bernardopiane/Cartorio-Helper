import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavigationLayout from '../layouts/NavigationLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import Dashboard from '../pages/Dashboard';
import FileUploadTable from '../pages/Upload';
import TextFormatter from '../pages/Formatter';
import ConsultaCRM from '../pages/Consulta';
import Etiquetas from '../pages/Etiquetas';
import CertidaoExtractor from '../pages/Certidao';
import NotFound from '../pages/NotFound';

const AppRouter = () => {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<NavigationLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="upload" element={<FileUploadTable />} />
            <Route path="formatter" element={<TextFormatter />} />
            <Route path="consulta" element={<ConsultaCRM />} />
            <Route path="etiquetas" element={<Etiquetas />} />
            <Route path="certidao" element={<CertidaoExtractor />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </Router>
  );
};

export default AppRouter;
