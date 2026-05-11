import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import Badge from "../../components/Badge";
import { dashboardAPI, attendanceAPI } from "../../utils/apiService";
import { ClipboardCheck, FileText, Download, BookOpen, CheckCircle, XCircle, ChevronRight, TrendingUp, Calendar, AlertCircle } from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [dailyAttendance, setDailyAttendance] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());

  useEffect(() => { 
    if (user?.id) { 
      fetchDashboardData(); 
      fetchMonthlyAttendance(); 
    } 
  }, [user, selectedMonth]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStudentDashboard(user.id);
      const data = response.data.data || {};
      const subjectWiseArray = data.subjectWiseAttendance
        ? Object.entries(data.subjectWiseAttendance).map(([subject, attendance]) => ({ subject, attendance }))
        : [];
      setDashboardData({ 
        attendancePercentage: data.attendancePercentage || 0, 
        totalPresent: data.totalPresent || 0, 
        totalAbsent: data.totalAbsent || 0, 
        totalLeaves: data.totalLeaveRequests || 0, 
        pendingLeaves: data.pendingLeaves || 0, 
        approvedLeaves: data.approvedLeaves || 0, 
        rejectedLeaves: data.rejectedLeaves || 0, 
        subjectWiseAttendance: subjectWiseArray 
      });
      await fetchDailyAttendance();
    } catch {
      setDashboardData({ attendancePercentage: 0, totalPresent: 0, totalAbsent: 0, totalLeaves: 0, pendingLeaves: 0, approvedLeaves: 0, rejectedLeaves: 0, subjectWiseAttendance: [] });
    } finally { 
      setLoading(false); 
    }
  };

  const fetchDailyAttendance = async () => {
    try {
      const response = await attendanceAPI.getMyAttendance(user.id);
      const records = response.data?.data || [];
      const cutoff = new Date(); 
      cutoff.setDate(cutoff.getDate() - 30);
      const filtered = records.filter((r) => new Date(r.date) >= cutoff);
      const map = {};
      filtered.forEach((r) => {
        if (!map[r.date]) map[r.date] = { date: r.date, present: 0, total: 0 };
        map[r.date].total++;
        if (r.status?.toLowerCase() === "present") map[r.date].present++;
      });
      const arr = Object.values(map)
        .map((d) => ({ 
          ...d, 
          absent: d.total - d.present,
          percentage: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0, 
          day: new Date(d.date).toLocaleDateString("en-US", { weekday: "short", day: "numeric" }) 
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7);
      setDailyAttendance(arr);
    } catch { 
      setDailyAttendance([]); 
    }
  };

  const fetchMonthlyAttendance = async () => {
    try {
      const response = await attendanceAPI.getMyAttendance(user.id);
      const all = response.data.data || [];
      setAttendanceHistory(all.filter((r) => { 
        const d = new Date(r.date); 
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear; 
      }));
    } catch { 
      setAttendanceHistory([]); 
    }
  };

  if (loading) return <Loader fullScreen />;

  const COLORS = ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed"];
  const rate = dashboardData?.attendancePercentage || 0;
  const total = (dashboardData?.totalPresent || 0) + (dashboardData?.totalAbsent || 0);
  const monthPresent = attendanceHistory.filter((a) => a.status?.toUpperCase() === "PRESENT").length;
  const monthAbsent = attendanceHistory.filter((a) => a.status?.toUpperCase() === "ABSENT").length;
  const monthRate = attendanceHistory.length > 0 ? Math.round((monthPresent / attendanceHistory.length) * 100) : 0;
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-8 animate-fade-in pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section - Enterprise Look */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-6 pt-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Student Portal</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
            {greeting()}, {user?.name || "Student"} | {new Date().toLocaleDateString("en-US", { weekday: "long", year: 'numeric', month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="shadow-sm border-gray-300 dark:border-gray-600" onClick={() => navigate("/student/attendance")}>
            <Calendar className="w-4 h-4 mr-2 text-gray-500" /> Attendance Records
          </Button>
          <Button className="shadow-sm bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate("/download-pdf")}>
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Overall Attendance", value: `${Math.round(rate)}%`, icon: TrendingUp, color: rate >= 75 ? "text-emerald-600" : "text-amber-600", bg: "bg-white dark:bg-gray-800", borderColor: rate >= 75 ? "border-emerald-200" : "border-amber-200" },
          { label: "Total Sessions", value: total, icon: BookOpen, color: "text-blue-600", bg: "bg-white dark:bg-gray-800", borderColor: "border-blue-200" },
          { label: "Sessions Attended", value: dashboardData?.totalPresent, icon: CheckCircle, color: "text-emerald-500", bg: "bg-white dark:bg-gray-800", borderColor: "border-emerald-100" },
          { label: "Leave Requests", value: dashboardData?.totalLeaves, icon: FileText, color: "text-purple-600", bg: "bg-white dark:bg-gray-800", borderColor: "border-purple-200" },
        ].map(({ label, value, icon: Icon, color, bg, borderColor }) => (
          <div key={label} className={`rounded-xl border ${borderColor} ${bg} shadow-sm overflow-hidden transition-all hover:shadow-md`}>
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-2">{value ?? 0}</p>
              </div>
              <div className={`p-3 rounded-full bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {dailyAttendance.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sessions Breakdown</h3>
                  <p className="text-sm text-gray-500">Classes attended vs missed (Past 7 days)</p>
                </div>
                <Badge variant="outline" className="text-indigo-600 border-indigo-200">Daily Breakdown</Badge>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dailyAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", fontSize: "13px", color: "#111827" }} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                  <Bar dataKey="present" name="Classes Attended" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} maxBarSize={40} />
                  <Bar dataKey="absent" name="Classes Missed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {(dashboardData?.subjectWiseAttendance || []).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Subject-wise Analytics</h3>
              <p className="text-sm text-gray-500 mb-6">Detailed breakdown by course</p>
              
              <div className="space-y-5">
                {dashboardData.subjectWiseAttendance.map(({ subject, attendance }, i) => (
                  <div key={subject} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{subject}</span>
                      <span className={`text-sm font-bold ${attendance >= 75 ? 'text-emerald-600' : 'text-amber-500'}`}>{attendance}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div className={`h-full rounded-full transition-all duration-700 ${attendance >= 75 ? 'bg-emerald-500' : attendance >= 60 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${attendance}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-8">
          
          {/* Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Status Overview</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative flex-shrink-0">
                  <svg className="w-32 h-32 -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="12" fill="none" className="dark:stroke-gray-700" />
                    <circle cx="64" cy="64" r="56" stroke={rate >= 75 ? "#059669" : rate >= 60 ? "#d97706" : "#dc2626"} strokeWidth="12" fill="none" strokeDasharray={`${2 * Math.PI * 56}`} strokeDashoffset={`${2 * Math.PI * 56 * (1 - rate / 100)}`} strokeLinecap="round" className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{Math.round(rate)}%</span>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <Badge variant={rate >= 75 ? "success" : rate >= 60 ? "warning" : "danger"} className="mb-2 px-3 py-1">
                    {rate >= 75 ? "Target Achieved" : "Action Required"}
                  </Badge>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {rate >= 75 ? "You are maintaining good attendance." : "Your attendance is below the 75% threshold."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Leave Status</h3>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" onClick={() => navigate("/student/leave")}>
                Manage <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {[
                { label: "Pending Approval", value: dashboardData?.pendingLeaves, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30" }, 
                { label: "Approved Requests", value: dashboardData?.approvedLeaves, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" }, 
                { label: "Rejected Requests", value: dashboardData?.rejectedLeaves, icon: XCircle, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" }
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${bg}`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{value ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
