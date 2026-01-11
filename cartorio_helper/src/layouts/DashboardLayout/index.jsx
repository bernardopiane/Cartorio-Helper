import React from 'react';
import styles from './styles.module.css';
import PageSelector from '../../components/PageSelector';
import { Outlet } from 'react-router-dom';

function DashboardLayout() {
  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <h1>Cartório Helper</h1>
        <p className={styles.subtitle}>Ferramentas para cartórios</p>
      </header>

      <main className={styles.dashboardContent}>
        <nav className={styles.pageSelector}>
          <PageSelector />
        </nav>
        <section className={styles.pageContent}>
          <Outlet />
        </section>
      </main>

      <footer className={styles.dashboardFooter}>
        <p>© 2025 Cartório Helper</p>
      </footer>
    </div>
  );
}

export default DashboardLayout;
