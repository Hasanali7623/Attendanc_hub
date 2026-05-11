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
} from "lucide-react";

// Helper — some APIs provide a separate Select/Textarea component; inline them cleanly
const FormSelect = ({ label, name, value, onChange, children, required, disabled }) => (
  <div className="space-y-1.5">
    {label && <label className="label">{label}</label>}
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="input-field bg-white dark:bg-gray-800 cursor-pointer disabled:cursor-not-allowed"
    >
      {children}
    </select>
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
  const [formData, setFormData] = useState({
    name: "", code: "", semester: "", department: "",
    description: "", credits: "", facultyName: "", isActive: true,
  });

  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Electrical"];

  useEffect(() => { fetchSubjects(); }, []);
  useEffect(() => { applyFilters(); }, [searchTerm, filterSemester, filterDepartment, subjects]);

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

  const stats = {
    total: subjects.length,
    active: subjects.filter((s) => s.isActive).length,
    inactive: subjects.filter((s) => !s.isActive).length,
    departments: new Set(subjects.map((s) => s.department)).size,
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Subjects</h1>
          <p className="page-subtitle">
            {user?.assignedSemester
              ? `Semester ${user.assignedSemester} · ${filteredSubjects.length} subjects`
              : `${filteredSubjects.length} of ${subjects.length} subjects`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus className="w-4 h-4" /> Add Subject
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
          { label: "Active", value: stats.active, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
          { label: "Inactive", value: stats.inactive, icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/30" },
          { label: "Departments", value: stats.departments, icon: GraduationCap, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30" },
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
              placeholder="Search by name, code, or faculty…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <FormSelect label="Semester" value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)}>
              <option value="all">All Semesters</option>
              {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
            </FormSelect>
            <FormSelect label="Department" value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
              <option value="all">All Departments</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </FormSelect>
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={() => { setFilterSemester("all"); setFilterDepartment("all"); setSearchTerm(""); }} className="w-full">
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
              <th>Code</th>
              <th>Subject Name</th>
              <th>Semester</th>
              <th>Department</th>
              <th>Credits</th>
              <th>Faculty</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="py-12 text-center"><Loader text="Loading subjects…" /></td></tr>
            ) : filteredSubjects.length > 0 ? (
              filteredSubjects.map((subject) => (
                <tr key={subject.id}>
                  <td>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-mono font-semibold">
                      {subject.code}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{subject.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sem {subject.semester}</span>
                  </td>
                  <td>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{subject.department}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      {subject.credits || "—"}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      {subject.facultyName || "Not Assigned"}
                    </div>
                  </td>
                  <td>
                    <Badge variant={subject.isActive ? "success" : "danger"}>
                      {subject.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
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
                <td colSpan="8" className="py-16 text-center">
                  <BookOpen className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No subjects found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingSubject ? "Edit Subject" : "Add New Subject"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
            <Button type="submit" form="subject-form" loading={loading}>
              {editingSubject ? "Save Changes" : "Create Subject"}
            </Button>
          </>
        }
      >
        <form id="subject-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <p className="text-xs text-blue-700 dark:text-blue-300">
                You can only create subjects for your assigned Semester {user.assignedSemester}.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="label">Description (optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of the subject…"
              className="input-field resize-none"
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
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject is Active</span>
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default ManageSubjects;
