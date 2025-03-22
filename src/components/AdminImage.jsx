import React, { useState } from "react";
import axios from "axios";
import { FaReact, FaUpload, FaTrashAlt, FaEye, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import './AdminImage.css'

export default function AdminImage() {
  const [question, setQuestion] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [image, setImage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Fetch all questions - now only when button is clicked
  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/all-questions");
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions", error);
      setMessage("Failed to load questions. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload new question
  const handleUpload = async () => {
    if (!question.trim() || !image || !imageDescription.trim()) {
      setMessage("Question, image, and description are required.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("question", question);
    formData.append("imageDescription", imageDescription);
    formData.append("image", image);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(response.data.message);
      setQuestion("");
      setImageDescription("");
      setImage(null);
      document.getElementById("file-input").value = "";
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error uploading question", error);
      setMessage("Failed to upload. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete question
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this question?");
    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:5000/delete/${id}`);
      setQuestions(questions.filter(item => item._id !== id));
      setMessage("Question deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting question", error);
      setMessage("Failed to delete. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-image-container">
      <div className="admin-image-header">
        <div className="admin-image-title-section">
          <FaReact className="admin-image-react-icon" />
          <div className="admin-image-title">
            <h1>Add</h1>
            <h2>Image</h2>
          </div>
        </div>
        <button 
          className="admin-image-back-button"
          onClick={() => navigate('/admindashboard')}
        >
          <FaArrowLeft /> Back to Homepage
        </button>
      </div>

      {message && <div className="admin-image-message">{message}</div>}

      <div className="admin-image-upload-section">
        <div className="admin-image-input-group">
          <label>Question</label>
          <input
            type="text"
            placeholder="Enter question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        
        <div className="admin-image-input-group">
          <label>Image Description</label>
          <textarea
            placeholder="Enter image description..."
            value={imageDescription}
            onChange={(e) => setImageDescription(e.target.value)}
          />
        </div>
        
        <div className="admin-image-input-group">
          <label>Upload Image</label>
          <div className="admin-image-file-input">
            <input 
              type="file" 
              id="file-input"
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <span>{image ? image.name : "No file chosen"}</span>
          </div>
        </div>
        
        <div className="admin-image-buttons">
          <button 
            className="admin-image-upload-button" 
            onClick={handleUpload}
            disabled={isLoading}
          >
            <FaUpload /> Upload Question
          </button>
          
          <button 
            className="admin-image-view-button" 
            onClick={fetchQuestions}
            disabled={isLoading}
          >
            <FaEye /> See Posts
          </button>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="admin-image-questions-section">
          <h2>Image Questions</h2>
          <div className="admin-image-question-grid">
            {questions.map((item) => (
              <div key={item._id} className="admin-image-question-item">
                <div className="admin-image-question-img">
                  <img src={`http://localhost:5000${item.imagePath}`} alt="Question" />
                </div>
                <div className="admin-image-question-content">
                  <p><strong>Question:</strong> {item.question}</p>
                  <p><strong>Description:</strong> {item.imageDescription}</p>
                  <button 
                    className="admin-image-delete-button" 
                    onClick={() => handleDelete(item._id)}
                    disabled={isLoading}
                  >
                    <FaTrashAlt /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}