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
  Calendar,
  PieChart,
  Crown,
  Shield,
  ArrowRight,
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
      name: "PDF Reports",
      path: "/download-pdf",
      icon: FileText,
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
          badge: "Beta",
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
        <span className="truncate flex-1">{item.name}</span>
        {item.badge && (
          <span className="ml-auto px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-md">
            {item.badge}
          </span>
        )}
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

        {/* Promotional Card */}
        {isAdmin() ? (
          <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800 border border-indigo-100 dark:border-indigo-800/30 flex flex-col items-center text-center shadow-sm">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 shadow-sm border border-indigo-50 dark:border-gray-700 relative">
               <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
               <div className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
              Upgrade to Pro
            </h4>
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-3">
              Unlock advanced insights and powerful features.
            </p>
            <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1">
              Upgrade Now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800 border border-indigo-100 dark:border-indigo-800/30 flex flex-col items-center text-center shadow-sm">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 shadow-sm border border-indigo-50 dark:border-gray-700">
              {location.pathname.includes('/download-pdf') ? (
                <PieChart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              ) : location.pathname.includes('/profile') ? (
                <Crown className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
              ) : (
                <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
              {location.pathname.includes('/leave') ? 'Need time off?' : location.pathname.includes('/download-pdf') ? 'Go Pro with Reports' : location.pathname.includes('/profile') ? 'Go Premium' : 'Stay Consistent'}
            </h4>
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-3">
              {location.pathname.includes('/leave') ? 'Submit your leave request in just a few clicks.' : location.pathname.includes('/download-pdf') ? 'Unlock advanced insights and custom reports.' : location.pathname.includes('/profile') ? 'Unlock advanced features and reports.' : 'Good attendance today builds a better tomorrow.'}
            </p>
            <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1">
              {location.pathname.includes('/leave') ? 'Apply for Leave' : location.pathname.includes('/download-pdf') ? 'Upgrade Now' : location.pathname.includes('/profile') ? 'Upgrade Now' : 'View Insights'}
            </button>
          </div>
        )}

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
