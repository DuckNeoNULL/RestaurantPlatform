import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import "../../styles/Profile.css";

function readUser() {
  try {
    const raw = localStorage.getItem("token");
    if (raw) {
      const t = JSON.parse(raw);
      return {
        fullName: t.fullName || "",
        email: t.email || "",
        phone: t.phone || ""
      };
    }
  } catch {}
  return { fullName: "", email: "", phone: "" };
}

function writeUser(u) {
  try {
    const raw = localStorage.getItem("token");
    const old = raw ? JSON.parse(raw) : {};
    localStorage.setItem(
      "token",
      JSON.stringify({
        ...old,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone
      })
    );
  } catch {}
}

function Profile() {
  const [user, setUser] = useState(readUser());
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(user);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setUser(readUser());
  }, []);

  function startEdit() {
    if (!window.confirm("Bạn có muốn chỉnh sửa thông tin này?")) return;
    setDraft(user);
    setEditing(true);
    setMessage("");
  }

  function cancelEdit() {
    setEditing(false);
    setDraft(user);
    setMessage("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setDraft(d => ({ ...d, [name]: value }));
  }

  function save() {
    if (!window.confirm("Xác nhận lưu thay đổi?")) return;
    writeUser(draft);
    setUser(draft);
    setEditing(false);
    setMessage("Đã cập nhật thông tin.");
  }

  return (
    <>
      <div className="profile-wrapper">
        <div className="profile-card">
          <h2 className="profile-title">Thông tin cá nhân</h2>

            <div className="profile-field">
              <label className="profile-label">Họ và tên</label>
              {!editing ? (
                <div className="profile-read">{user.fullName || <span className="profile-muted">Chưa có</span>}</div>
              ) : (
                <input
                  name="fullName"
                  className="profile-input"
                  value={draft.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                />
              )}
            </div>

            <div className="profile-field">
              <label className="profile-label">Email</label>
              {!editing ? (
                <div className="profile-read">{user.email || <span className="profile-muted">Chưa có</span>}</div>
              ) : (
                <input
                  name="email"
                  type="email"
                  className="profile-input"
                  value={draft.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              )}
            </div>

            <div className="profile-field">
              <label className="profile-label">Số điện thoại</label>
              {!editing ? (
                <div className="profile-read">{user.phone || <span className="profile-muted">Chưa có</span>}</div>
              ) : (
                <input
                  name="phone"
                  className="profile-input"
                  value={draft.phone}
                  onChange={handleChange}
                  placeholder="0901234567"
                />
              )}
            </div>

            {message && <div className="profile-success">{message}</div>}

            <div className="profile-actions">
              {!editing && (
                <button
                  type="button"
                  className="profile-btn profile-btn-primary"
                  onClick={startEdit}
                >
                  Chỉnh sửa
                </button>
              )}
              {editing && (
                <div className="profile-edit-actions">
                  <button
                    type="button"
                    className="profile-btn profile-btn-light"
                    onClick={cancelEdit}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="profile-btn profile-btn-primary"
                    onClick={save}
                    disabled={!draft.fullName || !draft.email}
                  >
                    Lưu
                  </button>
                </div>
              )}
            </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Profile;
