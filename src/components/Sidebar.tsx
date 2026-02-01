import { NavLink, useNavigate } from "react-router-dom";

const menus = [
  { name: "홈", path: "/home", icon: "tag" },
  { name: "스케줄", path: "/schedule", icon: "calendar" },
  { name: "수입", path: "/income", icon: "chart" },
  { name: "아르바이트", path: "/jobs", icon: "briefcase" },
  { name: "프로필", path: "/profile", icon: "person" },
  { name: "설정", path: "/settings", icon: "gear" },
];

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const c = className ?? "w-5 h-5";
  if (name === "tag")
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    );
  if (name === "calendar")
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  if (name === "chart")
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    );
  if (name === "briefcase")
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  if (name === "person")
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  if (name === "gear")
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 2.31.902 1.37 1.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.902 2.31-1.37 1.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-2.31-.902-1.37-1.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.902-2.31 1.37-1.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  return null;
};

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="w-64 px-6 pt-10 pb-8 bg-slate-100 shadow-[0px_4px_11px_0px_rgba(0,0,0,0.10)] border-r border-black/10 flex flex-col items-start">
      <div className="w-52 pb-12 flex flex-col justify-start items-center">
        <div className="w-44 inline-flex justify-start items-center gap-3">
          <div className="w-6 h-6 relative overflow-hidden shrink-0">
            <div className="absolute left-[2px] top-[7px] w-5 h-3.5 border-2 border-gray-900 rounded-sm" />
            <div className="absolute left-[8px] top-[3px] w-2 h-4 border-2 border-gray-900 rounded-sm" />
          </div>
          <span className="text-gray-900 text-xl font-bold font-['Pretendard']">알바로그</span>
        </div>
      </div>

      <nav className="w-52 flex-1 flex flex-col justify-start items-start gap-2">
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) =>
              `self-stretch h-12 py-3 rounded-xl inline-flex justify-start items-center gap-4 transition-colors font-['Pretendard'] ${
                menu.path === "/settings"
                  ? "px-5"
                  : "px-4"
              } ${
                isActive
                  ? "bg-indigo-600 text-white shadow-[0px_4px_12px_0px_rgba(59,130,246,0.25)] text-lg font-semibold"
                  : "text-gray-500 text-lg font-medium hover:bg-slate-200/60"
              } ${menu.path === "/settings" && !isActive ? "text-xl" : ""}`
            }
          >
            <Icon name={menu.icon} className={menu.path === "/schedule" ? "w-6 h-6 shrink-0" : "w-5 h-5 shrink-0"} />
            {menu.name}
          </NavLink>
        ))}
      </nav>

      <div className="w-52 px-4 py-3 inline-flex justify-start items-center gap-4">
        <div className="w-5 h-5 flex justify-center items-center shrink-0">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
        <button
          type="button"
          onClick={() => {
            sessionStorage.clear();
            navigate("/", { replace: true });
          }}
          className="justify-center text-slate-600 text-base font-medium font-['Pretendard'] hover:text-slate-800"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
