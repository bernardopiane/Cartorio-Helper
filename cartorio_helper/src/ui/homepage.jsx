import React from 'react';
import FileUploadTable from './components/FileUploadTable';
import TextFormatter from './components/TextFormatter';
import ConsultaCRM from './components/ConsultaCRM';

function Homepage() {
  return (
    <div>
      <h1>Homepage</h1>

      <FileUploadTable />

      <TextFormatter />

      <ConsultaCRM />
    </div>
  );
}

export default Homepage;