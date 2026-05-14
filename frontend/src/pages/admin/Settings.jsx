import { useState } from "react";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import {
  Settings as SettingsIcon, Bell, Shield, Mail, Lock, Clock, Calendar, RefreshCw, Check,
  Building, Phone, GraduationCap, Timer, ChevronDown, MonitorSmartphone, Smartphone, FileText, AlertCircle, Key, Link
} from "lucide-react";

// ToggleSwitch Component
const ToggleSwitch = ({ label, checked, onChange, name, description }) => (
  <div className="flex items-start justify-between py-2">
    <div>
      <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
      {description && <p className="text-[10px] font-medium text-gray-500 mt-0.5">{description}</p>}
    </div>
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
    </label>
  </div>
);

// Helper for Inputs with Icons
const IconInput = ({ label, icon: Icon, type = "text", name, value, onChange, helper, required = true, children, ...props }) => (
  <div className="space-y-1.5 flex flex-col w-full">
    <div className="flex items-center gap-1.5 px-1">
      <label className="text-[10px] font-bold text-gray-900 dark:text-gray-200 uppercase tracking-wider">{label}</label>
      {required && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
    </div>
    <div className="relative w-full">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon className="w-4 h-4" />
        </div>
      )}
      {children ? (
        children
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white py-3 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${Icon ? 'pl-11' : 'pl-4'}`}
          {...props}
        />
      )}
    </div>
    {helper && <p className="text-[10px] font-medium text-gray-500 px-1 pt-1">{helper}</p>}
  </div>
);

const Settings = () => {
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);

  const defaultSettings = {
    institutionName: "Smart University",
    institutionEmail: "admin@smartuniversity.edu",
    institutionPhone: "+1 (555) 123-4567",
    academicYear: "2025-2026",
    semester: "Spring 2025",
    sessionTimeout: "30",
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    dailyReport: true,
    alertAbsence: true,

    // Attendance
    attendanceMethod: "manual",
    lateThreshold: "15",
    autoMarkAbsent: true,
    allowTeacherEdit: true,

    // Leave
    requireDocument: true,
    maxLeaveDays: "10",
    autoRejectPast: false,
    notifyAdminsOnLeave: true,

    // Security
    twoFactorAuth: false,
    requireStrongPassword: true,
    passwordExpiry: "90",
    ipWhitelist: "",
  };

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("systemSettingsUI");
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({ ...settings, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);
    try {
      if (!settings.institutionName?.trim()) {
        setMessage({ type: "error", text: "Institution name is required" });
        return;
      }
      await new Promise((r) => setTimeout(r, 600));
      localStorage.setItem("systemSettingsUI", JSON.stringify(settings));
      setMessage({ type: "success", text: "Settings saved successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch {
      setMessage({ type: "error", text: "Failed to save settings." });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset all settings to default values? This cannot be undone.")) {
      setSettings(defaultSettings);
      localStorage.setItem("systemSettingsUI", JSON.stringify(defaultSettings));
      setMessage({ type: "success", text: "Settings reset to defaults." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "attendance", label: "Attendance", icon: Clock },
    { id: "leave", label: "Leave", icon: Calendar },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="animate-fade-in pb-12 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pt-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">System Settings</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Configure your institution's preferences and policies</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} type="button" className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-sm font-bold">
            <RefreshCw className="w-4 h-4" /> Reset to Defaults
          </button>
          <button onClick={handleSubmit} type="submit" form="settings-form" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm font-bold text-sm transition-colors shadow-indigo-200 dark:shadow-indigo-900/20">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save Changes
          </button>
        </div>
      </div>

      {message.text && <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: "", text: "" })} />}

      {/* Modern Tabs */}
      <div className="flex gap-8 border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto no-scrollbar">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all whitespace-nowrap relative ${
              activeTab === id
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {activeTab === id && (
               <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        {activeTab === "general" && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Inner Header Banner */}
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-8 flex items-center justify-between relative overflow-hidden border-b border-gray-100 dark:border-gray-700">
               <div className="flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center flex-shrink-0">
                    <Building className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">Basic Information</h2>
                    <p className="text-sm font-medium text-gray-500">Your institution's core details and configuration</p>
                  </div>
               </div>
               {/* Decorative Illustration Graphic */}
               <div className="absolute right-0 top-0 bottom-0 w-64 opacity-20 dark:opacity-10 pointer-events-none flex items-center justify-end pr-8">
                  <Building className="w-32 h-32 text-indigo-600" strokeWidth={1} />
               </div>
            </div>

            {/* Form Fields Grid */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                <IconInput 
                  label="Institution Name" 
                  icon={Building} 
                  name="institutionName" 
                  value={settings.institutionName} 
                  onChange={handleChange} 
                  helper="Displayed on reports and certificates" 
                />
                <IconInput 
                  label="Institution Email" 
                  icon={Mail} 
                  type="email" 
                  name="institutionEmail" 
                  value={settings.institutionEmail} 
                  onChange={handleChange} 
                  helper="Used for system notifications" 
                />
                <IconInput 
                  label="Contact Phone" 
                  icon={Phone} 
                  name="institutionPhone" 
                  value={settings.institutionPhone} 
                  onChange={handleChange} 
                  helper="Primary contact number" 
                />
                <IconInput 
                  label="Academic Year" 
                  icon={Calendar} 
                  name="academicYear" 
                  value={settings.academicYear} 
                  onChange={handleChange} 
                  helper="Current academic session" 
                />
                
                {/* Custom Select for Semester */}
                <IconInput 
                  label="Current Semester" 
                  helper="Active semester"
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <select 
                    name="semester" 
                    value={settings.semester} 
                    onChange={handleChange} 
                    className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white py-3 pl-11 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    <option>Spring 2025</option>
                    <option>Fall 2025</option>
                    <option>Spring 2026</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </IconInput>

                <IconInput 
                  label="Session Timeout (minutes)" 
                  type="number" 
                  icon={Timer} 
                  name="sessionTimeout" 
                  value={settings.sessionTimeout} 
                  onChange={handleChange} 
                  helper="Minutes before auto-logout for security" 
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === "notifications" && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">
            <div className="bg-amber-50/50 dark:bg-amber-900/10 p-8 flex items-center justify-between relative overflow-hidden border-b border-gray-100 dark:border-gray-700">
               <div className="flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center flex-shrink-0">
                    <Bell className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">Notification Preferences</h2>
                    <p className="text-sm font-medium text-gray-500">Manage how the system communicates with students and staff</p>
                  </div>
               </div>
               <div className="absolute right-0 top-0 bottom-0 w-64 opacity-20 dark:opacity-10 pointer-events-none flex items-center justify-end pr-8">
                  <Bell className="w-32 h-32 text-amber-500" strokeWidth={1} />
               </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-6">
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Channels</h3>
                   <ToggleSwitch label="Email Notifications" name="emailNotifications" checked={settings.emailNotifications} onChange={handleChange} description="Send alerts and updates via email" />
                   <ToggleSwitch label="SMS Notifications" name="smsNotifications" checked={settings.smsNotifications} onChange={handleChange} description="Send urgent alerts via SMS (charges apply)" />
                </div>
                <div className="space-y-6">
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Automated Reports</h3>
                   <ToggleSwitch label="Daily Summary Report" name="dailyReport" checked={settings.dailyReport} onChange={handleChange} description="Email daily attendance summary to admins" />
                   <ToggleSwitch label="Absence Alerts" name="alertAbsence" checked={settings.alertAbsence} onChange={handleChange} description="Notify students when marked absent" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Settings */}
        {activeTab === "attendance" && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">
            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-8 flex items-center justify-between relative overflow-hidden border-b border-gray-100 dark:border-gray-700">
               <div className="flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">Attendance Policies</h2>
                    <p className="text-sm font-medium text-gray-500">Configure tracking methods and thresholds</p>
                  </div>
               </div>
               <div className="absolute right-0 top-0 bottom-0 w-64 opacity-20 dark:opacity-10 pointer-events-none flex items-center justify-end pr-8">
                  <Clock className="w-32 h-32 text-emerald-500" strokeWidth={1} />
               </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <IconInput label="Default Tracking Method" helper="How attendance is recorded by default">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Link className="w-4 h-4" /></div>
                  <select name="attendanceMethod" value={settings.attendanceMethod} onChange={handleChange} className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white py-3 pl-11 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer">
                    <option value="manual">Manual Entry by Teachers</option>
                    <option value="biometric">Biometric Integration</option>
                    <option value="rfid">RFID Card Scan</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </IconInput>
                <IconInput label="Late Threshold (minutes)" type="number" icon={Timer} name="lateThreshold" value={settings.lateThreshold} onChange={handleChange} helper="Minutes after start before marked late" />
                
                <div className="space-y-6 md:col-span-2">
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Automation Rules</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <ToggleSwitch label="Auto-mark Absent" name="autoMarkAbsent" checked={settings.autoMarkAbsent} onChange={handleChange} description="Mark absent if no record exists by end of day" />
                     <ToggleSwitch label="Allow Teacher Edits" name="allowTeacherEdit" checked={settings.allowTeacherEdit} onChange={handleChange} description="Teachers can edit records up to 24h later" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leave Settings */}
        {activeTab === "leave" && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">
            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-8 flex items-center justify-between relative overflow-hidden border-b border-gray-100 dark:border-gray-700">
               <div className="flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">Leave Management</h2>
                    <p className="text-sm font-medium text-gray-500">Set quotas and approval workflows</p>
                  </div>
               </div>
               <div className="absolute right-0 top-0 bottom-0 w-64 opacity-20 dark:opacity-10 pointer-events-none flex items-center justify-end pr-8">
                  <Calendar className="w-32 h-32 text-blue-500" strokeWidth={1} />
               </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <IconInput label="Max Leave Days per Semester" type="number" icon={FileText} name="maxLeaveDays" value={settings.maxLeaveDays} onChange={handleChange} helper="Limit before requiring special permission" />
                <div className="hidden md:block"></div>
                <div className="space-y-6 md:col-span-2">
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Application Rules</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <ToggleSwitch label="Require Documentation" name="requireDocument" checked={settings.requireDocument} onChange={handleChange} description="Require proof for leaves > 3 days" />
                     <ToggleSwitch label="Auto-reject Past Dates" name="autoRejectPast" checked={settings.autoRejectPast} onChange={handleChange} description="Prevent applying for dates in the past" />
                     <ToggleSwitch label="Notify Admins" name="notifyAdminsOnLeave" checked={settings.notifyAdminsOnLeave} onChange={handleChange} description="Send email alert for every new request" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">
            <div className="bg-red-50/50 dark:bg-red-900/10 p-8 flex items-center justify-between relative overflow-hidden border-b border-gray-100 dark:border-gray-700">
               <div className="flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">Security & Access</h2>
                    <p className="text-sm font-medium text-gray-500">Protect system data and user accounts</p>
                  </div>
               </div>
               <div className="absolute right-0 top-0 bottom-0 w-64 opacity-20 dark:opacity-10 pointer-events-none flex items-center justify-end pr-8">
                  <Lock className="w-32 h-32 text-red-500" strokeWidth={1} />
               </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <IconInput label="Password Expiry (Days)" type="number" icon={Key} name="passwordExpiry" value={settings.passwordExpiry} onChange={handleChange} helper="Require reset after this many days" />
                <IconInput label="IP Whitelist" icon={MonitorSmartphone} name="ipWhitelist" value={settings.ipWhitelist} onChange={handleChange} helper="Leave empty to allow all IPs. Separate by comma." required={false} />
                
                <div className="space-y-6 md:col-span-2">
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Authentication Security</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <ToggleSwitch label="Two-Factor Authentication" name="twoFactorAuth" checked={settings.twoFactorAuth} onChange={handleChange} description="Require 2FA for all admin logins" />
                     <ToggleSwitch label="Require Strong Passwords" name="requireStrongPassword" checked={settings.requireStrongPassword} onChange={handleChange} description="Must contain uppercase, numbers & symbols" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Bottom Security Banner */}
      <div className="mt-8 bg-blue-50/80 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 p-6 flex items-center justify-between relative overflow-hidden">
         <div className="flex items-start gap-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
               <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
               <h3 className="text-base font-bold text-blue-900 dark:text-blue-300 mb-1">Your settings are secure</h3>
               <p className="text-sm font-medium text-blue-700/70 dark:text-blue-400">All changes are encrypted and stored securely. Make sure to save your changes.</p>
            </div>
         </div>
         {/* Decorative elements */}
         <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-80 z-0">
             <div className="relative">
                <MonitorSmartphone className="w-24 h-24 text-blue-200 dark:text-blue-900/40" strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Lock className="w-8 h-8 text-blue-500" />
                </div>
             </div>
         </div>
         <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-blue-100/50 to-transparent dark:from-blue-900/20 z-0"></div>
      </div>

    </div>
  );
};

export default Settings;
