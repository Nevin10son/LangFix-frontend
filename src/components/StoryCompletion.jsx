import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, Save, Brain, Book, ArrowLeft, Clock, Play, History, 
  FileText, Award, AlertCircle, CheckCircle, Edit, MessageSquare, Star, 
  RefreshCw, Send, ChevronDown, ChevronUp, Zap, Settings
} from "lucide-react";
import './StoryCompletion.css';

export default function StoryCompletion() {
  const [story, setStory] = useState(null);
  const [completedStory, setCompletedStory] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info, success, error, warning
  const [storyFeedback, setStoryFeedback] = useState(null);
  const [vocabFeedback, setVocabFeedback] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);
  const [timer, setTimer] = useState(15 * 60); // 15 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [activeTab, setActiveTab] = useState("current");
  const [activeFeedbackTab, setActiveFeedbackTab] = useState("write");
  const [pastStories, setPastStories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedStory, setExpandedStory] = useState(null);
  
  // New state variables for multiple attempts
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReattempting, setIsReattempting] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [submissionId, setSubmissionId] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    verifyToken();
    fetchRandomStory();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTime => prevTime - 1);
      }, 1000);
    } else if (timer === 0 && isRunning) {
      setIsRunning(false);
      showMessage("Time's up! You can no longer edit your story, but you can still submit it.", "warning");
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  // Update word count whenever completed story changes
  useEffect(() => {
    const words = completedStory.trim() ? completedStory.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [completedStory]);

  // Verify token and set authorization
  const verifyToken = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Unauthorized! Please log in.");
      navigate("/login");
      return;
    }
    axios.defaults.headers.common["token"] = token;
  };

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage("");
    }, 5000);
  };

  // Fetch a random story completion question
  const fetchRandomStory = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/random-story", {
        headers: { token: sessionStorage.getItem("token") },
      });
      setStory(response.data);
      setCompletedStory("");
      resetFeedback();
      setTimer(15 * 60); // Reset to 15 minutes
      setIsRunning(false);
      setMessage("");
      setActiveFeedbackTab("write");
      setIsSubmitted(false);
      setIsReattempting(false);
      setCurrentAttempt(1);
      setSubmissionId(null);
      setSelectedAttempt(null);
      setShowScoreDetails(false);
    } catch (error) {
      console.error("Error fetching story question", error);
      showMessage("Failed to load story.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset all feedback states
  const resetFeedback = () => {
    setStoryFeedback(null);
    setVocabFeedback(null);
    setScoreResult(null);
  };

  // Start the timer and enable typing
  const startExercise = () => {
    setIsRunning(true);
  };

  // Enable reattempt mode
  const startReattempt = () => {
    setIsRunning(true);
    // Important: We need to set isSubmitted to false when starting a reattempt
    // so that only the save button shows up
    setIsSubmitted(false);
  };

  // Prepare for a new attempt
  const enableReattempt = () => {
    const nextAttempt = currentAttempt + 1;
    setIsReattempting(true);
    setTimer(15 * 60);
    resetFeedback();
    setActiveFeedbackTab("write");
    setCurrentAttempt(nextAttempt);
    showMessage(`You can now improve your story for attempt #${nextAttempt}. Start the timer when ready.`, "info");
  };

  // Fetch past stories submitted by the user
  const fetchPastStories = async () => {
    setIsLoading(true);
    try {
      const userId = sessionStorage.getItem("userid");
      const token = sessionStorage.getItem("token");
      
      if (!userId || !token) {
        showMessage("Authentication error. Please log in again.", "error");
        navigate("/login");
        return;
      }
      
      const response = await axios.get(`http://localhost:5000/user-stories/${userId}`, {
        headers: { token }
      });
      
      // The API returns an array of stories with an attempts array inside each story
      if (Array.isArray(response.data)) {
        setPastStories(response.data);
        
        if (response.data.length === 0) {
          showMessage("You don't have any past story submissions yet.", "info");
        }
      } else {
        console.error("Unexpected response format:", response.data);
        showMessage("Failed to load past stories: Invalid response format", "error");
      }
    } catch (error) {
      console.error("Error fetching past stories:", error);
      console.error("Error details:", error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || "Server error";
      showMessage(`Failed to load past stories: ${errorMessage}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle story expansion in past stories view
  const toggleStoryExpansion = (storyId) => {
    if (expandedStory === storyId) {
      setExpandedStory(null);
      setSelectedAttempt(null);
    } else {
      setExpandedStory(storyId);
      setSelectedAttempt(null);
      setShowScoreDetails(false);
    }
  };

  // Calculate word count for display
  const calculateWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
  };

  // Change active tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "past") {
      fetchPastStories();
    }
  };

  // Change active feedback tab
  const handleFeedbackTabChange = (tab) => {
    setActiveFeedbackTab(tab);
  };

  // Toggle score details display
  const toggleScoreDetails = () => {
    setShowScoreDetails(!showScoreDetails);
  };

  // Select a specific attempt in past stories view
  const selectAttempt = (story, attemptNumber) => {
    const attempt = story.attempts.find(a => a.attemptNumber === attemptNumber);
    if (attempt) {
      setSelectedAttempt({
        storyId: story._id,
        attemptNumber: attemptNumber,
        completedStory: attempt.completedStory,
        submittedAt: attempt.submittedAt,
        scores: attempt.scores,
        wordCount: attempt.wordCount || calculateWordCount(attempt.completedStory)
      });
      setShowScoreDetails(false);
    }
  };

  // Submit the user's completed story to the database
  const submitCompletedStory = async () => {
    if (!completedStory.trim()) {
      showMessage("Please enter your story continuation!", "error");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = "http://localhost:5000/submit-story";

      const payload = {
        userId: sessionStorage.getItem("userid"),
        storyId: story._id,
        completedStory,
        attemptNumber: currentAttempt
      };

      // If we already have a submission and are reattempting, include the submission ID
      if (submissionId && isReattempting) {
        payload.submissionId = submissionId;
      }

      const response = await axios.post(
        endpoint,
        payload,
        { headers: { token: sessionStorage.getItem("token") } }
      );

      if (response.data.Status === "Success" || response.data.message) {
        // If we get a data object with the submission ID, save it
        if (response.data.data && response.data.data.userStoryId) {
          setSubmissionId(response.data.data.userStoryId);
        }
        
        showMessage(`Your story ${isReattempting ? '(Attempt #' + currentAttempt + ')' : ''} has been submitted successfully!`, "success");
        setIsSubmitted(true);
        setIsRunning(false);
        setIsReattempting(false); // Reset reattempting flag after successful submission
        
        // Refresh past stories if we're in that tab
        if (activeTab === "past") {
          fetchPastStories();
        }
      } else {
        showMessage("Failed to submit story: " + (response.data.message || "Unknown error"), "error");
      }
    } catch (error) {
      console.error("Error submitting story", error);
      showMessage("Failed to submit story: " + (error.response?.data?.message || "Server error"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Analyze the story with AI
  const analyzeWithAI = async () => {
    if (!completedStory.trim()) {
      showMessage("Please enter your story continuation to analyze!", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/analyze-story-completion",
        { originalStory: story.storyText, completedStory },
        { headers: { token: sessionStorage.getItem("token") } }
      );
      if (response.data.Status === "Success") {
        setStoryFeedback(response.data);
        showMessage(`Story analysis for attempt #${currentAttempt} completed!`, "success");
        setActiveFeedbackTab("analyze");
      } else {
        showMessage("Failed to analyze story: " + response.data.message, "error");
      }
    } catch (error) {
      console.error("Error analyzing story:", error);
      showMessage("Failed to analyze story with AI.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Enhance vocabulary with AI
  const enhanceVocabulary = async () => {
    if (!completedStory.trim()) {
      showMessage("Please enter your story continuation to enhance vocabulary!", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/vocabulary/enhance",
        { text: completedStory },
        { headers: { token: sessionStorage.getItem("token") } }
      );
      if (response.data.Status === "Success") {
        setVocabFeedback(response.data.feedback);
        showMessage(`Vocabulary enhancement for attempt #${currentAttempt} completed!`, "success");
        setActiveFeedbackTab("vocab");
      } else {
        showMessage("Failed to enhance vocabulary: " + response.data.error, "error");
      }
    } catch (error) {
      console.error("Error enhancing vocabulary:", error);
      showMessage("Failed to enhance vocabulary with AI.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Score the story with AI
  const scoreStory = async () => {
    if (!completedStory.trim()) {
      showMessage("Please enter your story continuation to score!", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/score-story",
        { 
          originalStory: story.storyText, 
          completedStory,
          userId: sessionStorage.getItem("userid"),
          storyId: story._id,
          attemptNumber: currentAttempt
        },
        { headers: { token: sessionStorage.getItem("token") } }
      );
      
      if (response.data.Status === "Success") {
        setScoreResult(response.data.feedback);
        showMessage(`Story scoring for attempt #${currentAttempt} completed!`, "success");
        setActiveFeedbackTab("score");
      } else {
        showMessage("Failed to score: " + (response.data.message || "Unknown error"), "error");
      }
    } catch (error) {
      console.error("Error scoring story:", error);
      showMessage("Failed to score story with AI.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Format time for display
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get color based on score
  const getScoreColor = (score) => {
    if (score >= 90) return "#22c55e"; // Excellent - Green
    if (score >= 75) return "#84cc16"; // Good - Light Green
    if (score >= 60) return "#eab308"; // Satisfactory - Yellow
    if (score >= 40) return "#f97316"; // Needs Improvement - Orange
    return "#ef4444"; // Poor - Red
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

  // Render attempt indicator if on attempt > 1
  const renderAttemptIndicator = () => {
    if (currentAttempt > 1) {
      return (
        <div className="attempt-indicator">
          <span>Attempt #{currentAttempt}</span>
        </div>
      );
    }
    return null;
  };

  // Render score summary for an attempt
  const renderScoreSummary = (scores) => {
    if (!scores) return null;
    
    return (
      <div className="score-summary">
        <div className="score-summary-total" style={{ color: getScoreColor(scores.total) }}>
          <Award size={16} />
          <span>{scores.total}/100</span>
        </div>
        
        {showScoreDetails && (
          <div className="score-detail-grid">
            <div className="score-detail-item">
              <span className="score-detail-label">Narrative Flow:</span>
              <span className="score-detail-value" style={{ color: getScoreColor(scores.narrativeFlow * 10) }}>
                {scores.narrativeFlow}/10
              </span>
            </div>
            <div className="score-detail-item">
              <span className="score-detail-label">Creativity:</span>
              <span className="score-detail-value" style={{ color: getScoreColor(scores.creativity * 10) }}>
                {scores.creativity}/10
              </span>
            </div>
            <div className="score-detail-item">
              <span className="score-detail-label">Structure:</span>
              <span className="score-detail-value" style={{ color: getScoreColor(scores.structure * 10) }}>
                {scores.structure}/10
              </span>
            </div>
            <div className="score-detail-item">
              <span className="score-detail-label">Grammar:</span>
              <span className="score-detail-value" style={{ color: getScoreColor(scores.grammar * 10) }}>
                {scores.grammar}/10
              </span>
            </div>
          </div>
        )}
        
        <button 
          className="score-detail-toggle" 
          onClick={(e) => {
            e.stopPropagation();
            toggleScoreDetails();
          }}
        >
          {showScoreDetails ? 'Hide Details' : 'Show Details'} {showScoreDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
    );
  };

  return (
    <div className="story-completion-container">
      <div className="story-header">
        <div className="story-title-section">
          <BookOpen className="title-icon" />
          <h1 className="story-title">Story Completion</h1>
          {renderAttemptIndicator()}
        </div>
        <button 
          className="back-button" 
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-button ${activeTab === "current" ? "active-tab" : ""}`}
          onClick={() => handleTabChange("current")}
        >
          <FileText size={16} />
          Current Story
        </button>
        <button 
          className={`tab-button ${activeTab === "past" ? "active-tab" : ""}`}
          onClick={() => handleTabChange("past")}
        >
          <History size={16} />
          Past Stories
        </button>
      </div>

      {message && (
        <div className={`message-banner message-${messageType}`}>
          <span>{message}</span>
          <button className="message-close" onClick={() => setMessage("")}>×</button>
        </div>
      )}

      {/* Current Story Tab */}
      {activeTab === "current" && (
        story ? (
          <div className="story-content">
            <div className={`story-info-bar ${timer < 60 && isRunning ? 'timer-warning' : ''}`}>
              <div className="timer-display">
                <Clock size={16} />
                <span>{formatTime(timer)}</span>
              </div>
              <div className="word-count-display">
                <span>Words: {wordCount}</span>
              </div>
            </div>

            {/* Feedback Tabs - Only show when submitted */}
            {isSubmitted && !isReattempting && (
              <div className="feedback-tabs-container">
                <button 
                  className={`feedback-tab ${activeFeedbackTab === "write" ? "active-feedback-tab" : ""}`}
                  onClick={() => handleFeedbackTabChange("write")}
                >
                  <Edit size={16} />
                  Write
                </button>
                {storyFeedback && (
                  <button 
                    className={`feedback-tab ${activeFeedbackTab === "analyze" ? "active-feedback-tab" : ""}`}
                    onClick={() => handleFeedbackTabChange("analyze")}
                  >
                    <Brain size={16} />
                    Analysis
                  </button>
                )}
                {vocabFeedback && (
                  <button 
                    className={`feedback-tab ${activeFeedbackTab === "vocab" ? "active-feedback-tab" : ""}`}
                    onClick={() => handleFeedbackTabChange("vocab")}
                  >
                    <Book size={16} />
                    Vocabulary
                  </button>
                )}
                {scoreResult && (
                  <button 
                    className={`feedback-tab ${activeFeedbackTab === "score" ? "active-feedback-tab" : ""}`}
                    onClick={() => handleFeedbackTabChange("score")}
                  >
                    <Star size={16} />
                    Score
                  </button>
                )}
              </div>
            )}

            {/* Writing Tab Content */}
            {activeFeedbackTab === "write" && (
              <>
                <h2 className="prompt-title">{story.title}</h2>
                <div className="prompt-card">
                  <p className="prompt-text">{story.storyText}</p>
                </div>

                {!isRunning && !isSubmitted && !isReattempting && (
                  <div className="start-container">
                    <button className="start-button" onClick={startExercise}>
                      <Play size={16} />
                      Start Writing
                    </button>
                    <p className="start-instruction">
                      Click the button above to begin the exercise. You'll have 15 minutes to complete the story.
                    </p>
                  </div>
                )}

                {!isRunning && isReattempting && (
                  <div className="start-container">
                    <button className="start-button" onClick={startReattempt}>
                      <Play size={16} />
                      Start Reattempt #{currentAttempt}
                    </button>
                    <p className="start-instruction">
                      Click the button above to begin your new attempt. You'll have 15 minutes to improve your story.
                    </p>
                  </div>
                )}

                {isRunning && (
                  <>
                    <textarea
                      className="story-textarea"
                      value={completedStory}
                      onChange={(e) => setCompletedStory(e.target.value)}
                      placeholder="Continue the story here..."
                      disabled={!isRunning || timer === 0}
                      spellCheck={true}
                    />

                    {/* Only show Save button when not submitted yet */}
                    {!isSubmitted && (
                      <div className="action-buttons">
                        <button 
                          className="submit-button" 
                          onClick={submitCompletedStory}
                          disabled={!completedStory.trim()}
                        >
                          <Save size={16} />
                          Save Story
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Show analysis buttons only after submission and not in reattempt mode */}
                {isSubmitted && !isReattempting && (
                  <div className="story-preview">
                    <h3>Your Story {currentAttempt > 1 && `(Attempt #${currentAttempt})`}</h3>
                    <div className="story-content-preview">
                      <p>{completedStory}</p>
                    </div>
                    
                    <div className="action-buttons">
                      <button 
                        className="analyze-button" 
                        onClick={analyzeWithAI}
                        disabled={!completedStory.trim()}
                      >
                        <Brain size={16} />
                        Analyze
                      </button>
                      <button 
                        className="enhance-button" 
                        onClick={enhanceVocabulary}
                        disabled={!completedStory.trim()}
                      >
                        <Book size={16} />
                        Enhance
                      </button>
                      <button 
                        className="score-button" 
                        onClick={scoreStory}
                        disabled={!completedStory.trim()}
                      >
                        <Award size={16} />
                        Score
                      </button>
                      <button 
                        className="reattempt-button" 
                        onClick={enableReattempt}
                      >
                        <RefreshCw size={16} />
                        Try Again
                      </button>
                      <button 
                        className="new-story-button" 
                        onClick={fetchRandomStory}
                      >
                        <FileText size={16} />
                        New Story
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Analysis Tab Content */}
            {activeFeedbackTab === "analyze" && storyFeedback && (
              <div className="feedback-section story-analysis">
                <h3 className="feedback-title">
                  <Brain size={20} className="feedback-icon" /> 
                  Story Analysis {currentAttempt > 1 && `(Attempt #${currentAttempt})`}
                </h3>
                {storyFeedback.Status === "Success" ? (
                  <>
                    {/* Relevance Feedback */}
                    <div className="relevance-section">
                      <h4 className="section-subtitle">Coherence Check</h4>
                      <div className="relevance-comparison">
                        <div className="relevance-item">
                          <h5>Original Story</h5>
                          <p>{storyFeedback.feedback.relevance.originalStory}</p>
                        </div>
                        <div className="relevance-item">
                          <h5>Your Continuation</h5>
                          <p>{storyFeedback.feedback.relevance.completedStory}</p>
                        </div>
                      </div>
                      <div className="relevance-result">
                        <strong>Analysis:</strong> {storyFeedback.feedback.relevance.result}
                      </div>
                    </div>

                    {/* Grammar Feedback */}
                    <div className="grammar-section">
                      <h4 className="section-subtitle">Grammar Corrections</h4>
                      {storyFeedback.feedback.grammar.map((sentence, index) => (
                        <div key={index} className="feedback-item">
                          <div className="feedback-columns">
                            <div className="original-text">
                              <h5>Original</h5>
                              <p>{sentence.original}</p>
                            </div>
                            <div className="corrected-text">
                              <h5>Corrected</h5>
                              <p>{sentence.corrected}</p>
                            </div>
                          </div>
                          <div className="issues-explanation">
                            <h5>Issues</h5>
                            {sentence.issues.length === 1 && sentence.issues[0] === "No grammar mistakes found." ? (
                              <div className="no-issues">
                                <CheckCircle size={16} />
                                <span>No grammar mistakes found</span>
                              </div>
                            ) : (
                              <ul className="issues-list">
                                {sentence.issues.map((issue, i) => (
                                  <li key={i}>{issue}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          {index < storyFeedback.feedback.grammar.length - 1 && (
                            <hr className="feedback-divider" />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="feedback-actions">
                      <button 
                        className="reattempt-button" 
                        onClick={enableReattempt}
                      >
                        <RefreshCw size={16} />
                        Improve Story Using This Feedback
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="error-message">
                    <AlertCircle size={20} />
                    <p>{storyFeedback.message}</p>
                  </div>
                )}
              </div>
            )}

            {/* Vocabulary Tab Content */}
            {activeFeedbackTab === "vocab" && vocabFeedback && (
              <div className="feedback-section vocab-enhancement">
                <h3 className="feedback-title">
                  <Book size={20} className="feedback-icon" /> 
                  Vocabulary Enhancement {currentAttempt > 1 && `(Attempt #${currentAttempt})`}
                </h3>
                {vocabFeedback.map((sentence, index) => (
                  <div key={index} className="feedback-item">
                    <div className="feedback-columns">
                      <div className="original-text">
                        <h5>Original</h5>
                        <p>{sentence.original}</p>
                      </div>
                      <div className="enhanced-text">
                        <h5>Enhanced</h5>
                        <p>{sentence.enhanced}</p>
                      </div>
                    </div>
                    <div className="vocab-details">
                      <div className="replaced-explanation">
                        <h5>Replaced Words</h5>
                        {sentence.replaced === "No enhancement needed" || sentence.replaced === "No enhancement or correction needed" ? (
                          <div className="no-issues">
                            <CheckCircle size={16} />
                            <span>No enhancement needed</span>
                          </div>
                        ) : (
                          <ul className="replaced-list">
                            {sentence.replaced.split(", ").map((replacement, i) => (
                              <li key={i}>{replacement}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="meaning-explanation">
                        <h5>Word Meanings</h5>
                        {sentence.meanings === "No enhancement needed" || sentence.meanings === "No enhancement or correction needed" ? (
                          <div className="no-issues">
                            <CheckCircle size={16} />
                            <span>No enhancement needed</span>
                          </div>
                        ) : (
                          <ul className="meanings-list">
                            {sentence.meanings.split(", ").map((meaning, i) => (
                              <li key={i}>{meaning}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    {index < vocabFeedback.length - 1 && <hr className="feedback-divider" />}
                  </div>
                ))}

                <div className="feedback-actions">
                  <button 
                    className="reattempt-button" 
                    onClick={enableReattempt}
                  >
                    <RefreshCw size={16} />
                    Improve Story Using These Enhancements
                  </button>
                </div>
              </div>
            )}

            {/* Score Tab Content */}
            {activeFeedbackTab === "score" && scoreResult && (
              <div className="feedback-section score-feedback">
                <h3 className="feedback-title">
                  <Award size={20} className="feedback-icon" /> 
                  Story Score {currentAttempt > 1 && `(Attempt #${currentAttempt})`}
                </h3>
                
                <div className="score-overview">
                  <div className="score-circle" style={{ 
                    background: `conic-gradient(${getScoreColor(scoreResult.Total)} ${scoreResult.Total * 3.6}deg, #f0f0f0 ${scoreResult.Total * 3.6}deg 360deg)` 
                  }}>
                    <div className="score-inner">
                      <span className="score-value">{scoreResult.Total}</span>
                      <span className="score-max">/100</span>
                    </div>
                  </div>
                  <div className="score-feedback-text">
                    <h4>Overall Feedback</h4>
                    <p>{scoreResult.Feedback}</p>
                  </div>
                </div>
                
                <div className="score-criteria">
                  {/* Narrative Flow */}
                  <div className="score-criterion">
                    <div className="criterion-header">
                      <h4>Narrative Flow</h4>
                      <span className="criterion-weight">25%</span>
                    </div>
                    <p>{scoreResult.CorrectWordUsage.feedback}</p>
                    {renderProgressBar(scoreResult.CorrectWordUsage.score, 10)}
                    <div className="criterion-points">
                      <ul>
                        {scoreResult.CorrectWordUsage.points.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Creativity */}
                  <div className="score-criterion">
                    <div className="criterion-header">
                      <h4>Creativity</h4>
                      <span className="criterion-weight">25%</span>
                    </div>
                    <p>{scoreResult.Completeness.feedback}</p>
                    {renderProgressBar(scoreResult.Completeness.score, 10)}
                    <div className="criterion-points">
                      <ul>
                        {scoreResult.Completeness.points.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Structure */}
                  <div className="score-criterion">
                    <div className="criterion-header">
                      <h4>Structure</h4>
                      <span className="criterion-weight">25%</span>
                    </div>
                    <p>{scoreResult.SentenceStructure.feedback}</p>
                    {renderProgressBar(scoreResult.SentenceStructure.score, 10)}
                    <div className="criterion-points">
                      <ul>
                        {scoreResult.SentenceStructure.points.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Grammar */}
                  <div className="score-criterion">
                    <div className="criterion-header">
                      <h4>Grammar & Style</h4>
                      <span className="criterion-weight">25%</span>
                    </div>
                    <p>{scoreResult.GrammarMistakes.feedback}</p>
                    {renderProgressBar(scoreResult.GrammarMistakes.score, 10)}
                    <div className="criterion-points">
                      <ul>
                        {scoreResult.GrammarMistakes.points.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="feedback-actions">
                  <button 
                    className="reattempt-button" 
                    onClick={enableReattempt}
                  >
                    <RefreshCw size={16} />
                    Try to Improve Your Score
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading story...</p>
          </div>
        )
      )}

      {/* Past Stories Tab */}
      {activeTab === "past" && (
        <div className="past-stories-container">
          <h2 className="section-title">Your Past Submissions</h2>
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading your past stories...</p>
            </div>
          ) : pastStories.length > 0 ? (
            <div className="stories-list">
              {pastStories.map((pastStory, index) => (
                <div key={index} className="past-story-card">
                  <div className="past-story-header" onClick={() => toggleStoryExpansion(pastStory._id)}>
                    <h3 className="past-story-title">{pastStory.storyTitle || "Untitled Story"}</h3>
                    <button className="expand-button">
                      {expandedStory === pastStory._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                  
                  <div className="past-story-details">
                    <span className="story-date">
                      {new Date(pastStory.attempts[0]?.submittedAt || new Date()).toLocaleDateString()}
                    </span>
                    <span className="story-attempts">
                      <RefreshCw size={14} />
                      {pastStory.attempts.length} attempt{pastStory.attempts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {expandedStory === pastStory._id && (
                    <div className="expanded-story-content">
                      <div className="past-prompt">
                        <h4>Original Prompt:</h4>
                        <p>{pastStory.originalStory}</p>
                      </div>
                      
                      {/* Attempt Selection Tabs */}
                      {pastStory.attempts.length > 1 && (
                        <div className="attempt-tabs">
                          {pastStory.attempts.map((attempt) => (
                            <button 
                              key={attempt.attemptNumber}
                              className={`attempt-tab ${selectedAttempt && selectedAttempt.storyId === pastStory._id && selectedAttempt.attemptNumber === attempt.attemptNumber ? 'active-attempt' : ''}`}
                              onClick={() => selectAttempt(pastStory, attempt.attemptNumber)}
                            >
                              Attempt #{attempt.attemptNumber}
                              {attempt.scores && (
                                <span 
                                  className="attempt-score-indicator"
                                  style={{ color: getScoreColor(attempt.scores.total) }}
                                >
                                  <Award size={12} /> {attempt.scores.total}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Show selected attempt or default to first attempt */}
                      {(selectedAttempt && selectedAttempt.storyId === pastStory._id) ? (
                        <div className="past-completion">
                          <div className="attempt-details">
                            <h4>Your Continuation (Attempt #{selectedAttempt.attemptNumber}):</h4>
                            <span className="attempt-date">
                              {formatDate(selectedAttempt.submittedAt)}
                            </span>
                          </div>
                          <p>{selectedAttempt.completedStory}</p>
                          <div className="past-story-metadata">
                            <div className="word-count-badge">
                              <FileText size={14} />
                              {selectedAttempt.wordCount} words
                            </div>
                            
                            {selectedAttempt.scores && (
                              renderScoreSummary(selectedAttempt.scores)
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="past-completion">
                          <div className="attempt-details">
                            <h4>Your Continuation (Attempt #1):</h4>
                            <span className="attempt-date">
                              {formatDate(pastStory.attempts[0]?.submittedAt)}
                            </span>
                          </div>
                          <p>{pastStory.attempts[0]?.completedStory}</p>
                          <div className="past-story-metadata">
                            <div className="word-count-badge">
                              <FileText size={14} />
                              {pastStory.attempts[0]?.wordCount || calculateWordCount(pastStory.attempts[0]?.completedStory)} words
                            </div>
                            
                            {pastStory.attempts[0]?.scores && (
                              renderScoreSummary(pastStory.attempts[0].scores)
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="past-story-actions">
                        <button 
                          className="try-again-button"
                          onClick={() => {
                            // Set the current story and enable reattempt mode
                            setStory({
                              _id: pastStory.storyId,
                              title: pastStory.storyTitle || "Story Prompt",
                              storyText: pastStory.originalStory
                            });
                            setCompletedStory("");
                            resetFeedback();
                            setTimer(15 * 60);
                            setActiveTab("current");
                            setActiveFeedbackTab("write");
                            setIsReattempting(true);
                            // Set attempt number based on existing attempts
                            setCurrentAttempt(pastStory.attempts.length + 1);
                            setSubmissionId(pastStory._id);
                            showMessage(`Ready to make attempt #${pastStory.attempts.length + 1} for this story.`, "info");
                          }}
                        >
                          <RefreshCw size={16} />
                          Try This Story Again
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {index < pastStories.length - 1 && <hr className="story-divider" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>You haven't submitted any stories yet.</p>
              <button 
                className="try-story-button" 
                onClick={() => handleTabChange("current")}
              >
                Try completing a story now
              </button>
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Processing...</p>
        </div>
      )}
    </div>
  );
}