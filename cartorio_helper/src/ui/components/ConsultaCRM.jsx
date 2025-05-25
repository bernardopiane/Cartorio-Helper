import React from 'react';

function ConsultaCRM() {
    return (
        <div id="consulta-crm" className="p-4 mt-4 border rounded">
            <h2 className="mb-3">Consulta CRM</h2>
            <div className="iframe-container" style={{ height: '600px', width: '100%' }}>
                <iframe
                    src="https://portal.cremerj.org.br/busca-medicos"
                    title="Consulta CRM"
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                />
            </div>
        </div>
    );
}

export default ConsultaCRM;
