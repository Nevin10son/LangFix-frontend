import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSync, FaArrowLeft, FaPlus, FaEye, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AdminRephrase.css";

export default function AdminRephrase() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [paragraphs, setParagraphs] = useState([]);
  const [message, setMessage] = useState("");
  const [showPosts, setShowPosts] = useState(false); // State to toggle visibility of posts

  useEffect(() => {
    // Fetch paragraphs only when "See Posts" is clicked, not on page load
  }, []);

  // Fetch all rephrase paragraphs
  const fetchParagraphs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/rephrase-texts");
      setParagraphs(response.data);
    } catch (error) {
      console.error("Error fetching paragraphs", error);
    }
  };

  // Add a new paragraph
  const addParagraph = async () => {
    if (!text.trim()) {
      setMessage("Please enter a paragraph.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/admin/add-rephrase", { text });
      setText("");
      setMessage(response.data.message);
      fetchParagraphs(); // Refresh list
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error adding paragraph", error);
    }
  };

  // Delete a paragraph
  const deleteParagraph = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this paragraph?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/admin/delete-rephrase/${id}`);
      fetchParagraphs(); // Refresh list
      setMessage("Paragraph deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting paragraph", error);
    }
  };

  // Toggle visibility of posts
  const togglePosts = () => {
    if (!showPosts) fetchParagraphs(); // Fetch only when showing posts
    setShowPosts(!showPosts);
  };

  return (
    <div className="admin-rephrase-page">
      <header className="admin-rephrase-header">
        <div className="admin-rephrase-header-left">
          <FaSync className="admin-rephrase-header-icon" />
          <div className="admin-rephrase-header-title">
            <span className="admin-rephrase-main-title">Add</span>
            <span className="admin-rephrase-sub-title">Rephrase</span>
          </div>
        </div>
        <button className="admin-rephrase-back-btn" onClick={() => navigate("/dashboard")}>
          <FaArrowLeft className="admin-rephrase-back-icon" />
          Back to Homepage
        </button>
      </header>

      <div className="admin-rephrase-content">
        {/* Add Paragraph Section */}
        <section className="admin-rephrase-section">
          <h2 className="admin-rephrase-section-title">Add a New Paragraph</h2>
          <div className="admin-rephrase-input-group">
            <textarea
              placeholder="Enter a paragraph for users to rephrase..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="admin-rephrase-textarea"
            />
            <button onClick={addParagraph} className="admin-rephrase-btn admin-rephrase-add-btn">
              <FaPlus className="admin-rephrase-btn-icon" />
              Add Paragraph
            </button>
          </div>
        </section>

        {/* See Posts Button */}
        <button onClick={togglePosts} className="admin-rephrase-btn admin-rephrase-toggle-btn">
          <FaEye className="admin-rephrase-btn-icon" />
          {showPosts ? "Hide Posts" : "See Posts"}
        </button>

        {/* Display All Paragraphs (Toggled) */}
        {showPosts && (
          <section className="admin-rephrase-section">
            <h2 className="admin-rephrase-section-title">All Rephrase Paragraphs</h2>
            <ul className="admin-rephrase-paragraph-list">
              {paragraphs.map((item) => (
                <li key={item._id} className="admin-rephrase-paragraph-item">
                  <p>{item.text}</p>
                  <button
                    onClick={() => deleteParagraph(item._id)}
                    className="admin-rephrase-btn admin-rephrase-delete-btn"
                  >
                    <FaTrash className="admin-rephrase-btn-icon" />
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Success/Error Message */}
        {message && <div className="admin-rephrase-notification">{message}</div>}
      </div>
    </div>
  );
}