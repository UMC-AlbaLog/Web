import { Routes, Route } from "react-router-dom";
import LoginLanding from "./pages/LoginLanding";
import Signup from "./pages/Signup";
import OnboardingRegion from "./pages/OnboardingRegion";
import HomeLayout from "./layouts/HomeLayout";
import GlobalAuthGuard from "./components/GlobalAuthGuard";

import Home from "./pages/Home";
import Schedule from "./pages/Schedule";
import Income from "./pages/Income";
import Jobs from "./pages/Jobs";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ApplicationStatus from "./pages/ApplicationStatus";
import JobDetail from "./pages/JobDetail";

const App = () => {
  return (
    <GlobalAuthGuard>
      <Routes>
        {/* 로그인 전 */}
        <Route path="/" element={<LoginLanding />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<OnboardingRegion />} />

        <Route element={<HomeLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/income" element={<Income />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/jobs/status" element={<ApplicationStatus />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </GlobalAuthGuard>
  );
};

export default App;
