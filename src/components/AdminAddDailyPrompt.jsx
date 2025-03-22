import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaBookOpen, FaArrowLeft, FaPlus, FaEye, FaTrash } from "react-icons/fa";
import "./AdminAddDailyPrompt.css";

export default function AdminAddDailyPrompt() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [message, setMessage] = useState("");
  const [prompts, setPrompts] = useState([]);
  const [showPosts, setShowPosts] = useState(false); // State to toggle visibility of prompts

  useEffect(() => {
    // Fetch prompts only when "See Posts" is clicked, not on page load
  }, []);

  // Fetch all prompts
  const fetchPrompts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/admin/diary-prompts");
      setPrompts(response.data.prompts);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      setMessage("❌ Failed to load prompts.");
    }
  };

  // Function to handle prompt submission
  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setMessage("⚠️ Please enter a prompt before submitting.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/admin/add-diary-prompt", { question: prompt });
      setMessage("✅ Prompt added successfully!");
      setPrompt("");
      fetchPrompts(); // Refresh the list after adding a prompt
    } catch (error) {
      console.error("Error adding prompt:", error);
      setMessage("❌ Failed to add prompt. Please try again.");
    }
  };

  // Function to delete a prompt
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prompt?")) return;

    try {
      await axios.delete(`http://localhost:5000/admin/delete-prompt/${id}`);
      setMessage("✅ Prompt deleted successfully!");
      setPrompts(prompts.filter((p) => p._id !== id)); // Remove from UI without reloading
    } catch (error) {
      console.error("Error deleting prompt:", error);
      setMessage("❌ Failed to delete prompt. Please try again.");
    }
  };

  // Toggle visibility of posts
  const togglePosts = () => {
    if (!showPosts) fetchPrompts(); // Fetch only when showing posts
    setShowPosts(!showPosts);
  };

  return (
    <div className="admin-prompt-page">
      <header className="admin-prompt-header">
        <div className="admin-prompt-header-left">
          <FaBookOpen className="admin-prompt-header-icon" />
          <div className="admin-prompt-header-title">
            <span className="admin-prompt-main-title">Add</span>
            <span className="admin-prompt-sub-title">Prompt</span>
          </div>
        </div>
        <button className="admin-prompt-back-btn" onClick={() => navigate("/admindashboard")}>
          <FaArrowLeft className="admin-prompt-back-icon" />
          Back to Dashboard
        </button>
      </header>

      <div className="admin-prompt-content">
        {/* Add Prompt Section */}
        <section className="admin-prompt-section">
          <h2 className="admin-prompt-section-title">Add a New Diary Prompt</h2>
          <div className="admin-prompt-input-group">
            <textarea
              className="admin-prompt-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Write a new diary prompt..."
            />
            <button onClick={handleSubmit} className="admin-prompt-btn admin-prompt-add-btn">
              <FaPlus className="admin-prompt-btn-icon" />
              Add Prompt
            </button>
          </div>
        </section>

        {/* See Posts Button */}
        <button onClick={togglePosts} className="admin-prompt-btn admin-prompt-toggle-btn">
          <FaEye className="admin-prompt-btn-icon" />
          {showPosts ? "Hide Posts" : "See Posts"}
        </button>

        {/* Display All Prompts (Toggled) */}
        {showPosts && (
          <section className="admin-prompt-section">
            <h2 className="admin-prompt-section-title">Existing Prompts</h2>
            <ul className="admin-prompt-prompt-list">
              {prompts.length > 0 ? (
                prompts.map((prompt) => (
                  <li key={prompt._id} className="admin-prompt-prompt-item">
                    <span className="admin-prompt-prompt-text">{prompt.question}</span>
                    <button
                      onClick={() => handleDelete(prompt._id)}
                      className="admin-prompt-btn admin-prompt-delete-btn"
                    >
                      <FaTrash className="admin-prompt-btn-icon" />
                      Delete
                    </button>
                  </li>
                ))
              ) : (
                <p className="admin-prompt-no-prompts">No prompts available.</p>
              )}
            </ul>
          </section>
        )}

        {/* Success/Error Message */}
        {message && <div className="admin-prompt-notification">{message}</div>}
      </div>
    </div>
  );
}