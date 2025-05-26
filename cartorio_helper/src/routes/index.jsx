import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../ui/layout/DashboardLayout';
import FileUploadTable from '../ui/components/FileUploadTable';
import TextFormatter from '../ui/components/TextFormatter';
import ConsultaCRM from '../ui/components/ConsultaCRM';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/upload" replace />} />
          <Route path="upload" element={<FileUploadTable />} />
          <Route path="formatter" element={<TextFormatter />} />
          <Route path="consulta" element={<ConsultaCRM />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
