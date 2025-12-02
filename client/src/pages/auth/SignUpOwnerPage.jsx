import { Link } from "react-router-dom";
import { uploadImageToCloudinary } from "../../services/uploadServices"; 
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Container, Form } from "react-bootstrap";
import AuthLayout from "../../layouts/MainLayout";
import "../../styles/AuthStyle.css";

function SignUpForOwner() {
  const navigate = useNavigate();
  const { signUpPartner } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    licenseUrl: "",
  });

  const [file, setFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting,setSubmitting] = useState(false);

  // =====================================
  // VALIDATION
  // =====================================
  const validateForm = () => {
    const e = {};

    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên.";
    else if (!/^[A-Za-zÀ-ỹ\s]+$/.test(form.name))
      e.name = "Tên không chứa số hoặc kí tự đặc biệt.";

    if (!/^[0-9]{9,11}$/.test(form.phone))
      e.phone = "Số điện thoại không hợp lệ";

    const emailRegex = /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(form.email)) {
      e.email = "Email không hợp lệ.";
    }

    if (!form.password || form.password.length < 6) {
      e.password = "Mật khẩu phải ít nhất 6 ký tự.";
    }

    if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    if (!file) {
      e.licenseUrl = "Bạn cần upload giấy phép kinh doanh (PDF hoặc ảnh).";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // =====================================
  // HANDLE FILE
  // =====================================
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.licenseUrl;
        return next;
      });
    }
  };

  // =====================================
  // SUBMIT FORM
  // =====================================
   const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      let licenseUrl = form.licenseUrl;

      if (file) {
        // upload file to cloudinary (or your upload service)
        const secureUrl = await uploadImageToCloudinary(file);
        licenseUrl = secureUrl;
      }
      await signUpPartner({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        licenseUrl,
      });
      navigate("/login");
    } catch (err) {
      const message = err?.message || String(err);
      // Handle specific errors
      if (message === "Email đã tồn tại") {
        setErrors((prev) => ({ ...prev, email: "Email đã tồn tại" }));
      } else {
        // set general form error
        setErrors((prev) => ({ ...prev, form: message }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================
  // UI (KHÔNG THAY ĐỔI)
  // =====================================
  return (
    <AuthLayout>
      <Container
        style={{
          maxWidth: "1200px",
          paddingLeft: "50px",
          paddingRight: "50px",
          minHeight: "100vh",
        }}
      >
        <style>{`
          .signup-wrapper {
            display: grid;
            grid-template-columns: 55% 45%;
            border-radius: 15px;
            margin: 20px;
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            background: white;
          }
          @media (max-width: 768px) {
            .signup-wrapper {
              grid-template-columns: 1fr;
            }
          }
          .signup-slogan {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            background: #E11D48;
            color: #fefaf9;
            padding: 40px 80px 60px 60px;
            border-radius: 15px 0 0 15px;
            text-align: left;
          }

          @media (max-width: 768px) {
            .signup-slogan {
              justify-content: center;
              padding: 60px 40px;
              border-radius: 15px 15px 0 0;
            }
          }

          .signup-slogan h2 {
            font-size: 50px;
            margin-bottom: 10px;
            font-weight: 700;
          }
          .signup-slogan p {
            font-size: 18px;
            line-height: 1.5;
            margin: 0;
            width: 80%;
          }
          .signup-form-container {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            padding: 40px 30px;
            background: #fff;
            border-radius: 0 15px 15px 0;
          }
          
          @media (max-width: 768px) {
            .signup-form-container {
              border-radius: 0 0 15px 15px;
              padding: 25px 20px;
            }
          }

          .signup-form-container h1 {
            margin-bottom: 20px;
            font-size: 32px;
            text-align: center;
            color: #E11D48;
            font-weight: 700;
          }

          .signup-input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 15px;
          }

          .password-wrapper {
            position: relative;
            width: 100%;
            margin-bottom: 4px;
            height: auto;
          }

          .password-wrapper input {
            width: 100%;
            padding: 12px 40px 12px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 15px;
            box-sizing: border-box;
            height: auto;
          }

          .toggle-password {
            position: absolute;
            top: 50%;
            right: 12px;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            cursor: pointer;
            color: #777;
            font-size: 18px;
            z-index: 3;
            pointer-events: auto;
          }

          .signup-btn {
            width: 100%;
            background: #E11D48;
            border: none;
            color: #fff;
            font-weight: 600;
            font-size: 15px;
            border-radius: 6px;
            padding: 12px 0;
            margin: 20px 0;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .signup-btn:hover {
            background: #c81344;
            transform: translateY(-2px);
          }

          .error-message {
            color: #E11D48;
            font-size: 16px;
            font-weight: bold;
            margin-top: 2px;
            margin-bottom: 10px;
            display: block;
            min-height: 18px;
          }

          .signup-link {
            text-align: center;
            font-size: 14px;
            color: #999;
          }

          .signup-link a {
            text-decoration: none;
            color: #f6a401;
            font-weight: 500;
          }

          .signup-link a:hover {
            text-decoration: underline;
          }
        `}</style>
        <style>
          {`
            /* Tắt icon mắt mặc định của Bootstrap */
            .form-control::-webkit-textfield-decoration-container { display: none !important; }
            .form-control::-ms-reveal { display: none !important; }
            .form-control::-ms-clear { display: none !important; }
  `}
        </style>

        <div
          className="signup-wrapper"
          style={{
            maxWidth: "1400px",
            width: "100%",
            margin: "40px auto 20px",
          }}
        >
          <div className="signup-slogan">
            <h2>Chào mừng!</h2>
            <p>
              Hãy để mọi người biết về nhà hàng của bạn và thu hút khách hàng
              tiềm năng. Đăng ký ngay để bắt đầu hành trình kinh doanh ẩm thực
              thành công của bạn cùng chúng tôi!
            </p>
          </div>

          <div
            className="signup-form-container"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 400,
              color: "#333",
            }}
          >
            <h1>Đăng Ký Chủ Nhà Hàng</h1>

            <form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <input
                  type="text"
                  placeholder="Họ và tên"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`form-control signup-input ${
                    errors.name ? "is-invalid" : ""
                  }`}
                />
                {errors.name && (
                  <div className="error-message">{errors.name}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  placeholder="Số điện thoại"
                  maxLength={10}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  onInput={(e) =>
                    (e.target.value = e.target.value.replace(/\D/g, ""))
                  }
                  className={`form-control signup-input ${
                    errors.phone ? "is-invalid" : ""
                  }`}
                />
                {errors.phone && (
                  <div className="error-message">{errors.phone}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <input
                  type="email"
                  placeholder="Email"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`form-control signup-input ${
                    errors.email ? "is-invalid" : ""
                  }`}
                />
                {errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Mật khẩu"
                  />
                    <span
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </span>
                </div>
                {errors.password && <div className="error-message">{errors.password}</div>}
              </Form.Group>

              <Form.Group className="mb-3">
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    className={`form-control ${
                      errors.confirmPassword ? "is-invalid" : ""
                    }`}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    placeholder="Xác nhận mật khẩu"
                   
                  />
                    <span
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </span>
                </div>
                {errors.confirmPassword && (
                  <div className="error-message">{errors.confirmPassword}</div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <label className="form-label">
                  <p className="mb-2">Upload giấy phép cá nhân</p>
                </label>
                <div style={{ position: "relative", width: "100%" }}>
                  <label
                    htmlFor="licenseUrl"
                    style={{
                      display: "inline-block",
                      padding: "10px 18px",
                      backgroundColor: "#fff",
                      border: "1.5px solid #ddd",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500",
                      fontSize: "15px",
                      color: "#555",
                      transition: "0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.border = "1.5px solid #E11D48";
                      e.target.style.color = "#E11D48";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.border = "1.5px solid #ddd";
                      e.target.style.color = "#555";
                    }}
                  >
                    Choose File
                  </label>

                  <span
                    style={{
                      marginLeft: "12px",
                      fontSize: "14px",
                      color: "#777",
                    }}
                  >
                    {file ? file.name : "No file chosen"}
                  </span>

                  <input
                    type="file"
                    id="licenseUrl"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "100%",
                      height: "100%",
                      opacity: 0,
                      cursor: "pointer",
                    }}
                  />
                </div>

                {errors.licenseUrl && (
                  <div className="error-message">{errors.licenseUrl}</div>
                )}
              </Form.Group>

              {errors.form && <div className="error-message">{errors.form}</div>}

              <button type="submit" className="signup-btn" disabled={submitting}>
                {submitting ? "Đang xử lý..." : "Đăng Ký"}
              </button>
              {errors.form && (
                <div
                  className="error-message"
                  style={{ textAlign: "center", marginTop: "10px" }}
                >
                  {errors.form}
                </div>
              )}
            </form>

            <div className="signup-link">
              <p>
                Bạn đã có tài khoản? <a href="/">Đăng nhập</a>
              </p>
            </div>

            <div className="signup-link">
              <p>
                Quay lại <a href="/">Trang chủ</a>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </AuthLayout>
  );
}

export default SignUpForOwner;
