import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/Alert";
import { Eye, EyeOff, User, Lock, BookOpen, Shield } from "lucide-react";

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

  const inputClass = "w-full bg-[#f4f7fe] border-none rounded-lg px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#2f4a7c] text-gray-700 font-medium placeholder-[#7f8da0] text-sm";
  const selectClass = "w-full bg-[#f4f7fe] border-none rounded-lg px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#2f4a7c] text-gray-700 font-medium text-sm appearance-none cursor-pointer text-[#7f8da0]";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans overflow-hidden">
      <div className="w-full flex h-screen animate-fade-in">
        
        {/* Left Side - Form */}
        <div className="w-full lg:w-[45%] p-6 sm:p-10 md:p-16 flex flex-col justify-start bg-white relative z-10 overflow-y-auto animate-fade-in-left">
          <div className="max-w-md w-full mx-auto my-auto py-4">
            
            {/* Logo area */}
            <div className="flex items-center gap-3 mb-10">
              <div>
                <h1 className="text-2xl font-bold tracking-wider text-[#1a2538] leading-tight">Created by ALI</h1>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-6">Create Account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <Alert type="error" message={error} onClose={() => setError("")} />}
              {success && <Alert type="success" message={success} />}

              {/* Role Selection */}
              <div className="flex gap-2 p-1 bg-[#f4f7fe] rounded-lg mb-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange("STUDENT")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-semibold transition-all duration-150 ${
                    formData.role === "STUDENT" ? "bg-white text-[#1a2538] shadow-sm" : "text-[#7f8da0] hover:text-[#455773]"
                  }`}
                >
                  <User className="w-4 h-4" /> Student
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("ADMIN")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-semibold transition-all duration-150 ${
                    formData.role === "ADMIN" ? "bg-white text-[#1a2538] shadow-sm" : "text-[#7f8da0] hover:text-[#455773]"
                  }`}
                >
                  <Shield className="w-4 h-4" /> Admin
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" name="name" placeholder="Full Name *" value={formData.name} onChange={handleChange} className={inputClass} />
                <input type="email" name="email" placeholder="Email *" value={formData.email} onChange={handleChange} className={inputClass} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="Password *" value={formData.password} onChange={handleChange} className={`${inputClass} pr-10`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7f8da0] hover:text-[#455773]">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password *" value={formData.confirmPassword} onChange={handleChange} className={`${inputClass} pr-10`} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7f8da0] hover:text-[#455773]">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <input type="tel" name="phoneNumber" placeholder="Phone Number (Optional)" value={formData.phoneNumber} onChange={handleChange} className={inputClass} />

              {/* Role Specific Fields */}
              {formData.role === "STUDENT" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <select name="department" value={formData.department} onChange={handleChange} className={selectClass}>
                      <option value="">Select Department *</option>
                      {departments.map((dept) => (<option key={dept} value={dept}>{dept}</option>))}
                    </select>
                  </div>
                  <div className="relative">
                    <select name="semester" value={formData.semester} onChange={handleChange} className={selectClass}>
                      <option value="">Select Semester *</option>
                      {semesters.map((sem) => (<option key={sem} value={sem}>Semester {sem}</option>))}
                    </select>
                  </div>
                </div>
              )}

              {formData.role === "ADMIN" && (
                <div className="relative">
                  <select name="assignedSemester" value={formData.assignedSemester} onChange={handleChange} className={selectClass}>
                    <option value="">Select Assigned Semester *</option>
                    {semesters.map((sem) => (<option key={sem} value={sem}>Semester {sem}</option>))}
                  </select>
                </div>
              )}

              {/* Submit button */}
              <div className="pt-2">
                <button disabled={loading} type="submit" className="w-full bg-[#1a2538] hover:bg-[#111927] text-white rounded-lg py-3.5 text-sm font-medium transition-all shadow-sm">
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
              </div>
            </form>

            <p className="text-left text-sm text-gray-600 mt-10 font-medium">
               Already have an account? <Link to="/login" className="text-[#1a2538] font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-[#f0f4f8] rounded-bl-[10rem] animate-fade-in-right">
           <div className="absolute inset-0 flex items-center justify-center">
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

export default Register;
