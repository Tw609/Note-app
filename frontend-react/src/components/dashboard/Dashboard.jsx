import { useEffect, useState, useRef } from "react";
import axiosInstance from "../../axiosInstance";

const fmtDate = (iso) =>
  new Date(iso).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const wasEdited = (note) => note.updated_at !== note.created_at;

const Dashboard = () => {
  const [notes, setNotes]       = useState([]);
  const [fetching, setFetching] = useState(true);
  const [fetchErr, setFetchErr] = useState("");

  const [cTitle, setCTitle]     = useState("");
  const [cContent, setCContent] = useState("");
  const [cLoading, setCLoading] = useState(false);
  const [cError, setCError]     = useState("");

  const [eNote, setENote]       = useState(null);
  const [eTitle, setETitle]     = useState("");
  const [eContent, setEContent] = useState("");
  const [eLoading, setELoading] = useState(false);
  const [eError, setEError]     = useState("");

  const modalRef = useRef(null);
  const bsModal  = useRef(null);

  useEffect(() => {
    if (modalRef.current && window.bootstrap) {
      bsModal.current = new window.bootstrap.Modal(modalRef.current);
    }
  }, []);

  const fetchNotes = async () => {
    setFetching(true);
    setFetchErr("");
    try {
      const res = await axiosInstance.get("/notes/");
      setNotes(res.data);
    } catch {
      setFetchErr("Could not load notes. Make sure the backend is running on port 8000.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCLoading(true);
    setCError("");
    try {
      const res = await axiosInstance.post("/notes/", { title: cTitle, content: cContent });
      if (res.status === 201) {
        setCTitle("");
        setCContent("");
        fetchNotes();
      }
    } catch {
      setCError("Failed to create note. Please try again.");
    } finally {
      setCLoading(false);
    }
  };

  const openEdit = (note) => {
    setENote(note);
    setETitle(note.title);
    setEContent(note.content);
    setEError("");
    bsModal.current?.show();
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!eNote) return;
    setELoading(true);
    setEError("");
    try {
      const res = await axiosInstance.patch(`/notes/${eNote.id}/`, { title: eTitle, content: eContent });
      if (res.status === 200) {
        bsModal.current?.hide();
        fetchNotes();
      }
    } catch {
      setEError("Failed to save changes. Please try again.");
    } finally {
      setELoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note? This cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/notes/${id}/`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      alert("Failed to delete note.");
    }
  };

  return (
    <div className="container py-5">

      <div className="bg-light-dark p-4 mb-5">
        <h4 className="section-title mb-1">Create New Note</h4>
        <div className="divider-gradient" />
        <form onSubmit={handleCreate} noValidate>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input type="text" className="form-control" placeholder="Give your note a title..."
              value={cTitle} onChange={(e) => setCTitle(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Content</label>
            <textarea className="form-control" placeholder="Write your note here..." rows={4}
              value={cContent} onChange={(e) => setCContent(e.target.value)} required />
          </div>
          {cError && <div className="alert alert-danger py-2 small mb-3">{cError}</div>}
          <button type="submit" className="btn btn-info px-4" disabled={cLoading}>
            {cLoading ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Saving...</> : "+ Add Note"}
          </button>
        </form>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-1">
        <h4 className="section-title mb-0">My Notes</h4>
        <span className="small" style={{ color: "var(--text-muted)" }}>
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </span>
      </div>
      <div className="divider-gradient" />

      {fetching ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status" />
          <p className="mt-3 small" style={{ color: "var(--text-muted)" }}>Loading your notes...</p>
        </div>
      ) : fetchErr ? (
        <div className="alert alert-danger text-center">
          {fetchErr}<br />
          <button className="btn btn-sm btn-danger mt-2" onClick={fetchNotes}>Retry</button>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-5">
          <p style={{ fontSize: "3rem" }}>📭</p>
          <p style={{ color: "var(--text-muted)" }}>No notes yet. Create your first one above!</p>
        </div>
      ) : (
        <div className="row g-3 mt-1">
          {notes.map((note) => (
            <div key={note.id} className="col-lg-4 col-md-6">
              <div className="note-card h-100 d-flex flex-column">
                <div className="flex-grow-1">
                  <p className="note-title">{note.title}</p>
                  <p className="note-body mb-3">
                    {note.content.length > 120 ? note.content.slice(0, 120) + "…" : note.content}
                  </p>
                </div>
                <div>
                  <p className="note-date mb-2">
                    {fmtDate(note.created_at)}
                    {wasEdited(note) && <span className="note-edited-badge">edited</span>}
                  </p>
                  <div className="d-flex gap-2">
                    <button className="btn btn-warning btn-sm flex-grow-1" onClick={() => openEdit(note)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm flex-grow-1" onClick={() => handleDelete(note.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="modal fade" ref={modalRef} tabIndex={-1} aria-labelledby="editModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editModalLabel">Edit Note</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <form onSubmit={handleEdit} noValidate>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input type="text" className="form-control" value={eTitle}
                    onChange={(e) => setETitle(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Content</label>
                  <textarea className="form-control" rows={6} value={eContent}
                    onChange={(e) => setEContent(e.target.value)} required />
                </div>
                {eError && <div className="alert alert-danger py-2 small">{eError}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-success px-4" disabled={eLoading}>
                  {eLoading ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Saving...</> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
