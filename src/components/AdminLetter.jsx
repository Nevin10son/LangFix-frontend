import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminLetter.css";

export default function AdminLetter() {
  const [category, setCategory] = useState("");
  const [letterText, setLetterText] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [letters, setLetters] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch all letter categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/letter-categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  // Fetch letters under a category
  const fetchLetters = async (category) => {
    try {
      const response = await axios.get(`http://localhost:5000/letters/${category}`);
      setLetters(response.data.letters);
    } catch (error) {
      console.error("Error fetching letters", error);
    }
  };

  // Add a new letter category
  const addCategory = async () => {
    if (!category.trim()) {
      setMessage("Please enter a category name.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/admin/add-letter-category", { category });
      setCategory("");
      setMessage(response.data.message);
      fetchCategories(); // Refresh list
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error adding category", error);
    }
  };

  // Add a new letter under a category
  const addLetter = async () => {
    if (!selectedCategory || !letterText.trim()) {
      setMessage("Please select a category and enter a letter prompt.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/admin/add-letter", {
        category: selectedCategory,
        description: letterText,
      });

      setLetterText("");
      setMessage(response.data.message);
      fetchLetters(selectedCategory); // Refresh list
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error adding letter", error);
    }
  };

  // Delete a letter category
  const deleteCategory = async (category) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this category?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/admin/delete-letter-category/${category}`);
      fetchCategories(); // Refresh list
    } catch (error) {
      console.error("Error deleting category", error);
    }
  };

  // Delete a specific letter
  const deleteLetter = async (description) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this letter?");
    if (!confirmDelete) return;

    try {
      await axios.delete("http://localhost:5000/admin/delete-letter", {
        data: { category: selectedCategory, description },
      });

      fetchLetters(selectedCategory); // Refresh list
    } catch (error) {
      console.error("Error deleting letter", error);
    }
  };

  return (
    <div className="admin-letter-container">
      <h1>Admin - Manage Letters</h1>
      {message && <p className="success-message">{message}</p>}

      {/* Add Letter Category Section */}
      <div className="input-section">
        <h2>Add a Letter Category</h2>
        <input
          type="text"
          placeholder="Enter category (e.g., Formal, Informal)..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button onClick={addCategory}>Add Category</button>
      </div>

      {/* Add Letter Section */}
      <div className="input-section">
        <h2>Add a Letter</h2>
        <select onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory}>
          <option value="">Select Category</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat.category}>
              {cat.category}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Enter letter prompt..."
          value={letterText}
          onChange={(e) => setLetterText(e.target.value)}
        />
        <button onClick={addLetter}>Add Letter</button>
      </div>

      {/* Display Categories & Letters */}
      <h2>All Categories</h2>
      <ul className="category-list">
        {categories.map((item) => (
          <li key={item.category}>
            <span onClick={() => fetchLetters(item.category)}>{item.category}</span>
            <button className="delete-button" onClick={() => deleteCategory(item.category)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>All Letters in {selectedCategory}</h2>
      <ul className="letter-list">
        {letters.map((item, index) => (
          <li key={index}>
            {item.description}
            <button className="delete-button" onClick={() => deleteLetter(item.description)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
