import { Routes, Route } from "react-router-dom";
import LoginLanding from "./pages/LoginLanding";
import Signup from "./pages/Signup";
import OnboardingRegion from "./pages/OnboardingRegion";
import HomeLayout from "./layouts/HomeLayout";
import GlobalAuthGuard from "./components/GlobalAuthGuard";

import Home from "./pages/Home";

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-200">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Header />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<div>스케줄 페이지</div>} />
            <Route path="/income" element={<div>수입 페이지</div>} />
            <Route path="/jobs" element={<div>아르바이트 페이지</div>} />
            <Route path="/profile" element={<div>프로필 페이지</div>} />
            <Route path="/settings" element={<div>설정 페이지</div>} />
          </Routes>

        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
