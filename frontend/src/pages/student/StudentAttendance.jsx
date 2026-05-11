import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/Card";
import Alert from "../../components/Alert";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import { attendanceAPI } from "../../utils/apiService";
import { CheckCircle, XCircle, Clock, TrendingUp, BookOpen, Calendar, Award } from "lucide-react";

const StudentAttendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [todayStatus, setTodayStatus] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDateData, setSelectedDateData] = useState(null);

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
      const today = new Date().toISOString().split("T")[0];
      const todayRec = allRecords.find((r) => r.date === today);
      setTodayStatus(todayRec?.status?.toLowerCase() || null);
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

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const cells = [];

    dayNames.forEach((d) => cells.push(
      <div key={`h-${d}`} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">{d}</div>
    ));
    for (let i = 0; i < firstDay; i++) cells.push(<div key={`e-${i}`} />);

    for (let date = 1; date <= daysInMonth; date++) {
      const records = getRecordsForDate(date);
      const hasPresent = records.some((r) => r.status?.toUpperCase() === "PRESENT");
      const hasAbsent = records.some((r) => r.status?.toUpperCase() === "ABSENT");
      const allPresent = records.length > 0 && records.every((r) => r.status?.toUpperCase() === "PRESENT");
      const allAbsent = records.length > 0 && records.every((r) => r.status?.toUpperCase() === "ABSENT");
      const isMixed = hasPresent && hasAbsent;
      const isToday = date === new Date().getDate() && selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear();

      let bg = "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700";
      if (allPresent) bg = "bg-emerald-500 text-white";
      else if (allAbsent) bg = "bg-red-500 text-white";
      else if (isMixed) bg = "bg-amber-400 text-white";

      cells.push(
        <div
          key={date}
          onClick={() => handleDateClick(date)}
          className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-semibold cursor-pointer transition-all hover:scale-105 hover:shadow-md relative ${bg} ${isToday ? "ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-900" : ""}`}
        >
          <span>{date}</span>
          {records.length > 0 && (
            <div className="mt-0.5">
              {allPresent ? <CheckCircle className="w-2.5 h-2.5 text-white/80" /> : allAbsent ? <XCircle className="w-2.5 h-2.5 text-white/80" /> : <Clock className="w-2.5 h-2.5 text-white/80" />}
            </div>
          )}
          {records.length > 1 && <div className="absolute top-0.5 left-0.5 text-[9px] font-bold bg-white/30 rounded-full w-4 h-4 flex items-center justify-center">{records.length}</div>}
        </div>
      );
    }
    return cells;
  };

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const presentCount = attendanceHistory.filter((a) => a.status?.toUpperCase() === "PRESENT").length;
  const absentCount = attendanceHistory.filter((a) => a.status?.toUpperCase() === "ABSENT").length;
  const monthRate = attendanceHistory.length > 0 ? Math.round((presentCount / attendanceHistory.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Attendance</h1>
          <p className="page-subtitle">Track your monthly attendance record</p>
        </div>
        {attendanceHistory.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <Award className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{monthRate}% this month</span>
          </div>
        )}
      </div>

      {message.text && <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: "", text: "" })} />}

      {/* Today's status */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Today</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          {todayStatus ? (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${todayStatus === "present" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"}`}>
              {todayStatus === "present" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span className="text-sm font-semibold capitalize">{todayStatus}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Not marked yet</span>
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Classes", value: attendanceHistory.length, icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
          { label: "Present", value: presentCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
          { label: "Absent", value: absentCount, icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/30" },
          { label: "Rate", value: `${monthRate}%`, icon: TrendingUp, color: monthRate >= 75 ? "text-emerald-600" : "text-amber-600", bg: monthRate >= 75 ? "bg-emerald-50 dark:bg-emerald-900/30" : "bg-amber-50 dark:bg-amber-900/30" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p></div>
              <div className={`${bg} p-2.5 rounded-lg`}><Icon className={`w-5 h-5 ${color}`} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {attendanceHistory.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{monthRate >= 75 ? "On track — great work!" : `Need ${Math.max(0, Math.ceil(attendanceHistory.length * 0.75) - presentCount)} more to reach 75%`}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{presentCount} present of {attendanceHistory.length} classes · Target: 75%</p>
            </div>
            <Badge variant={monthRate >= 75 ? "success" : monthRate >= 60 ? "warning" : "danger"}>{monthRate}%</Badge>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${monthRate >= 75 ? "bg-emerald-500" : "bg-amber-400"}`} style={{ width: `${Math.min(monthRate, 100)}%` }} />
          </div>
          <div className="flex justify-end mt-1"><span className="text-xs text-gray-400">75% target marker</span></div>
        </Card>
      )}

      {/* Calendar */}
      <Card
        title="Attendance Calendar"
        subtitle="Click any coloured date to see subject details"
        action={
          <div className="flex gap-2">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="text-xs border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="text-xs border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        }
      >
        {loading ? <Loader text="Loading attendance…" /> : (
          <>
            <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              {[
                { color: "bg-emerald-500", label: "All Present" },
                { color: "bg-red-500", label: "All Absent" },
                { color: "bg-amber-400", label: "Mixed" },
                { color: "bg-gray-200 dark:bg-gray-700", label: "No Data" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded-sm ${color}`} /><span className="text-xs text-gray-600 dark:text-gray-400">{label}</span></div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Date detail modal */}
      <Modal isOpen={showDateModal} onClose={() => setShowDateModal(false)} title={`Attendance — ${selectedDateData ? new Date(selectedDateData.dateStr).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : ""}`} size="md">
        {selectedDateData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-100 dark:border-gray-700">
              <span>{selectedDateData.records.length} class{selectedDateData.records.length !== 1 ? "es" : ""}</span>
              <span className="font-semibold">{selectedDateData.records.filter((r) => r.status?.toUpperCase() === "PRESENT").length} present</span>
            </div>
            {selectedDateData.records.map((r, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${r.status?.toUpperCase() === "PRESENT" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
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
