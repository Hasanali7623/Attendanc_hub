import { useState, useEffect } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import { leaveAPI } from "../../utils/apiService";
import {
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  Download,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckSquare,
  Zap,
  X,
} from "lucide-react";

const LeaveRequests = () => {
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedLeaves, setSelectedLeaves] = useState([]);
  const [bulkAction, setBulkAction] = useState("");

  useEffect(() => { fetchLeaves(); }, []);
  useEffect(() => { applyFilter(); }, [filterStatus, filterType, searchTerm, leaves]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.getAllLeaves();
      const formattedLeaves = response.data.data.map((leave) => ({
        id: leave.id,
        studentId: leave.studentId,
        studentName: leave.studentName,
        rollNo: leave.studentIdNumber,
        department: leave.department,
        email: leave.studentEmail,
        startDate: leave.fromDate,
        endDate: leave.toDate,
        type: leave.leaveType,
        reason: leave.reason,
        status: leave.status.toLowerCase(),
        appliedDate: leave.createdAt,
        approvedDate: leave.approvedAt,
        adminRemarks: leave.adminRemarks,
        approvedBy: leave.approvedBy,
      }));
      setLeaves(formattedLeaves);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch leave requests." });
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...leaves];
    if (filterStatus !== "all") filtered = filtered.filter((l) => l.status === filterStatus);
    if (filterType !== "all") filtered = filtered.filter((l) => l.type === filterType);
    if (searchTerm) {
      filtered = filtered.filter(
        (l) =>
          l.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredLeaves(filtered);
  };

  const handleApprove = async (leaveId) => {
    try {
      setLoading(true);
      await leaveAPI.approveLeave(leaveId, "");
      setMessage({ type: "success", text: "Leave request approved successfully!" });
      fetchLeaves();
      setShowDetailModal(false);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to approve leave request." });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setMessage({ type: "error", text: "Please provide a rejection reason" });
      return;
    }
    try {
      setLoading(true);
      await leaveAPI.rejectLeave(selectedLeave.id, rejectionReason);
      setMessage({ type: "success", text: "Leave request rejected successfully!" });
      fetchLeaves();
      setShowRejectModal(false);
      setShowDetailModal(false);
      setRejectionReason("");
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to reject leave request." });
    } finally {
      setLoading(false);
    }
  };

  const toggleLeaveSelection = (leaveId) =>
    setSelectedLeaves((prev) => prev.includes(leaveId) ? prev.filter((id) => id !== leaveId) : [...prev, leaveId]);

  const selectAllPending = () => setSelectedLeaves(filteredLeaves.filter((l) => l.status === "pending").map((l) => l.id));
  const clearSelection = () => setSelectedLeaves([]);

  const handleBulkAction = async () => {
    if (!selectedLeaves.length) return setMessage({ type: "error", text: "Please select at least one leave request" });
    if (!bulkAction) return setMessage({ type: "error", text: "Please select an action" });
    if (bulkAction === "reject" && !rejectionReason.trim()) return setMessage({ type: "error", text: "Please provide rejection reason" });
    try {
      setLoading(true);
      if (bulkAction === "approve") await leaveAPI.bulkApprove(selectedLeaves);
      else if (bulkAction === "reject") await leaveAPI.bulkReject(selectedLeaves);
      setMessage({ type: "success", text: `${selectedLeaves.length} leave request(s) ${bulkAction}d successfully!` });
      fetchLeaves();
      setShowBulkModal(false);
      setSelectedLeaves([]);
      setBulkAction("");
      setRejectionReason("");
    } catch (error) {
      setMessage({ type: "error", text: `Failed to ${bulkAction} leave requests.` });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Student Name", "Roll No", "Email", "Type", "Start Date", "End Date", "Days", "Status", "Reason"];
    const csvData = filteredLeaves.map((l) => [l.studentName, l.rollNo || "N/A", l.email || "N/A", getLeaveTypeLabel(l.type), l.startDate, l.endDate, calculateDays(l.startDate, l.endDate), l.status.toUpperCase(), l.reason.replace(/,/g, ";")]);
    const csv = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leave-requests-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const clearFilters = () => { setFilterStatus("all"); setFilterType("all"); setSearchTerm(""); };
  const viewDetails = (leave) => { setSelectedLeave(leave); setShowDetailModal(true); };
  const getStatusBadge = (status) => {
    const variants = { pending: "warning", approved: "success", rejected: "danger" };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };
  const getLeaveTypeLabel = (type) => ({ sick: "Sick Leave", personal: "Personal Leave", emergency: "Emergency", other: "Other" }[type] || type);
  const calculateDays = (startDate, endDate) => Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

  const pendingCount = leaves.filter((l) => l.status === "pending").length;
  const approvedCount = leaves.filter((l) => l.status === "approved").length;
  const rejectedCount = leaves.filter((l) => l.status === "rejected").length;

  const selectClass = "input-field bg-white dark:bg-gray-800 cursor-pointer";

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Requests</h1>
          <p className="page-subtitle">
            {filteredLeaves.length} of {leaves.length} requests
            {selectedLeaves.length > 0 && <span className="text-indigo-600 font-medium ml-2">· {selectedLeaves.length} selected</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedLeaves.length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => setShowBulkModal(true)}>
              <Zap className="w-4 h-4" /> Bulk Action ({selectedLeaves.length})
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: leaves.length, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
          { label: "Pending", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30" },
          { label: "Approved", value: approvedCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
          { label: "Rejected", value: rejectedCount, icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/30" },
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

      {message.text && <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: "", text: "" })} />}

      {/* Search & filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or roll number…"
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
            <div>
              <label className="label">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="label">Leave Type</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={selectClass}>
                <option value="all">All Types</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="emergency">Emergency Leave</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
                <X className="w-4 h-4" /> Clear
              </Button>
            </div>
          </div>
        )}

        {pendingCount > 0 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                {pendingCount} pending request{pendingCount !== 1 ? "s" : ""} awaiting review
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={selectAllPending}>
              <CheckSquare className="w-4 h-4" /> Select All Pending
            </Button>
          </div>
        )}
      </Card>

      {/* Table */}
      <div className="table-container bg-white dark:bg-gray-800 shadow-sm">
        <table className="table">
          <thead>
            <tr>
              <th className="w-10">
                <input
                  type="checkbox"
                  checked={selectedLeaves.length === filteredLeaves.filter((l) => l.status === "pending").length && filteredLeaves.filter((l) => l.status === "pending").length > 0}
                  onChange={(e) => e.target.checked ? selectAllPending() : clearSelection()}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th>Student</th>
              <th>Type</th>
              <th>Duration</th>
              <th>Days</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="py-12 text-center"><Loader text="Loading leave requests…" /></td></tr>
            ) : filteredLeaves.length > 0 ? (
              filteredLeaves.map((leave) => (
                <tr key={leave.id} className={selectedLeaves.includes(leave.id) ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""}>
                  <td>
                    {leave.status === "pending" && (
                      <input
                        type="checkbox"
                        checked={selectedLeaves.includes(leave.id)}
                        onChange={() => toggleLeaveSelection(leave.id)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {leave.studentName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{leave.studentName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{leave.rollNo}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium">
                      {getLeaveTypeLabel(leave.type)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{new Date(leave.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      {leave.startDate !== leave.endDate && (
                        <><span className="text-gray-400">→</span><span>{new Date(leave.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {calculateDays(leave.startDate, leave.endDate)}d
                    </span>
                  </td>
                  <td>{getStatusBadge(leave.status)}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => viewDetails(leave)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {leave.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(leave.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedLeave(leave); setShowRejectModal(true); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-16 text-center">
                  <FileText className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No leave requests found</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Leave Request Details" size="lg">
        {selectedLeave && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Student Name", value: selectedLeave.studentName },
                { label: "Roll No", value: selectedLeave.rollNo },
                { label: "Email", value: selectedLeave.email },
                { label: "Leave Type", value: getLeaveTypeLabel(selectedLeave.type) },
                { label: "Start Date", value: new Date(selectedLeave.startDate).toLocaleDateString() },
                { label: "End Date", value: new Date(selectedLeave.endDate).toLocaleDateString() },
                { label: "Duration", value: `${calculateDays(selectedLeave.startDate, selectedLeave.endDate)} days` },
                { label: "Applied", value: new Date(selectedLeave.appliedDate).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
              {getStatusBadge(selectedLeave.status)}
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reason</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                {selectedLeave.reason}
              </p>
            </div>

            {selectedLeave.status === "approved" && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Approved on {new Date(selectedLeave.approvedDate).toLocaleDateString()} by {selectedLeave.approvedBy}
                </p>
              </div>
            )}

            {selectedLeave.status === "pending" && (
              <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                <Button variant="success" onClick={() => handleApprove(selectedLeave.id)} loading={loading} className="flex-1">
                  <CheckCircle className="w-4 h-4" /> Approve
                </Button>
                <Button variant="danger" onClick={() => { setShowDetailModal(false); setShowRejectModal(true); }} className="flex-1">
                  <XCircle className="w-4 h-4" /> Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => { setShowRejectModal(false); setRejectionReason(""); }}
        title="Reject Leave Request"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowRejectModal(false); setRejectionReason(""); }}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} loading={loading}>Reject Leave</Button>
          </>
        }
      >
        <div className="space-y-1.5">
          <label className="label">Rejection Reason (required)</label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            placeholder="Please provide a reason for rejection…"
            className="input-field resize-none"
            required
          />
        </div>
      </Modal>

      {/* Bulk Action Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => { setShowBulkModal(false); setBulkAction(""); setRejectionReason(""); }}
        title={`Bulk Action — ${selectedLeaves.length} request(s)`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowBulkModal(false); setBulkAction(""); setRejectionReason(""); }}>Cancel</Button>
            <Button onClick={handleBulkAction} disabled={!bulkAction} loading={loading}>
              <Zap className="w-4 h-4" /> Execute
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              You have selected <strong>{selectedLeaves.length}</strong> leave request(s).
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="label">Select Action</label>
            <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="input-field bg-white dark:bg-gray-800 cursor-pointer">
              <option value="">Choose action…</option>
              <option value="approve">Approve All</option>
              <option value="reject">Reject All</option>
            </select>
          </div>
          {bulkAction === "reject" && (
            <div className="space-y-1.5">
              <label className="label">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Reason for rejection…"
                className="input-field resize-none"
                required
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default LeaveRequests;
