import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBook, FaArrowLeft, FaPlus, FaEye, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AdminStory.css";

export default function AdminStory() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [storyText, setStoryText] = useState("");
  const [stories, setStories] = useState([]);
  const [message, setMessage] = useState("");
  const [showPosts, setShowPosts] = useState(false); // State to toggle visibility of stories

  useEffect(() => {
    // Fetch stories only when "See Posts" is clicked, not on page load
  }, []);

  // Fetch all stories
  const fetchStories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/stories");
      setStories(response.data);
    } catch (error) {
      console.error("Error fetching stories", error);
    }
  };

  // Add a new story
  const addStory = async () => {
    if (!title.trim() || !storyText.trim()) {
      setMessage("Please enter both a title and an incomplete story.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/admin/add-story", {
        title,
        storyText,
      });

      setTitle("");
      setStoryText("");
      setMessage(response.data.message);
      fetchStories(); // Refresh list
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error adding story", error);
    }
  };

  // Delete a story
  const deleteStory = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this story?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/admin/delete-story/${id}`);
      fetchStories(); // Refresh list
      setMessage("Story deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting story", error);
    }
  };

  // Toggle visibility of posts
  const togglePosts = () => {
    if (!showPosts) fetchStories(); // Fetch only when showing posts
    setShowPosts(!showPosts);
  };

  return (
    <div className="admin-story-page">
      <header className="admin-story-header">
        <div className="admin-story-header-left">
          <FaBook className="admin-story-header-icon" />
          <div className="admin-story-header-title">
            <span className="admin-story-main-title">Add</span>
            <span className="admin-story-sub-title">Story</span>
          </div>
        </div>
        <button className="admin-story-back-btn" onClick={() => navigate("/admindashboard")}>
          <FaArrowLeft className="admin-story-back-icon" />
          Back to Homepage
        </button>
      </header>

      <div className="admin-story-content">
        {/* Add Story Section */}
        <section className="admin-story-section">
          <h2 className="admin-story-section-title">Add an Incomplete Story</h2>
          <div className="admin-story-input-group">
            <input
              type="text"
              placeholder="Enter story title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="admin-story-input"
            />
            <textarea
              placeholder="Enter an incomplete story..."
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              className="admin-story-textarea"
            />
            <button onClick={addStory} className="admin-story-btn admin-story-add-btn">
              <FaPlus className="admin-story-btn-icon" />
              Add Story
            </button>
          </div>
        </section>

        {/* See Posts Button */}
        <button onClick={togglePosts} className="admin-story-btn admin-story-toggle-btn">
          <FaEye className="admin-story-btn-icon" />
          {showPosts ? "Hide Posts" : "See Posts"}
        </button>

        {/* Display All Stories (Toggled) */}
        {showPosts && (
          <section className="admin-story-section">
            <h2 className="admin-story-section-title">All Incomplete Stories</h2>
            <ul className="admin-story-story-list">
              {stories.map((item) => (
                <li key={item._id} className="admin-story-story-item">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.storyText}</p>
                  </div>
                  <button
                    onClick={() => deleteStory(item._id)}
                    className="admin-story-btn admin-story-delete-btn"
                  >
                    <FaTrash className="admin-story-btn-icon" />
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Success/Error Message */}
        {message && <div className="admin-story-notification">{message}</div>}
      </div>
    </div>
  );
}