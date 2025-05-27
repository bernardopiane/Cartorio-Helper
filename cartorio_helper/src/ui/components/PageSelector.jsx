import { Button } from "primereact/button";
import { Link } from 'react-router-dom';

function PageSelector() {
    return (
        <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl font-medium text-gray-700">Selecione uma ferramenta</h2>
            <div className="flex gap-4">
                <PageSelectorButton 
                    label="Upload de Arquivos" 
                    to="/upload" 
                    icon="pi pi-upload" 
                    className="w-50"
                />
                <PageSelectorButton 
                    label="Formatador de Texto" 
                    to="/formatter" 
                    icon="pi pi-pencil" 
                    className="w-50"
                />
                <PageSelectorButton 
                    label="Consulta CRM" 
                    to="/consulta" 
                    icon="pi pi-search" 
                    className="w-50"
                />
            </div>
        </div>
    );
}

function PageSelectorButton({ label, to, icon, className }) {
    return (
        <Link to={to}>
            <Button 
                label={label} 
                icon={icon}
                className={`p-button-outlined p-button-lg ${className}`}
                style={{
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    transition: 'all 0.3s ease',
                    height: 'auto'
                }}
            />
        </Link>
    );
}

export default PageSelector;
