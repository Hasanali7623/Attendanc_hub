import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/Alert";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // Assuming rememberMe is true for this design
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
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 sm:p-8 font-sans">
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,_0,_0,_0.2)] flex max-w-[1100px] w-full mx-auto overflow-hidden relative min-h-[650px]">
        
        {/* Left Side - Form */}
        <div className="w-full lg:w-[50%] p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-white relative z-10">
          <div className="max-w-md w-full mx-auto">
            <h1 className="text-4xl form-title font-bold text-gray-900 mb-2">Hello Again!</h1>
            <p className="text-gray-500 text-sm mb-10 font-medium">Let's get started with your 30 days trial</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <Alert type="error" message={error} onClose={() => setError("")} />}

              {/* Email Input */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#fcfcfc] border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#8f646b] text-gray-700 font-medium placeholder-gray-400"
                />
              </div>

              {/* Password input */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#fcfcfc] border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#8f646b] text-gray-700 font-medium placeholder-gray-400 pr-12"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <a href="#" className="text-xs text-gray-400 hover:text-gray-600 font-medium">Recovery Password</a>
              </div>

              {/* Submit button */}
              <button 
                disabled={loading} 
                type="submit" 
                className="w-full bg-[#8f646b] hover:bg-[#7a545a] text-white rounded-2xl py-4 font-semibold shadow-lg shadow-[#8f646b]/30 transition-all mt-4"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-gray-100"></div>
              <span className="px-4 text-xs text-gray-400 bg-white font-medium">Or continue with</span>
              <div className="flex-1 border-t border-gray-100"></div>
            </div>

            {/* Social Login */}
            <div className="flex justify-center gap-4">
              <button type="button" className="p-3 w-16 h-12 flex items-center justify-center border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors shadow-sm bg-white">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              </button>
              <button type="button" className="p-3 w-16 h-12 flex items-center justify-center border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors shadow-md transform -translate-y-1 bg-white">
                <img src="https://www.svgrepo.com/show/330001/apple.svg" alt="Apple" className="w-5 h-5" />
              </button>
              <button type="button" className="p-3 w-16 h-12 flex items-center justify-center border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors shadow-sm bg-white">
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-8 font-medium">
               Don't have an account? <Link to="/register" className="text-[#8f646b] font-semibold hover:underline">Sign Up</Link>
            </p>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:block lg:w-[50%] p-4">
          <div 
            className="w-full h-full rounded-[2rem] bg-cover bg-[center_top] relative overflow-hidden shadow-inner" 
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542401886-65d6c61db217?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')` }}
          >
            {/* Dark overlay gradient at the bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2a1b24]/80 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-12 left-12 right-10">
              <h2 className="text-white text-2xl font-light tracking-wide mb-6">Finally, all your work in one place.</h2>
              
              <div className="flex gap-3">
                <button className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Login;
