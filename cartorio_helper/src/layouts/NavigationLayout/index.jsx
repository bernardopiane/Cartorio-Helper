import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

function NavigationLayout() {
  return (
    <div className="h-full flex overflow-hidden bg-[var(--color-paper)]">
      <Sidebar />
      <main id="main" className="flex-1 overflow-y-auto">
        <div className="container px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default NavigationLayout;
