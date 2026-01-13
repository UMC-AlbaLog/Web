import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const HomeLayout = () => {
  return (
    <div className="flex h-screen bg-gray-200">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default HomeLayout;