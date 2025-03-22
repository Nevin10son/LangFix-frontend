import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBook, FaGlobe, FaImage, FaPen, FaSync, FaBookOpen, FaSearch, FaEnvelope, FaCommentAlt, FaUser, FaSignOutAlt } from "react-icons/fa";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const userName = sessionStorage.getItem("name") || "User";

  const activities = [
    { name: "Diary Entry", description: "Write and track your daily thoughts.", path: "/diary", icon: <FaBook />, color: "#dbeafe" },
    { name: "Translation to English", description: "Translate the given text into English.", path: "/translation", icon: <FaGlobe />, color: "#e0f2fe" },
    { name: "Describe the Given Image", description: "Write about the provided image.", path: "/image-description", icon: <FaImage />, color: "#e0f7fa" },
    { name: "Essay Writing", description: "Write an essay on the given topic.", path: "/essay-writing", icon: <FaPen />, color: "#ecfdf5" },
    { name: "Rephrase Sentences", description: "Rewrite sentences in your own words.", path: "/rephrase", icon: <FaSync />, color: "#fef3c7" },
    { name: "Story Completion", description: "Continue the given story creatively.", path: "/story-completion", icon: <FaBookOpen />, color: "#fce7f3" },
    //{ name: "Error Hunting and Correction", description: "Find and correct grammar mistakes.", path: "/error-hunting", icon: <FaSearch />, color: "#ede9fe" },
  ];

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dash-page">
      {/* Header */}
      <motion.header
        className="dash-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="dash-brand">
          <span className="dash-brand-logo"><FaCommentAlt /></span>
          <h1 className="dash-brand-name">LangFix</h1>
        </div>
        <div className="dash-user-section">
          <span className="dash-user-icon"><FaUser /></span>
          <span className="dash-user-name">{userName}</span>
          <motion.button
            className="dash-logout-btn"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="dash-logout-icon"><FaSignOutAlt /></span>
            Logout
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.div
        className="dash-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h1 className="dash-title">Activities</h1>
        <div className="dash-card-grid">
          {activities.map((activity, index) => (
            <motion.div
              key={index}
              className={`dash-card ${activity.name === "Diary Entry" ? "dash-diary-card" : ""}`}
              style={{ backgroundColor: activity.color }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5, type: "spring" }}
              whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)" }}
            >
              {activity.name === "Diary Entry" ? (
                <div className="dash-diary-layout">
                  <div className="dash-diary-text">
                    <h2 className="dash-card-title">{activity.name}</h2>
                    <p className="dash-card-desc">{activity.description}</p>
                    <motion.button
                      className="dash-card-btn"
                      onClick={() => navigate(activity.path)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="dash-btn-icon">➔</span>
                      Start
                    </motion.button>
                  </div>
                  <div className="dash-diary-icon">{activity.icon}</div>
                </div>
              ) : (
                <>
                  <div className="dash-card-icon">{activity.icon}</div>
                  <div className="dash-card-body">
                    <h2 className="dash-card-title">{activity.name}</h2>
                    <p className="dash-card-desc">{activity.description}</p>
                    <motion.button
                      className="dash-card-btn"
                      onClick={() => navigate(activity.path)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="dash-btn-icon">➔</span>
                      Start
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="dash-footer">
          <p>© 2025 English Learning App | Designed with ❤️ by xAI</p>
          <div className="dash-footer-links">
            <a href="/about">About</a> | <a href="/contact">Contact</a> | <a href="/terms">Terms</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}