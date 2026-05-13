import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/Alert";
import { Eye, EyeOff, User, Lock, GraduationCap, ShieldCheck, Zap, ChevronRight, BookOpen, Users, Trophy, Shield } from "lucide-react";
import authIllustration from "../../assets/auth-illustration.png";

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "", role: "STUDENT" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password, true);
      if (result.success) {
        navigate(result.user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 lg:p-16 bg-[#F8FAFC]">
        <div className="max-w-md w-full animate-fade-in-left">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-[#304FFE] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <GraduationCap className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-[#1E293B] tracking-tight">ALI</h2>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-[#304FFE] text-xs font-semibold mb-4">
              Welcome back! 👋
            </div>
            <h1 className="text-3xl font-extrabold text-[#1E293B] mb-2">Login to your account</h1>
            <p className="text-slate-500 font-medium">Access your personalized learning experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert type="error" message={error} onClose={() => setError("")} />}

            {/* Role Toggle Switch */}
            <div className="flex p-1 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => handleRoleChange("STUDENT")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${formData.role === "STUDENT"
                  ? "bg-[#304FFE] text-white shadow-md shadow-indigo-200"
                  : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <GraduationCap size={18} /> Student
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

            {/* Input Group */}
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#304FFE] transition-colors" size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="Username or Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#304FFE] text-[#1E293B] placeholder-slate-400 font-medium transition-all shadow-sm"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#304FFE] transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#304FFE] text-[#1E293B] placeholder-slate-400 font-medium transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1E293B] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#304FFE] focus:ring-[#304FFE] transition-all" />
                <span className="text-sm text-slate-500 group-hover:text-slate-700 font-medium">Remember me</span>
              </label>
              <a href="#" className="text-sm text-[#304FFE] hover:underline font-bold">Forgot password?</a>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#304FFE] hover:bg-[#1A237E] text-white rounded-xl py-4 font-bold text-base transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              {loading ? "Authenticating..." : (
                <>
                  <Zap size={18} fill="currentColor" /> Login
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

            <p className="text-center text-slate-500 font-medium pt-4">
              Don't have an account? <Link to="/register" className="text-[#304FFE] font-bold hover:underline ml-1">Sign Up</Link>
            </p>

            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium pt-4 border-t border-slate-100">
              <Shield size={14} /> Your data is safe and secure
            </div>
          </form>
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
              Learn. Connect. <span className="text-[#304FFE]">Succeed.</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium max-w-md mx-auto">
              Join a vibrant learning community and unlock your full potential.
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
              { icon: BookOpen, title: "Personalized Learning", desc: "Learn at your own pace with customized content." },
              { icon: Users, title: "Expert Instructors", desc: "Learn from the best educators and industry experts." },
              { icon: Trophy, title: "Track Progress", desc: "Monitor your growth and achieve your goals." }
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

export default Login;
