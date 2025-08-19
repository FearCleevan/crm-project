// src/assets/components/LoginPage/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import SkeletonLoading from "../Common/SkeletonLoading";
import sample1 from "../../images/sample1.png";
import sample2 from "../../images/sample2.png";
import sample3 from "../../images/sample3.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeForm, setActiveForm] = useState("login"); // NEW
  const [notification, setNotification] = useState(""); // NEW
  const navigate = useNavigate();

  const carouselItems = [
    {
      image: sample1,
      title: "Powerful Analytics",
      description: "Track customer interactions and sales performance",
    },
    {
      image: sample2,
      title: "Team Collaboration",
      description: "Work seamlessly with your team on customer accounts",
    },
    {
      image: sample3,
      title: "Custom Dashboards",
      description: "Tailor your workspace to your business needs",
    },
  ];

  useEffect(() => {
    const carouselInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);

    const initTimer = setTimeout(() => {
      const rememberedUsername = localStorage.getItem("rememberedUsername");
      if (rememberedUsername) {
        setUsername(rememberedUsername);
        setRememberMe(true);
      }
      setIsInitializing(false);
    }, 1000);

    return () => {
      clearInterval(carouselInterval);
      clearTimeout(initTimer);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      rememberMe
        ? localStorage.setItem("rememberedUsername", username)
        : localStorage.removeItem("rememberedUsername");

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Mock Submit for Forgot/Contact forms
  const handleMockSubmit = (e) => {
    e.preventDefault();
    setNotification("✅ Submission successful! An Admin will contact you soon.");
    setTimeout(() => setNotification(""), 4000);
    setActiveForm("login");
  };

  if (isInitializing) return <SkeletonLoading />;

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginWrapper}>
        {/* Switch positions if activeForm is not login */}
        {activeForm === "login" ? (
          <>
            {/* Left: Login | Right: Carousel */}
            <div className={styles.loginFormContainer}>
              <div className={styles.loginCard}>
                <div className={styles.logoSection}>
                  <h1 className={styles.logoText}>CRM LP</h1>
                  <p className={styles.tagline}>
                    Customer Relationship Management Launchpad
                  </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.loginForm}>
                  <h2 className={styles.formTitle}>Sign In</h2>
                  {error && <div className={styles.errorMessage}>{error}</div>}

                  <div className={styles.inputGroup}>
                    <label htmlFor="username" className={styles.inputLabel}>
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={styles.inputField}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="password" className={styles.inputLabel}>
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.inputField}
                      required
                    />
                  </div>

                  <div className={styles.rememberMe}>
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="rememberMe">Remember me</label>
                  </div>

                  <button
                    type="submit"
                    className={styles.loginButton}
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </button>

                  <div className={styles.forgotPassword}>
                    <a
                      href="#"
                      className={styles.forgotLink}
                      onClick={() => setActiveForm("forgotPassword")}
                    >
                      Forgot password?
                    </a>
                  </div>
                </form>

                <div className={styles.footer}>
                  <p className={styles.footerText}>
                    Don't have an account?{" "}
                    <a
                      href="#"
                      className={styles.footerLink}
                      onClick={() => setActiveForm("contactAdmin")}
                    >
                      Contact Admin
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Carousel */}
            <div className={styles.featureCarousel}>
              <div className={styles.carouselContainer}>
                {carouselItems.map((item, index) => (
                  <div
                    key={index}
                    className={`${styles.carouselItem} ${
                      index === currentSlide ? styles.active : ""
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className={styles.carouselImage}
                    />
                    <div className={styles.carouselContent}>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.carouselDots}>
                {carouselItems.map((_, index) => (
                  <button
                    key={index}
                    className={`${styles.dot} ${
                      index === currentSlide ? styles.active : ""
                    }`}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Left: Carousel | Right: Mock Form */}
            <div className={styles.featureCarousel}>
              <div className={styles.carouselContainer}>
                {carouselItems.map((item, index) => (
                  <div
                    key={index}
                    className={`${styles.carouselItem} ${
                      index === currentSlide ? styles.active : ""
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className={styles.carouselImage}
                    />
                    <div className={styles.carouselContent}>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Forgot Password / Contact Admin Form */}
            <div className={styles.loginFormContainer}>
              <div className={styles.loginCard}>
                <h2 className={styles.formTitle}>
                  {activeForm === "forgotPassword"
                    ? "Forgot Password"
                    : "Contact Admin"}
                </h2>
                <form onSubmit={handleMockSubmit} className={styles.loginForm}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>First Name</label>
                    <input type="text" className={styles.inputField} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Middle Name</label>
                    <input type="text" className={styles.inputField} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Last Name</label>
                    <input type="text" className={styles.inputField} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Email</label>
                    <input type="email" className={styles.inputField} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Username</label>
                    <input type="text" className={styles.inputField} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Reason</label>
                    <select className={styles.inputField} required>
                      <option value="forgot">I forgot my Password</option>
                      <option value="account">I Need an Account</option>
                    </select>
                  </div>

                  <button type="submit" className={styles.loginButton}>
                    Submit
                  </button>
                </form>
                <div className={styles.forgotPassword}>
                  <a
                    href="#"
                    className={styles.forgotLink}
                    onClick={() => setActiveForm("login")}
                  >
                    ← Back to Login
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className={styles.notification}>{notification}</div>
      )}
    </div>
  );
};

export default Login;
