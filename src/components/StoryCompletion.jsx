import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, Save, Brain, Book, ArrowLeft, Clock, Play, History, 
  FileText, Award, AlertCircle, CheckCircle, Edit, MessageSquare, Star 
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
      setStoryFeedback(null);
      setVocabFeedback(null);
      setScoreResult(null);
      setTimer(15 * 60); // Reset to 15 minutes
      setIsRunning(false);
      setMessage("");
      setActiveFeedbackTab("write");
    } catch (error) {
      console.error("Error fetching story question", error);
      showMessage("Failed to load story.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Start the timer and enable typing
  const startExercise = () => {
    setIsRunning(true);
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
      
      const response = await axios.get("http://localhost:5000/user-stories", {
        headers: { token },
        params: { userId }
      });
      
      setPastStories(response.data);
      
      if (response.data.length === 0) {
        showMessage("You don't have any past story submissions yet.", "info");
      }
    } catch (error) {
      console.error("Error fetching past stories:", error);
      const errorMessage = error.response?.data?.message || "Server error";
      showMessage(`Failed to load past stories: ${errorMessage}`, "error");
    } finally {
      setIsLoading(false);
    }
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

  // Submit the user's completed story to the database
  const submitCompletedStory = async () => {
    if (!completedStory.trim()) {
      showMessage("Please enter your story continuation!", "error");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/submit-story",
        {
          userId: sessionStorage.getItem("userid"),
          storyId: story._id,
          completedStory,
          timeSpent: 15 * 60 - timer,
          wordCount
        },
        { headers: { token: sessionStorage.getItem("token") } }
      );
      showMessage("Your story has been submitted successfully!", "success");
      setIsRunning(false);
      // Refresh past stories if we're in that tab
      if (activeTab === "past") {
        fetchPastStories();
      }
    } catch (error) {
      console.error("Error submitting story", error);
      showMessage("Failed to submit story.", "error");
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
        showMessage("Story analysis completed!", "success");
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
        showMessage("Vocabulary enhancement completed!", "success");
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
        { originalStory: story.storyText, completedStory },
        { headers: { token: sessionStorage.getItem("token") } }
      );
      
      console.log("Score Response:", response.data);
      
      if (response.data.Status === "Success") {
        setScoreResult(response.data.feedback);
        showMessage("Story scoring completed!", "success");
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

  return (
    <div className="story-completion-container">
      <div className="story-header">
        <div className="story-title-section">
          <BookOpen className="title-icon" />
          <h1 className="story-title">Story Completion</h1>
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

            {/* Feedback Tabs */}
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

            {/* Writing Tab Content */}
            {activeFeedbackTab === "write" && (
              <>
                <h2 className="prompt-title">{story.title}</h2>
                <div className="prompt-card">
                  <p className="prompt-text">{story.storyText}</p>
                </div>

                {!isRunning ? (
                  <div className="start-container">
                    <button className="start-button" onClick={startExercise}>
                      <Play size={16} />
                      Start Writing
                    </button>
                    <p className="start-instruction">
                      Click the button above to begin the exercise. You'll have 15 minutes to complete the story.
                    </p>
                  </div>
                ) : (
                  <>
                    <textarea
                      className="story-textarea"
                      value={completedStory}
                      onChange={(e) => setCompletedStory(e.target.value)}
                      placeholder="Continue the story here..."
                      disabled={!isRunning || timer === 0}
                      spellCheck={true}
                    />

                    <div className="action-buttons">
                      <button 
                        className="submit-button" 
                        onClick={submitCompletedStory}
                        disabled={!completedStory.trim()}
                      >
                        <Save size={16} />
                        Submit
                      </button>
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
                    </div>
                  </>
                )}
              </>
            )}

            {/* Analysis Tab Content */}
            {activeFeedbackTab === "analyze" && storyFeedback && (
              <div className="feedback-section story-analysis">
                <h3 className="feedback-title">
                  <Brain size={20} className="feedback-icon" /> 
                  Story Analysis
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
                  Vocabulary Enhancement
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
              </div>
            )}

            {/* Score Tab Content */}
            {activeFeedbackTab === "score" && scoreResult && (
              <div className="feedback-section score-feedback">
                <h3 className="feedback-title">
                  <Award size={20} className="feedback-icon" /> 
                  Story Score
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
                  <h3 className="past-story-title">{pastStory.storyTitle || "Untitled Story"}</h3>
                  <div className="past-story-details">
                    <span className="story-date">
                      {new Date(pastStory.submittedAt).toLocaleDateString()}
                    </span>
                    <span className="story-stats">
                      {pastStory.wordCount} words
                    </span>
                  </div>
                  <div className="past-story-content">
                    <div className="past-prompt">
                      <h4>Original Prompt:</h4>
                      <p>{pastStory.originalStory}</p>
                    </div>
                    <div className="past-completion">
                      <h4>Your Continuation:</h4>
                      <p>{pastStory.completedStory}</p>
                    </div>
                  </div>
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