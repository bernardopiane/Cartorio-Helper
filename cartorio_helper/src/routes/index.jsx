import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavigationLayout from '../layouts/NavigationLayout';
import FileUploadTable from '../pages/Upload';
import TextFormatter from '../pages/Formatter';
import ConsultaCRM from '../pages/Consulta';
import Dashboard from '../pages/Dashboard';
import Etiquetas from '../pages/Etiquetas';
import CertidaoExtractor from '../pages/Certidao';

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
