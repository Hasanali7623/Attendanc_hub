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
import { dashboardAPI } from "../../utils/apiService";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  ClipboardCheck,
  FileText,
  Calendar,
  AlertCircle,
  Activity,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronDown,
  Settings,
  Shield,
  ArrowRight
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      
      setDashboardData({
        totalStudents: data?.totalStudents || 0,
        totalLeaves: data?.totalLeaveRequests || 0,
        todayAttendance: data?.totalPresent || 0,
        totalAbsent: data?.totalAbsent || 0,
        pendingLeaveRequests: data?.pendingLeaves || 0,
        approvedLeaves: data?.approvedLeaves || 0,
        rejectedLeaves: data?.rejectedLeaves || 0,
        overallAttendanceRate: data?.overallAttendanceRate || 0,
        attendanceTrend: data?.attendanceTrend || [],
        departmentAttendance: data?.departmentAttendance || [],
        recentLeaves: data?.recentLeaves || [],
        todayAttendanceBySubject: data?.todayAttendanceBySubject || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold rounded-md uppercase border border-emerald-100 dark:border-emerald-800">
        {status}
      </span>
    );
  };

  const rate = dashboardData?.overallAttendanceRate || 0;

  // Mini sparkline SVG for top cards
  const generateSparkline = (color) => (
    <svg className="w-full h-8 mt-4" viewBox="0 0 100 20" preserveAspectRatio="none">
      <path d="M0,15 Q10,10 20,12 T40,8 T60,14 T80,5 T100,10" fill="none" stroke={color} strokeWidth="1.5" className="opacity-80" />
      <path d="M0,15 Q10,10 20,12 T40,8 T60,14 T80,5 T100,10 L100,20 L0,20 Z" fill={`url(#grad-${color.replace('#', '')})`} opacity="0.2" />
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );

  return (
    <div className="animate-fade-in pb-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">Dashboard</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
            Welcome back, {user?.name || "Hasanali"}! Here's what's happening today. <span className="text-lg">👋</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">System Active</span>
          </div>
          <button className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
            <Activity className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-sm font-semibold">
            <Calendar className="w-4 h-4 text-gray-400" />
            May 13, 2026
            <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Students */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4 relative z-10">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                 <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
               </div>
               <div>
                 <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Students</p>
                 <div className="flex items-baseline gap-2">
                   <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{dashboardData?.totalStudents || 0}</p>
                 </div>
               </div>
             </div>
          </div>
          <p className="text-xs font-medium text-gray-500 ml-16 pl-1 z-10">Enrolled</p>
          <div className="absolute bottom-0 left-0 right-0 z-0">
             {generateSparkline("#6366f1")}
          </div>
          <div className="absolute bottom-0 left-4 right-4 h-1 bg-indigo-600 rounded-t-full"></div>
        </div>

        {/* Present Today */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4 relative z-10">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                 <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
               </div>
               <div>
                 <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Present Today</p>
                 <div className="flex items-baseline gap-2">
                   <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{dashboardData?.todayAttendance || 0}</p>
                 </div>
               </div>
             </div>
          </div>
          <p className="text-xs font-medium text-gray-500 ml-16 pl-1 z-10">All subjects</p>
          <div className="absolute bottom-0 left-0 right-0 z-0">
             {generateSparkline("#10b981")}
          </div>
          <div className="absolute bottom-0 left-4 right-4 h-1 bg-emerald-500 rounded-t-full"></div>
        </div>

        {/* Total Leaves */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4 relative z-10">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                 <FileText className="w-6 h-6 text-amber-500 dark:text-amber-400" />
               </div>
               <div>
                 <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Leaves</p>
                 <div className="flex items-baseline gap-2">
                   <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{dashboardData?.totalLeaves || 0}</p>
                 </div>
               </div>
             </div>
          </div>
          <p className="text-xs font-medium text-gray-500 ml-16 pl-1 z-10">This month</p>
          <div className="absolute bottom-0 left-0 right-0 z-0">
             {generateSparkline("#f59e0b")}
          </div>
          <div className="absolute bottom-0 left-4 right-4 h-1 bg-amber-500 rounded-t-full"></div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4 relative z-10">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                 <Clock className="w-6 h-6 text-red-500 dark:text-red-400" />
               </div>
               <div>
                 <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Pending Requests</p>
                 <div className="flex items-baseline gap-2">
                   <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{dashboardData?.pendingLeaveRequests || 0}</p>
                 </div>
               </div>
             </div>
          </div>
          <p className="text-xs font-medium text-gray-500 ml-16 pl-1 z-10">Needs attention</p>
          <div className="absolute bottom-0 left-0 right-0 z-0">
             {generateSparkline("#ef4444")}
          </div>
          <div className="absolute bottom-0 left-4 right-4 h-1 bg-red-500 rounded-t-full"></div>
        </div>
      </div>

      {/* Row 2: 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* Overall Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Overall Rate</h3>
            <span className={`px-3 py-1 ${rate >= 75 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800'} text-xs font-bold rounded-lg border`}>
              {rate >= 75 ? 'Good' : 'Poor'}
            </span>
          </div>
          <div className="flex items-center gap-6 mb-6">
            <div className="relative flex-shrink-0 w-24 h-24">
              <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#f3f4f6" strokeWidth="10" fill="none" className="dark:stroke-gray-700" />
                <circle cx="48" cy="48" r="40" stroke={rate >= 75 ? "#10b981" : "#ef4444"} strokeWidth="10" fill="none" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - rate / 100)}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-extrabold text-gray-900 dark:text-white">{rate.toFixed(1)}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Today's attendance</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">{dashboardData?.todayAttendance || 0} <span className="text-gray-400 font-medium text-lg">/ {(dashboardData?.todayAttendance || 0) + (dashboardData?.totalAbsent || 0)}</span></p>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />{dashboardData?.todayAttendance || 0} present</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />{dashboardData?.totalAbsent || 0} absent</span>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs">
             <span className="text-gray-500 font-medium">Target: 75%</span>
             <span className={`${rate >= 75 ? 'text-emerald-500' : 'text-red-500'} font-bold flex items-center gap-1`}><XCircle className="w-3.5 h-3.5" /> {rate >= 75 ? `${(rate - 75).toFixed(1)}% above` : `${(75 - rate).toFixed(1)}% below`}</span>
          </div>
        </div>

        {/* Leave Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Leave Summary</h3>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-amber-500 bg-transparent"></span>
                Pending
              </div>
              <span className="font-extrabold text-gray-900 dark:text-white">{dashboardData?.pendingLeaveRequests || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 bg-transparent"></span>
                Approved
              </div>
              <span className="font-extrabold text-gray-900 dark:text-white">{dashboardData?.approvedLeaves || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-indigo-500 bg-transparent"></span>
                Total
              </div>
              <span className="font-extrabold text-gray-900 dark:text-white">{dashboardData?.totalLeaves || 0}</span>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
               View all leaves <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Absent Today */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Absent Today</h3>
            <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-lg">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-4 mb-6">
             <span className="text-5xl font-extrabold text-red-500">{dashboardData?.totalAbsent || 0}</span>
             <div>
               <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">absence records</p>
               <p className="text-xs font-medium text-gray-500 dark:text-gray-400">All subjects combined</p>
             </div>
          </div>
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs">
             <span className="text-gray-500 font-medium">Absence rate</span>
             <span className="text-red-500 font-bold">{dashboardData?.todayAttendance + dashboardData?.totalAbsent > 0 ? ((dashboardData?.totalAbsent / (dashboardData?.todayAttendance + dashboardData?.totalAbsent)) * 100).toFixed(1) : 0}%</span>
          </div>
          <div className="mt-4">
             <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
               View absence report <ArrowRight className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>

      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Weekly Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 lg:col-span-2">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Weekly Attendance Trend</h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Presence vs absence over the last 7 days</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              Last 7 Days <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.attendanceTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tickFormatter={(val) => { const d = new Date(val); return `${d.toLocaleDateString('en-US', {weekday:'short'})}, ${d.toLocaleDateString('en-US', {month:'short', day:'numeric'})}`; }} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} domain={[0, 1]} tickCount={5} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: '1px solid #f3f4f6', fontSize: '12px', fontWeight: 'bold' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} formatter={(val) => <span className="text-gray-700 dark:text-gray-300">{val === 'present' ? 'Present' : 'Absent'}</span>} />
                <Bar dataKey="present" fill="#10b981" radius={[0, 0, 0, 0]} barSize={32} />
                <Bar dataKey="absent" fill="#ef4444" radius={[0, 0, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 flex items-start justify-between mb-8">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Department Performance</h3>
            <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
              View full report <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="relative z-10 flex items-center justify-center gap-8 mb-8 flex-1">
             <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="56" cy="56" r="46" stroke="#f3f4f6" strokeWidth="12" fill="none" className="dark:stroke-gray-700" />
                  <circle cx="56" cy="56" r="46" stroke="#4f46e5" strokeWidth="12" fill="none" strokeDasharray={`${2 * Math.PI * 46}`} strokeDashoffset={`${2 * Math.PI * 46 * (1 - (dashboardData?.departmentAttendance?.[0]?.value || 0) / 100)}`} strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-extrabold text-gray-900 dark:text-white">{dashboardData?.departmentAttendance?.[0]?.value || 0}%</span>
                </div>
             </div>
             <div className="space-y-4">
                {(dashboardData?.departmentAttendance || [{name: "No Data", value: 0}]).slice(0, 3).map((dept, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{dept.name}</span>
                    </div>
                    <span className="text-xs font-extrabold text-gray-900 dark:text-white">{dept.value}%</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-indigo-50/50 to-transparent pointer-events-none rounded-b-2xl opacity-50 z-0">
             {/* Wavy background shape */}
             <svg viewBox="0 0 400 150" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full text-indigo-50 dark:text-indigo-900/20 fill-current">
               <path d="M0,50 C100,100 200,0 400,50 L400,150 L0,150 Z" />
             </svg>
          </div>
        </div>

      </div>

      {/* Row 4: Subject Attendance & Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Today's Attendance by Subject */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Today's Attendance by Subject</h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Wednesday, May 13, 2026</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-2 overflow-y-auto max-h-64">
             {dashboardData?.todayAttendanceBySubject?.length > 0 ? (
                <div className="w-full space-y-2">
                   {dashboardData.todayAttendanceBySubject.map((sub, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-750">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                               <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-gray-900 dark:text-white">{sub.subject}</p>
                               <p className="text-xs font-medium text-gray-500">{sub.teacher}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-extrabold text-gray-900 dark:text-white">{sub.present} / {sub.total}</p>
                            <p className="text-[10px] font-bold text-emerald-500">{((sub.present/sub.total)*100).toFixed(0)}% present</p>
                         </div>
                      </div>
                   ))}
                </div>
             ) : (
                <div className="text-center py-8">
                   <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
                     <ClipboardCheck className="w-8 h-8" />
                   </div>
                   <p className="text-sm font-extrabold text-gray-900 dark:text-white mb-1">No attendance recorded today</p>
                   <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Records will appear once teachers mark attendance.</p>
                </div>
             )}
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Leave Requests</h3>
            <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1">
             {(dashboardData?.recentLeaves || []).map((leave, idx) => (
               <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-xl transition-colors">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                     {leave.studentName.charAt(0)}
                   </div>
                   <div>
                     <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{leave.studentName}</p>
                     <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                       {new Date(leave.startDate).toLocaleDateString('en-US', {month:'short', day:'numeric'})} - {new Date(leave.endDate).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})} <span className="mx-1">•</span> {leave.days} days
                     </p>
                   </div>
                 </div>
                 {getStatusBadge(leave.status)}
               </div>
             ))}
          </div>
        </div>

      </div>

      {/* Row 5: Quick Actions */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Manage Students", sub: "Add or edit students", icon: Users, path: "/admin/students", bg: "bg-indigo-50", color: "text-indigo-600" },
            { label: "Attendance", sub: "View attendance records", icon: Calendar, path: "/admin/attendance", bg: "bg-emerald-50", color: "text-emerald-600" },
            { label: "Leave Requests", sub: "Review pending leaves", icon: FileText, path: "/admin/leave-requests", bg: "bg-amber-50", color: "text-amber-500" },
            { label: "Settings", sub: "Configure system", icon: Settings, path: "/admin/settings", bg: "bg-blue-50", color: "text-blue-600" },
          ].map((item, idx) => (
            <div key={idx} onClick={() => navigate(item.path)} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${item.bg} dark:bg-opacity-20`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-0.5 group-hover:text-indigo-600 transition-colors">{item.label}</h4>
                  <p className="text-[10px] font-medium text-gray-500">{item.sub}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
