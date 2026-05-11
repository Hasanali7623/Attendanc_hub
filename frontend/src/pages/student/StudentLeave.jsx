import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import { leaveAPI } from "../../utils/apiService";
import { Plus, Calendar, FileText, CheckCircle, XCircle, Clock, Send, AlertCircle } from "lucide-react";

const StudentLeave = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({ startDate: "", endDate: "", leaveType: "sick", reason: "" });

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try {
      if (!user?.id) return;
      const response = await leaveAPI.getMyLeaves(user.id);
      const data = response.data?.data || [];
      setLeaves(data.map((l) => ({
        id: l.id, startDate: l.fromDate, endDate: l.toDate, type: l.leaveType,
        reason: l.reason, status: l.status.toLowerCase(), appliedDate: l.createdAt,
        approvedDate: l.approvedAt, rejectionReason: l.adminRemarks,
      })));
    } catch {
      setMessage({ type: "error", text: "Failed to fetch leave requests." });
      setLeaves([]);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      if (!user?.id) throw new Error("Not authenticated");
      await leaveAPI.applyLeave(user.id, { fromDate: formData.startDate, toDate: formData.endDate, leaveType: formData.leaveType, reason: formData.reason });
      setMessage({ type: "success", text: "Leave application submitted successfully!" });
      setShowModal(false);
      setFormData({ startDate: "", endDate: "", leaveType: "sick", reason: "" });
      fetchLeaves();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to submit application." });
    } finally { setLoading(false); }
  };

  const getStatusBadge = (status) => {
    const variants = { pending: "warning", approved: "success", rejected: "danger" };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const getLeaveTypeLabel = (type) => ({ sick: "Sick Leave", personal: "Personal Leave", emergency: "Emergency Leave", other: "Other" }[type] || type);

  const calculateDays = (start, end) => Math.ceil(Math.abs(new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;

  const pendingCount = leaves.filter((l) => l.status === "pending").length;
  const approvedCount = leaves.filter((l) => l.status === "approved").length;
  const rejectedCount = leaves.filter((l) => l.status === "rejected").length;

  const StatusIcon = ({ status }) => {
    if (status === "approved") return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (status === "rejected") return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">Apply for leave and monitor your requests</p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Apply for Leave
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: pendingCount, icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/30" },
          { label: "Approved", value: approvedCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
          { label: "Rejected", value: rejectedCount, icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/30" },
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

      {/* Leave history */}
      <Card title="Leave History" subtitle="All your leave applications and their status">
        {leaves.length === 0 ? (
          <div className="text-center py-14">
            <FileText className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No leave applications yet</p>
            <p className="text-xs text-gray-400 mt-1">Click "Apply for Leave" to submit your first request</p>
            <Button size="sm" className="mt-4" onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4" /> Apply Now
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700 -mx-6">
            {leaves.map((leave) => (
              <div key={leave.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5"><StatusIcon status={leave.status} /></div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{getLeaveTypeLabel(leave.type)}</p>
                        <span className="text-xs text-gray-400">#{leave.id}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(leave.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          {leave.startDate !== leave.endDate && ` – ${new Date(leave.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                        </span>
                        <span>{calculateDays(leave.startDate, leave.endDate)} day{calculateDays(leave.startDate, leave.endDate) !== 1 ? "s" : ""}</span>
                        <span>Applied {new Date(leave.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 line-clamp-2">{leave.reason}</p>
                      {leave.status === "rejected" && leave.rejectionReason && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-red-600 dark:text-red-400">{leave.rejectionReason}</p>
                        </div>
                      )}
                      {leave.status === "approved" && leave.approvedDate && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Approved on {new Date(leave.approvedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">{getStatusBadge(leave.status)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Apply Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Apply for Leave"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" form="leave-form" loading={loading}>
              <Send className="w-4 h-4" /> Submit Application
            </Button>
          </>
        }
      >
        <form id="leave-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300">Ensure all details are correct before submitting. Your request will be reviewed by the admin.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
            <Input label="End Date" type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
          </div>

          <div className="space-y-1.5">
            <label className="label">Leave Type</label>
            <select name="leaveType" value={formData.leaveType} onChange={handleChange} required className="input-field bg-white dark:bg-gray-800 cursor-pointer">
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal Leave</option>
              <option value="emergency">Emergency Leave</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="label">Reason for Leave</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Provide a detailed reason for your leave request…"
              className="input-field resize-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentLeave;
