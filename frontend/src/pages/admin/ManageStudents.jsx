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
  const [showFilters, setShowFilters] = useState(false);
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
    if (filterStatus !== "all") filtered = filtered.filter((s) => filterStatus === "active" ? s.isActive : !s.isActive);
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
    const action = currentStatus ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this student?`)) return;
    try {
      setLoading(true);
      await studentAPI.toggleStudentStatus(id);
      setMessage({ type: "success", text: `Student ${action}d successfully!` });
      fetchStudents();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || `Failed to ${action} student.` });
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
    const csvData = filteredStudents.map((s) => [s.name, s.studentId || "N/A", s.email, s.phoneNumber || "N/A", s.department || "N/A", s.semester || "N/A", s.isActive ? "Active" : "Inactive"]);
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

  const activeCount = students.filter((s) => s.isActive).length;
  const inactiveCount = students.length - activeCount;
  const deptCount = new Set(students.map((s) => s.department)).size;

  const selectClass = "input-field bg-white dark:bg-gray-800 cursor-pointer";

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Students</h1>
          <p className="page-subtitle">
            {user?.assignedSemester
              ? `Viewing Semester ${user.assignedSemester} · ${filteredStudents.length} students`
              : `${filteredStudents.length} of ${students.length} students`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button
            size="sm"
            onClick={() => { resetForm(); setShowModal(true); }}
          >
            <Plus className="w-4 h-4" /> Add Student
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: students.length, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
          { label: "Active", value: activeCount, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
          { label: "Inactive", value: inactiveCount, icon: UserX, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/30" },
          { label: "Departments", value: deptCount, icon: BookOpen, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              </div>
              <div className={`${bg} p-2.5 rounded-lg`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {message.text && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: "", text: "" })} />
      )}

      {/* Search & filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, student ID, or email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide" : "Filters"}
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div>
              <label className="label">Department</label>
              <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className={selectClass}>
                <option value="all">All Departments</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Semester</label>
              <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className={selectClass}>
                <option value="all">All Semesters</option>
                {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
                <X className="w-4 h-4" /> Clear
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Table */}
      <div className="table-container bg-white dark:bg-gray-800 shadow-sm">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Contact</th>
              <th>Academic</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-12 text-center">
                  <Loader text="Loading students…" />
                </td>
              </tr>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{student.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{student.studentId || "No ID"}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-0.5">
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-gray-400" />{student.email}
                      </p>
                      {student.phoneNumber && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-gray-400" />{student.phoneNumber}
                        </p>
                      )}
                    </div>
                  </td>
                  <td>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{student.department || "—"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />Sem {student.semester || "—"}
                    </p>
                  </td>
                  <td>
                    <Badge variant={student.isActive !== false ? "success" : "danger"}>
                      {student.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEdit(student)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(student.id, student.isActive !== false)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          student.isActive !== false
                            ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                            : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        }`}
                        title={student.isActive !== false ? "Deactivate" : "Activate"}
                      >
                        {student.isActive !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-16 text-center">
                  <Users className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No students found</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
            <Button type="submit" form="student-form" loading={loading}>
              {editMode ? "Save Changes" : "Add Student"}
            </Button>
          </>
        }
      >
        <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter student name" />
            {editMode && (
              <Input label="Student ID" name="studentId" value={formData.studentId} onChange={handleChange} disabled placeholder="Auto-generated" />
            )}
            <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="student@example.com" />
            <Input label="Phone Number" type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+1234567890" />
            <div className="space-y-1.5">
              <label className="label">Department</label>
              <select name="department" value={formData.department} onChange={handleChange} required className={selectClass}>
                <option value="">Select Department</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="label">Semester</label>
              <select name="semester" value={formData.semester} onChange={handleChange} required className={selectClass}>
                <option value="">Select Semester</option>
                {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
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
