import { useState, useEffect } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import Alert from "../../components/Alert";
import Loader from "../../components/Loader";
import { studentAPI } from "../../utils/apiService";
import { useAuth } from "../../context/AuthContext";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Users,
  UserCheck,
  UserX,
  Filter,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Activity,
  Shield,
  GraduationCap
} from "lucide-react";

const ManageStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    id: null, name: "", email: "", studentId: "",
    phoneNumber: "", department: "", semester: "", password: "",
  });

  const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Electrical", "Other"];
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  useEffect(() => { fetchStudents(); }, []);
  useEffect(() => { filterStudents(); }, [searchTerm, filterDepartment, filterSemester, filterStatus, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAllStudents();
      let studentList = response.data.data || [];
      if (user?.assignedSemester) {
        studentList = studentList.filter((s) => s.semester === user.assignedSemester);
      }
      setStudents(studentList);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch students." });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterDepartment !== "all") filtered = filtered.filter((s) => s.department === filterDepartment);
    if (filterSemester !== "all") filtered = filtered.filter((s) => s.semester === filterSemester);
    if (filterStatus !== "all") filtered = filtered.filter((s) => filterStatus === "active" ? s.isActive !== false : s.isActive === false);
    setFilteredStudents(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    try {
      setLoading(true);
      if (editMode) {
        await studentAPI.updateStudent(formData.id, formData);
        setMessage({ type: "success", text: "Student updated successfully!" });
      } else {
        const { studentId, ...dataToSend } = formData;
        await studentAPI.createStudent({ ...dataToSend, role: "STUDENT" });
        setMessage({ type: "success", text: "Student added successfully!" });
      }
      setShowModal(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Operation failed." });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setFormData({
      id: student.id, name: student.name, email: student.email,
      studentId: student.studentId || "", phoneNumber: student.phoneNumber || "",
      department: student.department || "", semester: student.semester || "", password: "",
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      setLoading(true);
      await studentAPI.deleteStudent(id);
      setMessage({ type: "success", text: "Student deleted successfully!" });
      fetchStudents();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to delete student." });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      setLoading(true);
      await studentAPI.toggleStudentStatus(id);
      setMessage({ type: "success", text: `Student ${currentStatus ? 'deactivated' : 'activated'} successfully!` });
      fetchStudents();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update student status." });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ id: null, name: "", email: "", studentId: "", phoneNumber: "", department: "", semester: "", password: "" });
    setEditMode(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const exportToCSV = () => {
    const headers = ["Name", "Student ID", "Email", "Phone", "Department", "Semester", "Status"];
    const csvData = filteredStudents.map((s) => [s.name, s.studentId || "N/A", s.email, s.phoneNumber || "N/A", s.department || "N/A", s.semester || "N/A", s.isActive !== false ? "Active" : "Inactive"]);
    const csv = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const clearFilters = () => {
    setSearchTerm(""); setFilterDepartment("all"); setFilterSemester("all"); setFilterStatus("all");
  };

  const activeCount = students.filter((s) => s.isActive !== false).length;
  const inactiveCount = students.length - activeCount;
  const deptCount = new Set(students.map((s) => s.department).filter(Boolean)).size;

  const selectClass = "w-full appearance-none bg-transparent outline-none text-sm font-semibold text-gray-900 dark:text-white cursor-pointer py-2 pl-3 pr-8";

  // Decorative sparkline component for KPI cards
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
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Manage Students</h1>
            <div className="p-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-md">
               <Users className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {user?.assignedSemester
              ? `Viewing Semester ${user.assignedSemester} · ${filteredStudents.length} student${filteredStudents.length !== 1 ? 's' : ''}`
              : `Viewing All Semesters · ${filteredStudents.length} student${filteredStudents.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-sm font-semibold">
            <Download className="w-4 h-4 text-gray-400" /> Export CSV
          </button>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-semibold text-sm transition-colors shadow-indigo-200 dark:shadow-indigo-900/20">
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {message.text && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: "", text: "" })} />
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Students", value: students.length, sub: "All students", trend: "↑ 100%", trendSub: "vs last month", icon: Users, color: "#6366f1", iconBg: "bg-indigo-50", iconColor: "text-indigo-600", trendColor: "text-indigo-600" },
          { label: "Active Students", value: activeCount, sub: "Currently active", trend: "↑ 100%", trendSub: "vs last month", icon: UserCheck, color: "#10b981", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", trendColor: "text-emerald-600" },
          { label: "Inactive Students", value: inactiveCount, sub: "Currently inactive", trend: "— 0%", trendSub: "vs last month", icon: UserX, color: "#ef4444", iconBg: "bg-red-50", iconColor: "text-red-500", trendColor: "text-red-500" },
          { label: "Departments", value: deptCount, sub: "Total departments", trend: "— 0%", trendSub: "vs last month", icon: BookOpen, color: "#f59e0b", iconBg: "bg-amber-50", iconColor: "text-amber-500", trendColor: "text-amber-500" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between relative z-10 mb-4">
               <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.iconBg} dark:bg-opacity-20 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{stat.label}</h4>
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none">{stat.value}</p>
                  </div>
               </div>
            </div>
            <p className="text-xs font-medium text-gray-500 ml-14 relative z-10">{stat.sub}</p>
            <div className="absolute bottom-0 left-0 right-0 z-0 opacity-80">
               {generateSparkline(stat.color)}
            </div>
            <div className="relative z-10 mt-6 flex items-center gap-2">
               <span className={`text-[10px] font-extrabold ${stat.trendColor} bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded shadow-sm border border-gray-100 dark:border-gray-700`}>{stat.trend}</span>
               <span className="text-[10px] font-medium text-gray-400">{stat.trendSub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search Block */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col lg:flex-row items-center gap-4">
           {/* Search Input */}
           <div className="relative flex-1 w-full">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input
               type="text"
               placeholder="Search by name, student ID, or email..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
             />
           </div>
           {/* Filters toggle */}
           <button className="flex items-center justify-between gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-sm font-semibold min-w-[120px]">
             <span className="flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</span>
             <ChevronDown className="w-4 h-4 text-gray-400" />
           </button>
        </div>
        
        {/* Expanded Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
           <div className="relative bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl">
             <div className="px-3 pt-1.5 pb-0">
               <label className="text-[10px] font-bold text-gray-500 uppercase">Department</label>
             </div>
             <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className={selectClass}>
               <option value="all">All Departments</option>
               {departments.map((d) => <option key={d} value={d}>{d}</option>)}
             </select>
             <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-gray-400 pointer-events-none" />
           </div>
           
           <div className="relative bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl">
             <div className="px-3 pt-1.5 pb-0">
               <label className="text-[10px] font-bold text-gray-500 uppercase">Semester</label>
             </div>
             <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className={selectClass}>
               <option value="all">All Semesters</option>
               {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
             </select>
             <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-gray-400 pointer-events-none" />
           </div>
           
           <div className="relative bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl">
             <div className="px-3 pt-1.5 pb-0">
               <label className="text-[10px] font-bold text-gray-500 uppercase">Status</label>
             </div>
             <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
               <option value="all">All Status</option>
               <option value="active">Active</option>
               <option value="inactive">Inactive</option>
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

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Student <span className="inline-block ml-1 text-gray-300">↑↓</span>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Academic</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <Loader text="Loading students…" />
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0 shadow-sm">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{student.name}</p>
                          <span className="inline-block px-2 py-0.5 mt-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-md">
                            {student.studentId || "No ID"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-indigo-400" />{student.email}
                        </p>
                        {student.phoneNumber && (
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-indigo-400" />{student.phoneNumber}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                         <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> {student.department || "—"}
                         </p>
                         <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Sem {student.semester || "—"}
                         </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 w-max bg-white dark:bg-gray-800 shadow-sm">
                         <span className={`w-2 h-2 rounded-full ${student.isActive !== false ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                         <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{student.isActive !== false ? "Active" : "Inactive"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(student)} className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-100 transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggleActive(student.id, student.isActive !== false)} className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 transition-colors" title={student.isActive !== false ? "Deactivate" : "Activate"}>
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(student.id)} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-base font-bold text-gray-900 dark:text-white mb-1">No students found</p>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Try adjusting your search or filters to find what you're looking for.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/50">
           <p className="text-xs font-medium text-gray-500">
             Showing 1 to {filteredStudents.length} of {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
           </p>
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-1">
               <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 cursor-not-allowed">
                 <ChevronLeft className="w-4 h-4" />
               </button>
               <button className="w-8 h-8 flex items-center justify-center rounded-md bg-indigo-600 text-white font-bold text-xs shadow-sm shadow-indigo-200 dark:shadow-none">
                 1
               </button>
               <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 cursor-not-allowed">
                 <ChevronRight className="w-4 h-4" />
               </button>
             </div>
             <div className="relative">
               <select className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 py-1.5 pl-3 pr-8 outline-none">
                 <option>10 / page</option>
                 <option>20 / page</option>
                 <option>50 / page</option>
               </select>
               <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
             </div>
           </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col xl:flex-row items-center gap-8 justify-between relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left z-10">
           <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
             <GraduationCap className="w-12 h-12 text-indigo-500" />
           </div>
           <div>
             <h3 className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 mb-1">Keep Your Student Records Organized</h3>
             <p className="text-sm font-medium text-gray-500 max-w-sm">Add new students, update their information, and manage academic details all in one place.</p>
           </div>
        </div>
        
        <div className="flex flex-wrap sm:flex-nowrap justify-center gap-6 xl:gap-8 z-10">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
               <Activity className="w-5 h-5" />
             </div>
             <div>
               <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Quick & Easy</h4>
               <p className="text-[10px] font-medium text-gray-500 w-32 leading-tight">Add or edit students in seconds</p>
             </div>
           </div>
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
               <Shield className="w-5 h-5" />
             </div>
             <div>
               <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Secure & Safe</h4>
               <p className="text-[10px] font-medium text-gray-500 w-32 leading-tight">Your data is encrypted and protected</p>
             </div>
           </div>
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
               <UserCheck className="w-5 h-5" />
             </div>
             <div>
               <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Smart Analytics</h4>
               <p className="text-[10px] font-medium text-gray-500 w-32 leading-tight">Get insights and reports effortlessly</p>
             </div>
           </div>
        </div>
        
        {/* Subtle background graphic */}
        <div className="absolute left-0 top-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -ml-20 -mt-20 z-0"></div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editMode ? "Edit Student" : "Add New Student"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
            <Button type="submit" form="student-form" loading={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md shadow-indigo-200">
              {editMode ? "Save Changes" : "Add Student"}
            </Button>
          </>
        }
      >
        <form id="student-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter student name" />
            {editMode && (
              <Input label="Student ID" name="studentId" value={formData.studentId} onChange={handleChange} disabled placeholder="Auto-generated" />
            )}
            <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="student@example.com" />
            <Input label="Phone Number" type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+1234567890" />
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Department</label>
              <div className="relative">
                <select name="department" value={formData.department} onChange={handleChange} required className="w-full appearance-none bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                  <option value="">Select Department</option>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Semester</label>
              <div className="relative">
                <select name="semester" value={formData.semester} onChange={handleChange} required className="w-full appearance-none bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                  <option value="">Select Semester</option>
                  {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            {!editMode && (
              <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Create password" className="sm:col-span-2" />
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageStudents;
