import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import styles from './NavigationBar.module.css';

function NavigationBar() {
    return (
        <nav className={styles.navigationBar}>
            <div className={styles.logoContainer}>
                <h2 className="typography-h5">Cartório Helper</h2>
            </div>
            <div className={styles.navLinks}>
                <Link to="/" className="text-link">Dashboard</Link>
                <Link to="/upload" className="text-link">Upload de Arquivos</Link>
                <Link to="/formatter" className="text-link">Formatador de Texto</Link>
                <Link to="/consulta" className="text-link">Consulta CRM</Link>
            </div>
        </nav>
    );
}

export default NavigationBar;
