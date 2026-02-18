import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { SchedulesProvider } from "../contexts/SchedulesContext";

const HomeLayout = () => {
  return (
    <SchedulesProvider>
      <div className="flex h-screen bg-white">
        <Sidebar />

        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Header />

          <main className="flex-1 overflow-y-auto min-h-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SchedulesProvider>
  );
};

export default HomeLayout;