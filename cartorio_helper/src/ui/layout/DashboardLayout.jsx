import React from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import FileUploadTable from '../components/FileUploadTable';
import TextFormatter from '../components/TextFormatter';
import ConsultaCRM from '../components/ConsultaCRM';
import styles from './DashboardLayout.module.css';

function DashboardLayout() {
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1>Cartório Helper Dashboard</h1>
      </div>
      <div className={styles.dashboardContent}>
        <TabView>
          <TabPanel header="Upload de Arquivos">
            <FileUploadTable />
          </TabPanel>
          <TabPanel header="Formatador de Texto">
            <TextFormatter />
          </TabPanel>
          <TabPanel header="Consulta CRM">
            <ConsultaCRM />
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
}

export default DashboardLayout;
