import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  RefreshCw, 
  Send, 
  Book, 
  Search, 
  Check, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb,
  Zap,
  Award,
  CheckCircle,
  Edit,
  History,
  Calendar,
  Clock,
  Badge,
  ChevronRight
} from "lucide-react";
import "./RephraseSentence.css";

export default function RephraseSentence() {
  const [question, setQuestion] = useState(null);
  const [rephrasedText, setRephrasedText] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success, error, info
  const [grammarFeedback, setGrammarFeedback] = useState(null);
  const [rephraseFeedback, setRephraseFeedback] = useState(null);
  const [enhancedRephraseFeedback, setEnhancedRephraseFeedback] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);
  const [showTips, setShowTips] = useState(false);
  const [activeTab, setActiveTab] = useState("write"); // write, grammar, enhance, score, history
  const [loading, setLoading] = useState({
    submit: false,
    enhance: false,
    grammar: false,
    score: false,
    history: false
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [userRephrase, setUserRephrase] = useState(null);
  const [rephraseHistory, setRephraseHistory] = useState([]);
  const [expandedRephrase, setExpandedRephrase] = useState(null);
  const [expandedAttempt, setExpandedAttempt] = useState(null);
  const navigate = useNavigate();

  // Rephrasing tips
  const tipsData = [
    "Use synonyms to replace key words while keeping the original meaning",
    "Change the sentence structure (e.g., from active to passive voice)",
    "Break a long sentence into two shorter ones, or combine short sentences",
    "Use different transitional phrases and conjunctions",
    "Reorder the information while maintaining the logical flow",
    "Use nominalizations (turning verbs into nouns) or vice versa"
  ];

  useEffect(() => {
    verifyToken();
    fetchRandomRephrase();
  }, []);

  const verifyToken = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      showMessage("Unauthorized! Please log in.", "error");
      navigate("/login");
      return;
    }
    axios.defaults.headers.common["token"] = token;
  };

  const fetchRandomRephrase = async () => {
    try {
      setActiveTab("write");
      setIsSubmitted(false);
      setIsEditing(false);
      setCurrentAttempt(1);
      setUserRephrase(null);
      const response = await axios.get("http://localhost:5000/random-rephrase", {
        headers: { token: sessionStorage.getItem("token") },
      });
      setQuestion(response.data);
      setRephrasedText("");
      resetFeedback();
    } catch (error) {
      console.error("Error fetching rephrase question", error);
      showMessage("Failed to load question.", "error");
    }
  };

  const fetchUserRephraseHistory = async () => {
    setLoading({...loading, history: true});
    try {
      const userId = sessionStorage.getItem("userid");
      if (!userId) {
        showMessage("User ID not found in session.", "error");
        return;
      }

      const response = await axios.get(`http://localhost:5000/user-rephrase-history?userId=${userId}`, {
        headers: { token: sessionStorage.getItem("token") }
      });

      if (response.data.Status === "Success") {
        setRephraseHistory(response.data.data);
        setActiveTab("history");
        if (response.data.data.length === 0) {
          showMessage("No rephrase history found.", "info");
        }
      } else {
        showMessage("Failed to fetch history: " + response.data.message, "error");
      }
    } catch (error) {
      console.error("Error fetching rephrase history:", error);
      showMessage("Failed to fetch rephrase history.", "error");
    } finally {
      setLoading({...loading, history: false});
    }
  };

  const resetFeedback = () => {
    setGrammarFeedback(null);
    setEnhancedRephraseFeedback(null);
    setRephraseFeedback(null);
    setScoreResult(null);
  };

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage("");
    }, 5000);
  };

  const submitRephrasedText = async () => {
    if (!rephrasedText.trim()) {
      showMessage("Please enter your rephrased text!", "error");
      return;
    }

    setLoading({...loading, submit: true});

    try {
      const userId = sessionStorage.getItem("userid");
      
      // Check if this is a new submission or an updated one
      if (!isEditing || !userRephrase) {
        // First submission
        const response = await axios.post(
          "http://localhost:5000/submit-rephrase",
          {
            userId,
            rephraseId: question._id,
            rephrasedText,
            attemptNumber: 1
          },
          { headers: { token: sessionStorage.getItem("token") } }
        );
        setUserRephrase(response.data);
        setCurrentAttempt(1);
      } else {
        // Updated submission (a new attempt)
        const nextAttemptNumber = currentAttempt + 1;
        const response = await axios.post(
          "http://localhost:5000/update-rephrase",
          {
            userRephraseId: userRephrase._id,
            userId,
            rephraseId: question._id,
            rephrasedText,
            attemptNumber: nextAttemptNumber
          },
          { headers: { token: sessionStorage.getItem("token") } }
        );
        setUserRephrase(response.data);
        setCurrentAttempt(nextAttemptNumber);
      }
      
      setIsSubmitted(true);
      setIsEditing(false);
      resetFeedback();
      showMessage(`Your rephrased text has been submitted successfully! (Attempt #${currentAttempt + (isEditing ? 1 : 0)})`, "success");
    } catch (error) {
      console.error("Error submitting rephrased text", error);
      showMessage("Failed to submit.", "error");
    } finally {
      setLoading({...loading, submit: false});
    }
  };

  const enhanceRephrase = async () => {
    if (!rephrasedText.trim()) {
      showMessage("Please enter your rephrased text to enhance!", "error");
      return;
    }

    setLoading({...loading, enhance: true});

    try {
      const response = await axios.post(
        "http://localhost:5000/rephrase/enhance",
        { text: rephrasedText },
        { headers: { token: sessionStorage.getItem("token") } }
      );
      if (response.data.Status === "Success") {
        setEnhancedRephraseFeedback(response.data.feedback);
        setActiveTab("enhance");
        showMessage("Rephrasing enhancement completed! Consider these improvements for your next attempt.", "success");
      } else {
        showMessage("Failed to enhance rephrasing: " + response.data.error, "error");
      }
    } catch (error) {
      console.error("Error enhancing rephrasing:", error);
      showMessage("Failed to enhance rephrasing with AI.", "error");
    } finally {
      setLoading({...loading, enhance: false});
    }
  };

  const handleAnalyzeRephrase = async () => {
    if (!rephrasedText.trim()) {
      showMessage("Please enter your rephrased text to analyze!", "error");
      return;
    }

    setLoading({...loading, grammar: true});

    try {
      const response = await axios.post(
        "http://localhost:5000/analyze-rephrase",
        { originalText: question.text, rephrasedText },
        { headers: { token: sessionStorage.getItem("token") } }
      );
      if (response.data.Status === "Success") {
        setRephraseFeedback(response.data);
        setActiveTab("grammar");
        showMessage("Rephrase analysis completed! Check the grammar feedback to improve your response.", "success");
      } else {
        showMessage("Failed to analyze rephrase: " + response.data.message, "error");
      }
    } catch (error) {
      console.error("Error analyzing rephrase:", error);
      showMessage("Failed to analyze rephrase with AI.", "error");
    } finally {
      setLoading({...loading, grammar: false});
    }
  };

  const scoreRephrase = async () => {
    if (!rephrasedText.trim()) {
      showMessage("Please enter your rephrased text to score!", "error");
      return;
    }
  
    setLoading({...loading, score: true});
  
    try {
      const userId = sessionStorage.getItem("userid");
      
      if (!userId) {
        showMessage("User authentication error. Please log in again.", "error");
        navigate("/login");
        return;
      }
      
      const response = await axios.post(
        "http://localhost:5000/score-rephrase",
        { 
          originalText: question.text, 
          rephrasedText,
          rephraseId: question._id,
          userId: userId,
          attemptNumber: currentAttempt
        },
        { headers: { token: sessionStorage.getItem("token") } }
      );
      
      if (response.data.Status === "Success") {
        setScoreResult(response.data.feedback);
        setActiveTab("score");
        showMessage(`Scoring for attempt #${currentAttempt} completed! See how your response performed.`, "success");
      } else {
        showMessage("Failed to score: " + (response.data.message || "Unknown error"), "error");
      }
    } catch (error) {
      console.error("Error scoring rephrase:", error);
      showMessage("Failed to score rephrase.", "error");
    } finally {
      setLoading({...loading, score: false});
    }
  };

  const enableEditing = () => {
    setIsEditing(true);
    setActiveTab("write");
    resetFeedback();
    showMessage(`You can now improve your response for attempt #${currentAttempt + 1}. Submit when ready.`, "info");
  };

  const loadHistoricalAttempt = (rephrase, attempt) => {
    setQuestion({
      _id: rephrase.rephraseId,
      text: rephrase.originalText,
      difficulty: rephrase.difficulty,
      category: rephrase.category
    });
    setRephrasedText(attempt.rephrasedText);
    setIsSubmitted(true);
    setIsEditing(false);
    setCurrentAttempt(attempt.attemptNumber);
    setUserRephrase({
      _id: rephrase.rephraseId,
      attempts: rephrase.attempts
    });
    
    // If the attempt has a score, load it
    if (attempt.score) {
      setScoreResult({
        CorrectWordUsage: {
          score: attempt.score.semanticScore / 10,
          feedback: "Semantic accuracy assessment from previous scoring.",
          points: ["Previous scoring data"]
        },
        SentenceStructure: {
          score: attempt.score.structureScore / 10,
          feedback: "Sentence structure assessment from previous scoring.",
          points: ["Previous scoring data"]
        },
        GrammarMistakes: {
          score: attempt.score.grammarScore / 10,
          feedback: "Grammar assessment from previous scoring.",
          points: ["Previous scoring data"]
        },
        Completeness: {
          score: attempt.score.creativityScore / 10,
          feedback: "Creativity assessment from previous scoring.",
          points: ["Previous scoring data"]
        },
        Total: attempt.score.totalScore,
        Feedback: attempt.score.feedback || "Score analysis from previous attempt."
      });
      setActiveTab("score");
    } else {
      setActiveTab("write");
      resetFeedback();
    }
    
    showMessage(`Loaded historical attempt #${attempt.attemptNumber} for review.`, "info");
  };

  const toggleRephraseExpand = (rephraseId) => {
    if (expandedRephrase === rephraseId) {
      setExpandedRephrase(null);
      setExpandedAttempt(null);
    } else {
      setExpandedRephrase(rephraseId);
      setExpandedAttempt(null);
    }
  };

  const toggleAttemptExpand = (attemptNumber) => {
    if (expandedAttempt === attemptNumber) {
      setExpandedAttempt(null);
    } else {
      setExpandedAttempt(attemptNumber);
    }
  };

  const cleanIssueText = (issue) => {
    return issue.replace(/\*\*(.*?)\*\*/g, "$1");
  };
  
  // Get color based on score
  const getScoreColor = (score) => {
    if (score >= 90) return "#22c55e"; // Excellent - Green
    if (score >= 75) return "#84cc16"; // Good - Light Green
    if (score >= 60) return "#eab308"; // Satisfactory - Yellow
    if (score >= 40) return "#f97316"; // Needs Improvement - Orange
    return "#ef4444"; // Poor - Red
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Render progress bar for scores
  const renderProgressBar = (score, maxScore = 10) => {
    const percentage = (score / maxScore) * 100;
    const color = getScoreColor(score * 10); // Scale to 0-100 for color
    
    return (
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
        <span className="progress-label">{score}/{maxScore}</span>
      </div>
    );
  };

  return (
    <div className="rephrase-page">
      <header className="rephrase-header">
        <div className="header-left">
          <button 
            className="refresh-button" 
            onClick={fetchRandomRephrase}
            aria-label="Get new sentence"
          >
            <RefreshCw size={18} />
            <span>New Sentence</span>
          </button>
          <h1 className="page-title">Rephrase the Sentence</h1>
          {currentAttempt > 1 && activeTab !== "history" && (
            <span className="attempt-indicator">Attempt #{currentAttempt}</span>
          )}
        </div>
        <button 
          className="back-button" 
          onClick={() => navigate("/dashboard")}
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </button>
      </header>

      <div className="rephrase-tabs main-tabs">
        <button 
          className={`rephrase-tab ${activeTab === 'write' ? 'rephrase-tab-active' : ''}`}
          onClick={() => setActiveTab('write')}
        >
          <Send size={16} />
          Write
        </button>
        {isSubmitted && (
          <>
            <button 
              className={`rephrase-tab ${activeTab === 'grammar' ? 'rephrase-tab-active' : ''}`}
              onClick={() => {
                if (rephraseFeedback) {
                  setActiveTab('grammar');
                } else {
                  handleAnalyzeRephrase();
                }
              }}
            >
              <Check size={16} />
              Grammar
            </button>
            <button 
              className={`rephrase-tab ${activeTab === 'enhance' ? 'rephrase-tab-active' : ''}`}
              onClick={() => {
                if (enhancedRephraseFeedback) {
                  setActiveTab('enhance');
                } else {
                  enhanceRephrase();
                }
              }}
            >
              <Book size={16} />
              Enhance
            </button>
            <button 
              className={`rephrase-tab ${activeTab === 'score' ? 'rephrase-tab-active' : ''}`}
              onClick={() => {
                if (scoreResult) {
                  setActiveTab('score');
                } else {
                  scoreRephrase();
                }
              }}
            >
              <Star size={16} />
              Score
            </button>
          </>
        )}
        <button 
          className={`rephrase-tab ${activeTab === 'history' ? 'rephrase-tab-active' : ''}`}
          onClick={() => {
            if (activeTab !== 'history') {
              fetchUserRephraseHistory();
            }
          }}
        >
          <History size={16} />
          History
        </button>
      </div>
      
      {message && (
        <div className={`message-banner message-${messageType}`}>
          <span>{message}</span>
          <button className="message-close" onClick={() => setMessage("")}>×</button>
        </div>
      )}

      <div className="rephrase-container">
        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="history-container">
            <div className="card history-card">
              <div className="card-header">
                <h3><History size={20} /> Your Rephrase History</h3>
                <p>Review all your past rephrase attempts and scores</p>
              </div>
              
              <div className="card-content">
                {loading.history ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading history...</p>
                  </div>
                ) : rephraseHistory.length === 0 ? (
                  <div className="no-history">
                    <p>You haven't submitted any rephrased sentences yet.</p>
                    <button 
                      className="primary-button" 
                      onClick={fetchRandomRephrase}
                    >
                      <RefreshCw size={18} />
                      Get Started with a Sentence
                    </button>
                  </div>
                ) : (
                  <div className="history-list">
                    {rephraseHistory.map((rephrase, index) => (
                      <div 
                        key={index} 
                        className={`history-item ${expandedRephrase === rephrase.rephraseId ? 'expanded' : ''}`}
                      >
                        <div 
                          className="history-item-header"
                          onClick={() => toggleRephraseExpand(rephrase.rephraseId)}
                        >
                          <div className="history-item-info">
                            <h4>Original: {rephrase.originalText}</h4>
                            <div className="history-meta">
                              <span className="history-meta-item">
                                <Calendar size={14} />
                                {formatDate(rephrase.attempts[0].submittedAt)}
                              </span>
                              <span className="history-meta-item">
                                <Badge size={14} />
                                {rephrase.difficulty}
                              </span>
                              {rephrase.category && (
                                <span className="history-meta-item">
                                  <Book size={14} />
                                  {rephrase.category}
                                </span>
                              )}
                              <span className="history-meta-item">
                                <Clock size={14} />
                                {rephrase.attempts.length} {rephrase.attempts.length === 1 ? 'attempt' : 'attempts'}
                              </span>
                            </div>
                          </div>
                          <button className="expand-button">
                            {expandedRephrase === rephrase.rephraseId ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </div>
                        
                        {expandedRephrase === rephrase.rephraseId && (
                          <div className="history-attempts">
                            {rephrase.attempts.map((attempt, attemptIndex) => (
                              <div 
                                key={attemptIndex} 
                                className={`history-attempt ${expandedAttempt === attempt.attemptNumber ? 'expanded' : ''}`}
                              >
                                <div 
                                  className="history-attempt-header"
                                  onClick={() => toggleAttemptExpand(attempt.attemptNumber)}
                                >
                                  <div className="attempt-info">
                                    <h5>Attempt #{attempt.attemptNumber}</h5>
                                    <span className="attempt-date">{formatDate(attempt.submittedAt)}</span>
                                  </div>
                                  
                                  {attempt.score && (
                                    <div className="attempt-score">
                                      <div 
                                        className="score-badge"
                                        style={{ backgroundColor: getScoreColor(attempt.score.totalScore) }}
                                      >
                                        {attempt.score.totalScore}/100
                                      </div>
                                    </div>
                                  )}
                                  
                                  <button className="expand-button">
                                    {expandedAttempt === attempt.attemptNumber ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </button>
                                </div>
                                
                                {expandedAttempt === attempt.attemptNumber && (
                                  <div className="attempt-details">
                                    <div className="attempt-text">
                                      <h6>Your Rephrased Version:</h6>
                                      <p>{attempt.rephrasedText}</p>
                                    </div>
                                    
                                    {attempt.score && (
                                      <div className="attempt-score-details">
                                        <h6>Score Breakdown:</h6>
                                        <div className="score-categories">
                                          <div className="score-category">
                                            <span>Semantic Accuracy:</span>
                                            <div className="mini-progress-bar">
                                              <div 
                                                className="mini-progress-fill" 
                                                style={{ 
                                                  width: `${attempt.score.semanticScore}%`,
                                                  backgroundColor: getScoreColor(attempt.score.semanticScore)
                                                }}
                                              ></div>
                                              <span>{attempt.score.semanticScore}/100</span>
                                            </div>
                                          </div>
                                          <div className="score-category">
                                            <span>Sentence Structure:</span>
                                            <div className="mini-progress-bar">
                                              <div 
                                                className="mini-progress-fill" 
                                                style={{ 
                                                  width: `${attempt.score.structureScore}%`,
                                                  backgroundColor: getScoreColor(attempt.score.structureScore)
                                                }}
                                              ></div>
                                              <span>{attempt.score.structureScore}/100</span>
                                            </div>
                                          </div>
                                          <div className="score-category">
                                            <span>Grammar:</span>
                                            <div className="mini-progress-bar">
                                              <div 
                                                className="mini-progress-fill" 
                                                style={{ 
                                                  width: `${attempt.score.grammarScore}%`,
                                                  backgroundColor: getScoreColor(attempt.score.grammarScore)
                                                }}
                                              ></div>
                                              <span>{attempt.score.grammarScore}/100</span>
                                            </div>
                                          </div>
                                          <div className="score-category">
                                            <span>Creativity:</span>
                                            <div className="mini-progress-bar">
                                              <div 
                                                className="mini-progress-fill" 
                                                style={{ 
                                                  width: `${attempt.score.creativityScore}%`,
                                                  backgroundColor: getScoreColor(attempt.score.creativityScore)
                                                }}
                                              ></div>
                                              <span>{attempt.score.creativityScore}/100</span>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {attempt.score.feedback && (
                                          <div className="score-feedback">
                                            <h6>Feedback:</h6>
                                            <p>{attempt.score.feedback}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    <div className="attempt-actions">
                                      <button
                                        className="primary-button"
                                        onClick={() => loadHistoricalAttempt(rephrase, attempt)}
                                      >
                                        <ChevronRight size={16} />
                                        Review This Attempt
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="history-actions">
                  <button
                    className="secondary-button refresh-button"
                    onClick={fetchRandomRephrase}
                  >
                    <RefreshCw size={18} />
                    Try New Sentence
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {question && activeTab !== 'history' ? (
          <>
            {/* Write Tab */}
            {activeTab === 'write' && (
              <div className="write-container">
                <div className="tips-section">
                  <button 
                    className="tips-toggle"
                    onClick={() => setShowTips(!showTips)}
                    aria-expanded={showTips}
                  >
                    <Lightbulb size={18} />
                    <span>Rephrasing Tips</span>
                    {showTips ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  
                  {showTips && (
                    <div className="tips-content">
                      <ul className="tips-list">
                        {tipsData.map((tip, index) => (
                          <li key={index} className="tip-item">
                            <Zap size={16} className="tip-icon" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="card original-card">
                  <div className="card-header">
                    <h3>Original Sentence</h3>
                  </div>
                  <div className="card-content">
                    <p className="original-text">{question.text}</p>
                  </div>
                </div>

                <div className="card input-card">
                  <div className="card-header">
                    <h3>Your Rephrased Version {isEditing && `(Attempt #${currentAttempt + 1})`}</h3>
                  </div>
                  <div className="card-content">
                    <textarea
                      className="text-editor"
                      value={rephrasedText}
                      onChange={(e) => setRephrasedText(e.target.value)}
                      placeholder="Write your rephrased version here..."
                      disabled={isSubmitted && !isEditing}
                    />
                  </div>
                </div>
                
                {isSubmitted && !isEditing && (
                  <div className="action-message">
                    <p>You've submitted your response (Attempt #{currentAttempt}). Click on the tabs above to see feedback or click "Improve Response" to make changes for a new attempt.</p>
                  </div>
                )}

                <div className="action-buttons">
                  {!isSubmitted ? (
                    // Initial state - only show Submit button
                    <button 
                      className="primary-button" 
                      onClick={submitRephrasedText}
                      disabled={loading.submit || !rephrasedText.trim()}
                    >
                      <Send size={18} />
                      {loading.submit ? "Submitting..." : "Submit"}
                    </button>
                  ) : isEditing ? (
                    // Editing state - show Submit button for the edited response
                    <button 
                      className="primary-button" 
                      onClick={submitRephrasedText}
                      disabled={loading.submit || !rephrasedText.trim()}
                    >
                      <Send size={18} />
                      {loading.submit ? "Submitting..." : `Submit Improved Response (Attempt #${currentAttempt + 1})`}
                    </button>
                  ) : (
                    // Submitted state - show Improve Response button
                    <button 
                      className="primary-button edit-button" 
                      onClick={enableEditing}
                    >
                      <Edit size={18} />
                      Improve Response (New Attempt)
                    </button>
                  )}
                  
                  {/* Analysis buttons only shown after submission and not in editing mode */}
                  {isSubmitted && !isEditing && (
                    <>
                      <button 
                        className="secondary-button" 
                        onClick={handleAnalyzeRephrase}
                        disabled={loading.grammar}
                      >
                        <Search size={18} />
                        {loading.grammar ? "Analyzing..." : rephraseFeedback ? "View Grammar Analysis" : "Analyze Grammar"}
                      </button>
                      <button 
                        className="secondary-button" 
                        onClick={enhanceRephrase}
                        disabled={loading.enhance}
                      >
                        <Book size={18} />
                        {loading.enhance ? "Enhancing..." : enhancedRephraseFeedback ? "View Enhanced Version" : "Enhance Rephrase"}
                      </button>
                      <button 
                        className="secondary-button score-button" 
                        onClick={scoreRephrase}
                        disabled={loading.score}
                      >
                        <Star size={18} />
                        {loading.score ? "Scoring..." : scoreResult ? "View Score" : "Score Rephrase"}
                      </button>
                    </>
                  )}
                  
                  {/* New sentence button - always available */}
                  <button 
                    className="secondary-button refresh-button" 
                    onClick={fetchRandomRephrase}
                  >
                    <RefreshCw size={18} />
                    Try New Sentence
                  </button>
                </div>
              </div>
            )}

            {/* Grammar Analysis Tab */}
            {activeTab === 'grammar' && rephraseFeedback && (
              <div className="grammar-container">
                <div className="card feedback-card">
                  <div className="card-header feedback-header">
                    <h3><Check size={20} /> Grammar Analysis (Attempt #{currentAttempt})</h3>
                    <p>Review of your rephrased sentence's grammatical structure</p>
                  </div>
                  
                  {rephraseFeedback.Status === "Success" && (
                    <div className="card-content">
                      <div className="relevance-section">
                        <h4>Relevance Check</h4>
                        <div className="relevance-comparison">
                          <div className="relevance-item">
                            <span className="relevance-label">Original:</span>
                            <p>{rephraseFeedback.feedback.relevance.originalText}</p>
                          </div>
                          <div className="relevance-item">
                            <span className="relevance-label">Your Rephrased:</span>
                            <p>{rephraseFeedback.feedback.relevance.rephrasedText}</p>
                          </div>
                        </div>
                        <div className="relevance-result">
                          <span className="relevance-label">Result:</span>
                          <p>{rephraseFeedback.feedback.relevance.result}</p>
                        </div>
                      </div>

                      <div className="grammar-section">
                        <h4>Grammar Corrections</h4>
                        {rephraseFeedback.feedback.grammar.map((sentence, index) => (
                          <div key={index} className="grammar-item">
                            <div className="grammar-original">
                              <span className="grammar-label">Original:</span>
                              <p>{sentence.original}</p>
                            </div>
                            <div className="grammar-corrected">
                              <span className="grammar-label">Corrected:</span>
                              <p>{sentence.corrected}</p>
                            </div>
                            <div className="grammar-issues">
                              <span className="grammar-label">Issues:</span>
                              {sentence.issues && sentence.issues.length > 0 ? (
                                sentence.issues.length === 1 && sentence.issues[0] === "No grammar mistakes found." ? (
                                  <div className="no-issues">
                                    <CheckCircle size={16} />
                                    <span>No grammar mistakes found</span>
                                  </div>
                                ) : (
                                  <ul className="issues-list">
                                    {sentence.issues.map((issue, i) => (
                                      <li key={i}>{cleanIssueText(issue)}</li>
                                    ))}
                                  </ul>
                                )
                              ) : (
                                <p>No issues provided.</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="feedback-actions">
                        <button 
                          className="secondary-button" 
                          onClick={enableEditing}
                        >
                          <Edit size={18} />
                          Improve Response (New Attempt)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Rephrasing Tab */}
            {activeTab === 'enhance' && enhancedRephraseFeedback && (
              <div className="enhance-container">
                <div className="card feedback-card">
                  <div className="card-header feedback-header">
                    <h3><Book size={20} /> Rephrasing Enhancement (Attempt #{currentAttempt})</h3>
                    <p>Alternative rephrasing options for your sentences</p>
                  </div>
                  
                  <div className="card-content">
                    {enhancedRephraseFeedback.map((item, index) => (
                      <div key={index} className="enhance-item">
                        <div className="enhance-original">
                          <span className="enhance-label">Original:</span>
                          <p>{item.original}</p>
                        </div>
                        <div className="enhance-rephrased">
                          <span className="enhance-label">Rephrased:</span>
                          <p>{item.rephrased}</p>
                        </div>
                        
                        <div className="enhance-details">
                          <div className="enhance-words">
                            <span className="enhance-label">Replaced Words:</span>
                            {item.replaced === "No rephrasing needed" ? (
                              <div className="no-issues">
                                <CheckCircle size={16} />
                                <span>No rephrasing needed</span>
                              </div>
                            ) : (
                              <ul className="replaced-list">
                                {item.replaced.split(", ").map((replacement, i) => (
                                  <li key={i}>{replacement}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          
                          <div className="enhance-meanings">
                            <span className="enhance-label">Word Meanings:</span>
                            {item.meanings === "No rephrasing needed" ? (
                              <div className="no-issues">
                                <CheckCircle size={16} />
                                <span>No rephrasing needed</span>
                              </div>
                            ) : (
                              <ul className="meanings-list">
                                {item.meanings.split(", ").map((meaning, i) => (
                                  <li key={i}>{meaning}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="feedback-actions">
                      <button 
                        className="secondary-button" 
                        onClick={enableEditing}
                      >
                        <Edit size={18} />
                        Try Using These Improvements (New Attempt)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Score Tab */}
            {activeTab === 'score' && scoreResult && (
              <div className="score-container">
                <div className="card feedback-card">
                  <div className="card-header feedback-header">
                    <h3><Star size={20} /> Rephrase Score (Attempt #{currentAttempt})</h3>
                    <p>Evaluation of your rephrasing quality and accuracy</p>
                  </div>
                  
                  <div className="card-content">
                    <div className="score-overview">
                      <div className="score-circle" style={{ 
                        background: `conic-gradient(${getScoreColor(scoreResult.Total)} ${scoreResult.Total * 3.6}deg, #f0f0f0 ${scoreResult.Total * 3.6}deg 360deg)` 
                      }}>
                        <div className="score-inner">
                          <span className="score-value">{scoreResult.Total}</span>
                          <span className="score-max">/100</span>
                        </div>
                      </div>
                      <div className="score-feedback">
                        <h4>Overall Feedback</h4>
                        <p>{scoreResult.Feedback}</p>
                      </div>
                    </div>
                    
                    <div className="score-criteria">
                      <div className="score-criterion">
                        <div className="criterion-header">
                          <h4>Semantic Accuracy</h4>
                          <span className="criterion-weight">25%</span>
                        </div>
                        <p>{scoreResult.CorrectWordUsage.feedback || "How well you maintained the original meaning"}</p>
                        {renderProgressBar(scoreResult.CorrectWordUsage.score, 10)}
                        <ul className="criterion-bullets">
                          {scoreResult.CorrectWordUsage.points && scoreResult.CorrectWordUsage.points.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="score-criterion">
                        <div className="criterion-header">
                          <h4>Sentence Structure</h4>
                          <span className="criterion-weight">25%</span>
                        </div>
                        <p>{scoreResult.SentenceStructure.feedback || "How well you restructured the sentence"}</p>
                        {renderProgressBar(scoreResult.SentenceStructure.score, 10)}
                        <ul className="criterion-bullets">
                          {scoreResult.SentenceStructure.points && scoreResult.SentenceStructure.points.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="score-criterion">
                        <div className="criterion-header">
                          <h4>Grammar</h4>
                          <span className="criterion-weight">25%</span>
                        </div>
                        <p>{scoreResult.GrammarMistakes.feedback || "Grammatical accuracy of your rephrased sentence"}</p>
                        {renderProgressBar(scoreResult.GrammarMistakes.score, 10)}
                        <ul className="criterion-bullets">
                          {scoreResult.GrammarMistakes.points && scoreResult.GrammarMistakes.points.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="score-criterion">
                        <div className="criterion-header">
                          <h4>Creativity</h4>
                          <span className="criterion-weight">25%</span>
                        </div>
                        <p>{scoreResult.Completeness.feedback || "How creatively you rephrased the sentence"}</p>
                        {renderProgressBar(scoreResult.Completeness.score, 10)}
                        <ul className="criterion-bullets">
                          {scoreResult.Completeness.points && scoreResult.Completeness.points.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="feedback-actions">
                      <button 
                        className="secondary-button" 
                        onClick={enableEditing}
                      >
                        <Edit size={18} />
                        Try to Improve Your Score (New Attempt)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : activeTab !== 'history' && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading question...</p>
          </div>
        )}
      </div>
    </div>
  );
}