import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import { leaveAPI } from "../../utils/apiService";
import { Plus, Calendar, FileText, CheckCircle, XCircle, Clock, Send, AlertCircle, Award, ChevronRight, ChevronLeft, Bot, Umbrella, Activity, TrendingUp } from "lucide-react";

const StudentLeave = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({ startDate: "", endDate: "", leaveType: "personal", reason: "" });

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
      setFormData({ startDate: "", endDate: "", leaveType: "personal", reason: "" });
      fetchLeaves();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to submit application." });
    } finally { setLoading(false); }
  };

  const getLeaveTypeLabel = (type) => ({ sick: "Sick Leave", personal: "Personal Leave", emergency: "Emergency Leave", other: "Other" }[type] || type);

  const calculateDays = (start, end) => Math.ceil(Math.abs(new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;

  const pendingCount = leaves.filter((l) => l.status === "pending").length;
  const approvedCount = leaves.filter((l) => l.status === "approved").length;
  const rejectedCount = leaves.filter((l) => l.status === "rejected").length;
  const totalCount = leaves.length;

  return (
    <div className="animate-fade-in pb-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Leave Management</h1>
            <Award className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Apply for leave and monitor your requests
          </p>
        </div>
        <div>
          <Button className="shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-5 py-2.5 h-auto" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Apply for Leave
          </Button>
        </div>
      </div>

      {message.text && <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: "", text: "" })} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Pending", value: pendingCount, sub: "Requests awaiting review", icon: Clock, color: "text-orange-500", iconBg: "bg-orange-50 dark:bg-orange-900/20", borderColor: "border-orange-100 dark:border-orange-900/30", graphColor: "text-orange-300 dark:text-orange-900/50" },
          { label: "Approved", value: approvedCount, sub: "Total approved leaves", icon: CheckCircle, color: "text-emerald-500", iconBg: "bg-emerald-50 dark:bg-emerald-900/20", borderColor: "border-emerald-100 dark:border-emerald-900/30", graphColor: "text-emerald-300 dark:text-emerald-900/50" },
          { label: "Rejected", value: rejectedCount, sub: "Total rejected leaves", icon: XCircle, color: "text-red-500", iconBg: "bg-red-50 dark:bg-red-900/20", borderColor: "border-red-100 dark:border-red-900/30", graphColor: "text-red-300 dark:text-red-900/50" },
          { label: "Total Requests", value: totalCount, sub: "All time requests", icon: Calendar, color: "text-blue-500", iconBg: "bg-blue-50 dark:bg-blue-900/20", borderColor: "border-blue-100 dark:border-blue-900/30", graphColor: "text-blue-300 dark:text-blue-900/50" },
        ].map(({ label, value, sub, icon: Icon, color, iconBg, borderColor, graphColor }, idx) => (
          <div key={label} className={`rounded-2xl border ${borderColor} bg-white dark:bg-gray-800 shadow-sm p-6 flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden`}>
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-3 rounded-full ${iconBg} dark:bg-gray-700 shadow-sm border border-white/50 dark:border-gray-600 z-10`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div className="z-10">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">{label}</p>
                <p className={`text-3xl font-extrabold ${color} dark:text-white`}>{value}</p>
              </div>
            </div>
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 z-10">{sub}</p>
            
            {/* Simple decorative sparkline background icon */}
            <div className={`absolute bottom-2 right-2 opacity-20 dark:opacity-10 pointer-events-none ${graphColor}`}>
              <Activity className="w-20 h-20" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Leave History</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">All your leave applications and their status</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select className="text-xs font-semibold border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 cursor-pointer outline-none">
                  <option>All Status</option>
                  <option>Approved</option>
                  <option>Pending</option>
                  <option>Rejected</option>
                </select>
                <select className="text-xs font-semibold border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 cursor-pointer outline-none">
                  <option>Newest First</option>
                  <option>Oldest First</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {leaves.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No leave applications found.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {leaves.map((leave, index) => {
                    const isApproved = leave.status === "approved";
                    const isRejected = leave.status === "rejected";
                    const isPending = leave.status === "pending";
                    
                    let borderColor = "border-amber-400";
                    let badgeBg = "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
                    let iconColor = "text-amber-500 bg-amber-50";
                    
                    if (isApproved) {
                      borderColor = "border-emerald-500";
                      badgeBg = "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
                      iconColor = "text-emerald-500 bg-emerald-50";
                    } else if (isRejected) {
                      borderColor = "border-red-500";
                      badgeBg = "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400";
                      iconColor = "text-red-500 bg-red-50";
                    }

                    return (
                      <div key={leave.id} className={`flex items-stretch border-l-4 ${borderColor} bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors`}>
                        <div className="p-5 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          
                          <div className="flex items-start gap-4">
                            <div className={`p-1.5 rounded-full mt-1 flex-shrink-0 ${iconColor} dark:bg-opacity-20`}>
                              {isApproved ? <CheckCircle className="w-5 h-5" /> : isRejected ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{getLeaveTypeLabel(leave.type)}</h4>
                                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">#{leave.id || index + 1}</span>
                              </div>
                              
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium mb-2 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(leave.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  {leave.startDate !== leave.endDate && ` – ${new Date(leave.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                                </span>
                                <span>•</span>
                                <span>{calculateDays(leave.startDate, leave.endDate)} day{calculateDays(leave.startDate, leave.endDate) !== 1 ? "s" : ""}</span>
                                <span>•</span>
                                <span>Applied {new Date(leave.appliedDate || leave.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                              </div>
                              
                              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 leading-relaxed max-w-2xl">{leave.reason}</p>
                              
                              {isApproved && (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Approved on {new Date(leave.approvedDate || leave.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                </p>
                              )}
                              {isRejected && leave.rejectionReason && (
                                <p className="text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" />
                                  Rejected: {leave.rejectionReason}
                                </p>
                              )}
                              {isPending && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  Awaiting admin review
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 self-end sm:self-center ml-12 sm:ml-0">
                            <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full tracking-wider uppercase border border-transparent ${badgeBg} ${isApproved ? 'border-emerald-100' : isRejected ? 'border-red-100' : 'border-amber-100'}`}>
                              {leave.status}
                            </span>
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors hidden sm:block">
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                          
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {leaves.length > 0 && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs font-semibold text-gray-500">
                <div className="flex items-center gap-1">
                  <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
                  <button className="w-7 h-7 flex items-center justify-center rounded bg-indigo-600 text-white">1</button>
                  <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <span>Showing 1 to {leaves.length} of {leaves.length} requests</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Leave Summary</h3>
            <div className="flex items-center justify-between gap-6">
              
              <div className="relative flex-shrink-0 w-24 h-24">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#f3f4f6" strokeWidth="12" fill="none" className="dark:stroke-gray-700" />
                  {totalCount > 0 && (
                    <circle cx="48" cy="48" r="40" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - approvedCount / totalCount)}`} strokeLinecap="round" className="transition-all duration-1000" />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold text-gray-900 dark:text-white">{totalCount}</span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Total</span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Approved</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{approvedCount} <span className="text-gray-500">({totalCount?Math.round(approvedCount/totalCount*100):0}%)</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Pending</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{pendingCount} <span className="text-gray-500">({totalCount?Math.round(pendingCount/totalCount*100):0}%)</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Rejected</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{rejectedCount} <span className="text-gray-500">({totalCount?Math.round(rejectedCount/totalCount*100):0}%)</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Cancelled</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">0 <span className="text-gray-500">(0%)</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Did you know? Box */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30 relative overflow-hidden">
            <h4 className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-2 relative z-10">Did you know?</h4>
            <div className="flex items-end justify-between relative z-10">
              <p className="text-xs text-purple-800 dark:text-purple-200 leading-relaxed max-w-[180px]">
                Planning your leave in advance helps keep your team and work on track.
              </p>
              <div className="text-purple-400 opacity-80 mb-2">
                <Umbrella className="w-12 h-12" />
              </div>
            </div>
          </div>

          {/* Need Help Box */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Need Help?</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              Our AI assistant is here to help you with your leave requests.
            </p>
            <div className="flex items-center justify-between">
              <Button onClick={() => navigate("/ai-chatbot")} className="bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-300 border-none font-semibold rounded-xl py-2 px-4 shadow-none transition-colors">
                <Bot className="w-4 h-4 mr-2" /> Chat with AI
              </Button>
              <div className="text-indigo-400/50">
                <Bot className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Apply for Leave"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" form="leave-form" loading={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
              <Send className="w-4 h-4 mr-2" /> Submit Application
            </Button>
          </>
        }
      >
        <form id="leave-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-indigo-900 dark:text-indigo-300">Ensure all details are correct before submitting. Your request will be reviewed by the admin.</p>
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
