import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./components/AuthProvider";

/**
 * Wrap login / register routes.
 * If the user is already logged in, send them to /dashboard.
 */
const PublicRoute = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
