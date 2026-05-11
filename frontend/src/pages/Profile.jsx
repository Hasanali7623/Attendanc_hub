import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Badge from "../components/Badge";
import { profileAPI, attendanceAPI } from "../utils/apiService";
import { User, Mail, Phone, Calendar, Lock, Shield, Award, BookOpen, Clock, Edit2, Camera, Check, Target, TrendingUp, XCircle } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [profileData, setProfileData] = useState({ name: user?.name || "", email: user?.email || "", phone: "", rollNo: "", department: "", semester: "", dateOfBirth: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [attendanceStats, setAttendanceStats] = useState({ percentage: 0, present: 0, absent: 0, total: 0 });

  useEffect(() => { if (user?.id) { fetchProfile(); fetchAttendanceStats(); } }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      const p = response.data.data;
      setProfileData({ name: p.name || "", email: p.email || "", phone: p.phoneNumber || "", rollNo: p.studentId || "", department: p.department || "", semester: p.semester || "", dateOfBirth: p.dateOfBirth || "" });
    } catch (error) { console.error("Error fetching profile:", error); }
  };

  const fetchAttendanceStats = async () => {
    try {
      const response = await attendanceAPI.getMyAttendance(user.id);
      const records = response.data.data || [];
      const present = records.filter((r) => r.status.toUpperCase() === "PRESENT").length;
      const absent = records.filter((r) => r.status.toUpperCase() === "ABSENT").length;
      const total = records.length;
      setAttendanceStats({ percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0, present, absent, total });
    } catch (error) { console.error("Error fetching stats:", error); }
  };

  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setMessage({ type: "", text: "" });
    try {
      await profileAPI.updateProfile(profileData);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      fetchProfile();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile." });
    } finally { setLoading(false); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault(); setMessage({ type: "", text: "" });
    if (passwordData.newPassword !== passwordData.confirmPassword) { setMessage({ type: "error", text: "Passwords do not match!" }); return; }
    if (passwordData.newPassword.length < 6) { setMessage({ type: "error", text: "Password must be at least 6 characters." }); return; }
    setLoading(true);
    try {
      await profileAPI.changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to change password." });
    } finally { setLoading(false); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setMessage({ type: "", text: "" });
    try {
      setLoading(true);
      const formData = new FormData(); formData.append("photo", file);
      await profileAPI.uploadPhoto(formData);
      setMessage({ type: "success", text: "Profile photo updated!" });
      fetchProfile();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to upload photo." });
    } finally { setLoading(false); }
  };

  const rate = Number(attendanceStats.percentage);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal information and security settings</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Active</span>
        </div>
      </div>

      {message.text && <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: "", text: "" })} />}

      {/* Profile summary card */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative group flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-indigo-100 dark:ring-indigo-900">
              {profileData.name?.charAt(0)?.toUpperCase() || <User className="w-10 h-10" />}
            </div>
            <label htmlFor="photo-upload" className="absolute bottom-0 right-0 w-7 h-7 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md transition-shadow">
              <Camera className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profileData.name || "—"}</h2>
            <div className="flex items-center gap-2 justify-center sm:justify-start mt-1 flex-wrap">
              <Badge variant="info">{user?.role}</Badge>
              {profileData.rollNo && <span className="text-xs text-gray-500 dark:text-gray-400">{profileData.rollNo}</span>}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{profileData.email}</p>
            {(profileData.department || profileData.semester) && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {profileData.department}{profileData.department && profileData.semester && " · "}
                {profileData.semester && `Semester ${profileData.semester}`}
              </p>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: "Attendance", value: `${attendanceStats.percentage}%`, color: "text-indigo-600" },
              { label: "Present", value: attendanceStats.present, color: "text-emerald-600" },
              { label: "Absent", value: attendanceStats.absent, color: "text-red-500" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Overall Attendance", value: `${attendanceStats.percentage}%`, icon: Target, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
          { label: "Days Present", value: attendanceStats.present, icon: Check, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
          { label: "Days Absent", value: attendanceStats.absent, icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/30" },
          { label: "Current Semester", value: profileData.semester ? `Sem ${profileData.semester}` : "—", icon: BookOpen, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p></div>
              <div className={`${bg} p-2.5 rounded-lg`}><Icon className={`w-5 h-5 ${color}`} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal info */}
          <Card>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"><Edit2 className="w-4 h-4 text-indigo-600" /></div>
              <div><h2 className="text-sm font-bold text-gray-900 dark:text-white">Personal Information</h2><p className="text-xs text-gray-500">Update your personal details</p></div>
            </div>
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" name="name" value={profileData.name} onChange={handleProfileChange} icon={User} />
                <Input label="Email" type="email" name="email" value={profileData.email} onChange={handleProfileChange} icon={Mail} disabled />
                <Input label="Phone Number" type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} icon={Phone} />
                <Input label="Roll Number" name="rollNo" value={profileData.rollNo} onChange={handleProfileChange} disabled />
                <Input label="Department" name="department" value={profileData.department} onChange={handleProfileChange} disabled />
                <Input label="Semester" name="semester" value={profileData.semester} onChange={handleProfileChange} disabled />
                <Input label="Date of Birth" type="date" name="dateOfBirth" value={profileData.dateOfBirth} onChange={handleProfileChange} icon={Calendar} />
              </div>
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button type="submit" loading={loading}><Check className="w-4 h-4" /> Update Profile</Button>
              </div>
            </form>
          </Card>

          {/* Change password */}
          <Card>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg"><Shield className="w-4 h-4 text-red-500" /></div>
              <div><h2 className="text-sm font-bold text-gray-900 dark:text-white">Change Password</h2><p className="text-xs text-gray-500">Keep your account secure</p></div>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><Input label="Current Password" type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} icon={Lock} required /></div>
                <Input label="New Password" type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} icon={Lock} required />
                <Input label="Confirm New Password" type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} icon={Lock} required />
              </div>
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button type="submit" loading={loading}><Shield className="w-4 h-4" /> Change Password</Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right: sidebar */}
        <div className="space-y-6">
          {/* Account info */}
          <Card>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><User className="w-4 h-4 text-gray-600 dark:text-gray-300" /></div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Account Information</h3>
            </div>
            <div className="space-y-2">
              {[
                { label: "Role", value: user?.role || "Student" },
                { label: "Roll No", value: profileData.rollNo || "—" },
                { label: "Semester", value: profileData.semester || "—" },
                { label: "Department", value: profileData.department || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Attendance summary */}
          <Card>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg"><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Attendance Summary</h3>
            </div>

            {/* Progress ring */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-shrink-0">
                <svg className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="#e5e7eb" strokeWidth="5" fill="none" />
                  <circle cx="32" cy="32" r="26" stroke={rate >= 75 ? "#10b981" : "#f59e0b"} strokeWidth="5" fill="none"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - rate / 100)}`}
                    strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{attendanceStats.percentage}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{rate >= 75 ? "On Track" : "Below Target"}</p>
                <p className="text-xs text-gray-500">Target: 75%</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Present</span><span className="font-semibold text-emerald-600">{attendanceStats.present}</span></div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${attendanceStats.percentage}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Absent</span><span className="font-semibold text-red-500">{attendanceStats.absent}</span></div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-red-400 h-full rounded-full transition-all duration-700" style={{ width: `${attendanceStats.total > 0 ? (attendanceStats.absent / attendanceStats.total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
