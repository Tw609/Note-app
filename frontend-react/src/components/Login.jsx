import { useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthProvider";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();

  // After login, go back to the page the user was trying to visit (or dashboard)
  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_API}/token/`,
        { username, password },
      );
      login(res.data.access, res.data.refresh);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("Server error. Make sure the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-sm-8">
          <div className="auth-card">
            <h3 className="text-center mb-1" style={{ fontWeight: 800 }}>
              Login to NoteApp
            </h3>
            <div className="divider-gradient" />

            <form onSubmit={handleLogin} noValidate>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="alert alert-danger py-2 text-center small">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-info w-100 mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Logging in...
                  </>
                ) : "Login"}
              </button>
            </form>

            <p className="text-center mt-4 mb-0 small" style={{ color: "var(--text-muted)" }}>
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-info fw-semibold">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
