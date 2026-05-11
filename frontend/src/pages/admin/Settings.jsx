import { useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Mail,
  Globe,
  Lock,
  Clock,
  FileText,
  RefreshCw,
  Check,
  AlertCircle,
  Phone,
} from "lucide-react";

// Clean toggle component
const Toggle = ({ name, checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer
      peer-checked:bg-indigo-600
      after:content-[''] after:absolute after:top-[2px] after:left-[2px]
      after:bg-white after:rounded-full after:h-4 after:w-4
      after:transition-all peer-checked:after:translate-x-5
      peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/30"
    />
  </label>
);

const ToggleRow = ({ icon: Icon, iconColor = "text-gray-600", label, description, name, checked, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
    <Toggle name={name} checked={checked} onChange={onChange} />
  </div>
);

const SectionHeader = ({ icon: Icon, title, description, iconColor }) => (
  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
    <div className={`p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700`}>
      <Icon className={`w-5 h-5 ${iconColor || "text-indigo-600"}`} />
    </div>
    <div>
      <h3 className="text-sm font-bold text-gray-800 dark:text-white">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
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
    attendanceThreshold: "75",
    lateMarkMinutes: "15",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: true,
    leaveAutoApproval: false,
    maxLeaveDays: "10",
    minLeaveNoticeDays: "2",
    maintenanceMode: false,
    sessionTimeout: "30",
    twoFactorAuth: false,
  };

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("systemSettings");
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
      if (parseInt(settings.attendanceThreshold) < 0 || parseInt(settings.attendanceThreshold) > 100) {
        setMessage({ type: "error", text: "Attendance threshold must be between 0–100%" });
        return;
      }
      if (parseInt(settings.sessionTimeout) < 5) {
        setMessage({ type: "error", text: "Session timeout must be at least 5 minutes" });
        return;
      }
      await new Promise((r) => setTimeout(r, 600));
      localStorage.setItem("systemSettings", JSON.stringify(settings));
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
      localStorage.setItem("systemSettings", JSON.stringify(defaultSettings));
      setMessage({ type: "success", text: "Settings reset to defaults." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "attendance", label: "Attendance", icon: Clock },
    { id: "leave", label: "Leave", icon: Shield },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure your institution's preferences and policies</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RefreshCw className="w-4 h-4" /> Reset to Defaults
          </Button>
          <Button size="sm" form="settings-form" type="submit" loading={loading}>
            <Check className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </div>

      {message.text && <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: "", text: "" })} />}

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
              activeTab === id
                ? "bg-white dark:bg-gray-900 text-indigo-600 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-4">
        {/* General */}
        {activeTab === "general" && (
          <Card>
            <SectionHeader icon={Globe} title="Basic Information" description="Your institution's core details and configuration" iconColor="text-indigo-600" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Institution Name" name="institutionName" value={settings.institutionName} onChange={handleChange} helper="Displayed on reports and certificates" />
              <Input label="Institution Email" type="email" name="institutionEmail" value={settings.institutionEmail} onChange={handleChange} helper="Used for system notifications" />
              <Input label="Contact Phone" name="institutionPhone" value={settings.institutionPhone} onChange={handleChange} />
              <Input label="Academic Year" name="academicYear" value={settings.academicYear} onChange={handleChange} helper="Current academic session" />
              <div className="space-y-1.5">
                <label className="label">Current Semester</label>
                <select name="semester" value={settings.semester} onChange={handleChange} className="input-field bg-white dark:bg-gray-800 cursor-pointer">
                  <option>Spring 2025</option>
                  <option>Fall 2025</option>
                  <option>Spring 2026</option>
                </select>
              </div>
              <Input label="Session Timeout (minutes)" type="number" name="sessionTimeout" value={settings.sessionTimeout} onChange={handleChange} min="5" max="120" helper="Minutes before auto-logout" />
            </div>
          </Card>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <Card>
            <SectionHeader icon={Bell} title="Notification Channels" description="Choose how to receive alerts and updates" iconColor="text-amber-500" />
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <ToggleRow icon={Mail} iconColor="text-emerald-600" label="Email Notifications" description="Get alerts via email (Recommended)" name="emailNotifications" checked={settings.emailNotifications} onChange={handleChange} />
              <ToggleRow icon={Bell} iconColor="text-indigo-600" label="Push Notifications" description="Real-time alerts on your device" name="pushNotifications" checked={settings.pushNotifications} onChange={handleChange} />
              <ToggleRow icon={FileText} iconColor="text-purple-600" label="SMS Notifications" description="Text messages for urgent alerts only" name="smsNotifications" checked={settings.smsNotifications} onChange={handleChange} />
            </div>
          </Card>
        )}

        {/* Attendance */}
        {activeTab === "attendance" && (
          <Card>
            <SectionHeader icon={Clock} title="Attendance Policies" description="Set rules for marking and tracking attendance" iconColor="text-emerald-600" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Input label="Minimum Required Attendance (%)" type="number" name="attendanceThreshold" value={settings.attendanceThreshold} onChange={handleChange} min="0" max="100" helper="Percentage students must maintain (e.g. 75%)" />
              <Input label="Grace Period for Late Arrival (min)" type="number" name="lateMarkMinutes" value={settings.lateMarkMinutes} onChange={handleChange} min="0" max="60" helper="Minutes late before marking absent" />
            </div>
            <div>
              <label className="label">Active Working Days</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Click to toggle days on or off</p>
              <div className="flex flex-wrap gap-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      const newDays = settings.workingDays.includes(day)
                        ? settings.workingDays.filter((d) => d !== day)
                        : [...settings.workingDays, day];
                      setSettings({ ...settings, workingDays: newDays });
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      settings.workingDays.includes(day)
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Leave */}
        {activeTab === "leave" && (
          <Card>
            <SectionHeader icon={Shield} title="Leave Management" description="Configure student leave request policies" iconColor="text-amber-500" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Input label="Maximum Leave Days (per semester)" type="number" name="maxLeaveDays" value={settings.maxLeaveDays} onChange={handleChange} min="0" helper="Total days a student can take off" />
              <Input label="Advance Notice Required (days)" type="number" name="minLeaveNoticeDays" value={settings.minLeaveNoticeDays} onChange={handleChange} min="0" helper="Days in advance students must request" />
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <ToggleRow icon={Check} iconColor="text-amber-600" label="Auto-Approve Leave Requests" description="Approve valid requests instantly without manual review" name="leaveAutoApproval" checked={settings.leaveAutoApproval} onChange={handleChange} />
            </div>
          </Card>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <Card>
            <SectionHeader icon={Lock} title="Security Settings" description="Protect your system and data" iconColor="text-red-500" />
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <ToggleRow icon={Lock} iconColor="text-red-500" label="Two-Factor Authentication (2FA)" description="Add extra security with a verification code" name="twoFactorAuth" checked={settings.twoFactorAuth} onChange={handleChange} />
              <ToggleRow icon={AlertCircle} iconColor="text-gray-500" label="Maintenance Mode" description="Block student access while updating the system" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} />
            </div>
          </Card>
        )}
      </form>
    </div>
  );
};

export default Settings;
