import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPencilAlt, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AdminEssay.css";

export default function AdminEssay() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [topic, setTopic] = useState("");
  const [topics, setTopics] = useState([]);
  const [showCategories, setShowCategories] = useState(false); // State to toggle category visibility

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  // Fetch topics for a selected category
  const fetchTopics = async (category) => {
    try {
      const response = await axios.get(`http://localhost:5000/topics/${category}`);
      setTopics(response.data.topics);
    } catch (error) {
      console.error("Error fetching topics", error);
    }
  };

  // Add a new category
  const addCategory = async () => {
    if (!category.trim()) {
      alert("Category name is required.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/admin/add-essay-category", { category });
      setCategory("");
      fetchCategories();
      alert("Category added successfully!");
    } catch (error) {
      console.error("Error adding category", error);
    }
  };

  // Add a topic to a category
  const addTopic = async () => {
    if (!selectedCategory || !topic.trim()) {
      alert("Please select a category and enter a topic.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/admin/add-topic", {
        category: selectedCategory,
        question: topic,
      });
      setTopic("");
      fetchTopics(selectedCategory);
      alert("Topic added successfully!");
    } catch (error) {
      console.error("Error adding topic", error);
    }
  };

  // Delete a category
  const deleteCategory = async (category) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete category "${category}"?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/admin/delete-category/${category}`);
      fetchCategories();
      setTopics([]);
      alert("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category", error);
    }
  };

  // Delete a topic
  const deleteTopic = async (topicId) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this topic?`);
    if (!confirmDelete) return;

    try {
      await axios.delete("http://localhost:5000/admin/delete-topic", {
        data: { category: selectedCategory, topicId },
      });
      fetchTopics(selectedCategory);
      alert("Topic deleted successfully!");
    } catch (error) {
      console.error("Error deleting topic", error);
    }
  };

  return (
    <div className="admin-essay-page">
      <header className="admin-essay-header">
        <div className="admin-essay-header-left">
          <FaPencilAlt className="admin-essay-header-icon" />
          <div className="admin-essay-header-title">
            <span className="admin-essay-main-title">Add</span>
            <span className="admin-essay-sub-title">Essays</span>
          </div>
        </div>
        <button className="admin-essay-back-btn" onClick={() => navigate("/admindashboard")}>
          <FaArrowLeft className="admin-essay-back-icon" />
          Back to Homepage
        </button>
      </header>

      <div className="admin-essay-content">
        {/* Add Category Section */}
        <section className="admin-essay-section">
          <h2 className="admin-essay-section-title">Add New Category</h2>
          <div className="admin-essay-input-group">
            <input
              type="text"
              placeholder="Enter category name..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="admin-essay-input"
            />
            <button onClick={addCategory} className="admin-essay-btn admin-essay-add-btn">
              Add Category
            </button>
          </div>
        </section>

        {/* See Categories Button */}
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="admin-essay-btn admin-essay-toggle-btn"
        >
          {showCategories ? "Hide Categories" : "See Categories"}
        </button>

        {/* Category List (Toggled) */}
        {showCategories && (
          <section className="admin-essay-section">
            <h2 className="admin-essay-section-title">Categories</h2>
            <ul className="admin-essay-category-list">
              {categories.map((cat, index) => (
                <li key={index} className="admin-essay-category-item">
                  <span>{cat.category}</span>
                  <button
                    onClick={() => deleteCategory(cat.category)}
                    className="admin-essay-btn admin-essay-delete-btn"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Add Topic Section */}
        <section className="admin-essay-section">
          <h2 className="admin-essay-section-title">Add New Topic</h2>
          <div className="admin-essay-input-group">
            <select
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                if (e.target.value) fetchTopics(e.target.value);
              }}
              value={selectedCategory}
              className="admin-essay-select"
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat.category}>
                  {cat.category}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Enter topic name..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="admin-essay-input"
            />
            <button onClick={addTopic} className="admin-essay-btn admin-essay-add-btn">
              Add Topic
            </button>
          </div>
        </section>

        {/* Display Topics for Selected Category */}
        {selectedCategory && (
          <section className="admin-essay-section">
            <h2 className="admin-essay-section-title">Topics under "{selectedCategory}"</h2>
            <ul className="admin-essay-topic-list">
              {topics.map((top) => (
                <li key={top._id} className="admin-essay-topic-item">
                  <span>{top.question}</span>
                  <button
                    onClick={() => deleteTopic(top._id)}
                    className="admin-essay-btn admin-essay-delete-btn"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}