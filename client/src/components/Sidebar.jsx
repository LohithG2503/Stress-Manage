import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const employeeLinks = [
    { to: "/employee/dashboard", label: "Dashboard" },
    { to: "/employee/log", label: "Log Metrics" },
    { to: "/employee/history", label: "My History" },
  ];

  const hrLinks = [
    { to: "/hr/dashboard", label: "Dashboard" },
    { to: "/hr/employees", label: "All Employees" },
  ];

  const links = user?.role === "hr" ? hrLinks : employeeLinks;

  return (
    <aside className="fixed inset-y-0 left-0 w-64 glass shadow-2xl z-50 flex flex-col justify-between border-r border-white/5">
      <div>
        <div className="p-6 border-b border-white/5">
          <h1 className="text-2xl font-bold tracking-tight text-brand-400">
            StressManage
          </h1>
          <p className="text-sm text-white/60 mt-1 font-medium">
            Employee Wellness
          </p>
        </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 " +
              (isActive
                ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                : "text-white/60 hover:bg-white/5 hover:text-white")
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-white/60">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {user?.role === "hr" ? "Hr" : "Employee"}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/60 rounded-lg hover:bg-white/5 hover:text-white transition-all duration-200"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
