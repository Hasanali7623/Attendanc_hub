import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/Alert";
import { Eye, EyeOff, User, Lock, BookOpen } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-white font-sans overflow-hidden">
      <div className="w-full flex h-screen animate-fade-in">
        
        {/* Left Side - Form */}
        <div className="w-full lg:w-[45%] p-8 sm:p-12 md:p-20 flex flex-col justify-center bg-white relative z-10 animate-fade-in-left">
          <div className="max-w-sm w-full mx-auto">
            
            {/* Logo area */}
            <div className="flex items-center gap-3 mb-16">
              <div>
                <h1 className="text-2xl font-bold tracking-wider text-[#1a2538] leading-tight">Created by ALI</h1>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-8">Login to your account</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <Alert type="error" message={error} onClose={() => setError("")} />}

              {/* Role Selection */}
              <div className="flex gap-2 p-1 bg-[#f4f7fe] rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => handleRoleChange("STUDENT")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-semibold transition-all duration-150 ${
                    formData.role === "STUDENT" ? "bg-white text-[#1a2538] shadow-sm" : "text-[#7f8da0] hover:text-[#455773]"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("ADMIN")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-semibold transition-all duration-150 ${
                    formData.role === "ADMIN" ? "bg-white text-[#1a2538] shadow-sm" : "text-[#7f8da0] hover:text-[#455773]"
                  }`}
                >
                  Admin
                </button>
              </div>

              {/* Email Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7f8da0]">
                  <User size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Username or Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#f4f7fe] border-none rounded-lg pl-12 pr-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#2f4a7c] text-gray-700 font-medium placeholder-[#7f8da0] text-sm"
                />
              </div>

              {/* Password input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7f8da0]">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#f4f7fe] border-none rounded-lg pl-12 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#2f4a7c] text-gray-700 font-medium placeholder-[#7f8da0] text-sm"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7f8da0] hover:text-[#455773] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex justify-start pt-1">
                <a href="#" className="text-xs text-gray-700 hover:text-gray-900 font-medium tracking-wide">Forget password?</a>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button 
                  disabled={loading} 
                  type="submit" 
                  className="w-1/3 min-w-[120px] bg-[#1a2538] hover:bg-[#111927] text-white rounded-lg py-3 text-sm font-medium transition-all"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>

            </form>

            <p className="text-left text-sm text-gray-600 mt-12 font-medium">
               Don't have an account? <Link to="/register" className="text-[#1a2538] font-bold hover:underline">Sign Up</Link>
            </p>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-[#f0f4f8] rounded-bl-[10rem] animate-fade-in-right">
           <div className="absolute inset-0 flex items-center justify-center">
             {/* Using a placeholder similar to the illustration */}
             <img 
               src="https://img.freepik.com/free-vector/online-tutorials-concept_52683-37480.jpg?w=1000" 
               alt="Students studying" 
               className="max-w-[85%] max-h-[85%] object-contain mix-blend-multiply transition-transform duration-700 hover:scale-105"
             />
           </div>
        </div>
        
      </div>
    </div>
  );
};

export default Login;
