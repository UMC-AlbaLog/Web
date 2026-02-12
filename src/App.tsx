// App.tsx
import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import LoginLanding from "./pages/LoginLanding";
import Signup from "./pages/Signup";
import OnboardingRegion from "./pages/OnboardingRegion";

import HomeLayout from "./layouts/HomeLayout";
import GlobalAuthGuard from "./components/GlobalAuthGuard";

import Home from "./pages/Home";
import Schedule from "./pages/Schedule";
import Income from "./pages/Income";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import ApplicationStatusPage from "./pages/ApplicationStatus";
import ApplicationManagement from "./pages/ApplicationManagement";
import ReviewPage from "./pages/ReviewPage";
import Profile from "./pages/Profile";
import ProfileReviews from "./pages/ProfileReviews";
import ProfileEdit from "./pages/ProfileEdit";
import Settings from "./pages/Settings";
import SettlementHistory from "./pages/SettlementHistory";

const App = () => {
  return (
    <GlobalAuthGuard>
      <Routes>
        {/* 🌈 로그인 전 */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginLanding />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<OnboardingRegion />} />

        {/* 🔒 로그인 후 */}
        <Route element={<HomeLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/income" element={<Income />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/jobs/status" element={<ApplicationStatusPage />} />
          <Route path="/applications/manage" element={<ApplicationManagement />} />
          <Route path="/review/:jobId" element={<ReviewPage mode="write" />} />
          <Route path="/workplace/:workplaceId" element={<ReviewPage mode="view" />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/reviews" element={<ProfileReviews />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/settlement-history" element={<SettlementHistory />} />
        </Route>
      </Routes>
    </GlobalAuthGuard>
  );
};

export default App;
