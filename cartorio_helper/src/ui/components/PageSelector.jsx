import { Button } from "primereact/button";
import { Link } from 'react-router-dom';

function PageSelector() {
    return (
        <div>
            <h2>Selecione a página</h2>
            <div>
                <PageSelectorButton label="Upload de Arquivos" to="/upload" />
                <PageSelectorButton label="Formatador de Texto" to="/formatter" />
                <PageSelectorButton label="Consulta CRM" to="/consulta" />
            </div>
        </div>
    );
}

function PageSelectorButton({ label, to }) {
    return (
        <Link to={to}>
            <Button label={label} />
        </Link>
    );
}

export default PageSelector;
