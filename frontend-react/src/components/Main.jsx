import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./AuthProvider";

const FEATURES = [
  "✅ Create Notes",
  "✏️ Edit Notes",
  "🗑️ Delete Notes",
  "🔐 JWT Auth",
  "🔄 Auto Token Refresh",
];

const Main = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <main className="hero-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-9">
            <h1 className="hero-title">Your Notes,<br />Anywhere.</h1>
            <p className="hero-sub">
              A simple, fast, and secure note-taking app powered by a REST API.
              Create, edit, and delete your notes — all synced to your account.
            </p>

            {isLoggedIn ? (
              <Link to="/dashboard" className="btn btn-info btn-lg px-5">
                Go to My Notes →
              </Link>
            ) : (
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link to="/register" className="btn btn-info btn-lg px-5">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                  Login
                </Link>
              </div>
            )}

            <div className="d-flex gap-2 justify-content-center flex-wrap mt-5">
              {FEATURES.map((f) => (
                <span key={f} className="feature-pill">{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Main;
