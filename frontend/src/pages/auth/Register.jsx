import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/Alert";
import { Eye, EyeOff, User, Lock, GraduationCap, ShieldCheck, Zap, Mail, Phone, ChevronRight, BookOpen, Users, Trophy, Shield } from "lucide-react";
import authIllustration from "../../assets/auth-illustration.png";

const Register = () => {
  const navigate = useNavigate();
  const { register, user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    department: "",
    semester: "",
    assignedSemester: "",
    role: "STUDENT",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Electrical", "Other"];
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  useEffect(() => {
    if (user) {
      navigate(user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role, department: "", semester: "", assignedSemester: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (formData.role === "STUDENT" && (!formData.department || !formData.semester)) {
      setError("Please fill in all student details");
      return;
    }
    if (formData.role === "ADMIN" && !formData.assignedSemester) {
      setError("Please select which semester you will teach");
      return;
    }

    setLoading(true);
    try {
      const registerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };
      if (formData.phoneNumber?.trim()) registerData.phoneNumber = formData.phoneNumber.trim();
      if (formData.role === "STUDENT") {
        registerData.department = formData.department;
        registerData.semester = formData.semester;
      }
      if (formData.role === "ADMIN") {
        registerData.assignedSemester = formData.assignedSemester;
      }

      const result = await register(registerData);
      if (result.success) {
        setSuccess("Account created! Redirecting...");
        setTimeout(() => {
          navigate(result.user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard");
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#304FFE] text-[#1E293B] placeholder-slate-400 font-medium transition-all shadow-sm";
  const selectClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#304FFE] text-slate-700 font-medium transition-all appearance-none cursor-pointer shadow-sm";

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* Left Side - Register Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 lg:p-12 bg-[#F8FAFC] overflow-y-auto custom-scrollbar">
        <div className="max-w-md w-full animate-fade-in-left py-8">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#304FFE] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <GraduationCap className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-[#1E293B] tracking-tight">ALI</h2>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#1E293B] mb-2">Create your account</h1>
            <p className="text-slate-500 font-medium">Join the next generation of attendance tracking</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert type="error" message={error} onClose={() => setError("")} />}
            {success && <Alert type="success" message={success} />}

            {/* Role Toggle Switch */}
            <div className="flex p-1 bg-white rounded-2xl border border-slate-200 shadow-sm mb-6">
              <button
                type="button"
                onClick={() => handleRoleChange("STUDENT")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${formData.role === "STUDENT"
                  ? "bg-[#304FFE] text-white shadow-md shadow-indigo-200"
                  : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <User size={18} /> Student
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("ADMIN")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${formData.role === "ADMIN"
                  ? "bg-[#304FFE] text-white shadow-md shadow-indigo-200"
                  : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <ShieldCheck size={18} /> Admin
              </button>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#304FFE] transition-colors" size={18} />
                <input type="text" name="name" placeholder="Full Name *" value={formData.name} onChange={handleChange} className={inputClass} />
              </div>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#304FFE] transition-colors" size={18} />
                <input type="email" name="email" placeholder="Email *" value={formData.email} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#304FFE] transition-colors" size={18} />
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Password *" value={formData.password} onChange={handleChange} className={`${inputClass} pr-12`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1E293B] transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#304FFE] transition-colors" size={18} />
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm *" value={formData.confirmPassword} onChange={handleChange} className={`${inputClass} pr-12`} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1E293B] transition-colors">
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#304FFE] transition-colors" size={18} />
              <input type="tel" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} className={inputClass} />
            </div>

            {formData.role === "STUDENT" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                <div className="relative">
                  <select name="department" value={formData.department} onChange={handleChange} className={selectClass}>
                    <option value="">Department *</option>
                    {departments.map((dept) => (<option key={dept} value={dept}>{dept}</option>))}
                  </select>
                </div>
                <div className="relative">
                  <select name="semester" value={formData.semester} onChange={handleChange} className={selectClass}>
                    <option value="">Semester *</option>
                    {semesters.map((sem) => (<option key={sem} value={sem}>Semester {sem}</option>))}
                  </select>
                </div>
              </div>
            )}

            {formData.role === "ADMIN" && (
              <select name="assignedSemester" value={formData.assignedSemester} onChange={handleChange} className={selectClass + " animate-fade-in"}>
                <option value="">Select Assigned Semester *</option>
                {semesters.map((sem) => (<option key={sem} value={sem}>Semester {sem}</option>))}
              </select>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#304FFE] hover:bg-[#1A237E] text-white rounded-xl py-4 font-bold text-base transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 mt-2"
            >
              {loading ? "Creating Account..." : (
                <>
                  <Zap size={18} fill="currentColor" /> Sign Up Now
                </>
              )}
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">or continue with</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-[#1E293B] rounded-xl py-3 transition-all font-semibold text-sm shadow-sm">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Google
              </button>
              <button type="button" className="flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-[#1E293B] rounded-xl py-3 transition-all font-semibold text-sm shadow-sm">
                <img src="https://www.svgrepo.com/show/448239/microsoft.svg" className="w-5 h-5" alt="Microsoft" />
                Microsoft
              </button>
            </div>
          </form>

          <p className="text-center text-slate-500 font-medium pt-6">
            Already have an account? <Link to="/login" className="text-[#304FFE] font-bold hover:underline ml-1">Sign In</Link>
          </p>

          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium pt-8 border-t border-slate-100 mt-8">
            <Shield size={14} /> Your data is safe and secure
          </div>
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-indigo-50 to-white overflow-hidden items-center justify-center p-12">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
          <div className="text-center mb-12 animate-fade-in-right">
            <h2 className="text-5xl font-black text-[#1E293B] mb-6 leading-[1.2]">
              Start Your <span className="text-[#304FFE]">Journey.</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium max-w-md mx-auto">
              Join our platform today and experience the future of academic management.
            </p>
          </div>

          {/* Illustration Container */}
          <div className="w-full relative mb-16 transform hover:scale-[1.02] transition-transform duration-700">
             <div className="absolute inset-0 bg-[#304FFE]/5 rounded-[3rem] -rotate-3 scale-105"></div>
             <div className="relative bg-white p-4 rounded-[3rem] shadow-2xl border border-white">
               <img
                src={authIllustration}
                alt="System Illustration"
                className="w-full h-auto rounded-[2.5rem] object-cover"
              />
             </div>
          </div>

          {/* Bottom Features */}
          <div className="grid grid-cols-3 gap-6 w-full">
            {[
              { icon: BookOpen, title: "Smart Tracking", desc: "Automated attendance and leave workflows." },
              { icon: Users, title: "Collaborative", desc: "Connect with teachers and peers effortlessly." },
              { icon: Trophy, title: "Achievement", desc: "Reach your milestones with real-time insights." }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-[#304FFE] mb-4 group-hover:bg-[#304FFE] group-hover:text-white transition-all duration-300 shadow-sm">
                  <feature.icon size={22} />
                </div>
                <h3 className="text-sm font-bold text-[#1E293B] mb-2">{feature.title}</h3>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
