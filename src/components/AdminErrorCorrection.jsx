import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheck, FaArrowLeft, FaPlus, FaEye, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AdminErrorCorrection.css";

export default function AdminErrorCorrection() {
  const navigate = useNavigate();
  const [sentence, setSentence] = useState("");
  const [sentences, setSentences] = useState([]);
  const [message, setMessage] = useState("");
  const [showPosts, setShowPosts] = useState(false); // State to toggle visibility of sentences

  useEffect(() => {
    // Fetch sentences only when "See Posts" is clicked, not on page load
  }, []);

  // Fetch all error sentences
  const fetchSentences = async () => {
    try {
      const response = await axios.get("http://localhost:5000/error-sentences");
      setSentences(response.data);
    } catch (error) {
      console.error("Error fetching sentences", error);
    }
  };

  // Add a new sentence with errors
  const addSentence = async () => {
    if (!sentence.trim()) {
      setMessage("Please enter a sentence with errors.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/admin/add-error-sentence", { sentence });

      setSentence("");
      setMessage(response.data.message);
      fetchSentences(); // Refresh list
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error adding sentence", error);
    }
  };

  // Delete a sentence
  const deleteSentence = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this sentence?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/admin/delete-error-sentence/${id}`);
      fetchSentences(); // Refresh list
      setMessage("Sentence deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting sentence", error);
    }
  };

  // Toggle visibility of posts
  const togglePosts = () => {
    if (!showPosts) fetchSentences(); // Fetch only when showing posts
    setShowPosts(!showPosts);
  };

  return (
    <div className="admin-error-page">
      <header className="admin-error-header">
        <div className="admin-error-header-left">
          <FaCheck className="admin-error-header-icon" />
          <div className="admin-error-header-title">
            <span className="admin-error-main-title">Add</span>
            <span className="admin-error-sub-title">Error</span>
          </div>
        </div>
        <button className="admin-error-back-btn" onClick={() => navigate("/dashboard")}>
          <FaArrowLeft className="admin-error-back-icon" />
          Back to Homepage
        </button>
      </header>

      <div className="admin-error-content">
        {/* Add Sentence Section */}
        <section className="admin-error-section">
          <h2 className="admin-error-section-title">Add a Sentence with Errors</h2>
          <div className="admin-error-input-group">
            <textarea
              placeholder="Enter a sentence with grammatical errors..."
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              className="admin-error-textarea"
            />
            <button onClick={addSentence} className="admin-error-btn admin-error-add-btn">
              <FaPlus className="admin-error-btn-icon" />
              Add Sentence
            </button>
          </div>
        </section>

        {/* See Posts Button */}
        <button onClick={togglePosts} className="admin-error-btn admin-error-toggle-btn">
          <FaEye className="admin-error-btn-icon" />
          {showPosts ? "Hide Posts" : "See Posts"}
        </button>

        {/* Display All Sentences (Toggled) */}
        {showPosts && (
          <section className="admin-error-section">
            <h2 className="admin-error-section-title">All Error Sentences</h2>
            <ul className="admin-error-sentence-list">
              {sentences.map((item) => (
                <li key={item._id} className="admin-error-sentence-item">
                  <p>{item.sentence}</p>
                  <button
                    onClick={() => deleteSentence(item._id)}
                    className="admin-error-btn admin-error-delete-btn"
                  >
                    <FaTrash className="admin-error-btn-icon" />
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Success/Error Message */}
        {message && <div className="admin-error-notification">{message}</div>}
      </div>
    </div>
  );
}