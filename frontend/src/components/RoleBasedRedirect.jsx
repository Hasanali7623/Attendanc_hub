import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleBasedRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  if (user.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  } else {
    return <Navigate to="/student/dashboard" replace />;
  }
};

export default RoleBasedRedirect;
