import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Home from "../pages/Home";
import Schedule from "../pages/Schedule";
import Income from "../pages/Income";
import Jobs from "../pages/Jobs";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";

const HomeLayout = () => {
  return (
    <div className="flex h-screen bg-gray-200">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header />

        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="income" element={<Income />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Routes>

      </div>
    </div>
  );
};

export default HomeLayout;
