import { Outlet } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import styles from "./NavigationLayout.module.css";

function NavigationLayout() {
    return (
        <div className={styles.container}>
            <NavigationBar />
            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    );
}

export default NavigationLayout;
