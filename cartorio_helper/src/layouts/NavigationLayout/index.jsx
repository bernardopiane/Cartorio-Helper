import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts.js";

function NavigationLayout() {
  useKeyboardShortcuts();

  return (
    <div className="h-full flex overflow-hidden bg-[var(--color-paper)]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <main id="main" className="flex-1 overflow-y-auto">
          <div className="px-8 py-7 2xl:px-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default NavigationLayout;
