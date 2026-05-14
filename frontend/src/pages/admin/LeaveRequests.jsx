import { useState, useEffect } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import Loader from "../../components/Loader";
import { leaveAPI } from "../../utils/apiService";
import {
  CheckCircle, XCircle, Eye, Filter, Search, Download, Calendar, Clock, FileText,
  AlertCircle, CheckSquare, Zap, X, ChevronDown, ChevronLeft, ChevronRight, MoreVertical,
  User, Check, CalendarCheck, ArrowRight
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    setCurrentPage(1);
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

  const selectAllFiltered = () => setSelectedLeaves(filteredLeaves.map((l) => l.id));
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
  
  const getLeaveTypeLabel = (type) => ({ sick: "Sick Leave", personal: "Personal Leave", emergency: "Emergency", other: "Other" }[type] || type);
  const calculateDays = (startDate, endDate) => Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

  const pendingCount = leaves.filter((l) => l.status === "pending").length;
  const approvedCount = leaves.filter((l) => l.status === "approved").length;
  const rejectedCount = leaves.filter((l) => l.status === "rejected").length;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredLeaves.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

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
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Leave Requests</h1>
            <div className="p-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-md">
               <FileText className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {filteredLeaves.length} of {leaves.length} requests
            {selectedLeaves.length > 0 && <span className="text-indigo-600 font-bold ml-2">· {selectedLeaves.length} selected</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedLeaves.length > 0 && (
            <button onClick={() => setShowBulkModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-sm font-semibold">
              <Zap className="w-4 h-4 text-amber-500" /> Bulk Action ({selectedLeaves.length})
            </button>
          )}
          <button onClick={exportToCSV} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-semibold text-sm transition-colors shadow-indigo-200 dark:shadow-indigo-900/20">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {message.text && <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: "", text: "" })} />}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { label: "Total Requests", value: leaves.length, sub: "All leave requests", trend: "↑ 100%", trendSub: "vs last month", icon: FileText, color: "#6366f1", iconBg: "bg-indigo-50", iconColor: "text-indigo-600", trendColor: "text-indigo-600" },
          { label: "Pending", value: pendingCount, sub: "Awaiting approval", trend: "— 0%", trendSub: "vs last month", icon: Clock, color: "#f59e0b", iconBg: "bg-amber-50", iconColor: "text-amber-500", trendColor: "text-amber-500" },
          { label: "Approved", value: approvedCount, sub: "Successfully approved", trend: "↑ 100%", trendSub: "vs last month", icon: CheckCircle, color: "#10b981", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", trendColor: "text-emerald-600" },
          { label: "Rejected", value: rejectedCount, sub: "Denied requests", trend: "— 0%", trendSub: "vs last month", icon: XCircle, color: "#ef4444", iconBg: "bg-red-50", iconColor: "text-red-500", trendColor: "text-red-500" },
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

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col lg:flex-row items-center gap-4">
           {/* Search Input */}
           <div className="relative flex-1 w-full">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input
               type="text"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Search by student name or roll number..."
               className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
             />
           </div>
           {/* Filters toggle */}
           <div className="flex items-center gap-3 w-full md:w-auto">
             <button onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-between gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-sm font-semibold min-w-[120px]">
               <span className="flex items-center gap-2"><Filter className="w-4 h-4" /> Filters <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full text-[10px] ml-1">0</span></span>
               <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
             </button>
           </div>
        </div>
        
        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
             <div className="relative bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl">
               <div className="px-3 pt-1.5 pb-0 flex flex-col">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Date Range</label>
                 <input type="text" placeholder="Select date range" className="bg-transparent text-sm font-bold text-gray-900 dark:text-white outline-none pb-2 pt-0.5" />
               </div>
               <Calendar className="absolute right-3 bottom-3 w-4 h-4 text-gray-400 pointer-events-none" />
             </div>

             <div className="relative bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl">
               <div className="px-3 pt-1.5 pb-0">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Type</label>
               </div>
               <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={filterSelectClass}>
                 <option value="all">All Types</option>
                 <option value="sick">Sick Leave</option>
                 <option value="personal">Personal Leave</option>
                 <option value="emergency">Emergency</option>
                 <option value="other">Other</option>
               </select>
               <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-gray-400 pointer-events-none" />
             </div>

             <div className="relative bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl">
               <div className="px-3 pt-1.5 pb-0">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Status</label>
               </div>
               <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={filterSelectClass}>
                 <option value="all">All Statuses</option>
                 <option value="pending">Pending</option>
                 <option value="approved">Approved</option>
                 <option value="rejected">Rejected</option>
               </select>
               <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-gray-400 pointer-events-none" />
             </div>

             <div className="relative bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl">
               <div className="px-3 pt-1.5 pb-0">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Department</label>
               </div>
               <select className={filterSelectClass}>
                 <option value="all">All Departments</option>
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

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedLeaves.length === filteredLeaves.length && filteredLeaves.length > 0}
                    onChange={(e) => e.target.checked ? selectAllFiltered() : clearSelection()}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Student <span className="inline-block ml-1 text-gray-300">↑↓</span>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Type <span className="inline-block ml-1 text-gray-300">↑↓</span>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Duration <span className="inline-block ml-1 text-gray-300">↑↓</span>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Days <span className="inline-block ml-1 text-gray-300">↑↓</span>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Status <span className="inline-block ml-1 text-gray-300">↑↓</span>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <Loader text="Loading leave requests…" />
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((leave) => (
                  <tr key={leave.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition-colors ${selectedLeaves.includes(leave.id) ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLeaves.includes(leave.id)}
                        onChange={() => toggleLeaveSelection(leave.id)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-extrabold shadow-sm flex-shrink-0">
                          {leave.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{leave.studentName}</p>
                          <p className="text-xs font-medium text-gray-500">{leave.rollNo || leave.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-sm">
                         <User className="w-3.5 h-3.5" />
                         {getLeaveTypeLabel(leave.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                         <Calendar className="w-4 h-4 text-indigo-400 mt-0.5" />
                         <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                               {new Date(leave.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                               {leave.startDate !== leave.endDate && ` - ${new Date(leave.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                            </p>
                            <p className="text-xs font-medium text-gray-500">{calculateDays(leave.startDate, leave.endDate)} days</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                        {calculateDays(leave.startDate, leave.endDate)}d
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {leave.status === "approved" && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider mb-1">
                             <Check className="w-3 h-3" /> APPROVED
                          </div>
                        )}
                        {leave.status === "rejected" && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider mb-1">
                             <X className="w-3 h-3" /> REJECTED
                          </div>
                        )}
                        {leave.status === "pending" && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider mb-1">
                             <Clock className="w-3 h-3" /> PENDING
                          </div>
                        )}
                        {leave.status === "approved" && leave.approvedDate && (
                           <p className="text-[10px] font-medium text-gray-500">Approved on {new Date(leave.approvedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button onClick={() => viewDetails(leave)} className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors" title="View"><Eye className="w-4 h-4 text-indigo-500" /></button>
                        <button className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors" title="More options"><MoreVertical className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-base font-bold text-gray-900 dark:text-white mb-1">No leave requests found</p>
                    <p className="text-sm font-medium text-gray-500 mt-1">Try adjusting your filters to find what you're looking for.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/50">
           <p className="text-xs font-medium text-gray-500">
             Showing {Math.min(indexOfFirst + 1, filteredLeaves.length)} to {Math.min(indexOfLast, filteredLeaves.length)} of {filteredLeaves.length} requests
           </p>
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

      {/* Bottom Promotional Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
         <div className="flex items-center gap-6 z-10">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center flex-shrink-0 relative">
               <CalendarCheck className="w-12 h-12 text-indigo-500" />
               <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
               </div>
            </div>
            <div>
               <h3 className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 mb-1">Leave Management Made Easy</h3>
               <p className="text-sm font-medium text-gray-500 max-w-lg leading-relaxed">
                 Streamline leave requests, approvals, and track everything in one place. Keep your records organized and your workflow smooth.
               </p>
            </div>
         </div>
         <div className="z-10">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-indigo-600 font-bold text-sm hover:bg-gray-50 transition-colors">
              Learn more <ArrowRight className="w-4 h-4" />
            </button>
         </div>
         {/* Subtle background decoration */}
         <div className="absolute left-0 top-0 w-64 h-64 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl -ml-20 -mt-20 z-0"></div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Leave Request Details" size="lg">
        {selectedLeave && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold">{selectedLeave.studentName?.charAt(0).toUpperCase()}</div>
              <div><p className="font-bold text-gray-900 dark:text-white">{selectedLeave.studentName}</p><p className="text-sm font-medium text-gray-500">{selectedLeave.email}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Roll No", value: selectedLeave.rollNo },
                { label: "Leave Type", value: getLeaveTypeLabel(selectedLeave.type) },
                { label: "Start Date", value: new Date(selectedLeave.startDate).toLocaleDateString() },
                { label: "End Date", value: new Date(selectedLeave.endDate).toLocaleDateString() },
                { label: "Duration", value: `${calculateDays(selectedLeave.startDate, selectedLeave.endDate)} days` },
                { label: "Applied", value: new Date(selectedLeave.appliedDate).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{value}</p>
                </div>
              ))}
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Reason</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedLeave.reason}
              </p>
            </div>

            {selectedLeave.status === "approved" && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  Approved on {new Date(selectedLeave.approvedDate).toLocaleDateString()} by {selectedLeave.approvedBy}
                </p>
              </div>
            )}
            
            {selectedLeave.status === "rejected" && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm font-bold text-red-700 dark:text-red-300">Rejected Leave Request</p>
                </div>
                {selectedLeave.adminRemarks && (
                   <p className="text-sm font-medium text-red-600 pl-8">{selectedLeave.adminRemarks}</p>
                )}
              </div>
            )}

            {selectedLeave.status === "pending" && (
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button onClick={() => handleApprove(selectedLeave.id)} loading={loading} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm">
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve Leave
                </Button>
                <Button variant="danger" onClick={() => { setShowDetailModal(false); setShowRejectModal(true); }} className="flex-1 rounded-xl font-bold shadow-sm">
                  <XCircle className="w-4 h-4 mr-2" /> Reject Leave
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
            <Button variant="danger" onClick={handleReject} loading={loading} className="font-bold">Confirm Rejection</Button>
          </>
        }
      >
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700">Rejection Reason (required)</label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            placeholder="Please provide a reason for rejection…"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium resize-none"
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
            <Button onClick={handleBulkAction} disabled={!bulkAction} loading={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              <Zap className="w-4 h-4 mr-2" /> Execute Action
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center gap-3">
            <Zap className="w-5 h-5 text-indigo-500" />
            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              You have selected <strong>{selectedLeaves.length}</strong> leave request(s).
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Select Action</label>
            <div className="relative">
              <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 py-3 pl-4 pr-10 outline-none">
                <option value="">Choose action…</option>
                <option value="approve">Approve All</option>
                <option value="reject">Reject All</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          {bulkAction === "reject" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Reason for rejection…"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-sm font-medium resize-none"
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
