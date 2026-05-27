import { useEffect, useState } from "react";
import axiosInstance from "../../axiosInstance";

/* ── Avatar circle ───────────────────────────────────────── */
const Avatar = ({ username, firstName, lastName }) => {
  let letter = "?";
  if (firstName) letter = firstName[0].toUpperCase();
  else if (lastName) letter = lastName[0].toUpperCase();
  else if (username) letter = username[0].toUpperCase();
  return (
    <div
      style={{
        width: 88,
        height: 88,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2.2rem",
        fontWeight: 800,
        color: "#fff",
        flexShrink: 0,
      }}>
      {letter}
    </div>
  );
};

/* ── Inline alert ─────────────────────────────────────────── */
const Msg = ({ type, text }) =>
  text ? <div className={`alert alert-${type} py-2 small`}>{text}</div> : null;

/* ── Show field-level error ───────────────────────────────── */
const FieldErr = ({ errs, field }) => {
  const msg = errs?.[field];
  if (!msg) return null;
  return (
    <small className="mt-1 text-danger d-block">
      {Array.isArray(msg) ? msg[0] : msg}
    </small>
  );
};

/* ═══════════════════════════════════════════════════════════
   PROFILE PAGE
═══════════════════════════════════════════════════════════ */
const Profile = () => {
  /* ── profile state ─────────────────────────────────────── */
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  /* ── info form ─────────────────────────────────────────── */
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState("");
  const [infoError, setInfoError] = useState("");
  const [infoFieldErrs, setInfoFieldErrs] = useState({});

  /* ── password form ─────────────────────────────────────── */
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showNew2, setShowNew2] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwFieldErrs, setPwFieldErrs] = useState({});

  /* ── fetch profile ─────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/profile/");
        const d = res.data;
        setProfile(d);
        setUsername(d.username || "");
        setEmail(d.email || "");
        setFirstName(d.first_name || "");
        setLastName(d.last_name || "");
      } catch {
        setLoadErr(
          "Could not load profile. Make sure the backend is running on port 8000.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── save info ─────────────────────────────────────────── */
  const handleInfoSave = async (e) => {
    e.preventDefault();
    setInfoSaving(true);
    setInfoSuccess("");
    setInfoError("");
    setInfoFieldErrs({});
    try {
      const res = await axiosInstance.patch("/profile/", {
        username,
        email,
        first_name: firstName,
        last_name: lastName,
      });
      setProfile(res.data);
      setInfoSuccess("Profile updated successfully!");
      setTimeout(() => setInfoSuccess(""), 3500);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        setInfoFieldErrs(data);
        setInfoError("Please fix the highlighted errors.");
      } else {
        setInfoError("Failed to update. Please try again.");
      }
    } finally {
      setInfoSaving(false);
    }
  };

  /* ── change password ───────────────────────────────────── */
  const handlePwSave = async (e) => {
    e.preventDefault();
    setPwSuccess("");
    setPwError("");
    setPwFieldErrs({});
    if (newPw !== newPw2) {
      setPwFieldErrs({ new_password2: "Passwords do not match." });
      return;
    }
    setPwSaving(true);
    try {
      await axiosInstance.patch("/profile/", {
        current_password: curPw,
        new_password: newPw,
      });
      setPwSuccess("Password changed successfully!");
      setCurPw("");
      setNewPw("");
      setNewPw2("");
      setTimeout(() => setPwSuccess(""), 3500);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        setPwFieldErrs(data);
        setPwError("Please fix the highlighted errors.");
      } else {
        setPwError("Failed to change password. Please try again.");
      }
    } finally {
      setPwSaving(false);
    }
  };

  /* ── strength bar ──────────────────────────────────────── */
  const pwStrength = () => {
    if (!newPw) return null;
    const len = newPw.length;
    let level = 0,
      label = "",
      color = "";
    if (len >= 8) level = 1;
    if (len >= 10 && /[A-Z]/.test(newPw) && /[0-9]/.test(newPw)) level = 2;
    if (len >= 12 && /[^A-Za-z0-9]/.test(newPw)) level = 3;
    if (level === 0) {
      label = "Too short";
      color = "#ef4444";
    }
    if (level === 1) {
      label = "Weak";
      color = "#f59e0b";
    }
    if (level === 2) {
      label = "Good";
      color = "#3b82f6";
    }
    if (level === 3) {
      label = "Strong";
      color = "#22c55e";
    }
    return (
      <div className="mt-2">
        <div style={{ display: "flex", gap: 4, marginBottom: 3 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: 4,
                flex: 1,
                borderRadius: 2,
                background:
                  i < level + (level === 0 ? 0 : 1) ? color : "var(--border)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
        <small style={{ color }}>{label}</small>
      </div>
    );
  };

  /* ── loading / error ───────────────────────────────────── */
  if (loading)
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-info" role="status" />
        <p className="mt-3 small" style={{ color: "var(--text-muted)" }}>
          Loading profile...
        </p>
      </div>
    );

  if (loadErr)
    return (
      <div className="container py-5">
        <div className="text-center alert alert-danger">{loadErr}</div>
      </div>
    );

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || profile.username;
  const joinDate = new Date(profile.date_joined).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  /* ── render ────────────────────────────────────────────── */
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-7 col-md-9">
          {/* ══ PROFILE HEADER ═══════════════════════════════ */}
          <div className="flex-wrap gap-4 p-4 mb-4 bg-light-dark d-flex align-items-center">
            <Avatar
              username={profile.username}
              firstName={firstName}
              lastName={lastName}
            />
            <div>
              <h4
                className="mb-0"
                style={{ fontWeight: 800, color: "var(--text-light)" }}>
                {displayName}
              </h4>
              <p className="mb-2 small" style={{ color: "var(--text-muted)" }}>
                @{profile.username}
                {profile.email && (
                  <span className="ms-2">· {profile.email}</span>
                )}
              </p>
              <div className="flex-wrap gap-2 d-flex">
                <span className="feature-pill">
                  📝 {profile.note_count}{" "}
                  {profile.note_count === 1 ? "note" : "notes"}
                </span>
                <span className="feature-pill">📅 Joined {joinDate}</span>
              </div>
            </div>
          </div>

          {/* ══ ACCOUNT INFO ═════════════════════════════════ */}
          <div className="p-4 mb-4 bg-light-dark">
            <h5 className="mb-1 section-title">Account Information</h5>
            <div className="divider-gradient" />

            <form onSubmit={handleInfoSave} noValidate>
              <div className="mb-3 row g-3">
                <div className="col-sm-6">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <FieldErr errs={infoFieldErrs} field="username" />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">
                    Email{" "}
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.78rem",
                      }}>
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
                  <FieldErr errs={infoFieldErrs} field="email" />
                </div>
              </div>

              <div className="mb-4 row g-3">
                <div className="col-sm-6">
                  <label className="form-label">
                    First Name{" "}
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.78rem",
                      }}>
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <FieldErr errs={infoFieldErrs} field="first_name" />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">
                    Last Name{" "}
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.78rem",
                      }}>
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <FieldErr errs={infoFieldErrs} field="last_name" />
                </div>
              </div>

              <Msg type="success" text={infoSuccess} />
              <Msg type="danger" text={infoError} />

              <button
                type="submit"
                className="px-4 btn btn-info"
                disabled={infoSaving}>
                {infoSaving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          </div>

          {/* ══ CHANGE PASSWORD ══════════════════════════════ */}
          <div className="p-4 bg-light-dark">
            <h5 className="mb-1 section-title">Change Password</h5>
            <div className="divider-gradient" />

            <form onSubmit={handlePwSave} noValidate>
              {/* Current password */}
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <div className="input-group">
                  <input
                    type={showCur ? "text" : "password"}
                    className="form-control"
                    placeholder="Enter your current password"
                    value={curPw}
                    onChange={(e) => setCurPw(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-muted)",
                    }}
                    onClick={() => setShowCur((v) => !v)}
                    tabIndex={-1}>
                    {showCur ? "🙈" : "👁️"}
                  </button>
                </div>
                <FieldErr errs={pwFieldErrs} field="current_password" />
              </div>

              {/* New password */}
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <div className="input-group">
                  <input
                    type={showNew ? "text" : "password"}
                    className="form-control"
                    placeholder="At least 8 characters"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-muted)",
                    }}
                    onClick={() => setShowNew((v) => !v)}
                    tabIndex={-1}>
                    {showNew ? "🙈" : "👁️"}
                  </button>
                </div>
                {pwStrength()}
                <FieldErr errs={pwFieldErrs} field="new_password" />
              </div>

              {/* Confirm new password */}
              <div className="mb-4">
                <label className="form-label">Confirm New Password</label>
                <div className="input-group">
                  <input
                    type={showNew2 ? "text" : "password"}
                    className="form-control"
                    placeholder="Repeat the new password"
                    value={newPw2}
                    onChange={(e) => setNewPw2(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-muted)",
                    }}
                    onClick={() => setShowNew2((v) => !v)}
                    tabIndex={-1}>
                    {showNew2 ? "🙈" : "👁️"}
                  </button>
                </div>
                <FieldErr errs={pwFieldErrs} field="new_password2" />
              </div>

              <Msg type="success" text={pwSuccess} />
              <Msg type="danger" text={pwError} />

              <button
                type="submit"
                className="px-4 btn btn-warning"
                disabled={pwSaving}>
                {pwSaving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
