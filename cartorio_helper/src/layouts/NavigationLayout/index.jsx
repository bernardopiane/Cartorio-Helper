import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

function NavigationLayout() {
  return (
    <div className="h-full flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default NavigationLayout;
