import { useState, useEffect } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import { attendanceAPI, studentAPI, subjectAPI } from "../../utils/apiService";
import { useAuth } from "../../context/AuthContext";
import { Search, Download, Filter, Calendar, UserCheck, UserX, FileText, Eye, Edit3, Plus, CheckSquare, XSquare, Save, X, BookOpen } from "lucide-react";

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
  const [filters, setFilters] = useState({ dateFrom: todayDate, dateTo: todayDate, student: "", subject: "", status: "all", department: "all" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [bulkAttendance, setBulkAttendance] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const itemsPerPage = 15;

  const departments = ["Computer Science","Information Technology","Electronics","Mechanical","Civil","Electrical"];
  const semesters = ["1","2","3","4","5","6","7","8"];

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
      if (!data.length) setMessage({ type: "info", text: "No attendance records found. Mark attendance to see records here." });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to load attendance records" });
      setAttendanceData([]); setFilteredData([]);
    } finally { setLoading(false); }
  };

  const applyFilters = () => {
    let f = [...attendanceData];
    if (filters.dateFrom) f = f.filter((i) => i.date >= filters.dateFrom);
    if (filters.dateTo) f = f.filter((i) => i.date <= filters.dateTo);
    if (filters.student) f = f.filter((i) => i.studentName?.toLowerCase().includes(filters.student.toLowerCase()) || i.studentEmail?.toLowerCase().includes(filters.student.toLowerCase()));
    if (filters.subject) f = f.filter((i) => i.subject?.toLowerCase().includes(filters.subject.toLowerCase()));
    if (filters.status !== "all") f = f.filter((i) => i.status?.toLowerCase() === filters.status);
    if (filters.department !== "all") f = f.filter((i) => i.department === filters.department);
    setFilteredData(f); setCurrentPage(1);
  };

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const clearFilters = () => setFilters({ dateFrom: todayDate, dateTo: todayDate, student: "", subject: "", status: "all", department: "all" });
  const showAllRecords = () => setFilters({ dateFrom: "", dateTo: "", student: "", subject: "", status: "all", department: "all" });

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

  const selectCls = "input-field bg-white dark:bg-gray-800 cursor-pointer";

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Reports</h1>
          <p className="page-subtitle">{filteredData.length} of {attendanceData.length} records · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowBulkModal(true)}><Plus className="w-4 h-4" /> Mark Attendance</Button>
          <Button variant="secondary" size="sm" onClick={exportToCSV}><Download className="w-4 h-4" /> Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Records", value: filteredData.length, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
          { label: "Present", value: presentCount, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
          { label: "Absent", value: absentCount, icon: UserX, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/30" },
          { label: "Rate", value: `${rate}%`, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p></div>
              <div className={`${bg} p-2.5 rounded-lg`}><Icon className={`w-5 h-5 ${color}`} /></div>
            </div>
          </div>
        ))}
      </div>

      {message.text && <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: "", text: "" })} />}

      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by student name or email…" name="student" value={filters.student} onChange={handleFilterChange} className="input-field pl-9" />
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}><Filter className="w-4 h-4" /> Filters</Button>
          <Button variant="ghost" size="sm" onClick={showAllRecords}><Eye className="w-4 h-4" /> All Records</Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div><label className="label">From Date</label><input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="input-field" /></div>
            <div><label className="label">To Date</label><input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="input-field" /></div>
            <div><label className="label">Department</label>
              <select name="department" value={filters.department} onChange={handleFilterChange} className={selectCls}>
                <option value="all">All</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div><label className="label">Status</label>
              <select name="status" value={filters.status} onChange={handleFilterChange} className={selectCls}>
                <option value="all">All</option><option value="present">Present</option><option value="absent">Absent</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="flex-1"><X className="w-4 h-4" /> Reset</Button>
            </div>
          </div>
        )}
      </Card>

      <div className="table-container bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          Showing {Math.min(indexOfFirst + 1, filteredData.length)}–{Math.min(indexOfLast, filteredData.length)} of {filteredData.length}
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Student</th><th>Date</th><th>Subject</th><th>Marked By</th><th>Status</th><th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="py-12 text-center"><Loader text="Loading records…" /></td></tr>
            ) : currentItems.length > 0 ? currentItems.map((record) => (
              <tr key={record.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{record.studentName?.charAt(0).toUpperCase()}</div>
                    <div><p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{record.studentName}</p><p className="text-xs text-gray-500">{record.studentEmail}</p></div>
                  </div>
                </td>
                <td><span className="text-sm text-gray-700 dark:text-gray-300">{new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></td>
                <td><span className="text-sm font-medium text-gray-700 dark:text-gray-300">{record.subject}</span></td>
                <td><span className="text-sm text-gray-600 dark:text-gray-400">{record.markedBy || "—"}</span></td>
                <td><Badge variant={record.status?.toLowerCase() === "present" ? "success" : "danger"}>{record.status?.toUpperCase()}</Badge></td>
                <td>
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => { setSelectedRecord(record); setShowViewModal(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => { setSelectedRecord(record); setEditStatus(record.status); setShowEditModal(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Edit"><Edit3 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="py-16 text-center"><FileText className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" /><p className="text-sm text-gray-500">No records found</p><p className="text-xs text-gray-400 mt-1">Try adjusting your filters or mark new attendance</p></td></tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <Button variant="secondary" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
            <Button variant="secondary" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button>
          </div>
        )}
      </div>

      {/* Bulk Mark Modal */}
      <Modal isOpen={showBulkModal} onClose={() => { setShowBulkModal(false); setSelectedSubject(""); }} title="Mark Subject-wise Attendance" size="xl"
        footer={selectedSubject ? <><Button variant="secondary" onClick={() => { setShowBulkModal(false); setSelectedSubject(""); }}>Cancel</Button><Button onClick={submitBulkAttendance} loading={loading}><CheckSquare className="w-4 h-4" /> Submit Attendance</Button></> : undefined}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Date</label><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} max={todayDate} className="input-field" /></div>
            <div><label className="label">Subject *</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className={selectCls} required>
                <option value="">Choose a subject…</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.code} - {s.name} (Sem {s.semester})</option>)}
              </select>
            </div>
          </div>
          {selectedSubject ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{students.length} students</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={markAllPresent}><CheckSquare className="w-4 h-4 text-emerald-600" /> All Present</Button>
                  <Button variant="outline" size="sm" onClick={markAllAbsent}><XSquare className="w-4 h-4 text-red-500" /> All Absent</Button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto space-y-2 border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">{student.name.charAt(0).toUpperCase()}</div>
                      <div><p className="text-sm font-medium text-gray-800 dark:text-gray-200">{student.name}</p><p className="text-xs text-gray-500">{student.studentId}</p></div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => setBulkAttendance({ ...bulkAttendance, [student.id]: "present" })} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${bulkAttendance[student.id] === "present" ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-emerald-100"}`}>P</button>
                      <button onClick={() => setBulkAttendance({ ...bulkAttendance, [student.id]: "absent" })} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${bulkAttendance[student.id] === "absent" ? "bg-red-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-100"}`}>A</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center"><BookOpen className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" /><p className="text-sm text-gray-500">Select a subject to mark attendance</p></div>
          )}
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Attendance Record" size="md"
        footer={<><Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button><Button onClick={() => { setShowViewModal(false); setEditStatus(selectedRecord.status); setShowEditModal(true); }}><Edit3 className="w-4 h-4" /> Edit</Button></>}
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold">{selectedRecord.studentName?.charAt(0).toUpperCase()}</div>
              <div><p className="font-bold text-gray-900 dark:text-white">{selectedRecord.studentName}</p><p className="text-sm text-gray-500">{selectedRecord.studentEmail}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: "Date", value: new Date(selectedRecord.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) }, { label: "Subject", value: selectedRecord.subject }, { label: "Marked By", value: selectedRecord.markedBy || "—" }, { label: "Department", value: selectedRecord.department || "—" }].map(({ label, value }) => (
                <div key={label} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"><p className="text-xs text-gray-500 mb-0.5">{label}</p><p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value}</p></div>
              ))}
            </div>
            <div><p className="text-xs text-gray-500 mb-1">Status</p><Badge variant={selectedRecord.status?.toLowerCase() === "present" ? "success" : "danger"}>{selectedRecord.status?.toUpperCase()}</Badge></div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Attendance" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button><Button onClick={handleUpdateAttendance} loading={loading} disabled={editStatus?.toUpperCase() === selectedRecord?.status?.toUpperCase()}><Save className="w-4 h-4" /> Save</Button></>}
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedRecord.studentName}</p>
              <p className="text-xs text-gray-500">{selectedRecord.subject} · {new Date(selectedRecord.date).toLocaleDateString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setEditStatus("PRESENT")} className={`p-4 rounded-xl font-semibold transition-all ${editStatus?.toUpperCase() === "PRESENT" ? "bg-emerald-500 text-white ring-2 ring-emerald-300" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-emerald-50"}`}>
                <UserCheck className="w-6 h-6 mx-auto mb-1" />Present
              </button>
              <button onClick={() => setEditStatus("ABSENT")} className={`p-4 rounded-xl font-semibold transition-all ${editStatus?.toUpperCase() === "ABSENT" ? "bg-red-500 text-white ring-2 ring-red-300" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50"}`}>
                <UserX className="w-6 h-6 mx-auto mb-1" />Absent
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AttendanceReports;
