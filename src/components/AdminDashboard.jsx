import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaLanguage, 
  FaImage, 
  FaPencilAlt, 
  FaSyncAlt, 
  FaBook, 
  FaCheck, 
  FaComment,
  FaUser,
  FaSignOutAlt
} from "react-icons/fa";
import './AdminDashboard.css'

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // Card colors array
  const cardColors = [
    "#e9f5ff", // Light Blue
    "#fff2e9", // Light Orange
    "#f2f9ed", // Light Green
    "#fff5f5", // Light Red
    "#f2eafa", // Light Purple
    "#e9fbfb", // Light Teal
    "#fff9e6", // Light Yellow
    "#f0f0f0"  // Light Gray
  ];

  // Card accent colors (for top border)
  const cardAccentColors = [
    "#4299e1", // Blue
    "#ed8936", // Orange
    "#68d391", // Green
    "#fc8181", // Red
    "#9f7aea", // Purple
    "#4fd1c5", // Teal
    "#ecc94b", // Yellow
    "#a0aec0"  // Gray
  ];
  
  const adminCards = [
    {
      title: "Add Translation Text",
      description: "Add new texts for users to translate.",
      icon: <FaLanguage />,
      route: "/add-translation"
    },
    {
      title: "Describe the Image",
      description: "Upload an image and a question for users to describe.",
      icon: <FaImage />,
      route: "/add-image-description"
    },
    {
      title: "Add Essay Topics",
      description: "Create categories and add essay topics for users.",
      icon: <FaPencilAlt />,
      route: "/add-essay-topics"
    },
    {
      title: "Add Paragraphs for Refining",
      description: "Provide small paragraphs for users to refine and improve.",
      icon: <FaSyncAlt />,
      route: "/add-rephrase-paragraphs"
    },
    {
      title: "Add Story",
      description: "Provide incomplete stories for users to complete.",
      icon: <FaBook />,
      route: "/add-story"
    },
    {
      title: "Add Error Correcting Sentences",
      description: "Provide sentences with grammatical errors for users to correct.",
      icon: <FaCheck />,
      route: "/add-error-sentences"
    },

    {
      title: "Add Diary Prompt",
      description: "Create daily writing prompts for users' diaries.",
      icon: <FaBook />,
      route: "/add-diary-prompt"
    }
  ];

  return (
    <div className="admin-homepage-container">
      {/* New top header */}
      <div className="admin-top-header">
        <div className="admin-logo-section">
          <FaComment className="admin-logo-icon" />
          <h2 className="admin-logo-text">Langfix</h2>
        </div>
        <div className="admin-profile-section">
          <div className="admin-profile">
            <FaUser className="admin-profile-icon" />
            <span className="admin-profile-text">Admin</span>
          </div>
          <button className="admin-logout-button">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      <div className="admin-homepage-header">
        <h1 className="admin-homepage-title">Admin Dashboard</h1>
        <p className="admin-homepage-subtitle">Manage your language learning content</p>
      </div>
      
      <div className="admin-homepage-cards-grid">
        {adminCards.map((card, index) => (
          <div 
            className="admin-homepage-card" 
            key={index}
            style={{
              backgroundColor: cardColors[index % cardColors.length],
            }}
          >
            <div 
              className="admin-homepage-card-accent"
              style={{
                backgroundColor: cardAccentColors[index % cardAccentColors.length],
              }}
            ></div>
            <div 
              className="admin-homepage-card-icon"
              style={{
                backgroundColor: `${cardAccentColors[index % cardAccentColors.length]}22`,
                color: cardAccentColors[index % cardAccentColors.length]
              }}
            >
              {card.icon}
            </div>
            <div className="admin-homepage-card-content">
              <h2 className="admin-homepage-card-title">{card.title}</h2>
              <p className="admin-homepage-card-description">{card.description}</p>
            </div>
            <button 
              className="admin-homepage-card-button"
              style={{
                backgroundColor: cardAccentColors[index % cardAccentColors.length]
              }}
              onClick={() => navigate(card.route)}
            >
              Manage
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}