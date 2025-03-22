import React, { useState, useEffect } from "react";
import axios from "axios";
import {FaLanguage} from "react-icons/fa";
import { Home, ArrowDown } from "lucide-react";
import "./AdminTranslate.css";

export default function AdminTranslate() {
  const [text, setText] = useState("");
  const [texts, setTexts] = useState([]);
  const [message, setMessage] = useState("");
  const [showTexts, setShowTexts] = useState(false);

  const fetchTexts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/translate-texts");
      setTexts(response.data);
    } catch (error) {
      console.error("Error fetching texts", error);
    }
  };

  const addText = async () => {
    if (!text.trim()) return;
    try {
      const response = await axios.post("http://localhost:5000/api/admin/add-translate-text", { text });
      setText("");
      setMessage(response.data.message);
      if (showTexts) {
        fetchTexts();
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error adding text", error);
    }
  };

  const deleteText = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this text?");
    if (!confirmDelete) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/delete-translate-text/${id}`);
      fetchTexts();
    } catch (error) {
      console.error("Error deleting text", error);
    }
  };

  const handleShowTexts = () => {
    setShowTexts(!showTexts);
    if (!showTexts) {
      fetchTexts();
    }
  };

  return (
    <div className="admin-translation-container">
      <div className="admin-translation-header">
        <div className="admin-translation-logo">
          <FaLanguage size={32} color="#FFB6C1" />
          <div className="admin-translation-title">
            <span className="admin-translation-add">Add</span>
            <span className="admin-translation-text">translation</span>
          </div>
        </div>
        <button className="admin-translation-home-btn">
          <Home size={18} />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="admin-translation-content">
        {message && <p className="admin-translation-success-message">{message}</p>}
        <textarea
          className="admin-translation-textarea"
          placeholder="Enter text to be translated..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        <button className="admin-translation-add-btn" onClick={addText}>Add Text</button>
        
        <button className="admin-translation-show-btn" onClick={handleShowTexts}>
          <span>See Posts</span>
          <ArrowDown size={16} />
        </button>

        {showTexts && (
          <div className="admin-translation-texts">
            <h2>All Added Texts</h2>
            {texts.length === 0 ? (
              <p className="admin-translation-no-texts">No texts found</p>
            ) : (
              <ul className="admin-translation-list">
                {texts.map((item) => (
                  <li key={item._id} className="admin-translation-item">
                    <div className="admin-translation-item-text">{item.text}</div>
                    <button 
                      className="admin-translation-delete-btn" 
                      onClick={() => deleteText(item._id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}