import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import Button from "../components/Button";
import Alert from "../components/Alert";
import { pdfAPI, attendanceAPI } from "../utils/apiService";
import {
  Download,
  FileText,
  Calendar,
  CheckCircle,
  TrendingUp,
  Sparkles,
  User,
  BookOpen,
  Target,
  ArrowRight,
  ShieldCheck,
  Lock,
  XCircle,
  ChevronRight
} from "lucide-react";

const DownloadPDF = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [stats, setStats] = useState({
    totalDays: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  });

  useEffect(() => {
    if (user?.id) {
      fetchAttendanceStats();
    }
  }, [filters, user]);

  const fetchAttendanceStats = async () => {
    try {
      const response = await attendanceAPI.getMyAttendance(user.id);
      const allRecords = response.data.data || [];

      // Filter by selected month/year
      const filteredRecords = allRecords.filter((record) => {
        const recordDate = new Date(record.date);
        return (
          recordDate.getMonth() + 1 === filters.month &&
          recordDate.getFullYear() === filters.year
        );
      });

      const presentCount = filteredRecords.filter(
        (r) => r.status.toUpperCase() === "PRESENT"
      ).length;
      const absentCount = filteredRecords.filter(
        (r) => r.status.toUpperCase() === "ABSENT"
      ).length;
      const totalDays = filteredRecords.length;
      const percentage =
        totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

      setStats({
        totalDays,
        present: presentCount,
        absent: absentCount,
        percentage,
      });
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await pdfAPI.downloadAttendancePDF(
        user.id,
        filters.month,
        filters.year
      );

      // Create blob from response
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-report-${filters.month}-${filters.year}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setMessage({
        type: "success",
        text: "PDF downloaded successfully! Check your downloads folder.",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to generate PDF. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: parseInt(e.target.value),
    });
  };

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = [
    { value: 2024, label: "2024" },
    { value: 2025, label: "2025" },
    { value: 2026, label: "2026" },
  ];

  return (
    <div className="animate-fade-in pb-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">PDF Reports</h1>
            <FileText className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Generate and download professional attendance reports
          </p>
        </div>
        <div>
          <Button className="shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-5 py-2.5 h-auto">
            <Sparkles className="w-4 h-4 mr-2" /> Instant Download
          </Button>
        </div>
      </div>

      {message.text && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: "", text: "" })}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Generator Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 shadow-sm border border-indigo-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 right-10 opacity-20 pointer-events-none">
              <FileText className="w-48 h-48 text-white rotate-12" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-1">Generate Report</h3>
                  <p className="text-white/80 text-sm font-medium">
                    Select the period for your attendance report
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="block text-white/90 text-xs font-semibold mb-2">
                    Month
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                    <select
                      name="month"
                      value={filters.month}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all cursor-pointer appearance-none"
                    >
                      {months.map((m) => (
                        <option key={m.value} value={m.value} className="bg-gray-800 text-white">
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white/90 text-xs font-semibold mb-2">
                    Year
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                    <select
                      name="year"
                      value={filters.year}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all cursor-pointer appearance-none"
                    >
                      {years.map((y) => (
                        <option key={y.value} value={y.value} className="bg-gray-800 text-white">
                          {y.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={loading}
                className="w-full bg-white text-indigo-600 hover:bg-gray-50 px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Generate & Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Report Contents Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                  Report Contents
                </h4>
              </div>
              <button className="text-xs font-bold text-gray-500 hover:text-indigo-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 flex items-center gap-1 transition-colors">
                <Sparkles className="w-3 h-3" /> See All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: User, label: "Personal Info", desc: "Name, roll number, and department", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-100 dark:border-blue-800/30" },
                { icon: Calendar, label: "Daily Records", desc: "Day-by-day attendance status", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", border: "border-emerald-100 dark:border-emerald-800/30" },
                { icon: BookOpen, label: "Subject-wise", desc: "Breakdown by each subject", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-100 dark:border-purple-800/30" },
                { icon: Target, label: "Overall Stats", desc: "Total percentage and summary", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30", border: "border-orange-100 dark:border-orange-800/30" },
                { icon: FileText, label: "Leave Records", desc: "Approved leaves for period", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-100 dark:border-amber-800/30" },
                { icon: TrendingUp, label: "Trends", desc: "Monthly progress analysis", color: "text-teal-600", bg: "bg-teal-100 dark:bg-teal-900/30", border: "border-teal-100 dark:border-teal-800/30" },
              ].map((item, idx) => (
                <div key={idx} className={`flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border ${item.border} hover:shadow-md transition-all cursor-pointer group`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${item.bg}`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
                        {item.label}
                      </p>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 dark:text-gray-600 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          
          {/* Selected Period Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-6 shadow-sm border border-emerald-400/30 flex items-center justify-between">
            <div className="relative z-10 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 opacity-90" />
                <h3 className="font-semibold text-white/90 text-[10px] uppercase tracking-wider">
                  Selected Period
                </h3>
              </div>
              <p className="text-3xl font-extrabold leading-tight">
                {months.find((m) => m.value === filters.month)?.label}
              </p>
              <p className="text-xl font-bold opacity-90">{filters.year}</p>
            </div>
            <div className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
               <Calendar className="w-10 h-10 text-white" />
               <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1 border-2 border-white">
                 <CheckCircle className="w-4 h-4 text-white" />
               </div>
            </div>
          </div>

          {/* Report Preview Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                  Report Preview
                </h4>
              </div>
              <button className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                 View Details <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <Calendar className="w-4 h-4 text-blue-500 mb-2" />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Days</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDays}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <CheckCircle className="w-4 h-4 text-emerald-500 mb-2" />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Present</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.present}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <XCircle className="w-4 h-4 text-red-500 mb-2" />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Absent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.absent}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center relative">
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 absolute top-4 left-4">Rate</p>
                 <div className="relative w-14 h-14 mt-4">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="28" cy="28" r="24" stroke="#f3f4f6" strokeWidth="6" fill="none" className="dark:stroke-gray-700" />
                      {stats.totalDays > 0 && (
                        <circle cx="28" cy="28" r="24" stroke="#6366f1" strokeWidth="6" fill="none" strokeDasharray={`${2 * Math.PI * 24}`} strokeDashoffset={`${2 * Math.PI * 24 * (1 - stats.percentage / 100)}`} strokeLinecap="round" className="transition-all duration-1000" />
                      )}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stats.percentage}%</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* PDF Format Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">PDF Format</h4>
              </div>
              <button className="text-[10px] font-bold text-gray-500 flex items-center gap-1 hover:text-gray-900 dark:hover:text-white uppercase tracking-wider">
                 Learn More <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Professional Layout</p>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Clean, organized format ready for printing</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Comprehensive Data</p>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">All attendance records with detailed stats</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Instant Generation</p>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Download your report in seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Features */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
          <div className="md:col-span-1 flex items-center gap-3 pr-6 md:border-r border-gray-100 dark:border-gray-700">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-1">Why Our Reports Stand Out</h4>
              <p className="text-[10px] text-gray-500 font-medium">Built with accuracy, speed, and professional quality in mind.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-emerald-500">
               <CheckCircle className="w-4 h-4" />
             </div>
             <div>
               <p className="text-xs font-bold text-gray-900 dark:text-white">100% Accurate</p>
               <p className="text-[10px] text-gray-500 font-medium">Verified attendance data</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-blue-500">
               <Download className="w-4 h-4" />
             </div>
             <div>
               <p className="text-xs font-bold text-gray-900 dark:text-white">Export Anytime</p>
               <p className="text-[10px] text-gray-500 font-medium">Download whenever you need</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-purple-500">
               <FileText className="w-4 h-4" />
             </div>
             <div>
               <p className="text-xs font-bold text-gray-900 dark:text-white">Professional Quality</p>
               <p className="text-[10px] text-gray-500 font-medium">Print-ready PDF reports</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-orange-500">
               <Lock className="w-4 h-4" />
             </div>
             <div>
               <p className="text-xs font-bold text-gray-900 dark:text-white">Secure & Reliable</p>
               <p className="text-[10px] text-gray-500 font-medium">Your data is safe with us</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPDF;
