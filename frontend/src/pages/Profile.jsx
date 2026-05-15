import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Badge from "../components/Badge";
import { profileAPI, attendanceAPI } from "../utils/apiService";
import { 
  User, Mail, Phone, Calendar, Lock, Shield, Award, BookOpen, Clock, 
  Edit2, Camera, Check, Target, TrendingUp, XCircle, ShieldCheck, 
  Download, Bell, HelpCircle, Eye, EyeOff, Activity, CheckCircle, ChevronRight, Fingerprint
} from "lucide-react";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [profileData, setProfileData] = useState({ 
    name: user?.name || "", 
    email: user?.email || "", 
    phone: "", 
    rollNo: "", 
    department: "", 
    semester: "", 
    dateOfBirth: "",
    profileImage: ""
  });
  const [passwordData, setPasswordData] = useState({ 
    currentPassword: "", 
    newPassword: "", 
    confirmPassword: "" 
  });
  const [attendanceStats, setAttendanceStats] = useState({ 
    percentage: 0, 
    present: 0, 
    absent: 0, 
    total: 0 
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => { 
    if (user?.id) { 
      fetchProfile(); 
      fetchAttendanceStats(); 
    } 
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      const p = response.data.data;
      setProfileData({ 
        name: p.name || "", 
        email: p.email || "", 
        phone: p.phoneNumber || "", 
        rollNo: p.studentId || "", 
        department: p.department || "", 
        semester: p.semester || "", 
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : "",
        profileImage: p.profileImage || "" 
      });
      updateUser({ 
        name: p.name, 
        profileImage: p.profileImage 
      });
    } catch (error) { 
      console.error("Error fetching profile:", error); 
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const response = await attendanceAPI.getMyAttendance(user.id);
      const records = response.data.data || [];
      const present = records.filter((r) => r.status.toUpperCase() === "PRESENT").length;
      const absent = records.filter((r) => r.status.toUpperCase() === "ABSENT").length;
      const total = records.length;
      setAttendanceStats({ 
        percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0, 
        present, 
        absent, 
        total 
      });
    } catch (error) { 
      console.error("Error fetching stats:", error); 
    }
  };

  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true); 
    setMessage({ type: "", text: "" });
    try {
      await profileAPI.updateProfile(profileData);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      fetchProfile();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile." });
    } finally { 
      setLoading(false); 
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault(); 
    setMessage({ type: "", text: "" });
    if (passwordData.newPassword !== passwordData.confirmPassword) { 
      setMessage({ type: "error", text: "Passwords do not match!" }); 
      return; 
    }
    if (passwordData.newPassword.length < 6) { 
      setMessage({ type: "error", text: "Password must be at least 6 characters." }); 
      return; 
    }
    setLoading(true);
    try {
      await profileAPI.changePassword({ 
        currentPassword: passwordData.currentPassword, 
        newPassword: passwordData.newPassword 
      });
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to change password." });
    } finally { 
      setLoading(false); 
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]; 
    if (!file) return;
    setMessage({ type: "", text: "" });
    try {
      setLoading(true);
      const formData = new FormData(); 
      formData.append("photo", file);
      await profileAPI.uploadPhoto(formData);
      setMessage({ type: "success", text: "Profile photo updated!" });
      fetchProfile();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to upload photo." });
    } finally { 
      setLoading(false); 
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const rate = Number(attendanceStats.percentage);

  return (
    <div className="animate-fade-in pb-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Profile</h1>
            <User className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Manage your personal information and security settings
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg shadow-sm">
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Active</span>
        </div>
      </div>

      {message.text && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: "", text: "" })} />
      )}

      {/* Hero Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-100 via-indigo-50 to-white dark:from-indigo-900/40 dark:via-gray-800 dark:to-gray-800 border border-indigo-100 dark:border-indigo-800/30 p-8 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl -ml-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative group flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-extrabold ring-8 ring-white dark:ring-gray-800 shadow-md overflow-hidden">
              {profileData.profileImage ? (
                <img src={`/${profileData.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profileData.name?.charAt(0)?.toUpperCase() || <User className="w-10 h-10" />
              )}
            </div>
            <label htmlFor="photo-upload" className="absolute bottom-1 right-1 w-8 h-8 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform">
              <Edit2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          {/* Info */}
          <div className="pt-2">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">{profileData.name || "—"}</h2>
              {profileData.rollNo && (
                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-md">
                  {profileData.rollNo}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Student • Original ICs
            </p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              {profileData.department || "Computer Science"} • Semester {profileData.semester || "1"}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg">
                <Mail className="w-4 h-4" /> {profileData.email}
              </div>
              <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg">
                <Phone className="w-4 h-4" /> {profileData.phone || "+6019 767 890"}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Right Graphic */}
        <div className="relative z-10 flex items-center gap-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-white/50 dark:border-gray-700 max-w-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
             <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">Your profile is complete!</h4>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Keep your information updated for a better experience.</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Overall Attendance", value: `${attendanceStats.percentage}%`, sub: "Below target (75%)", subColor: "text-red-500", icon: Target, color: "text-purple-600", iconBg: "bg-purple-50", borderColor: "border-purple-100", graphColor: "text-purple-300" },
          { label: "Days Present", value: attendanceStats.present, sub: "Good job!", subColor: "text-emerald-500", icon: CheckCircle, color: "text-emerald-500", iconBg: "bg-emerald-50", borderColor: "border-emerald-100", graphColor: "text-emerald-300" },
          { label: "Days Absent", value: attendanceStats.absent, sub: "Keep it low", subColor: "text-red-500", icon: XCircle, color: "text-red-500", iconBg: "bg-red-50", borderColor: "border-red-100", graphColor: "text-red-300" },
          { label: "Current Semester", value: profileData.semester ? `Sem ${profileData.semester}` : "Sem 1", sub: "Active semester", subColor: "text-amber-500", icon: Calendar, color: "text-amber-500", iconBg: "bg-amber-50", borderColor: "border-amber-100", graphColor: "text-amber-300" },
        ].map(({ label, value, sub, subColor, icon: Icon, color, iconBg, borderColor, graphColor }, idx) => (
          <div key={label} className={`rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6 flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden`}>
            <div className="flex items-start justify-between mb-2 z-10">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{label}</p>
              <div className={`p-1.5 rounded-md ${iconBg} dark:bg-gray-700 shadow-sm border border-white/50 dark:border-gray-600`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <div className="z-10 mb-4">
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{value}</p>
            </div>
            <div className="flex items-center gap-1.5 z-10">
               <div className={`w-2 h-2 rounded-full ${subColor.replace('text', 'bg')}`}></div>
               <p className={`text-[10px] font-bold ${subColor}`}>{sub}</p>
            </div>
            
            {/* Simple decorative sparkline background icon */}
            <div className={`absolute bottom-2 right-2 opacity-10 pointer-events-none ${graphColor}`}>
              <Activity className="w-16 h-16" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Forms) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Update your personal details</p>
                </div>
              </div>
              <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-lg px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center gap-2">
                 <Edit2 className="w-3 h-3" /> Edit
              </button>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                    <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                    <input type="email" name="email" value={profileData.email} disabled className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 outline-none cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                    <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Matric Number</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                    <input type="text" name="rollNo" value={profileData.rollNo} disabled className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 outline-none cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Department</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                    <input type="text" name="department" value={profileData.department} disabled className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 outline-none cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Semester</label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                    <input type="text" name="semester" value={profileData.semester} disabled className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 outline-none cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                    <input type="date" name="dateOfBirth" value={profileData.dateOfBirth} onChange={handleProfileChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-start">
                <Button type="submit" loading={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-900/20 px-6 py-2.5">
                  Update Profile
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-500">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Keep your account secure</p>
                </div>
              </div>
              <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-lg px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center gap-2">
                 Reset Password
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Current Password</label>
                  <div className="relative">
                    <input type={showPassword.current ? "text" : "password"} name="currentPassword" placeholder="Enter current password" value={passwordData.currentPassword} onChange={handlePasswordChange} required className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                    <button type="button" onClick={() => togglePasswordVisibility('current')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">New Password</label>
                  <div className="relative">
                    <input type={showPassword.new ? "text" : "password"} name="newPassword" placeholder="Enter new password" value={passwordData.newPassword} onChange={handlePasswordChange} required className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                    <button type="button" onClick={() => togglePasswordVisibility('new')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Confirm New Password</label>
                  <div className="relative">
                    <input type={showPassword.confirm ? "text" : "password"} name="confirmPassword" placeholder="Confirm new password" value={passwordData.confirmPassword} onChange={handlePasswordChange} required className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                    <button type="button" onClick={() => togglePasswordVisibility('confirm')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-start">
                <Button type="submit" loading={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-900/20 px-6 py-2.5">
                  Change Password
                </Button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column (Sidebar Cards) */}
        <div className="space-y-6">
          
          {/* Account Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Account Information</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-dashed border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-xs font-semibold text-gray-500">Role</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">{user?.role || "STUDENT"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-dashed border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-xs font-semibold text-gray-500">Roll No</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">{profileData.rollNo || "—"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-dashed border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-xs font-semibold text-gray-500">Semester</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">{profileData.semester || "1"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-dashed border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-xs font-semibold text-gray-500">Department</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">{profileData.department || "Computer Science"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-dashed border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-xs font-semibold text-gray-500">Account Status</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-extrabold rounded-md uppercase">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500">Member Since</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">May 13, 2026</span>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Attendance Summary</h3>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="relative flex-shrink-0 w-20 h-20">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="34" stroke="#f3f4f6" strokeWidth="8" fill="none" className="dark:stroke-gray-700" />
                  <circle cx="40" cy="40" r="34" stroke="#f59e0b" strokeWidth="8" fill="none"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - rate / 100)}`}
                    strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-extrabold text-gray-900 dark:text-white">{attendanceStats.percentage}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Below Target</p>
                <p className="text-xs font-medium text-gray-500">Target: 75%</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">Present</span>
                  <span className="text-sm font-bold text-emerald-500">{attendanceStats.present}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${attendanceStats.percentage}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">Absent</span>
                  <span className="text-sm font-bold text-red-500">{attendanceStats.absent}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-red-500 h-full rounded-full transition-all duration-700" style={{ width: `${attendanceStats.total > 0 ? (attendanceStats.absent / attendanceStats.total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Quick Actions</h3>
            </div>
            <div className="space-y-2">
              {[
                { icon: Download, label: "Download My Data", desc: "Export your profile and attendance data" },
                { icon: Bell, label: "Notification Settings", desc: "Manage your email and push notifications" },
                { icon: Lock, label: "Privacy Settings", desc: "Control your data and privacy preferences" },
                { icon: HelpCircle, label: "Help & Support", desc: "Get help or contact support team" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-xl cursor-pointer transition-colors group">
                  <div className="flex items-start gap-3">
                    <div className="text-indigo-500 mt-0.5"><item.icon className="w-4 h-4" /></div>
                    <div>
                      <h4 className="text-[11px] font-bold text-gray-900 dark:text-white mb-0.5">{item.label}</h4>
                      <p className="text-[9px] font-medium text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Footer Banner */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left md:border-r border-gray-100 dark:border-gray-700 pr-6">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 border border-indigo-100 dark:border-indigo-800">
               <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="pt-1">
               <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">Your Data is Safe with Us</h4>
               <p className="text-xs text-gray-500 font-medium max-w-sm">We use industry-standard security measures to protect your personal information.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-6 lg:gap-10">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-green-50 text-green-600"><Lock className="w-5 h-5" /></div>
               <div>
                 <p className="text-xs font-bold text-gray-900 dark:text-white">Secure Encryption</p>
                 <p className="text-[10px] font-medium text-gray-500">256-bit SSL protection</p>
               </div>
             </div>
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-orange-50 text-orange-600"><Fingerprint className="w-5 h-5" /></div>
               <div>
                 <p className="text-xs font-bold text-gray-900 dark:text-white">Privacy First</p>
                 <p className="text-[10px] font-medium text-gray-500">Your data, your control</p>
               </div>
             </div>
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Shield className="w-5 h-5" /></div>
               <div>
                 <p className="text-xs font-bold text-gray-900 dark:text-white">Trusted Platform</p>
                 <p className="text-[10px] font-medium text-gray-500">Reliable & secure</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
