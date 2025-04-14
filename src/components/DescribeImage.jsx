import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Image, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  MessageSquare,
  Award,
  Book,
  Star,
  Calendar,
  RefreshCw,
  AlertCircle,
  Info,
  Sparkles,
  Play
} from "lucide-react";
import "./DescribeImage.css";

export default function DescribeImage() {
  const [imageData, setImageData] = useState(null);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info, success, error
  const [imageError, setImageError] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [vocabularyEnhancement, setVocabularyEnhancement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vocabLoading, setVocabLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [activeTab, setActiveTab] = useState("description"); // description, grammar, vocabulary, history
  const [pastActivities, setPastActivities] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  // Timer logic
  useEffect(() => {
    let interval = null;
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (textareaRef.current) {
        textareaRef.current.disabled = true;
      }
      setTimerActive(false);
      setMessage("⏱️ Time's up! You can no longer edit your description.");
      setMessageType("warning");
    }
    
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const verifyToken = useCallback(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Unauthorized! Please log in.");
      navigate("/login");
      return false;
    }
    axios.defaults.headers.common["token"] = token;
    return true;
  }, [navigate]);

  const startActivity = () => {
    if (!imageData) return;
    
    setIsStarted(true);
    setTimerActive(true);
    setTimeLeft(10 * 60);
    
    if (textareaRef.current) {
      textareaRef.current.disabled = false;
      textareaRef.current.focus();
    }
  };

  const fetchRandomImage = useCallback(async () => {
    if (!verifyToken()) return;
    setLoading(true);
    try {
      setImageError(false);
      setAiAnalysis(null);
      setVocabularyEnhancement(null);
      setMessage("");
      setMessageType("info");
      setIsStarted(false);
      setSubmittedOnce(false);
      setCurrentAttempt(1);
      
      const response = await axios.get("http://localhost:5000/random-image-question", {
        headers: { token: sessionStorage.getItem("token") },
      });
      console.log("Fetched image data:", response.data);
      setImageData(response.data);
      setDescription("");
      setActiveTab("description");
      
      if (textareaRef.current) {
        textareaRef.current.disabled = true;
      }
    } catch (error) {
      console.error("Error fetching image question:", error);
      setMessage("Failed to load image. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, [verifyToken]);

  const fetchPastActivities = useCallback(async () => {
    if (!verifyToken()) return;
    try {
      const response = await axios.get("http://localhost:5000/user-descriptions", {
        headers: { 
          token: sessionStorage.getItem("token"),
          userid: sessionStorage.getItem("userid")
        },
      });
      
      if (response.data.status === "Success") {
        setPastActivities(response.data.descriptions);
      } else {
        setMessage("Failed to load past activities");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error fetching past activities:", error);
      setMessage("Failed to load past activities");
      setMessageType("error");
    }
  }, [verifyToken]);

  useEffect(() => {
    fetchRandomImage();
  }, [fetchRandomImage]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchPastActivities();
    }
  }, [activeTab, fetchPastActivities]);

  const submitDescription = async () => {
    if (!description.trim()) {
      setMessage("Please enter a description!");
      setMessageType("error");
      return;
    }

    if (!verifyToken()) return;

    setLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/submit-description",
        {
          userId: sessionStorage.getItem("userid"),
          imageId: imageData._id,
          description,
          attempt: currentAttempt
        },
        {
          headers: { token: sessionStorage.getItem("token") },
        }
      );

      setMessage("Your description has been submitted successfully!");
      setMessageType("success");
      setSubmittedOnce(true);
      
      // Don't fetch a new image, allow users to continue with same image for analysis
    } catch (error) {
      console.error("Error submitting description:", error);
      setMessage("Failed to submit description. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const analyzeWithAI = async () => {
    if (!description.trim()) {
      setMessage("Please enter a description before analyzing!");
      setMessageType("error");
      return;
    }

    if (!verifyToken()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/image/description-analyze",
        {
          imageDescription: imageData.imageDescription,
          userText: description,
        },
        {
          headers: { token: sessionStorage.getItem("token") },
        }
      );

      console.log("AI Analysis Response:", response.data);
      if (response.data.Status === "Success") {
        setAiAnalysis(response.data.feedback);
        setMessage("Analysis completed successfully!");
        setMessageType("success");
        setActiveTab("grammar");
      } else {
        setMessage("Failed to analyze: " + (response.data.message || "Unknown error"));
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error analyzing description:", error);
      setMessage("Failed to analyze description. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const enhanceVocabulary = async () => {
    if (!description.trim()) {
      setMessage("Please enter a description before enhancing vocabulary!");
      setMessageType("error");
      return;
    }

    if (!verifyToken()) return;

    setVocabLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/vocabulary/enhance",
        { text: description },
        { headers: { token: sessionStorage.getItem("token") } }
      );

      console.log("Vocabulary Enhancement Response:", response.data);
      if (response.data.Status === "Success") {
        setVocabularyEnhancement(response.data.feedback);
        setMessage("Vocabulary enhancement completed successfully!");
        setMessageType("success");
        setActiveTab("vocabulary");
      } else {
        setMessage("Failed to enhance vocabulary: " + (response.data.message || "Unknown error"));
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error enhancing vocabulary:", error);
      setMessage("Failed to enhance vocabulary. Please try again.");
      setMessageType("error");
    } finally {
      setVocabLoading(false);
    }
  };

  const startNewAttempt = () => {
    setCurrentAttempt(prev => prev + 1);
    setActiveTab("description");
    setDescription("");
    setIsStarted(true);
    setTimerActive(true);
    setTimeLeft(10 * 60);
    
    if (textareaRef.current) {
      textareaRef.current.disabled = false;
      textareaRef.current.focus();
    }
  };

  const cleanIssueText = (issue) => {
    return issue.replace(/\*\*/g, "");
  };

  const countWords = (text) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "#4CAF50"; // Excellent - Green
    if (score >= 75) return "#8BC34A"; // Good - Light Green
    if (score >= 60) return "#CDDC39"; // Satisfactory - Lime
    if (score >= 40) return "#FFC107"; // Needs Improvement - Amber
    return "#F44336"; // Poor - Red
  };

  const renderProgressBar = (score, maxScore = 10) => {
    const percentage = (score / maxScore) * 100;
    const color = getScoreColor((percentage * 100) / 100);
    
    return (
      <div className="img-progress-container">
        <div 
          className="img-progress-bar" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
        <span className="img-progress-label">{score}/{maxScore}</span>
      </div>
    );
  };

  return (
    <div className="img-container">
      <header className="img-header">
        <div className="img-header-left">
          <button className="img-back-button" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        </div>
        
        <div className="img-title">
          <Image className="img-title-icon" />
          <h1>Image Description Challenge</h1>
          {currentAttempt > 1 && (
            <span className="img-attempt-badge">Attempt #{currentAttempt}</span>
          )}
        </div>
        
        <div className="img-header-right">
          {isStarted && (
            <div className="img-timer">
              <Clock size={18} />
              <span className={timeLeft < 60 ? "img-timer-warning" : ""}>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </header>

      <div className="img-tabs">
        <button 
          className={`img-tab ${activeTab === 'description' ? 'img-tab-active' : ''}`}
          onClick={() => setActiveTab('description')}
        >
          <MessageSquare size={16} />
          Description
        </button>
        {aiAnalysis && (
          <button 
            className={`img-tab ${activeTab === 'grammar' ? 'img-tab-active' : ''}`}
            onClick={() => setActiveTab('grammar')}
          >
            <CheckCircle size={16} />
            Grammar Analysis
          </button>
        )}
        {vocabularyEnhancement && (
          <button 
            className={`img-tab ${activeTab === 'vocabulary' ? 'img-tab-active' : ''}`}
            onClick={() => setActiveTab('vocabulary')}
          >
            <Book size={16} />
            Vocabulary
          </button>
        )}
        <button 
          className={`img-tab ${activeTab === 'history' ? 'img-tab-active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Calendar size={16} />
          History
        </button>
      </div>
      
      {message && (
        <div className={`img-message img-message-${messageType}`}>
          <span>{message}</span>
          <button 
            className="img-message-close" 
            onClick={() => setMessage("")}
          >×</button>
        </div>
      )}

      {activeTab === 'description' && (
        <div className="img-content">
          <div className="img-task-info">
            <Info size={18} />
            <div>
              <h3>Task Instructions</h3>
              <p>Examine the image carefully and provide a detailed description based on the question. You have 10 minutes to complete this task once you start. Focus on accuracy, grammar, and vocabulary in your response.</p>
            </div>
          </div>

          {imageData ? (
            <div className="img-workspace">
              <div className="img-left-panel">
                <div className="img-display-container">
                  {!imageError ? (
                    <img
                      src={`http://localhost:5000${imageData.imagePath}`}
                      alt="Describe this"
                      className="img-display"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="img-error">
                      <AlertCircle size={40} />
                      <p>Image failed to load!</p>
                      <button 
                        className="img-refresh-button"
                        onClick={fetchRandomImage}
                      >
                        <RefreshCw size={16} />
                        Try Another Image
                      </button>
                    </div>
                  )}
                </div>
                <div className="img-question-container">
                  <h3>Question:</h3>
                  <p>{imageData.question}</p>
                </div>
              </div>

              <div className="img-right-panel">
                {!isStarted ? (
                  <div className="img-start-container">
                    <p>Click the Start button when you're ready. You'll have 10 minutes to complete your description.</p>
                    <button 
                      className="img-button img-start-activity-button"
                      onClick={startActivity}
                    >
                      <Play size={16} />
                      Start Activity
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="img-textarea-container">
                      <textarea
                        ref={textareaRef}
                        className="img-textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Write your description here..."
                        disabled={!isStarted || timeLeft === 0}
                        spellCheck="false"
                      />
                      <div className="img-word-count">
                        <FileText size={14} />
                        <span>{countWords(description)} words</span>
                      </div>
                    </div>

                    <div className="img-buttons">
                      {!submittedOnce ? (
                        <button 
                          className="img-button img-submit-button"
                          onClick={submitDescription}
                          disabled={loading || timeLeft === 0}
                        >
                          <CheckCircle size={16} />
                          {loading ? 'Submitting...' : 'Submit Description'}
                        </button>
                      ) : (
                        <div className="img-advanced-buttons">
                          <button 
                            className="img-button img-analyze-button"
                            onClick={analyzeWithAI}
                            disabled={loading || timeLeft === 0}
                          >
                            <CheckCircle size={16} />
                            {loading ? 'Analyzing...' : 'Grammar Analysis'}
                          </button>
                          
                          <button 
                            className="img-button img-vocab-button"
                            onClick={enhanceVocabulary}
                            disabled={vocabLoading || timeLeft === 0}
                          >
                            <Book size={16} />
                            {vocabLoading ? 'Enhancing...' : 'Enhance Vocabulary'}
                          </button>
                          
                          <button 
                            className="img-button img-new-attempt-button"
                            onClick={startNewAttempt}
                          >
                            <RefreshCw size={16} />
                            New Attempt
                          </button>
                          
                          <button 
                            className="img-button img-new-button"
                            onClick={fetchRandomImage}
                            disabled={loading}
                          >
                            <Image size={16} />
                            New Image
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="img-loading">
              <div className="img-spinner"></div>
              <p>Loading an image for you...</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'grammar' && aiAnalysis && (
        <div className="img-analysis-container">
          <div className="img-analysis-header">
            <h2><CheckCircle size={20} /> Grammar Analysis</h2>
            <p>Review of grammatical structure and suggestions for improvement</p>
          </div>
          
          <div className="img-relevance-card">
            <div className="img-card-header">
              <h3>Topic Relevance</h3>
            </div>
            <div className="img-card-content">
              <div className="img-comparison">
                <div className="img-comparison-item">
                  <h4>Image Description</h4>
                  <p>{aiAnalysis.relevance.imageDescription}</p>
                </div>
                <div className="img-comparison-item">
                  <h4>Your Description</h4>
                  <p>{aiAnalysis.relevance.userText}</p>
                </div>
              </div>
              <div className="img-result">
                <h4>Analysis Result</h4>
                <p>{aiAnalysis.relevance.result}</p>
              </div>
            </div>
          </div>

          <div className="img-grammar-card">
            <div className="img-card-header">
              <h3>Grammar Corrections</h3>
            </div>
            <div className="img-card-content">
              {aiAnalysis.grammar && aiAnalysis.grammar.length > 0 ? (
                aiAnalysis.grammar.map((sentence, index) => (
                  <div key={index} className="img-feedback-item">
                    <div className="img-feedback-original">
                      <h4>Original</h4>
                      <p>{sentence.original}</p>
                    </div>
                    <div className="img-feedback-corrected">
                      <h4>Corrected</h4>
                      <p>{sentence.corrected}</p>
                    </div>
                    <div className="img-feedback-issues">
                      <h4>Issues</h4>
                      {sentence.issues.length === 1 && sentence.issues[0] === "No grammar mistakes found." ? (
                        <div className="img-no-issues">
                          <CheckCircle size={16} />
                          <span>No grammar mistakes found</span>
                        </div>
                      ) : (
                        <ul className="img-issues-list">
                          {sentence.issues.map((issue, i) => (
                            <li key={i}>{cleanIssueText(issue)}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="img-no-issues-container">
                  <CheckCircle size={40} />
                  <p>Perfect grammar! No mistakes found in your description.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="img-feedback-actions">
            <button 
              className="img-button img-new-attempt-button"
              onClick={startNewAttempt}
            >
              <RefreshCw size={16} />
              Try Again (New Attempt)
            </button>
            
            <button 
              className="img-button img-new-button"
              onClick={fetchRandomImage}
            >
              <Image size={16} />
              Try New Image
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'vocabulary' && vocabularyEnhancement && (
        <div className="img-analysis-container">
          <div className="img-analysis-header">
            <h2><Book size={20} /> Vocabulary Enhancement</h2>
            <p>Suggestions for improving word choice and language variety</p>
          </div>
          
          <div className="img-vocab-cards">
            {vocabularyEnhancement.length > 0 ? (
              vocabularyEnhancement.map((item, index) => (
                <div key={index} className="img-vocab-card">
                  <div className="img-card-header">
                    <h3>Enhancement {index + 1}</h3>
                    <Sparkles size={18} className="img-sparkle-icon" />
                  </div>
                  <div className="img-card-content">
                    <div className="img-vocab-comparison">
                      <div className="img-feedback-original">
                        <h4>Original</h4>
                        <p>{item.original}</p>
                      </div>
                      <div className="img-feedback-enhanced">
                        <h4>Enhanced</h4>
                        <p>{item.enhanced}</p>
                      </div>
                    </div>
                    
                    <div className="img-vocab-details">
                      <div className="img-replaced-words">
                        <h4>Replaced Words</h4>
                        {item.replaced === "No enhancement needed" ? (
                          <div className="img-no-issues">
                            <CheckCircle size={16} />
                            <span>No enhancement needed</span>
                          </div>
                        ) : (
                          <ul className="img-replaced-list">
                            {item.replaced.split(", ").map((replacement, i) => (
                              <li key={i}>{replacement}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      
                      <div className="img-word-meanings">
                        <h4>Word Meanings</h4>
                        {item.meanings === "No enhancement needed" ? (
                          <div className="img-no-issues">
                            <CheckCircle size={16} />
                            <span>No enhancement needed</span>
                          </div>
                        ) : (
                          <ul className="img-meanings-list">
                            {item.meanings.split(", ").map((meaning, i) => (
                              <li key={i}>{meaning}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="img-no-issues-container">
                <CheckCircle size={40} />
                <p>Excellent vocabulary! No enhancements needed for your description.</p>
              </div>
            )}
          </div>
          
          <div className="img-feedback-actions">
            <button 
              className="img-button img-new-attempt-button"
              onClick={startNewAttempt}
            >
              <RefreshCw size={16} />
              Try Again (New Attempt)
            </button>
            
            <button 
              className="img-button img-new-button"
              onClick={fetchRandomImage}
            >
              <Image size={16} />
              Try New Image
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'history' && (
        <div className="img-history-container">
          <div className="img-history-header">
            <h2><Calendar size={20} /> Past Activities</h2>
            <p>Review your previous image descriptions</p>
          </div>
          
          {pastActivities.length > 0 ? (
            <div className="img-history-list">
              {pastActivities.map((activity, index) => (
                <div key={index} className="img-history-item">
                  <div className="img-history-image">
                    <img 
                      src={`http://localhost:5000${activity.imagePath}`} 
                      alt="Past activity"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/100x100?text=Image+Not+Available";
                      }}
                    />
                  </div>
                  <div className="img-history-details">
                    <div className="img-history-meta">
                      <div className="img-history-date">
                        <Calendar size={14} />
                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                      {activity.attempt && (
                        <div className="img-history-attempt">
                          <RefreshCw size={14} />
                          <span>Attempt #{activity.attempt}</span>
                        </div>
                      )}
                    </div>
                    <h4>{activity.question}</h4>
                    <p>{activity.description.substring(0, 100)}...</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="img-no-history">
              <AlertCircle size={40} />
              <p>You haven't completed any image descriptions yet.</p>
              <button 
                className="img-start-button"
                onClick={() => setActiveTab('description')}
              >
                <Image size={16} />
                Start Describing Images
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}