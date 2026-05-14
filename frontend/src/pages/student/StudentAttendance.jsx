import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import { attendanceAPI } from "../../utils/apiService";
import { CheckCircle, XCircle, TrendingUp, BookOpen, Download, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bot } from "lucide-react";

const StudentAttendance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDateData, setSelectedDateData] = useState(null);

  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();

  useEffect(() => { if (user?.id) fetchAttendance(); }, [selectedMonth, selectedYear, user]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token || !user?.id) { setMessage({ type: "error", text: "Authentication required." }); return; }
      const response = await attendanceAPI.getMyAttendance(user.id);
      const allRecords = response.data.data || [];
      const filtered = allRecords.filter((r) => {
        const d = new Date(r.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      });
      setAttendanceHistory(filtered);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to load attendance." });
      setAttendanceHistory([]);
    } finally { setLoading(false); }
  };

  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();

  const getRecordsForDate = (date) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    return attendanceHistory.filter((a) => a.date === dateStr);
  };

  const handleDateClick = (date) => {
    const records = getRecordsForDate(date);
    if (records.length > 0) {
      setSelectedDateData({ date, dateStr: `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`, records });
      setShowDateModal(true);
    }
  };

  const handlePrevMonth = () => setSelectedDate(new Date(selectedYear, selectedMonth - 1, 1));
  const handleNextMonth = () => setSelectedDate(new Date(selectedYear, selectedMonth + 1, 1));
  const handleToday = () => setSelectedDate(new Date());

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const cells = [];

    dayNames.forEach((d) => cells.push(
      <div key={`h-${d}`} className="text-center text-xs font-bold text-gray-800 dark:text-gray-300 py-3">{d}</div>
    ));
    for (let i = 0; i < firstDay; i++) cells.push(<div key={`e-${i}`} />);

    for (let date = 1; date <= daysInMonth; date++) {
      const records = getRecordsForDate(date);
      const hasPresent = records.some((r) => r.status?.toUpperCase() === "PRESENT");
      const hasAbsent = records.some((r) => r.status?.toUpperCase() === "ABSENT");
      const allPresent = records.length > 0 && records.every((r) => r.status?.toUpperCase() === "PRESENT");
      const allAbsent = records.length > 0 && records.every((r) => r.status?.toUpperCase() === "ABSENT");
      const isToday = date === new Date().getDate() && selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear();
      
      cells.push(
        <div
          key={date}
          onClick={() => handleDateClick(date)}
          className={`h-14 flex flex-col items-center justify-start pt-2 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 relative ${isToday ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600 dark:hover:bg-emerald-600" : "text-gray-600 dark:text-gray-300"}`}
        >
          <span>{date}</span>
          <div className="flex gap-1 mt-1">
            {records.length > 0 && !isToday && (
              allPresent ? <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> : 
              allAbsent ? <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> : 
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
            {isToday && <div className="w-1.5 h-1.5 rounded-full bg-white/80" />}
          </div>
        </div>
      );
    }
    return cells;
  };

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const presentCount = attendanceHistory.filter((a) => a.status?.toUpperCase() === "PRESENT").length;
  const absentCount = attendanceHistory.filter((a) => a.status?.toUpperCase() === "ABSENT").length;
  const totalRecords = presentCount + absentCount;
  const monthRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

  return (
    <div className="animate-fade-in pb-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">My Attendance</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Track your daily attendance and stay on top of your progress.
          </p>
        </div>
        <div>
          <Button variant="outline" className="shadow-sm border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold rounded-xl px-5 py-2.5 h-auto bg-white dark:bg-gray-800" onClick={() => navigate("/download-pdf")}>
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      {message.text && <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: "", text: "" })} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Overall Attendance", value: `${monthRate}%`, sub: monthRate >= 75 ? "Good standing" : "Below 75% threshold", subColor: monthRate >= 75 ? "text-orange-500 bg-orange-50" : "text-orange-500 bg-orange-50", icon: TrendingUp, color: "text-orange-500", iconBg: "bg-orange-50 dark:bg-orange-900/20", borderColor: monthRate >= 75 ? "border-orange-200" : "border-orange-200" },
          { label: "Total Classes", value: totalRecords, sub: "All time", subColor: "text-blue-500", icon: CalendarIcon, color: "text-blue-600", iconBg: "bg-blue-50", borderColor: "border-blue-200" },
          { label: "Classes Attended", value: presentCount, sub: "This term", subColor: "text-gray-500", icon: CheckCircle, color: "text-emerald-500", iconBg: "bg-emerald-50", borderColor: "border-emerald-200" },
          { label: "Classes Missed", value: absentCount, sub: "This term", subColor: "text-gray-500", icon: XCircle, color: "text-red-500", iconBg: "bg-red-50", borderColor: "border-red-200" },
        ].map(({ label, value, sub, subColor, icon: Icon, color, iconBg, borderColor }, idx) => (
          <div key={label} className={`rounded-2xl border ${borderColor} bg-white dark:bg-gray-800 shadow-sm p-6 flex flex-row items-center justify-between transition-all hover:shadow-md`}>
            <div>
              <p className={`text-sm font-semibold ${idx === 0 ? 'text-gray-800 dark:text-gray-200' : idx === 1 ? 'text-blue-600 dark:text-blue-400' : idx === 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} mb-2`}>{label}</p>
              <p className={`text-4xl font-bold ${idx === 0 ? 'text-orange-500' : idx === 1 ? 'text-blue-600' : idx === 2 ? 'text-emerald-500' : 'text-red-500'} dark:text-white mb-3`}>{value}</p>
              <span className={`text-[11px] font-semibold px-2 py-1 rounded-md ${subColor} dark:bg-opacity-20`}>{sub}</span>
            </div>
            <div className={`p-4 rounded-full ${iconBg} dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600`}>
              <Icon className={`w-8 h-8 ${color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Attendance Progress</h3>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{monthRate}%</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              You need 75% attendance to maintain good standing.
            </p>
            <div className="relative pt-1">
              <div className="overflow-hidden h-3 mb-2 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
                <div style={{ width: `${Math.min(monthRate, 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-1000 rounded-full"></div>
              </div>
              <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                <span>0%</span>
                <span className="ml-12">75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold">Attendance Calendar</h3>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                <span className="text-sm font-bold w-24 text-center">{months[selectedMonth]} {selectedYear}</span>
                <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
                <button onClick={handleToday} className="ml-2 px-4 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg transition-colors">Today</button>
              </div>
            </div>

            {loading ? <Loader text="Loading calendar…" /> : (
              <>
                <div className="grid grid-cols-7 gap-x-2 gap-y-4 mb-8">
                  {renderCalendar()}
                </div>
                <div className="flex items-center gap-6 pt-6 border-t border-gray-100 dark:border-gray-700 justify-start">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Present</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Absent</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Late</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500" /><span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Excused</span></div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Present</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{presentCount} <span className="text-gray-500 font-medium">({monthRate}%)</span></span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Absent</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{absentCount} <span className="text-gray-500 font-medium">({totalRecords > 0 ? Math.round((absentCount/totalRecords)*100) : 0}%)</span></span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Late</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">0 <span className="text-gray-500 font-medium">(0%)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Excused</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">0 <span className="text-gray-500 font-medium">(0%)</span></span>
              </div>
            </div>
          </div>

          {/* Below Threshold Alert */}
          {monthRate <= 75 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30">
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-2">Below Threshold</h4>
              <div className="flex items-start gap-4">
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                  Your attendance is below the 75% required threshold. Attend more classes to improve.
                </p>
                <TrendingUp className="w-8 h-8 text-blue-400 flex-shrink-0" />
              </div>
            </div>
          )}

          {/* Need Help Box */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Need Help?</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              Talk to our AI assistant for tips on improving your attendance.
            </p>
            <Button onClick={() => navigate("/ai-chatbot")} className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-300 border-none font-semibold rounded-xl py-2.5 shadow-none transition-colors">
              <Bot className="w-4 h-4 mr-2" /> Chat with AI
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={showDateModal} onClose={() => setShowDateModal(false)} title={`Attendance — ${selectedDateData ? new Date(selectedDateData.dateStr).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : ""}`} size="md">
        {selectedDateData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-100 dark:border-gray-700">
              <span>{selectedDateData.records.length} class{selectedDateData.records.length !== 1 ? "es" : ""}</span>
              <span className="font-semibold">{selectedDateData.records.filter((r) => r.status?.toUpperCase() === "PRESENT").length} present</span>
            </div>
            {selectedDateData.records.map((r, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${r.status?.toUpperCase() === "PRESENT" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{r.subject || `Class ${i + 1}`}</span>
                <Badge variant={r.status?.toUpperCase() === "PRESENT" ? "success" : "danger"}>{r.status?.toUpperCase() === "PRESENT" ? "Present" : "Absent"}</Badge>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentAttendance;
