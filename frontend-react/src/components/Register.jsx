import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_BASE_API}/register/`, {
        username,
        email,
        password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      // Django returns field-level errors as { username: [...], password: [...] }
      setErrors(
        err.response?.data || {
          non_field_errors: ["Registration failed. Please try again."],
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field) =>
    errors[field] ? (
      <small className="mt-1 text-danger d-block">{errors[field][0]}</small>
    ) : null;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-sm-8">
          <div className="auth-card">
            <h3 className="mb-1 text-center" style={{ fontWeight: 800 }}>
              Create an Account
            </h3>
            <div className="divider-gradient" />

            {success ? (
              <div className="py-3 text-center">
                <p style={{ fontSize: "2.5rem" }}>🎉</p>
                <div className="alert alert-success">
                  Registration successful! Redirecting to login...
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} noValidate>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className={`form-control ${errors.username ? "is-invalid" : ""}`}
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                  {fieldError("username")}
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Email Address{" "}
                    <span style={{ color: "var(--text-muted)" }}>
                      (optional)
                    </span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {fieldError("password")}
                </div>

                {(errors.non_field_errors || errors.detail) && (
                  <div className="py-2 text-center alert alert-danger small">
                    {errors.non_field_errors?.[0] || errors.detail}
                  </div>
                )}

                <button
                  type="submit"
                  className="mt-2 btn btn-info w-100"
                  disabled={loading}>
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />
                      Creating account...
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>
            )}

            <p
              className="mt-4 mb-0 text-center small"
              style={{ color: "var(--text-muted)" }}>
              Already have an account?{" "}
              <Link to="/login" className="text-info fw-semibold">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
