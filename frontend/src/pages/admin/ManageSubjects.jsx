import { useState, useEffect } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import { subjectAPI } from "../../utils/apiService";
import { useAuth } from "../../context/AuthContext";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  GraduationCap,
  Users,
  Calendar,
  Award,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Activity,
  Layers,
  LayoutDashboard,
  Building,
  User as UserIcon,
  Star,
  BookMarked
} from "lucide-react";

const FormSelect = ({ label, name, value, onChange, children, required, disabled, className }) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-xs font-bold text-gray-700 dark:text-gray-300">{label}</label>}
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={className || "w-full appearance-none bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50"}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const ManageSubjects = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterFaculty, setFilterFaculty] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [formData, setFormData] = useState({
    name: "", code: "", semester: "", department: "",
    description: "", credits: "", facultyName: "", isActive: true,
  });

  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Electrical"];

  useEffect(() => { fetchSubjects(); }, []);
  useEffect(() => { applyFilters(); }, [searchTerm, filterSemester, filterDepartment, filterFaculty, filterStatus, subjects]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectAPI.getAllSubjects();
      let data = response.data?.data || response.data || [];
      if (user?.assignedSemester) {
        data = data.filter((s) => s.semester === user.assignedSemester);
      }
      setSubjects(data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch subjects." });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...subjects];
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.facultyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterSemester !== "all") filtered = filtered.filter((s) => s.semester === filterSemester);
    if (filterDepartment !== "all") filtered = filtered.filter((s) => s.department === filterDepartment);
    if (filterFaculty !== "all") filtered = filtered.filter((s) => filterFaculty === 'assigned' ? !!s.facultyName : !s.facultyName);
    if (filterStatus !== "all") filtered = filtered.filter((s) => filterStatus === "active" ? s.isActive : !s.isActive);
    setFilteredSubjects(filtered);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      if (editingSubject) {
        await subjectAPI.updateSubject(editingSubject.id, formData);
        setMessage({ type: "success", text: "Subject updated successfully!" });
      } else {
        await subjectAPI.createSubject(formData);
        setMessage({ type: "success", text: "Subject created successfully!" });
      }
      setShowModal(false);
      resetForm();
      fetchSubjects();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || `Failed to ${editingSubject ? "update" : "create"} subject.` });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name, code: subject.code, semester: subject.semester,
      department: subject.department, description: subject.description || "",
      credits: subject.credits?.toString() || "", facultyName: subject.facultyName || "",
      isActive: subject.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    try {
      setLoading(true);
      await subjectAPI.deleteSubject(id);
      setMessage({ type: "success", text: "Subject deleted successfully!" });
      fetchSubjects();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to delete subject." });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", code: "", semester: user?.assignedSemester || "", department: "", description: "", credits: "", facultyName: "", isActive: true });
    setEditingSubject(null);
  };

  const exportCSV = () => {
    const headers = ["Code", "Name", "Semester", "Department", "Credits", "Faculty", "Status"];
    const data = filteredSubjects.map((s) => [s.code, s.name, s.semester, s.department, s.credits || "N/A", s.facultyName || "N/A", s.isActive ? "Active" : "Inactive"]);
    const csvContent = [headers.join(","), ...data.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subjects_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const clearFilters = () => {
    setSearchTerm(""); setFilterDepartment("all"); setFilterSemester("all"); setFilterStatus("all"); setFilterFaculty("all");
  };

  const stats = {
    total: subjects.length,
    active: subjects.filter((s) => s.isActive).length,
    inactive: subjects.filter((s) => !s.isActive).length,
    departments: new Set(subjects.map((s) => s.department).filter(Boolean)).size,
  };

  const filterSelectClass = "w-full appearance-none bg-transparent outline-none text-sm font-semibold text-gray-900 dark:text-white cursor-pointer py-2 pl-3 pr-8";

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
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Manage Subjects</h1>
            <div className="p-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-md">
               <BookMarked className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {user?.assignedSemester
              ? `Semester ${user.assignedSemester} · ${filteredSubjects.length} subject${filteredSubjects.length !== 1 ? 's' : ''}`
              : `All Semesters · ${filteredSubjects.length} subject${filteredSubjects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-sm font-semibold">
            <Download className="w-4 h-4 text-gray-400" /> Export <ChevronDown className="w-3.5 h-3.5 ml-1 text-gray-400" />
          </button>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-semibold text-sm transition-colors shadow-indigo-200 dark:shadow-indigo-900/20">
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>
      </div>

      {message.text && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: "", text: "" })} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Subjects", value: stats.total, sub: "All subjects", trend: "↑ 100%", trendSub: "vs last semester", icon: BookMarked, color: "#6366f1", iconBg: "bg-indigo-50", iconColor: "text-indigo-600", trendColor: "text-indigo-600" },
          { label: "Active Subjects", value: stats.active, sub: "Currently active", trend: "↑ 100%", trendSub: "vs last semester", icon: CheckCircle, color: "#10b981", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", trendColor: "text-emerald-600" },
          { label: "Inactive Subjects", value: stats.inactive, sub: "Currently inactive", trend: "— 0%", trendSub: "vs last semester", icon: XCircle, color: "#ef4444", iconBg: "bg-red-50", iconColor: "text-red-500", trendColor: "text-red-500" },
          { label: "Departments", value: stats.departments, sub: "Total departments", trend: "— 0%", trendSub: "vs last semester", icon: GraduationCap, color: "#f59e0b", iconBg: "bg-amber-50", iconColor: "text-amber-500", trendColor: "text-amber-500" },
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

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col lg:flex-row items-center gap-4">
           {/* Search Input */}
           <div className="relative flex-1 w-full">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input
               type="text"
               placeholder="Search by name, code, or faculty..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
             />
           </div>
           {/* Filters toggle */}
           <button onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-between gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-sm font-semibold min-w-[120px]">
             <span className="flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</span>
             <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
           </button>
        </div>
        
        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="relative bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="px-3 pt-1.5 pb-0">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Semester</label>
              </div>
              <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className={filterSelectClass}>
                <option value="all">All Semesters</option>
                {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="px-3 pt-1.5 pb-0">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Department</label>
              </div>
              <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className={filterSelectClass}>
                <option value="all">All Departments</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="px-3 pt-1.5 pb-0">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Faculty</label>
              </div>
              <select value={filterFaculty} onChange={(e) => setFilterFaculty(e.target.value)} className={filterSelectClass}>
                <option value="all">All Faculties</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
              <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="px-3 pt-1.5 pb-0">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Status</label>
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={filterSelectClass}>
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
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Code <span className="inline-block ml-1 text-gray-300">↑↓</span>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Subject Name <span className="inline-block ml-1 text-gray-300">↑↓</span>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Semester</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Credits</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Faculty</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <Loader text="Loading subjects…" />
                  </td>
                </tr>
              ) : filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-sm">
                        {subject.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0 shadow-sm border border-indigo-100 dark:border-indigo-800">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{subject.name}</p>
                          {subject.description && (
                             <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 max-w-[200px] truncate">
                               {subject.description}
                             </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-800">
                         Sem {subject.semester}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-gray-400" /> {subject.department || "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                         <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-100 dark:fill-amber-900/50" /> {subject.credits || 0}
                         </p>
                         <p className="text-[10px] font-medium text-gray-500 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-amber-500 ml-1"></span> Credits
                         </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <div className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                           <UserIcon className="w-3.5 h-3.5" />
                         </div>
                         <div className="space-y-0.5">
                            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">{subject.facultyName || "Unassigned"}</p>
                            <p className="text-[10px] font-medium text-gray-500">Faculty</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 w-max bg-white dark:bg-gray-800 shadow-sm">
                         <span className={`w-2 h-2 rounded-full ${subject.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                         <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{subject.isActive ? "Active" : "Inactive"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(subject)} className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-100 transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(subject.id)} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors" title="Delete">
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
                  <td colSpan="8" className="py-16 text-center">
                    <BookMarked className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-base font-bold text-gray-900 dark:text-white mb-1">No subjects found</p>
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
             Showing 1 to {filteredSubjects.length} of {filteredSubjects.length} subjects
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { icon: Layers, title: "Organized & Efficient", desc: "Manage all your subjects in one place with ease.", bg: "bg-purple-50", color: "text-purple-600" },
          { icon: LayoutDashboard, title: "Real-time Overview", desc: "Get instant insights into subject status and details.", bg: "bg-emerald-50", color: "text-emerald-600" },
          { icon: Activity, title: "Smart Management", desc: "Add, update, and manage subjects effortlessly.", bg: "bg-blue-50", color: "text-blue-600" },
          { icon: GraduationCap, title: "Better Collaboration", desc: "Seamlessly manage faculties and departments.", bg: "bg-amber-50", color: "text-amber-600" }
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer group">
            <div className={`w-12 h-12 rounded-xl ${item.bg} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                 <h4 className="text-xs font-bold text-gray-900 dark:text-white">{item.title}</h4>
                 <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
              <p className="text-[10px] font-medium text-gray-500 leading-snug pr-4">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingSubject ? "Edit Subject" : "Add New Subject"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
            <Button type="submit" form="subject-form" loading={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md shadow-indigo-200">
              {editingSubject ? "Save Changes" : "Create Subject"}
            </Button>
          </>
        }
      >
        <form id="subject-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Subject Name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Data Structures" />
            <Input label="Subject Code" name="code" value={formData.code} onChange={handleChange} required placeholder="e.g., CS301" />
            
            <FormSelect
              label="Semester"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              required
              disabled={!!user?.assignedSemester}
            >
              <option value="">Select Semester</option>
              {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
            </FormSelect>
            
            <FormSelect label="Department" name="department" value={formData.department} onChange={handleChange} required>
              <option value="">Select Department</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </FormSelect>
            
            <Input label="Credits" name="credits" type="number" value={formData.credits} onChange={handleChange} placeholder="e.g., 4" min="1" max="10" />
            <Input label="Faculty Name" name="facultyName" value={formData.facultyName} onChange={handleChange} placeholder="e.g., Dr. Smith" />
          </div>

          {user?.assignedSemester && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                You can only create subjects for your assigned Semester {user.assignedSemester}.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Description (optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of the subject…"
              className="w-full appearance-none bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Subject is Active</span>
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default ManageSubjects;
