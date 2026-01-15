// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Profile from "./pages/profile/Profile";
import ProfileEdit from "./pages/profile/ProfileEdit";
import ProfileReviews from "./pages/profile/ProfileReviews";

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-200">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/schedule" element={<div>스케줄 페이지</div>} />
              <Route path="/income" element={<div>수입 페이지</div>} />
              <Route path="/jobs" element={<div>아르바이트 페이지</div>} />

              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<ProfileEdit />} />
              <Route path="/profile/reviews" element={<ProfileReviews />} />

              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
