import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavigationLayout from '../ui/layout/NavigationLayout';
import FileUploadTable from '../ui/components/FileUploadTable';
import TextFormatter from '../ui/components/TextFormatter';
import ConsultaCRM from '../ui/components/ConsultaCRM';
import Dashboard from '../ui/components/Dashboard';
import Etiquetas from '../ui/components/Etiquetas';
import CertidaoExtractor from '../ui/components/CertidaoExtractor';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NavigationLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload" element={<FileUploadTable />} />
          <Route path="formatter" element={<TextFormatter />} />
          <Route path="consulta" element={<ConsultaCRM />} />
          <Route path="etiquetas" element={<Etiquetas />} />
          <Route path="certidao" element={<CertidaoExtractor />} />
        </Route>
      </Routes>

    </Router>
  );
};

export default AppRouter;
