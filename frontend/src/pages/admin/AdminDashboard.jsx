import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import Badge from "../../components/Badge";
import { dashboardAPI } from "../../utils/apiService";
import {
  Users,
  ClipboardCheck,
  FileText,
  Calendar,
  TrendingUp,
  AlertCircle,
  Activity,
  UserCheck,
  UserX,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const handleVisibilityChange = () => { if (!document.hidden) fetchDashboardData(); };
    const handleFocus = () => fetchDashboardData();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getAdminDashboard();
      const data = response.data.data;
      const totalStudents = data?.totalStudents || 0;
      const todayAttendance = Math.min(totalStudents, data?.todayAttendance || 0);
      setDashboardData({
        totalStudents,
        totalLeaves: data?.totalLeaveRequests || 0,
        todayAttendance,
        totalAbsent: data?.totalAbsent || 0,
        pendingLeaveRequests: data?.pendingLeaves || 0,
        overallAttendanceRate: Math.min(100, data?.overallAttendanceRate || 0),
        attendanceTrend: data?.attendanceTrend || [],
        departmentAttendance: data?.departmentAttendance || [],
        recentLeaves: data?.recentLeaves || [],
        todayAttendanceBySubject: data?.todayAttendanceBySubject || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardData({
        totalStudents: 0, totalLeaves: 0, todayAttendance: 0,
        totalAbsent: 0, pendingLeaveRequests: 0, overallAttendanceRate: 0,
        attendanceTrend: [], departmentAttendance: [], recentLeaves: [],
        todayAttendanceBySubject: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

  const getStatusBadge = (status) => {
    const variants = { pending: "warning", approved: "success", rejected: "danger" };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const rate = dashboardData?.overallAttendanceRate || 0;
  const rateLabel = rate >= 90 ? "Excellent" : rate >= 75 ? "Good" : rate >= 60 ? "Average" : "Poor";
  const rateVariant = rate >= 90 ? "success" : rate >= 75 ? "info" : rate >= 60 ? "warning" : "danger";

  const statCards = [
    {
      label: "Total Students",
      value: dashboardData?.totalStudents || 0,
      icon: Users,
      iconBg: "bg-indigo-50 dark:bg-indigo-900/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      sub: "Enrolled",
    },
    {
      label: "Present Today",
      value: dashboardData?.todayAttendance || 0,
      icon: UserCheck,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      sub: "All subjects",
    },
    {
      label: "Total Leaves",
      value: dashboardData?.totalLeaves || 0,
      icon: FileText,
      iconBg: "bg-amber-50 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      sub: "This month",
    },
    {
      label: "Pending Requests",
      value: dashboardData?.pendingLeaveRequests || 0,
      icon: AlertCircle,
      iconBg: "bg-red-50 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      sub: "Needs attention",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            System Active
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, iconBg, iconColor, sub }) => (
          <div key={label} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
              </div>
              <div className={`${iconBg} p-2.5 rounded-lg`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance overview row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall rate */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Overall Rate</h3>
            <Badge variant={rateVariant}>{rateLabel}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <svg className="w-20 h-20 -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="#e5e7eb" strokeWidth="7" fill="none" />
                <circle
                  cx="40" cy="40" r="34"
                  stroke={rate >= 75 ? "#10b981" : rate >= 60 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="7" fill="none"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - rate / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-bold text-gray-900 dark:text-white">{Math.round(rate)}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Today's attendance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData?.todayAttendance || 0}
                <span className="text-base font-normal text-gray-400 ml-1">
                  / {(dashboardData?.todayAttendance || 0) + (dashboardData?.totalAbsent || 0)}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                <span className="text-emerald-600 font-medium">{dashboardData?.todayAttendance || 0} present</span>
                {" · "}
                <span className="text-red-500 font-medium">{dashboardData?.totalAbsent || 0} absent</span>
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Target: 75%</span>
              <span className={`font-medium flex items-center gap-1 ${rate >= 75 ? "text-emerald-600" : "text-red-500"}`}>
                {rate >= 75 ? <TrendingUp className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {rate >= 75 ? `+${(rate - 75).toFixed(1)}% above` : `${(75 - rate).toFixed(1)}% below`}
              </span>
            </div>
          </div>
        </Card>

        {/* Leave stats */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Leave Summary</h3>
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {[
              { icon: Clock, label: "Pending", value: dashboardData?.pendingLeaveRequests || 0, color: "text-amber-500" },
              { icon: CheckCircle, label: "Approved", value: (dashboardData?.totalLeaves || 0) - (dashboardData?.pendingLeaveRequests || 0), color: "text-emerald-500" },
              { icon: FileText, label: "Total", value: dashboardData?.totalLeaves || 0, color: "text-gray-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Absent today */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Absent Today</h3>
            <UserX className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold text-red-600 dark:text-red-400">
              {dashboardData?.totalAbsent || 0}
            </p>
            <div className="mb-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">absence records</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">All subjects combined</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Absence rate</span>
              <span className="font-semibold text-red-500">
                {(dashboardData?.todayAttendance || 0) + (dashboardData?.totalAbsent || 0) > 0
                  ? (((dashboardData?.totalAbsent || 0) / ((dashboardData?.todayAttendance || 0) + (dashboardData?.totalAbsent || 0))) * 100).toFixed(1)
                  : "0.0"}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card
          className="lg:col-span-2"
          title="Weekly Attendance Trend"
          subtitle="Present vs absent over the last 7 days"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={dashboardData?.attendanceTrend?.map((day) => ({
                ...day,
                day: new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
              })) || []}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
                formatter={(value, name) => [value, name === "present" ? "Present" : "Absent"]}
              />
              <Legend iconType="circle" formatter={(v) => v === "present" ? "Present" : "Absent"} />
              <Bar dataKey="present" fill="url(#presentGrad)" radius={[4, 4, 0, 0]} maxBarSize={48} />
              <Bar dataKey="absent" fill="url(#absentGrad)" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Department Performance">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dashboardData?.departmentAttendance || []}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={85}
                paddingAngle={4} dataKey="value"
              >
                {(dashboardData?.departmentAttendance || []).map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {(dashboardData?.departmentAttendance || []).map((dept, idx) => (
              <div key={dept.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{dept.name}</span>
                </div>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">{dept.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Today's attendance by subject */}
      <Card
        title="Today's Attendance by Subject"
        subtitle={new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      >
        {(dashboardData?.todayAttendanceBySubject || []).length === 0 ? (
          <div className="text-center py-10">
            <ClipboardCheck className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No attendance recorded today</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Records will appear once teachers mark attendance</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(dashboardData?.todayAttendanceBySubject || []).map((subjectData, idx) => {
              const presentCount = Number(subjectData.present) || 0;
              const absentCount = Number(subjectData.absent) || 0;
              const totalCount = Number(subjectData.total) || 0;
              const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;
              const rateNum = parseFloat(attendanceRate);

              return (
                <div key={idx} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{subjectData.subject}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subjectData.teacher}</p>
                    </div>
                    <Badge variant={rateNum >= 75 ? "success" : rateNum >= 50 ? "warning" : "danger"}>
                      {attendanceRate}%
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Present</span>
                      <span className="font-semibold text-emerald-600">{presentCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Absent</span>
                      <span className="font-semibold text-red-600">{absentCount}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${rateNum >= 75 ? "bg-emerald-500" : rateNum >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${attendanceRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Recent leave requests */}
      <Card
        title="Recent Leave Requests"
        subtitle="Latest leave applications from students"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/leave-requests")}>
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        }
      >
        {(dashboardData?.recentLeaves || []).length === 0 ? (
          <div className="text-center py-10">
            <FileText className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No recent leave requests</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700 -mx-6">
            {(dashboardData?.recentLeaves || []).map((leave) => {
              const startDate = new Date(leave.startDate);
              const endDate = new Date(leave.endDate);
              const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
              const isPending = leave.status.toUpperCase() === "PENDING";

              return (
                <div key={leave.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {leave.studentName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{leave.studentName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
                        {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {" · "}{days} {days === 1 ? "day" : "days"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    {getStatusBadge(leave.status.toLowerCase())}
                    {isPending && (
                      <Button size="sm" onClick={() => navigate("/admin/leave-requests")}>
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Quick actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Manage Students", sub: "Add or edit students", icon: Users, path: "/admin/students", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
            { label: "Attendance", sub: "View records", icon: ClipboardCheck, path: "/admin/attendance", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
            { label: "Leave Requests", sub: `${dashboardData?.pendingLeaveRequests || 0} pending`, icon: FileText, path: "/admin/leave-requests", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30" },
            { label: "Settings", sub: "Configure system", icon: Activity, path: "/admin/settings", color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-700" },
          ].map(({ label, sub, icon: Icon, path, color, bg }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all group"
            >
              <div className={`${bg} w-9 h-9 rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
