import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import Button from "../components/Button";
import Select from "../components/Select";
import Alert from "../components/Alert";
import { pdfAPI, attendanceAPI } from "../utils/apiService";
import {
  Download,
  FileText,
  Calendar,
  CheckCircle,
  TrendingUp,
  File,
  Sparkles,
  Clock,
  User,
  BookOpen,
  Target,
  ArrowRight,
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PDF Reports
            </span>
            <span>📄</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
            <File className="w-4 h-4" />
            Generate and download professional attendance reports
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">Instant Download</span>
        </div>
      </div>

      {message.text && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: "", text: "" })}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PDF Generator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Generator Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-1">Generate Report</h3>
                  <p className="text-white/90">
                    Select the period for your attendance report
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Month
                  </label>
                  <select
                    name="month"
                    value={filters.month}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/50 transition-all cursor-pointer"
                  >
                    {months.map((m) => (
                      <option
                        key={m.value}
                        value={m.value}
                        className="bg-gray-800 text-white"
                      >
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Year
                  </label>
                  <select
                    name="year"
                    value={filters.year}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/50 transition-all cursor-pointer"
                  >
                    {years.map((y) => (
                      <option
                        key={y.value}
                        value={y.value}
                        className="bg-gray-800 text-white"
                      >
                        {y.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={loading}
                className="w-full group relative overflow-hidden bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-center gap-3 group-hover:text-white transition-colors duration-300">
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-indigo-600 group-hover:border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6" />
                      <span>Generate & Download PDF</span>
                      <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Report Contents Card */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <h4 className="text-xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Report Contents
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    Personal Info
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Name, roll number, and department
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    Daily Records
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Day-by-day attendance status
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    Subject-wise
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Breakdown by each subject
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    Overall Stats
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Total percentage and summary
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    Leave Records
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Approved leaves for period
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-teal-200 dark:border-teal-800">
                <div className="p-2 bg-teal-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    Trends
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Monthly progress analysis
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Period Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 p-6 shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10 text-center text-white">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h3 className="font-semibold text-white/90 text-sm mb-2">
                Selected Period
              </h3>
              <p className="text-3xl font-bold">
                {months.find((m) => m.value === filters.month)?.label}
              </p>
              <p className="text-2xl font-bold mt-1">{filters.year}</p>
            </div>
          </div>

          {/* Report Preview Card */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Report Preview
              </h4>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Days
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalDays}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Present
                </span>
                <span className="text-lg font-bold text-green-600">
                  {stats.present}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Absent
                </span>
                <span className="text-lg font-bold text-red-600">
                  {stats.absent}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border-2 border-purple-300 dark:border-purple-700">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Attendance Rate
                </span>
                <span className="text-2xl font-bold text-purple-600">
                  {stats.percentage}%
                </span>
              </div>
            </div>
          </Card>

          {/* Report Info Card */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h4 className="font-bold text-lg">PDF Format</h4>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
                  Professional Layout
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Clean, organized format ready for printing
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
                  Comprehensive Data
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  All attendance records with detailed stats
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
                  Instant Generation
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Download your report in seconds
                </p>
              </div>
            </div>
          </Card>

          {/* Info Card */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
                  Quick Tip
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Download reports regularly to keep track of your attendance
                  progress throughout the semester.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DownloadPDF;
