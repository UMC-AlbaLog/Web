import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { SchedulesProvider } from "../contexts/SchedulesContext";

const HomeLayout = () => {
  const location = useLocation();
  const isSchedulePage = location.pathname === "/schedule";

  return (
    <SchedulesProvider>
      <div className="flex h-screen bg-white">
        <Sidebar />

        <div className="flex flex-col flex-1 overflow-hidden">
          {!isSchedulePage && <Header />}

          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SchedulesProvider>
  );
};

export default HomeLayout;