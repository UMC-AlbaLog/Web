import { NavLink } from "react-router-dom";

const menus = [
  { name: "홈", path: "/" },
  { name: "스케줄", path: "/schedule" },
  { name: "수입", path: "/income" },
  { name: "아르바이트", path: "/jobs" },
  { name: "프로필", path: "/profile" },
  { name: "설정", path: "/settings" },
];

const Sidebar = () => {
  return (
    <aside className="w-56 bg-gray-600 text-white p-6">
      <ul className="space-y-5 text-sm">
        {menus.map((menu) => (
          <li key={menu.path}>
            <NavLink
              to={menu.path}
              className={({ isActive }) =>
                `block cursor-pointer ${
                  isActive
                    ? "text-yellow-300 font-bold"
                    : "hover:text-yellow-300"
                }`
              }
            >
              ● {menu.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
