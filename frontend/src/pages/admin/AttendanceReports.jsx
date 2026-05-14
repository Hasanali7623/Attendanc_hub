import { useState, useEffect } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import { attendanceAPI, studentAPI, subjectAPI } from "../../utils/apiService";
import { useAuth } from "../../context/AuthContext";
import {
  Search, Download, Filter, Calendar, UserCheck, UserX, FileText, Eye, Edit3, Plus,
  CheckSquare, XSquare, Save, X, BookOpen, ChevronLeft, ChevronRight, ChevronDown,
  PieChart, Activity, AlertCircle, Clock, User
} from "lucide-react";

const AttendanceReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const todayDate = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [filters, setFilters] = useState({ dateRange: todayDate, subject: "all", markedBy: "all", status: "all", search: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [bulkAttendance, setBulkAttendance] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const itemsPerPage = 10;

  useEffect(() => { fetchAttendance(); fetchStudents(); fetchSubjects(); }, []);
  useEffect(() => { applyFilters(); }, [filters, attendanceData]);

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAllStudents();
      let list = response.data.data || [];
      if (user?.assignedSemester) list = list.filter((s) => s.semester === user.assignedSemester);
      setStudents(list);
      const init = {};
      list.forEach((s) => { init[s.id] = "present"; });
      setBulkAttendance(init);
    } catch { setStudents([]); }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getActiveSubjects();
      let list = response.data?.data || response.data || [];
      if (user?.assignedSemester) list = list.filter((s) => s.semester === user.assignedSemester);
      setSubjects(list);
    } catch { setSubjects([]); }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getAllAttendance();
      const data = response.data.data || response.data || [];
      setAttendanceData(data);
      setFilteredData(data);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to load attendance records" });
      setAttendanceData([]); setFilteredData([]);
    } finally { setLoading(false); }
  };

  const applyFilters = () => {
    let f = [...attendanceData];
    if (filters.search) f = f.filter((i) => i.studentName?.toLowerCase().includes(filters.search.toLowerCase()) || i.studentEmail?.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.dateRange && filters.dateRange !== 'all') f = f.filter((i) => i.date === filters.dateRange);
    if (filters.subject !== "all") f = f.filter((i) => i.subject?.toLowerCase().includes(filters.subject.toLowerCase()));
    if (filters.markedBy !== "all") f = f.filter((i) => i.markedBy?.toLowerCase().includes(filters.markedBy.toLowerCase()));
    if (filters.status !== "all") f = f.filter((i) => i.status?.toLowerCase() === filters.status);
    setFilteredData(f); setCurrentPage(1);
  };

  const handleFilterChange = (name, value) => setFilters({ ...filters, [name]: value });
  const clearFilters = () => setFilters({ dateRange: todayDate, subject: "all", markedBy: "all", status: "all", search: "" });
  const showAllRecords = () => setFilters({ dateRange: "all", subject: "all", markedBy: "all", status: "all", search: "" });

  const markAllPresent = () => { const a = {}; students.forEach((s) => { a[s.id] = "present"; }); setBulkAttendance(a); };
  const markAllAbsent = () => { const a = {}; students.forEach((s) => { a[s.id] = "absent"; }); setBulkAttendance(a); };

  const handleUpdateAttendance = async () => {
    try {
      setLoading(true);
      await attendanceAPI.updateAttendance(selectedRecord.id, { studentId: selectedRecord.studentId, date: selectedRecord.date, subject: selectedRecord.subject, status: editStatus.toUpperCase(), remarks: selectedRecord.remarks || "" });
      setMessage({ type: "success", text: "Attendance updated successfully" });
      setShowEditModal(false); fetchAttendance();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update attendance" });
    } finally { setLoading(false); }
  };

  const submitBulkAttendance = async () => {
    if (!selectedSubject) { setMessage({ type: "error", text: "Please select a subject" }); return; }
    try {
      setLoading(true);
      const subject = subjects.find((s) => s.id === parseInt(selectedSubject));
      const subjectName = subject ? `${subject.code} - ${subject.name}` : "Subject";
      const records = Object.entries(bulkAttendance).map(([studentId, status]) => ({ studentId: parseInt(studentId), date: selectedDate, subject: subjectName, status: status.toUpperCase() }));
      await attendanceAPI.markBulkAttendance(records);
      setMessage({ type: "success", text: `Attendance marked for ${students.length} students` });
      setShowBulkModal(false); setSelectedSubject(""); fetchAttendance();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to mark attendance" });
    } finally { setLoading(false); }
  };

  const exportToCSV = () => {
    const headers = ["Student Name","Email","Date","Subject","Status"];
    const rows = filteredData.map((r) => [r.studentName, r.studentEmail, r.date, r.subject, r.status]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `attendance-${todayDate}.csv`;
    a.click();
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const presentCount = filteredData.filter((r) => r.status?.toLowerCase() === "present").length;
  const absentCount = filteredData.filter((r) => r.status?.toLowerCase() === "absent").length;
  const rate = filteredData.length > 0 ? ((presentCount / filteredData.length) * 100).toFixed(1) : 0;

  // Extract unique subjects and marked by for filters
  const uniqueSubjects = [...new Set(attendanceData.map(item => item.subject))];
  const uniqueMarkedBy = [...new Set(attendanceData.map(item => item.markedBy).filter(Boolean))];

  const filterSelectClass = "w-full appearance-none bg-transparent outline-none text-sm font-bold text-gray-900 dark:text-white cursor-pointer py-2 pl-3 pr-8";

  const generateSparkline = (color) => (
    <svg className="w-full h-12 mt-2" viewBox="0 0 100 20" preserveAspectRatio="none">
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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Attendance Reports</h1>
            <div className="p-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-md">
               <FileText className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {filteredData.length} of {attendanceData.length} records · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowBulkModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-sm font-semibold">
            <Plus className="w-4 h-4 text-gray-400" /> Mark Attendance
          </button>
          <button onClick={exportToCSV} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-semibold text-sm transition-colors shadow-indigo-200 dark:shadow-indigo-900/20">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {message.text && <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: "", text: "" })} />}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Records */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10 mb-2">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Total Records</p>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">{filteredData.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 relative z-10">Total attendance records</p>
          <div className="absolute bottom-0 left-0 right-0 z-0 opacity-80">{generateSparkline("#6366f1")}</div>
        </div>

        {/* Present */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10 mb-2">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Present</p>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">{presentCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 relative z-10">Students present</p>
          <div className="absolute bottom-0 left-0 right-0 z-0 opacity-80">{generateSparkline("#10b981")}</div>
          <div className="relative z-10 mt-6 flex items-center gap-2">
             <span className="text-[10px] font-extrabold text-emerald-600 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded shadow-sm border border-gray-100 dark:border-gray-700">↑ 100%</span>
             <span className="text-[10px] font-medium text-gray-400">vs last 7 days</span>
          </div>
        </div>

        {/* Absent */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10 mb-2">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Absent</p>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">{absentCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <UserX className="w-5 h-5 text-red-500 dark:text-red-400" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 relative z-10">Students absent</p>
          <div className="absolute bottom-0 left-0 right-0 z-0 opacity-80">{generateSparkline("#ef4444")}</div>
          <div className="relative z-10 mt-6 flex items-center gap-2">
             <span className="text-[10px] font-extrabold text-red-500 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded shadow-sm border border-gray-100 dark:border-gray-700">↓ 0%</span>
             <span className="text-[10px] font-medium text-gray-400">vs last 7 days</span>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Attendance Rate</p>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">{rate}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <PieChart className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 mb-6">Overall attendance rate</p>
          <div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
               <div className="h-full bg-amber-500 rounded-full" style={{width: `${rate}%`}}></div>
            </div>
            <p className="text-[10px] font-extrabold text-amber-500 text-right mt-1.5">Excellent!</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col lg:flex-row items-center gap-4">
           {/* Search Input */}
           <div className="relative flex-1 w-full">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input
               type="text"
               name="search"
               value={filters.search}
               onChange={(e) => handleFilterChange('search', e.target.value)}
               placeholder="Search by student name or email..."
               className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
             />
           </div>
           {/* Filters toggle */}
           <div className="flex items-center gap-3 w-full md:w-auto">
             <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-sm font-semibold min-w-[120px]">
               <Filter className="w-4 h-4" /> Filters
             </button>
             <button onClick={showAllRecords} className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-sm font-semibold whitespace-nowrap">
               <Eye className="w-4 h-4" /> All Records
             </button>
           </div>
        </div>
        
        {/* Expanded Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
           <div className="relative bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl">
             <div className="px-3 pt-1.5 pb-0 flex flex-col">
               <label className="text-[10px] font-bold text-gray-500 uppercase">Date Range</label>
               <input type="date" value={filters.dateRange === 'all' ? '' : filters.dateRange} onChange={(e) => handleFilterChange('dateRange', e.target.value)} className="bg-transparent text-sm font-bold text-gray-900 dark:text-white outline-none pb-2 pt-0.5" />
             </div>
             <Calendar className="absolute right-3 bottom-3 w-4 h-4 text-gray-400 pointer-events-none" />
           </div>

           <div className="relative bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl">
             <div className="px-3 pt-1.5 pb-0">
               <label className="text-[10px] font-bold text-gray-500 uppercase">Subject</label>
             </div>
             <select value={filters.subject} onChange={(e) => handleFilterChange('subject', e.target.value)} className={filterSelectClass}>
               <option value="all">All Subjects</option>
               {uniqueSubjects.map((sub, idx) => <option key={idx} value={sub}>{sub}</option>)}
             </select>
             <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-gray-400 pointer-events-none" />
           </div>

           <div className="relative bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl">
             <div className="px-3 pt-1.5 pb-0">
               <label className="text-[10px] font-bold text-gray-500 uppercase">Marked By</label>
             </div>
             <select value={filters.markedBy} onChange={(e) => handleFilterChange('markedBy', e.target.value)} className={filterSelectClass}>
               <option value="all">All</option>
               {uniqueMarkedBy.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
             </select>
             <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-gray-400 pointer-events-none" />
           </div>

           <div className="relative bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl">
             <div className="px-3 pt-1.5 pb-0">
               <label className="text-[10px] font-bold text-gray-500 uppercase">Status</label>
             </div>
             <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className={filterSelectClass}>
               <option value="all">All Status</option>
               <option value="present">Present</option>
               <option value="absent">Absent</option>
             </select>
             <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-gray-400 pointer-events-none" />
           </div>
           
           <div className="flex items-center">
              <button onClick={clearFilters} className="flex items-center justify-center gap-2 w-full h-full min-h-[52px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-sm font-semibold">
                <X className="w-4 h-4" /> Clear Filters
              </button>
           </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
           <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
             Showing {Math.min(indexOfFirst + 1, filteredData.length)}-{Math.min(indexOfLast, filteredData.length)} of {filteredData.length} records
           </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Student <span className="inline-block ml-1 text-gray-300">↑↓</span>
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Date <span className="inline-block ml-1 text-gray-300">↑↓</span>
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Marked By</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <Loader text="Loading records…" />
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-extrabold shadow-sm flex-shrink-0">
                          {record.studentName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{record.studentName}</p>
                          <p className="text-xs font-medium text-gray-500">{record.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <Calendar className="w-4 h-4 text-indigo-400" />
                         <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                            <p className="text-xs font-medium text-gray-500">
                               {new Date(record.date).toLocaleDateString("en-US", { weekday: "long" })}
                            </p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                         <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold shadow-sm border border-indigo-100 dark:border-indigo-800">
                            {record.subject}
                         </span>
                         <p className="text-xs font-medium text-gray-500">Sem 1</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <User className="w-4 h-4 text-indigo-400" />
                         <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{record.markedBy || "—"}</p>
                            <p className="text-xs font-medium text-gray-500">Admin</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {record.status?.toLowerCase() === "present" ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider">
                           <span className="w-2 h-2 rounded-full bg-emerald-500"></span> PRESENT
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-extrabold uppercase tracking-wider">
                           <span className="w-2 h-2 rounded-full bg-red-500"></span> ABSENT
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button onClick={() => { setSelectedRecord(record); setShowViewModal(true); }} className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors" title="View"><Eye className="w-4 h-4 text-indigo-500" /></button>
                        <button onClick={() => { setSelectedRecord(record); setEditStatus(record.status); setShowEditModal(true); }} className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors" title="Edit"><Edit3 className="w-4 h-4 text-indigo-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-base font-bold text-gray-900 dark:text-white mb-1">No records found</p>
                    <p className="text-sm font-medium text-gray-500 mt-1">Try adjusting your filters or mark new attendance</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/50">
           <div className="flex-1"></div>
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-1">
               <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 disabled:opacity-50 transition-colors hover:bg-gray-50">
                 <ChevronLeft className="w-4 h-4" />
               </button>
               <button className="w-8 h-8 flex items-center justify-center rounded-md bg-indigo-600 text-white font-bold text-xs shadow-sm">
                 {currentPage}
               </button>
               <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 disabled:opacity-50 transition-colors hover:bg-gray-50">
                 <ChevronRight className="w-4 h-4" />
               </button>
             </div>
             <div className="relative">
               <select className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 py-1.5 pl-3 pr-8 outline-none cursor-pointer">
                 <option>10 / page</option>
                 <option>20 / page</option>
                 <option>50 / page</option>
               </select>
               <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
             </div>
           </div>
        </div>
      </div>

      {/* Bottom Banner Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Overview Chart Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4 border-b-4 border-b-indigo-500">
           <div className="relative w-14 h-14 flex-shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="#f3f4f6" strokeWidth="6" fill="none" className="dark:stroke-gray-700" />
                <circle cx="28" cy="28" r="24" stroke="#4f46e5" strokeWidth="6" fill="none" strokeDasharray={`${2 * Math.PI * 24}`} strokeDashoffset={0} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-extrabold text-gray-900 dark:text-white">100%</span>
              </div>
           </div>
           <div>
             <h4 className="text-[11px] font-bold text-gray-900 dark:text-white mb-1.5">Attendance Overview</h4>
             <div className="space-y-0.5">
                <div className="flex justify-between items-center text-[10px] gap-3">
                   <span className="flex items-center gap-1 font-medium text-gray-500"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Present</span>
                   <span className="font-bold text-gray-900 dark:text-white">2 <span className="text-gray-400 font-medium">(100%)</span></span>
                </div>
                <div className="flex justify-between items-center text-[10px] gap-3">
                   <span className="flex items-center gap-1 font-medium text-gray-500"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Absent</span>
                   <span className="font-bold text-gray-900 dark:text-white">0 <span className="text-gray-400 font-medium">(0%)</span></span>
                </div>
             </div>
           </div>
        </div>

        {/* Active Students */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4 border-b-4 border-b-emerald-500">
           <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5 text-indigo-500" />
           </div>
           <div>
             <h4 className="text-[10px] font-bold text-gray-500 mb-0.5">Active Students</h4>
             <p className="text-xl font-extrabold text-gray-900 dark:text-white leading-none mb-1">2</p>
             <p className="text-[10px] font-medium text-gray-500">Marked present</p>
           </div>
        </div>

        {/* Need Attention */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4 border-b-4 border-b-red-500">
           <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <UserX className="w-5 h-5 text-red-500" />
           </div>
           <div>
             <h4 className="text-[10px] font-bold text-gray-500 mb-0.5">Need Attention</h4>
             <p className="text-xl font-extrabold text-gray-900 dark:text-white leading-none mb-1">0</p>
             <p className="text-[10px] font-medium text-gray-500">Students absent</p>
           </div>
        </div>

        {/* Most Recent */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4 border-b-4 border-b-emerald-100">
           <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-emerald-500" />
           </div>
           <div>
             <h4 className="text-[10px] font-bold text-gray-500 mb-0.5">Most Recent</h4>
             <p className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight mb-1">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
             <p className="text-[10px] font-medium text-gray-500">Latest attendance date</p>
           </div>
        </div>
      </div>

      {/* Bulk Mark Modal */}
      <Modal isOpen={showBulkModal} onClose={() => { setShowBulkModal(false); setSelectedSubject(""); }} title="Mark Subject-wise Attendance" size="xl"
        footer={selectedSubject ? <><Button variant="secondary" onClick={() => { setShowBulkModal(false); setSelectedSubject(""); }}>Cancel</Button><Button onClick={submitBulkAttendance} loading={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"><CheckSquare className="w-4 h-4 mr-2" /> Submit Attendance</Button></> : undefined}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-xs font-bold text-gray-700 dark:text-gray-300">Date</label><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} max={todayDate} className="w-full bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none text-sm font-medium" /></div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-gray-700 dark:text-gray-300">Subject *</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 outline-none text-sm font-medium" required>
                <option value="">Choose a subject…</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.code} - {s.name} (Sem {s.semester})</option>)}
              </select>
            </div>
          </div>
          {selectedSubject ? (
            <>
              <div className="flex items-center justify-between mt-6 border-t border-gray-100 dark:border-gray-700 pt-4">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{students.length} students</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={markAllPresent}><CheckSquare className="w-4 h-4 text-emerald-600 mr-1" /> All Present</Button>
                  <Button variant="outline" size="sm" onClick={markAllAbsent}><XSquare className="w-4 h-4 text-red-500 mr-1" /> All Absent</Button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mt-4">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">{student.name.charAt(0).toUpperCase()}</div>
                      <div><p className="text-sm font-bold text-gray-900 dark:text-white">{student.name}</p><p className="text-xs text-gray-500">{student.studentId}</p></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setBulkAttendance({ ...bulkAttendance, [student.id]: "present" })} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${bulkAttendance[student.id] === "present" ? "bg-emerald-500 text-white" : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"}`}>P</button>
                      <button onClick={() => setBulkAttendance({ ...bulkAttendance, [student.id]: "absent" })} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${bulkAttendance[student.id] === "absent" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20"}`}>A</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center mt-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg"><BookOpen className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" /><p className="text-sm font-medium text-gray-500">Select a subject to mark attendance</p></div>
          )}
        </div>
      </Modal>
      
      {/* Edit Modal (used for both View and Edit to keep it simple and clean) */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Attendance" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button><Button onClick={handleUpdateAttendance} loading={loading} disabled={editStatus?.toUpperCase() === selectedRecord?.status?.toUpperCase()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"><Save className="w-4 h-4 mr-2" /> Save Changes</Button></>}
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
              <p className="text-base font-bold text-gray-900 dark:text-white mb-1">{selectedRecord.studentName}</p>
              <p className="text-xs font-medium text-gray-500">{selectedRecord.subject} · {new Date(selectedRecord.date).toLocaleDateString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setEditStatus("PRESENT")} className={`p-4 rounded-xl font-bold transition-all border ${editStatus?.toUpperCase() === "PRESENT" ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 ring-2 ring-emerald-500/20" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750"}`}>
                <UserCheck className="w-6 h-6 mx-auto mb-2" />Present
              </button>
              <button onClick={() => setEditStatus("ABSENT")} className={`p-4 rounded-xl font-bold transition-all border ${editStatus?.toUpperCase() === "ABSENT" ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 ring-2 ring-red-500/20" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750"}`}>
                <UserX className="w-6 h-6 mx-auto mb-2" />Absent
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Attendance Record" size="md"
        footer={<><Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button><Button onClick={() => { setShowViewModal(false); setEditStatus(selectedRecord.status); setShowEditModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"><Edit3 className="w-4 h-4 mr-2" /> Edit</Button></>}
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold">{selectedRecord.studentName?.charAt(0).toUpperCase()}</div>
              <div><p className="font-bold text-gray-900 dark:text-white">{selectedRecord.studentName}</p><p className="text-sm font-medium text-gray-500">{selectedRecord.studentEmail}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: "Date", value: new Date(selectedRecord.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) }, { label: "Subject", value: selectedRecord.subject }, { label: "Marked By", value: selectedRecord.markedBy || "—" }, { label: "Department", value: selectedRecord.department || "—" }].map(({ label, value }) => (
                <div key={label} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800"><p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{label}</p><p className="text-sm font-bold text-gray-900 dark:text-gray-200">{value}</p></div>
              ))}
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</p>
               <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${selectedRecord.status?.toLowerCase() === "present" ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-red-200 bg-red-50 text-red-600"}`}>{selectedRecord.status?.toUpperCase()}</span>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default AttendanceReports;
