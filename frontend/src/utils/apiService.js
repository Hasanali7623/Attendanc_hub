import api from "./api";

// Auth API
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (registerData) => api.post("/auth/register", registerData),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
};

// Attendance API
export const attendanceAPI = {
  markPresent: () => api.post("/attendance/mark"),
  getMyAttendance: (studentId, month, year) =>
    api.get("/attendance/my-attendance", {
      params: { studentId, month, year },
    }),
  getAllAttendance: (filters) =>
    api.get("/attendance/all", { params: filters }),
  markBulkAttendance: (attendanceRecords) =>
    api.post("/attendance/mark-bulk", attendanceRecords),
  updateAttendance: (id, data) => api.put(`/attendance/${id}`, data),
  getAttendanceStats: (studentId) =>
    api.get("/attendance/stats", { params: { studentId } }),
  getSubjectWiseAttendance: () => api.get("/attendance/subject-wise"),
};

// Leave API
export const leaveAPI = {
  applyLeave: (studentId, leaveData) =>
    api.post("/leave/apply", leaveData, { params: { studentId } }),
  getMyLeaves: (studentId) =>
    api.get("/leave/my-leaves", { params: { studentId } }),
  getAllLeaves: () => api.get("/leave/all"),
  getPendingLeaves: () => api.get("/leave/pending"),
  approveLeave: (leaveId, remarks) =>
    api.put(`/leave/${leaveId}/approve`, { adminRemarks: remarks }),
  rejectLeave: (leaveId, remarks) =>
    api.put(`/leave/${leaveId}/reject`, { adminRemarks: remarks }),
  bulkApprove: (leaveIds) => api.put("/leave/bulk/approve", leaveIds),
  bulkReject: (leaveIds) => api.put("/leave/bulk/reject", leaveIds),
};

// Subject API
export const subjectAPI = {
  getAllSubjects: () => api.get("/subjects"),
  getSubjectById: (id) => api.get(`/subjects/${id}`),
  getSubjectsBySemester: (semester) =>
    api.get(`/subjects/semester/${semester}`),
  getSubjectsByDepartment: (department) =>
    api.get(`/subjects/department/${department}`),
  getActiveSubjects: () => api.get("/subjects/active"),
  createSubject: (subjectData) => api.post("/subjects", subjectData),
  updateSubject: (id, subjectData) => api.put(`/subjects/${id}`, subjectData),
  deleteSubject: (id) => api.delete(`/subjects/${id}`),
};

// Student API
export const studentAPI = {
  getAllStudents: () => api.get("/admin/students"),
  getStudentById: (id) => api.get(`/admin/students/${id}`),
  createStudent: (studentData) =>
    api.post("/admin/student/create", studentData),
  updateStudent: (id, studentData) =>
    api.put(`/admin/students/${id}`, studentData),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  toggleStudentStatus: (id) => api.patch(`/admin/students/${id}/toggle-status`),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get("/profile"),
  updateProfile: (profileData) => api.put("/profile", profileData),
  changePassword: (passwordData) => api.put("/profile/password", passwordData),
  uploadPhoto: (formData) =>
    api.post("/profile/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// PDF API
export const pdfAPI = {
  downloadAttendancePDF: (studentId, month, year) =>
    api.get(`/pdf/monthly/${studentId}`, {
      params: { month, year },
      responseType: "blob",
    }),
};

// Dashboard API
export const dashboardAPI = {
  getStudentDashboard: (studentId) =>
    api.get("/student/dashboard", { params: { studentId } }),
  getAdminDashboard: () => api.get("/admin/dashboard"),
};
