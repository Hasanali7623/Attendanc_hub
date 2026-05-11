import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  User,
  Users,
  BarChart3,
  Settings,
  X,
  Download,
  BookOpen,
  Sparkles,
  GraduationCap,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { isAdmin, user } = useAuth();

  const studentMenu = [
    {
      name: "Dashboard",
      path: "/student/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Attendance",
      path: "/student/attendance",
      icon: ClipboardCheck,
    },
    {
      name: "Leave Requests",
      path: "/student/leave",
      icon: FileText,
    },
    {
      name: "Download PDF",
      path: "/download-pdf",
      icon: Download,
    },
    {
      name: "AI Chatbot",
      path: "/ai-chatbot",
      icon: Sparkles,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: User,
    },
  ];

  const adminMenu = [
    {
      section: "Overview",
      items: [
        {
          name: "Dashboard",
          path: "/admin/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      section: "Management",
      items: [
        {
          name: "Students",
          path: "/admin/students",
          icon: Users,
        },
        {
          name: "Subjects",
          path: "/admin/subjects",
          icon: BookOpen,
        },
        {
          name: "Attendance Reports",
          path: "/admin/attendance",
          icon: ClipboardCheck,
        },
        {
          name: "Leave Requests",
          path: "/admin/leave-requests",
          icon: FileText,
        },
      ],
    },
    {
      section: "Tools",
      items: [
        {
          name: "AI Chatbot",
          path: "/ai-chatbot",
          icon: Sparkles,
        },
      ],
    },
    {
      section: "System",
      items: [
        {
          name: "Settings",
          path: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ item, onClick }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`
          relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
          transition-colors duration-150 group
          ${active
            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          }
        `}
      >
        {/* Active indicator bar */}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-600 dark:bg-indigo-400 rounded-full -ml-px" />
        )}
        <Icon
          className={`w-4 h-4 flex-shrink-0 ${active
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
            }`}
        />
        <span className="truncate">{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-60
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          z-40 flex flex-col
          transform transition-transform duration-250 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Smart Attendance
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          {isAdmin()
            ? adminMenu.map((section, idx) => (
              <div key={idx}>
                <p className="section-label px-3 mb-1.5">{section.section}</p>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <NavItem key={item.path} item={item} onClick={onClose} />
                  ))}
                </div>
              </div>
            ))
            : (
              <div className="space-y-0.5">
                {studentMenu.map((item) => (
                  <NavItem key={item.path} item={item} onClick={onClose} />
                ))}
              </div>
            )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                {user?.role?.toLowerCase()}
              </p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="Online" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
