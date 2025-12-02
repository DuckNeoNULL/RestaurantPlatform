import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Form, Button } from "react-bootstrap";
import AuthLayout from "../../layouts/MainLayout";

export default function SignUpCustomer() {
  const [form, setForm] = useState({
    fullname: "",
    role: "",
    partner: "",
    phone: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const roleMap = {
    "Cô dâu": 0,
    "Chú rể": 1,
    Khác: 2,
  };

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUpCustomer } = useAuth();
  const navigate = useNavigate();
  // ===== CUSTOM DROPDOWN =====
  const [openDropdown, setOpenDropdown] = useState(false);

  const dropdownStyles = {
    wrapper: { position: "relative", width: "100%", marginBottom: "16px" },
    selectBox: {
      border: "1px solid #ced4da",
      height: "calc(1.5em + 0.75rem + 2px)", // chiều cao chuẩn Form.Control
      padding: "0.375rem 0.75rem", // padding chuẩn
      borderRadius: "0.375rem", // bo chuẩn bootstrap
      backgroundColor: "#fff",
      cursor: "pointer",
      color: "#212529", // màu chữ chuẩn input
      fontSize: "1rem", // font-size chuẩn input
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    menu: {
      position: "absolute",
      top: "110%",
      left: 0,
      width: "100%",
      backgroundColor: "#fff",
      border: "1px solid #ced4da",
      borderRadius: "0.375rem",
      boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
      overflow: "hidden",
      zIndex: 100,
    },

    option: (active) => ({
      padding: "0.5rem 0.75rem",
      cursor: "pointer",
      backgroundColor: active ? "#FFE4EA" : "#fff",
      color: active ? "#E11D48" : "#212529",
      fontSize: "1rem",
      transition: "0.2s",
    }),
  };

  const validate = () => {
    const e = {};

    if (!form.fullname.trim()) e.fullname = "Vui lòng nhập họ tên.";
    else if (!/^[A-Za-zÀ-ỹ\s]+$/.test(form.fullname))
      e.fullname = "Tên không chứa số hoặc kí tự đặc biệt.";

    if (!form.role || form.role.trim() === "") {
      e.role = "Vui lòng chọn vai trò.";
    }

    if (form.role === "Cô dâu" || form.role === "Chú rể") {
      if (!form.partner.trim()) e.partner = "Vui lòng nhập tên người đồng hành";
      else if (!/^[A-Za-zÀ-ỹ\s]+$/.test(form.partner))
        e.partner = "Tên chỉ được nhập chữ";
    }

    if (!/^[0-9]{9,11}$/.test(form.phone))
      e.phone = "Số điện thoại không hợp lệ";
    if (!/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(form.email))
      e.email = "Email không hợp lệ";
    if (!form.password || form.password.length < 6)
      e.password = "Mật khẩu nhiều hơn 5 ký tự";
    if (form.confirmPassword !== form.password)
      e.confirmPassword = "Mật khẩu nhập lại không khớp";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await signUpCustomer({
          fullname: form.fullname,
          weddingRole: roleMap[form.role],
          partner: form.partner,
          phone: form.phone,
          email: form.email,
          password: form.password,
        });
        // success -> redirect to login
        navigate("/login");
      } catch (err) {
        // Handle specific errors
        if (err?.message === "Email đã tồn tại") {
          setErrors({ email: "Email đã tồn tại" });
        } else {
          // For other errors, set form error
          setErrors({ form: err?.message || String(err) });
        }
      }
    }
  };

  return (
    <AuthLayout>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          paddingTop: "40px",
          paddingBottom: "30px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1200px",
            paddingLeft: "50px",
            paddingRight: "50px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <style>{`
          .signup-card {
            display: grid;
            grid-template-columns: 55% 45%;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
            background: white;
          }
          @media (max-width: 768px) {
            .signup-card {
              grid-template-columns: 1fr;
            }
          }
          .toggle-password {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #777;
            pointer-events: auto;
          }
          .password-input-wrapper {
            position: relative;
          }
          .password-input-wrapper input {
            padding-right: 44px;
          }
        `}</style>

          <div
            className="signup-card"
            style={{ maxWidth: "1100px", width: "100%" }}
          >
            <div
              className="auth-box"
              style={{
                backgroundColor: "#E11D48",
                color: "#fff",
                padding: "60px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                paddingTop: "200px",
              }}
            >
              <h1
                style={{
                  fontSize: "64px",
                  marginBottom: "20px",
                  fontWeight: "700",
                  letterSpacing: "1px",
                }}
              >
                Chào Mừng!
              </h1>
              <p style={{ fontSize: "18px", margin: "0", lineHeight: "1.6" }}>
                Nơi mỗi khoảnh khắc trở thành kỷ niệm vĩnh cửu
              </p>
              <p
                style={{
                  fontSize: "16px",
                  marginTop: "20px",
                  lineHeight: "1.6",
                  opacity: "0.95",
                }}
              >
                Câu chuyện tình cảm của bạn xứng đáng được ghi lại. Hãy để chúng
                tôi giúp bạn biến ngày trọng đại thành kỷ niệm không thể quên.
              </p>
            </div>

            <div
              className="auth-box shadow"
              style={{
                backgroundColor: "#fff",
                padding: "40px",
                borderTopRightRadius: "15px",
                borderBottomRightRadius: "15px",
              }}
            >
              <h2
                style={{
                  marginBottom: "20px",
                  fontSize: "32px",
                  textAlign: "center",
                  color: "#E11D48",
                  fontWeight: "700",
                }}
              >
                Đăng Ký Khách Hàng
              </h2>
              <style>
                {`
                  /* Tắt icon mắt mặc định của Bootstrap */
                  .form-control::-webkit-textfield-decoration-container { display: none !important; }
                  .form-control::-ms-reveal { display: none !important; }
                  .form-control::-ms-clear { display: none !important; }
  `}
              </style>

              <form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Họ và tên"
                    value={form.fullname}
                    onChange={(e) =>
                      setForm({ ...form, fullname: e.target.value })
                    }
                    isInvalid={!!errors.fullname}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.fullname}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <div style={dropdownStyles.wrapper}>
                    <div
                      style={dropdownStyles.selectBox}
                      onClick={() => setOpenDropdown(!openDropdown)}
                    >
                      {form.role || "Bạn là?"}
                      <span style={{ fontSize: "18px" }}>▾</span>
                    </div>

                    {openDropdown && (
                      <div style={dropdownStyles.menu}>
                        {["Cô dâu", "Chú rể", "Khác"].map((option) => (
                          <div
                            key={option}
                            onClick={() => {
                              setForm({
                                ...form,
                                role: option,
                                partner:
                                  option === "Cô dâu" || option === "Chú rể"
                                    ? form.partner
                                    : "",
                              });
                              setOpenDropdown(false);
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#FFF1F4";
                              e.target.style.color = "#E11D48";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor =
                                form.role === option ? "#FFE4EA" : "white";
                              e.target.style.color =
                                form.role === option ? "#E11D48" : "#333";
                            }}
                            style={{
                              height: "calc(1.5em + 0.75rem + 2px)",
                              padding: "7px 17px",
                              cursor: "pointer",
                              backgroundColor:
                                form.role === option ? "#FFE4EA" : "white",
                              color: form.role === option ? "#E11D48" : "#333",
                              transition: "0.2s ease",
                              fontWeight: form.role === option ? 600 : 400,
                            }}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}

                    {errors.role && (
                      <div
                        style={{
                          color: "red",
                          fontSize: "13px",
                          marginTop: "6px",
                        }}
                      >
                        {errors.role}
                      </div>
                    )}
                  </div>

                  <Form.Control.Feedback type="invalid">
                    {errors.role}
                  </Form.Control.Feedback>
                </Form.Group>

                {(form.role === "Cô dâu" || form.role === "Chú rể") && (
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Nhập tên người đồng hành"
                      value={form.partner}
                      onChange={(e) =>
                        setForm({ ...form, partner: e.target.value })
                      }
                      isInvalid={!!errors.partner}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.partner}
                    </Form.Control.Feedback>
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Số điện thoại"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    isInvalid={!!errors.phone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <div className="password-input-wrapper">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Mật khẩu"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      isInvalid={!!errors.password}
                      autoComplete="new-password"
                      style={{ backgroundImage: "none" }}
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
                  <Form.Control.Feedback
                    type="invalid"
                    style={{ display: errors.password ? "block" : "none" }}
                  >
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <div className="password-input-wrapper">
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                      }
                      isInvalid={!!errors.confirmPassword}
                      autoComplete="new-password"
                      style={{ backgroundImage: "none" }}
                    />
                      <span
                        className="toggle-password"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        <FontAwesomeIcon
                          icon={showConfirmPassword ? faEyeSlash : faEye}
                        />
                      </span>
                  </div>
                  <Form.Control.Feedback
                    type="invalid"
                    style={{
                      display: errors.confirmPassword ? "block" : "none",
                    }}
                  >
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#E11D48",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "15px",
                    fontWeight: "600",
                    marginBottom: "20px",
                  }}
                >
                  Đăng Ký
                </Button>
                {errors.form && (
                  <div
                    style={{
                      color: "red",
                      fontSize: "20px",
                      marginBottom: "10px",
                      textAlign: "center",
                    }}
                  >
                    {errors.form}
                  </div>
                )}
              </form>

              <div
                style={{ textAlign: "center", fontSize: "14px", color: "#999" }}
              >
                <p>
                  Bạn đã có tài khoản?{" "}
                  <a
                    href="/"
                    style={{
                      color: "#f6a401",
                      textDecoration: "none",
                      fontWeight: "500",
                    }}
                  >
                    Đăng nhập
                  </a>
                </p>
                <p>
                  Quay lại{" "}
                  <a
                    href="/"
                    style={{
                      color: "#f6a401",
                      textDecoration: "none",
                      fontWeight: "500",
                    }}
                  >
                    Trang chủ
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
