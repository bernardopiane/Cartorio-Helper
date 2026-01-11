import React from 'react';
import { Card } from 'primereact/card';
import styles from './styles.module.css';

function ConsultaCRM() {
    return (
        <div className={styles.consultaCRMContainer}>
            <Card title="Consulta CRM">
                <div className={styles.iframeContainer}>
                    <iframe
                        src="https://portal.cremerj.org.br/busca-medicos"
                        title="Consulta CRM"
                        className={styles.iframe}
                    />
                </div>
            </Card>
        </div>
    );
}

export default ConsultaCRM;
