import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Globe, 
  ArrowLeft, 
  Star, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Award, 
  BookOpen, 
  BarChart, 
  RefreshCw,
  Lightbulb,
  Info,
  Edit,
  Send,
  History,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Medal,
  AlertCircle
} from "lucide-react";
import "./UserTranslation.css";

const TranslationTask = () => {
  const navigate = useNavigate();
  const [textData, setTextData] = useState(null);
  const [translatedText, setTranslatedText] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info, success, error
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [scoreAnalysis, setScoreAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [activeTab, setActiveTab] = useState("translation"); // translation, analysis, score, history
  
  // State variables for attempt tracking
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [userTranslationDoc, setUserTranslationDoc] = useState(null);

  // State variables for history feature
  const [pastTranslations, setPastTranslations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedTranslation, setExpandedTranslation] = useState(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [expandedScoreView, setExpandedScoreView] = useState(null);

  useEffect(() => {
    fetchTranslationText();
  }, []);

  const fetchTranslationText = async () => {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userid");
    setLoading(true);

    try {
      const response = await axios.get("http://localhost:5000/get-translation", {
        headers: { token, userid: userId },
      });

      if (response.data.status === "Success") {
        setTextData(response.data.translation);
        setMessageType("success");
        setMessage("Translation text loaded successfully");
        
        // Reset states for a new translation
        setTranslatedText("");
        setAiAnalysis(null);
        setScoreAnalysis(null);
        setIsSubmitted(false);
        setIsEditing(false);
        setCurrentAttempt(1);
        setUserTranslationDoc(null);
        setActiveTab("translation");
        
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessageType("error");
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching translation text:", error);
      setMessageType("error");
      setMessage("Error fetching translation text");
    } finally {
      setLoading(false);
    }
  };

  const fetchPastTranslations = async () => {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userid");
    setLoadingHistory(true);

    try {
      const response = await axios.get(`http://localhost:5000/user-translations?userId=${userId}`, {
        headers: { token },
      });

      if (response.data.Status === "Success") {
        setPastTranslations(response.data.translations);
        if (response.data.translations.length === 0) {
          setMessageType("info");
          setMessage("You haven't submitted any translations yet.");
        }
      } else {
        setMessageType("error");
        setMessage(response.data.message || "Failed to load past translations");
      }
    } catch (error) {
      console.error("Error fetching past translations:", error);
      setMessageType("error");
      setMessage("Error loading translation history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchTranslationDetails = async (translationId) => {
    const token = sessionStorage.getItem("token");
    setLoadingHistory(true);

    try {
      const response = await axios.get(`http://localhost:5000/user-translation/${translationId}`, {
        headers: { token },
      });

      if (response.data.Status === "Success") {
        setSelectedHistoryItem(response.data.translation);
      } else {
        setMessageType("error");
        setMessage(response.data.message || "Failed to load translation details");
      }
    } catch (error) {
      console.error("Error fetching translation details:", error);
      setMessageType("error");
      setMessage("Error loading translation details");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleInputChange = (e) => {
    setTranslatedText(e.target.value);
  };

  const resetFeedback = () => {
    setAiAnalysis(null);
    setScoreAnalysis(null);
  };

  const submitTranslation = async () => {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userid");

    if (!translatedText.trim()) {
      setMessageType("error");
      setMessage("Please enter your translation before submitting.");
      return;
    }

    setLoading(true);

    try {
      // Check if this is a new submission or an improved one
      if (!isEditing || !userTranslationDoc) {
        // First submission
        const response = await axios.post(
          "http://localhost:5000/submit-translation",
          {
            userId,
            translationId: textData._id,
            userTranslation: translatedText,
            attemptNumber: 1
          },
          { headers: { token } }
        );
        
        setUserTranslationDoc(response.data);
        setCurrentAttempt(1);
      } else {
        // Updated submission (a new attempt)
        const nextAttemptNumber = currentAttempt + 1;
        const response = await axios.post(
          "http://localhost:5000/update-translation",
          {
            userTranslationId: userTranslationDoc._id,
            userId,
            translationId: textData._id,
            userTranslation: translatedText,
            attemptNumber: nextAttemptNumber
          },
          { headers: { token } }
        );
        
        setUserTranslationDoc(response.data);
        setCurrentAttempt(nextAttemptNumber);
      }
      
      setIsSubmitted(true);
      setIsEditing(false);
      resetFeedback();
      setMessageType("success");
      setMessage(`Your translation has been submitted successfully! (Attempt #${currentAttempt + (isEditing ? 1 : 0)})`);
    } catch (error) {
      console.error("Error submitting translation:", error);
      setMessageType("error");
      setMessage("Error submitting translation");
    } finally {
      setLoading(false);
    }
  };

  const analyzeTranslation = async () => {
    const token = sessionStorage.getItem("token");

    if (!translatedText.trim()) {
      setMessageType("error");
      setMessage("Please enter your translation to analyze.");
      return;
    }

    setAnalyzing(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/translation/analyze",
        {
          translationId: textData._id,
          malayalamText: textData.text,
          userTranslation: translatedText,
        },
        { headers: { token } }
      );

      if (response.data.Status === "Success") {
        setAiAnalysis(response.data);
        setMessageType("success");
        setMessage(`Translation analysis for attempt #${currentAttempt} completed!`);
        setActiveTab("analysis");
      } else {
        setMessageType("error");
        setMessage("Failed to analyze: " + (response.data.message || response.data.error));
      }
    } catch (error) {
      console.error("Error analyzing translation:", error);
      setMessageType("error");
      setMessage("Failed to analyze translation with AI.");
    } finally {
      setAnalyzing(false);
    }
  };

  const scoreTranslation = async () => {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userid");

    if (!translatedText.trim()) {
      setMessageType("error");
      setMessage("Please enter your translation to score.");
      return;
    }

    setScoring(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/score-translation",
        {
          originalText: textData.text,
          userTranslation: translatedText,
          translationId: textData._id,
          userId: userId,
          attemptNumber: currentAttempt
        },
        { headers: { token } }
      );

      if (response.data.Status === "Success") {
        console.log("Score response:", response.data);
        setScoreAnalysis(response.data);
        setMessageType("success");
        setMessage(`Translation scoring for attempt #${currentAttempt} completed!`);
        setActiveTab("score");
      } else {
        setMessageType("error");
        setMessage("Failed to score: " + (response.data.message || response.data.error));
      }
    } catch (error) {
      console.error("Error scoring translation:", error);
      setMessageType("error");
      setMessage("Failed to score translation.");
    } finally {
      setScoring(false);
    }
  };

  const enableEditing = () => {
    setIsEditing(true);
    setActiveTab("translation");
    resetFeedback();
    setMessageType("info");
    setMessage(`You can now improve your translation for attempt #${currentAttempt + 1}. Submit when ready.`);
  };

  const cleanIssueText = (issue) => {
    return issue.replace(/\*\*/g, "");
  };

  const getScoreColor = (score) => {
    // Convert score to number if it's a string
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    
    if (numScore >= 90) return "#4CAF50"; // Excellent - Green
    if (numScore >= 75) return "#8BC34A"; // Good - Light Green
    if (numScore >= 60) return "#CDDC39"; // Satisfactory - Lime
    if (numScore >= 40) return "#FFC107"; // Needs Improvement - Amber
    return "#F44336"; // Poor - Red
  };

  const getScoreLabel = (score) => {
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    
    if (numScore >= 90) return "Excellent";
    if (numScore >= 75) return "Good";
    if (numScore >= 60) return "Satisfactory";
    if (numScore >= 40) return "Needs Improvement";
    return "Poor";
  };

  const renderProgressBar = (score, maxScore = 10) => {
    // Convert score to number if it's a string
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    const percentage = (numScore / maxScore) * 100;
    const color = getScoreColor((percentage * 100) / 100); // Scale to 0-100 for color
    
    return (
      <div className="trans-progress-container">
        <div 
          className="trans-progress-bar" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
        <span className="trans-progress-label">{numScore}/{maxScore}</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const toggleExpand = (id) => {
    setExpandedTranslation(expandedTranslation === id ? null : id);
  };

  const toggleScoreView = (id) => {
    setExpandedScoreView(expandedScoreView === id ? null : id);
  };

  const loadHistoryItem = (item) => {
    setSelectedHistoryItem(item);
    setExpandedScoreView(null);
    fetchTranslationDetails(item.userTranslationId);
  };
  
  useEffect(() => {
    // Fetch past translations when the history tab is activated
    if (activeTab === "history") {
      fetchPastTranslations();
    }
  }, [activeTab]);

  return (
    <div className="trans-container">
      <div className="trans-header">
        <div className="trans-header-left">
          <Globe className="trans-icon" />
          <h1>Translation Workshop</h1>
          {currentAttempt > 1 && (
            <span className="trans-attempt-indicator">Attempt #{currentAttempt}</span>
          )}
        </div>
        <button 
          className="trans-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {message && (
        <div className={`trans-message trans-message-${messageType}`}>
          <span>{message}</span>
          <button 
            className="trans-message-close" 
            onClick={() => setMessage("")}
          >×</button>
        </div>
      )}

      <div className="trans-description">
        <Info size={20} />
        <div>
          <h2>Malayalam to English Translation Task</h2>
          <p>Translate the provided Malayalam text into English as accurately as possible. After submission, you can analyze your translation for grammar and vocabulary feedback, or receive a score based on accuracy, structure, and completeness.</p>
        </div>
        <button 
          className="trans-tips-toggle" 
          onClick={() => setShowTips(!showTips)}
        >
          {showTips ? "Hide Tips" : "Show Tips"}
        </button>
      </div>

      {showTips && (
        <div className="trans-tips">
          <div className="trans-tip-card">
            <Lightbulb size={20} className="trans-tip-icon" />
            <div>
              <h3>Translation Tips</h3>
              <ul>
                <li>Read the entire text first to understand the context</li>
                <li>Translate meaning rather than word-for-word</li>
                <li>Maintain the original tone and style when possible</li>
                <li>Use natural English phrases and expressions</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="trans-tabs">
        <button 
          className={`trans-tab ${activeTab === 'translation' ? 'trans-tab-active' : ''}`}
          onClick={() => setActiveTab('translation')}
        >
          <BookOpen size={16} />
          Translation
        </button>
        
        {isSubmitted && (
          <>
            <button 
              className={`trans-tab ${activeTab === 'analysis' ? 'trans-tab-active' : ''}`}
              onClick={() => {
                if (aiAnalysis) {
                  setActiveTab('analysis');
                } else {
                  analyzeTranslation();
                }
              }}
            >
              <Search size={16} />
              Analysis
            </button>
            <button 
              className={`trans-tab ${activeTab === 'score' ? 'trans-tab-active' : ''}`}
              onClick={() => {
                if (scoreAnalysis) {
                  setActiveTab('score');
                } else {
                  scoreTranslation();
                }
              }}
            >
              <Star size={16} />
              Score
            </button>
          </>
        )}
        
        {/* History Tab */}
        <button 
          className={`trans-tab ${activeTab === 'history' ? 'trans-tab-active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={16} />
          History
        </button>
      </div>

      {activeTab === 'translation' && (
        <div className="trans-workspace">
          <div className="trans-panel trans-source-panel">
            <div className="trans-panel-header">
              <h2>
                <span className="trans-panel-title">Original Text</span>
                <span className="trans-language-badge">Malayalam</span>
              </h2>
              <button className="trans-refresh" onClick={fetchTranslationText}>
                <RefreshCw size={16} />
              </button>
            </div>
            
            {textData ? (
              <div className="trans-panel-content">
                <p className="trans-source-text">{textData.text}</p>
                <div className="trans-meta">
                  <span>Text ID: {textData._id}</span>
                </div>
              </div>
            ) : (
              <div className="trans-loading-container">
                {loading ? (
                  <div className="trans-loader"></div>
                ) : (
                  <p className="trans-error-message">No text available. Try refreshing.</p>
                )}
              </div>
            )}
          </div>

          <div className="trans-panel trans-target-panel">
            <div className="trans-panel-header">
              <h2>
                <span className="trans-panel-title">Your Translation {isEditing && `(Attempt #${currentAttempt + 1})`}</span>
                <span className="trans-language-badge">English</span>
              </h2>
              <div className="trans-char-count">
                {translatedText.length} characters
              </div>
            </div>
            
            <div className="trans-panel-content">
              <textarea
                value={translatedText}
                onChange={handleInputChange}
                placeholder="Type your English translation here..."
                className="trans-textarea"
                disabled={loading || (isSubmitted && !isEditing)}
              />
            </div>
            
            {isSubmitted && !isEditing && (
              <div className="trans-action-message">
                <p>You've submitted your translation (Attempt #{currentAttempt}). Use the tabs above to see feedback or click "Improve Translation" to make changes for a new attempt.</p>
              </div>
            )}

            <div className="trans-actions">
              {!isSubmitted ? (
                // Initial state - only show Submit button
                <button 
                  onClick={submitTranslation} 
                  className={`trans-button trans-submit-button ${loading ? 'trans-loading' : ''}`}
                  disabled={loading || !textData || !translatedText.trim()}
                >
                  <Send size={16} />
                  {loading ? 'Submitting...' : 'Submit Translation'}
                </button>
              ) : isEditing ? (
                // Editing state - show Submit button for the improved translation
                <button 
                  onClick={submitTranslation} 
                  className={`trans-button trans-submit-button ${loading ? 'trans-loading' : ''}`}
                  disabled={loading || !textData || !translatedText.trim()}
                >
                  <Send size={16} />
                  {loading ? 'Submitting...' : `Submit Improved Translation (Attempt #${currentAttempt + 1})`}
                </button>
              ) : (
                // Submitted state - show buttons for analysis, scoring, and improving
                <>
                  <button 
                    onClick={enableEditing} 
                    className="trans-button trans-edit-button"
                    disabled={loading}
                  >
                    <Edit size={16} />
                    Improve Translation (New Attempt)
                  </button>
                
                  <button 
                    onClick={analyzeTranslation} 
                    className={`trans-button trans-analyze-button ${analyzing ? 'trans-loading' : ''}`}
                    disabled={analyzing || loading || scoring}
                  >
                    <Search size={16} />
                    {analyzing ? 'Analyzing...' : aiAnalysis ? 'View Analysis' : 'Analyze Translation'}
                  </button>
                  
                  <button 
                    onClick={scoreTranslation} 
                    className={`trans-button trans-score-button ${scoring ? 'trans-loading' : ''}`}
                    disabled={scoring || loading || analyzing}
                  >
                    <Star size={16} />
                    {scoring ? 'Scoring...' : scoreAnalysis ? 'View Score' : 'Score Translation'}
                  </button>
                  
                  <button 
                    onClick={fetchTranslationText} 
                    className="trans-button trans-refresh-button"
                    disabled={loading}
                  >
                    <RefreshCw size={16} />
                    Try New Text
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && aiAnalysis && (
        <div className="trans-analysis-container">
          <div className="trans-analysis-header">
            <h2><Search size={20} /> AI Analysis Results (Attempt #{currentAttempt})</h2>
            <p>Detailed analysis of your translation's accuracy, grammar, and vocabulary</p>
          </div>
          
          <div className="trans-analysis-grid">
            <div className="trans-analysis-card trans-accuracy-card">
              <div className="trans-card-header">
                <h3><Award size={18} /> Translation Accuracy</h3>
              </div>
              <div className="trans-card-content">
                <div className="trans-comparison">
                  <div className="trans-comparison-item">
                    <h4>AI Translation</h4>
                    <p>{aiAnalysis.feedback.translationAccuracy.aiTranslation}</p>
                  </div>
                  <div className="trans-comparison-item">
                    <h4>Your Translation</h4>
                    <p>{aiAnalysis.feedback.translationAccuracy.userTranslation}</p>
                  </div>
                </div>
                <div className="trans-result">
                  <h4>Accuracy Assessment</h4>
                  <p>{aiAnalysis.feedback.translationAccuracy.result}</p>
                </div>
              </div>
            </div>

            <div className="trans-analysis-card trans-grammar-card">
              <div className="trans-card-header">
                <h3><BookOpen size={18} /> Grammar Feedback</h3>
              </div>
              <div className="trans-card-content">
                {aiAnalysis.feedback.grammar.map((sentence, index) => (
                  <div key={index} className="trans-feedback-item">
                    <div className="trans-feedback-original">
                      <h4>Original</h4>
                      <p>{sentence.original}</p>
                    </div>
                    <div className="trans-feedback-corrected">
                      <h4>Corrected</h4>
                      <p>{sentence.corrected}</p>
                    </div>
                    <div className="trans-feedback-issues">
                      <h4>Issues Identified</h4>
                      {sentence.issues.length === 1 && sentence.issues[0] === "No grammar mistakes found." ? (
                        <div className="trans-no-issues">
                          <CheckCircle size={16} /> No grammar mistakes found
                        </div>
                      ) : (
                        <ul>
                          {sentence.issues.map((issue, i) => (
                            <li key={i}>{cleanIssueText(issue)}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="trans-analysis-card trans-vocab-card">
              <div className="trans-card-header">
                <h3><BarChart size={18} /> Vocabulary Enhancement</h3>
              </div>
              <div className="trans-card-content">
                {aiAnalysis.feedback.vocabulary.map((sentence, index) => (
                  <div key={index} className="trans-feedback-item">
                    <div className="trans-feedback-original">
                      <h4>Original</h4>
                      <p>{sentence.original}</p>
                    </div>
                    <div className="trans-feedback-enhanced">
                      <h4>Enhanced</h4>
                      <p>{sentence.enhanced}</p>
                    </div>
                    <div className="trans-feedback-details">
                      <div className="trans-feedback-replaced">
                        <h4>Replaced Words</h4>
                        {sentence.replaced === "No enhancement needed" ? (
                          <div className="trans-no-issues">
                            <CheckCircle size={16} /> No enhancement needed
                          </div>
                        ) : (
                          <ul>
                            {sentence.replaced.split(", ").map((replacement, i) => (
                              <li key={i}>{replacement}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="trans-feedback-meanings">
                        <h4>Meaning Context</h4>
                        {sentence.meanings === "No enhancement needed" ? (
                          <div className="trans-no-issues">
                            <CheckCircle size={16} /> No enhancement needed
                          </div>
                        ) : (
                          <ul>
                            {sentence.meanings.split("; ").map((meaning, i) => (
                              <li key={i}>{meaning}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="trans-feedback-actions">
            <button 
              className="trans-button trans-improve-button" 
              onClick={enableEditing}
            >
              <Edit size={16} />
              Improve Translation Using This Feedback (New Attempt)
            </button>
          </div>
        </div>
      )}

      {activeTab === 'score' && scoreAnalysis && (
        <div className="trans-score-container">
          <div className="trans-score-header">
            <h2><Star size={20} /> Translation Score (Attempt #{currentAttempt})</h2>
            <p>Evaluation of your translation quality based on multiple criteria</p>
          </div>
          
          <div className="trans-score-overview">
            <div 
              className="trans-score-circle" 
              style={{ 
                background: `conic-gradient(${getScoreColor(scoreAnalysis.feedback.Total)} ${scoreAnalysis.feedback.Total * 3.6}deg, #f0f0f0 ${scoreAnalysis.feedback.Total * 3.6}deg 360deg)` 
              }}
            >
              <div className="trans-score-inner">
                <span className="trans-score-value">{scoreAnalysis.feedback.Total}</span>
                <span className="trans-score-max">/100</span>
              </div>
            </div>
            <div className="trans-score-feedback">
              <h3>Overall Feedback</h3>
              <div className="trans-feedback-text">
                <p>{scoreAnalysis.feedback.Feedback}</p>
              </div>
            </div>
          </div>
          
          <div className="trans-score-breakdown">
            <h3>Scoring Breakdown</h3>
            
            <div className="trans-score-criteria">
              <div className="trans-score-criterion">
                <div className="trans-criterion-header">
                  <h4>Correct Word Usage</h4>
                  <span className="trans-criterion-weight">20%</span>
                </div>
                <div className="trans-criterion-score">
                  <strong>Score: {scoreAnalysis.feedback.CorrectWordUsage.score}/10</strong>
                  <span className="trans-criterion-contribution">(Contribution: {scoreAnalysis.feedback.CorrectWordUsage.contribution}/20)</span>
                </div>
                <ul className="trans-bullet-points">
                  {scoreAnalysis.feedback.CorrectWordUsage.points && 
                   scoreAnalysis.feedback.CorrectWordUsage.points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
                {renderProgressBar(scoreAnalysis.feedback.CorrectWordUsage.score, 10)}
              </div>
              
              <div className="trans-score-criterion">
                <div className="trans-criterion-header">
                  <h4>Sentence Structure</h4>
                  <span className="trans-criterion-weight">20%</span>
                </div>
                <div className="trans-criterion-score">
                  <strong>Score: {scoreAnalysis.feedback.SentenceStructure.score}/10</strong>
                  <span className="trans-criterion-contribution">(Contribution: {scoreAnalysis.feedback.SentenceStructure.contribution}/20)</span>
                </div>
                <ul className="trans-bullet-points">
                  {scoreAnalysis.feedback.SentenceStructure.points && 
                   scoreAnalysis.feedback.SentenceStructure.points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
                {renderProgressBar(scoreAnalysis.feedback.SentenceStructure.score, 10)}
              </div>
              
              <div className="trans-score-criterion">
                <div className="trans-criterion-header">
                  <h4>Grammar Mistakes</h4>
                  <span className="trans-criterion-weight">20%</span>
                </div>
                <div className="trans-criterion-score">
                  <strong>Score: {scoreAnalysis.feedback.GrammarMistakes.score}/10</strong>
                  <span className="trans-criterion-contribution">(Contribution: {scoreAnalysis.feedback.GrammarMistakes.contribution}/20)</span>
                </div>
                <ul className="trans-bullet-points">
                  {scoreAnalysis.feedback.GrammarMistakes.points && 
                   scoreAnalysis.feedback.GrammarMistakes.points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
                {renderProgressBar(scoreAnalysis.feedback.GrammarMistakes.score, 10)}
              </div>
              
              <div className="trans-score-criterion">
                <div className="trans-criterion-header">
                  <h4>Completeness</h4>
                  <span className="trans-criterion-weight">40%</span>
                </div>
                <div className="trans-criterion-score">
                  <strong>Score: {scoreAnalysis.feedback.Completeness.score}/10</strong>
                  <span className="trans-criterion-contribution">(Contribution: {scoreAnalysis.feedback.Completeness.contribution}/40)</span>
                </div>
                <ul className="trans-bullet-points">
                  {scoreAnalysis.feedback.Completeness.points && 
                   scoreAnalysis.feedback.Completeness.points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
                {renderProgressBar(scoreAnalysis.feedback.Completeness.score, 10)}
              </div>
            </div>
          </div>
          
          <div className="trans-feedback-actions">
            <button 
              className="trans-button trans-improve-button" 
              onClick={enableEditing}
            >
              <Edit size={16} />
              Try to Improve Your Score (New Attempt)
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="trans-history-container">
          <div className="trans-history-header">
            <h2><History size={20} /> Translation History</h2>
            <p>View all your previous translation attempts and progress</p>
          </div>
          
          {loadingHistory ? (
            <div className="trans-loading-container">
              <div className="trans-loader"></div>
              <p>Loading your translation history...</p>
            </div>
          ) : (
            <div className="trans-history-content">
              {pastTranslations.length === 0 ? (
                <div className="trans-empty-state">
                  <div className="trans-empty-icon">
                    <Clock size={48} />
                  </div>
                  <h3>No Translations Yet</h3>
                  <p>You haven't completed any translations yet. Start translating to build your history!</p>
                </div>
              ) : (
                <div className="trans-history-grid">
                  <div className="trans-history-list">
                    <h3>Your Past Translations</h3>
                    {pastTranslations.map((translation, index) => (
                      <div 
                        key={translation.userTranslationId} 
                        className={`trans-history-item ${selectedHistoryItem?.userTranslationId === translation.userTranslationId ? 'trans-history-item-selected' : ''}`}
                        onClick={() => loadHistoryItem(translation)}
                      >
                        <div className="trans-history-item-header">
                          <div className="trans-history-item-title">
                            <h4>Translation #{index + 1}</h4>
                            <div className="trans-item-badges">
                              <span className="trans-attempt-count">
                                {translation.totalAttempts} attempt{translation.totalAttempts !== 1 ? 's' : ''}
                              </span>
                              
                              {translation.scoreStats && translation.scoreStats.highestScore && (
                                <span 
                                  className="trans-score-badge"
                                  style={{ backgroundColor: getScoreColor(translation.scoreStats.highestScore) }}
                                >
                                  Best: {translation.scoreStats.highestScore}/100
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="trans-history-item-date">
                            <Calendar size={14} />
                            <span>{formatDate(translation.latestAttempt.submittedAt)}</span>
                          </div>
                        </div>
                        <div className="trans-history-item-preview">
                          <div className="trans-history-original">
                            <strong>Original:</strong>
                            <p>{translation.originalText.length > 100 
                                ? translation.originalText.substring(0, 100) + '...' 
                                : translation.originalText}</p>
                          </div>
                          <div className="trans-history-translation">
                            <strong>Latest Translation:</strong>
                            <p>{translation.latestAttempt.translatedText.length > 100 
                                ? translation.latestAttempt.translatedText.substring(0, 100) + '...' 
                                : translation.latestAttempt.translatedText}</p>
                          </div>
                        </div>
                        
                        {translation.scoreStats && (
                          <div className="trans-history-score-summary">
                            {translation.scoreStats.totalScored > 0 ? (
                              <>
                                <div className="trans-score-progress">
                                  <div className="trans-score-stats">
                                    <div className="trans-score-stat">
                                      <TrendingUp size={14} color={getScoreColor(translation.scoreStats.highestScore)} />
                                      <span>Best: {translation.scoreStats.highestScore}/100 (Attempt #{translation.scoreStats.highestScoreAttempt})</span>
                                    </div>
                                    <div className="trans-score-stat">
                                      <TrendingDown size={14} color={getScoreColor(translation.scoreStats.lowestScore)} />
                                      <span>Lowest: {translation.scoreStats.lowestScore}/100 (Attempt #{translation.scoreStats.lowestScoreAttempt})</span>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="trans-no-scores">
                                <AlertCircle size={14} />
                                <span>No scores yet</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="trans-history-details">
                    {selectedHistoryItem ? (
                      <div className="trans-history-detail-content">
                        <div className="trans-history-detail-header">
                          <h3>Translation Details</h3>
                          <div className="trans-history-meta">
                            <span className="trans-history-id">ID: {selectedHistoryItem.userTranslationId}</span>
                            <span className="trans-history-attempts">
                              {selectedHistoryItem.totalAttempts} attempt{selectedHistoryItem.totalAttempts !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        
                        {selectedHistoryItem.scoreStats && selectedHistoryItem.scoreStats.totalScored > 0 && (
                          <div className="trans-history-score-overview">
                            <h4>Score Overview</h4>
                            <div className="trans-score-overview-grid">
                              <div className="trans-score-highlight">
                                <div className="trans-score-highlight-header">
                                  <Medal size={18} color={getScoreColor(selectedHistoryItem.scoreStats.highestScore)} />
                                  <h5>Highest Score</h5>
                                </div>
                                <div className="trans-score-highlight-value">
                                  <span style={{ color: getScoreColor(selectedHistoryItem.scoreStats.highestScore) }}>
                                    {selectedHistoryItem.scoreStats.highestScore}/100
                                  </span>
                                  <div className="trans-score-highlight-info">
                                    <span>Attempt #{selectedHistoryItem.scoreStats.highestScoreAttempt}</span>
                                    <span>{getScoreLabel(selectedHistoryItem.scoreStats.highestScore)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="trans-score-highlight">
                                <div className="trans-score-highlight-header">
                                  <AlertCircle size={18} color={getScoreColor(selectedHistoryItem.scoreStats.lowestScore)} />
                                  <h5>Lowest Score</h5>
                                </div>
                                <div className="trans-score-highlight-value">
                                  <span style={{ color: getScoreColor(selectedHistoryItem.scoreStats.lowestScore) }}>
                                    {selectedHistoryItem.scoreStats.lowestScore}/100
                                  </span>
                                  <div className="trans-score-highlight-info">
                                    <span>Attempt #{selectedHistoryItem.scoreStats.lowestScoreAttempt}</span>
                                    <span>{getScoreLabel(selectedHistoryItem.scoreStats.lowestScore)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="trans-history-original-text">
                          <h4>Original Malayalam Text:</h4>
                          <div className="trans-history-original-content">
                            <p>{selectedHistoryItem.originalText}</p>
                          </div>
                        </div>
                        
                        <div className="trans-history-attempts-section">
                          <h4>Translation Attempts:</h4>
                          {selectedHistoryItem.attempts.map((attempt, index) => (
                            <div key={index} className="trans-history-attempt">
                              <div 
                                className="trans-history-attempt-header" 
                                onClick={() => toggleExpand(attempt.attemptNumber)}
                              >
                                <div className="trans-history-attempt-title">
                                  <div className="trans-attempt-title-main">
                                    <strong>Attempt #{attempt.attemptNumber}</strong>
                                    {attempt.score && (
                                      <span 
                                        className="trans-attempt-score"
                                        style={{ backgroundColor: getScoreColor(attempt.score.totalScore) }}
                                      >
                                        {attempt.score.totalScore}/100
                                      </span>
                                    )}
                                  </div>
                                  <span className="trans-history-attempt-date">{formatDate(attempt.submittedAt)}</span>
                                </div>
                                
                                <div className="trans-attempt-expand-icon">
                                  {expandedTranslation === attempt.attemptNumber ? (
                                    <ChevronUp size={18} />
                                  ) : (
                                    <ChevronDown size={18} />
                                  )}
                                </div>
                              </div>
                              
                              {expandedTranslation === attempt.attemptNumber && (
                                <div className="trans-history-attempt-content">
                                  <p className="trans-attempt-text">{attempt.translatedText}</p>
                                  
                                  {attempt.score && (
                                    <div className="trans-attempt-score-details">
                                      <div 
                                        className="trans-attempt-score-toggle" 
                                        onClick={() => toggleScoreView(attempt.attemptNumber)}
                                      >
                                        <Star size={16} fill={getScoreColor(attempt.score.totalScore)} color={getScoreColor(attempt.score.totalScore)} />
                                        <span>Score Details</span>
                                        {expandedScoreView === attempt.attemptNumber ? (
                                          <ChevronUp size={16} />
                                        ) : (
                                          <ChevronDown size={16} />
                                        )}
                                      </div>
                                      
                                      {expandedScoreView === attempt.attemptNumber && (
                                        <div className="trans-attempt-score-breakdown">
                                          <div className="trans-attempt-score-overview">
                                            <div 
                                              className="trans-attempt-score-circle" 
                                              style={{ 
                                                background: `conic-gradient(${getScoreColor(attempt.score.totalScore)} ${attempt.score.totalScore * 3.6}deg, #f0f0f0 ${attempt.score.totalScore * 3.6}deg 360deg)` 
                                              }}
                                            >
                                              <div className="trans-attempt-score-inner">
                                                <span className="trans-attempt-score-value">{attempt.score.totalScore}</span>
                                                <span className="trans-attempt-score-max">/100</span>
                                              </div>
                                            </div>
                                            <div className="trans-attempt-score-label">
                                              {getScoreLabel(attempt.score.totalScore)}
                                            </div>
                                          </div>
                                          
                                          <div className="trans-attempt-score-categories">
                                            <div className="trans-score-category">
                                              <div className="trans-score-category-header">
                                                <span>Word Usage</span>
                                                <span className="trans-category-score" style={{ color: getScoreColor(attempt.score.wordUsageScore) }}>
                                                  {attempt.score.wordUsageScore}/100
                                                </span>
                                              </div>
                                              <div className="trans-category-bar">
                                                <div 
                                                  className="trans-category-progress" 
                                                  style={{ 
                                                    width: `${attempt.score.wordUsageScore}%`,
                                                    backgroundColor: getScoreColor(attempt.score.wordUsageScore)
                                                  }}
                                                ></div>
                                              </div>
                                            </div>
                                            
                                            <div className="trans-score-category">
                                              <div className="trans-score-category-header">
                                                <span>Sentence Structure</span>
                                                <span className="trans-category-score" style={{ color: getScoreColor(attempt.score.structureScore) }}>
                                                  {attempt.score.structureScore}/100
                                                </span>
                                              </div>
                                              <div className="trans-category-bar">
                                                <div 
                                                  className="trans-category-progress" 
                                                  style={{ 
                                                    width: `${attempt.score.structureScore}%`,
                                                    backgroundColor: getScoreColor(attempt.score.structureScore)
                                                  }}
                                                ></div>
                                              </div>
                                            </div>
                                            
                                            <div className="trans-score-category">
                                              <div className="trans-score-category-header">
                                                <span>Grammar</span>
                                                <span className="trans-category-score" style={{ color: getScoreColor(attempt.score.grammarScore) }}>
                                                  {attempt.score.grammarScore}/100
                                                </span>
                                              </div>
                                              <div className="trans-category-bar">
                                                <div 
                                                  className="trans-category-progress" 
                                                  style={{ 
                                                    width: `${attempt.score.grammarScore}%`,
                                                    backgroundColor: getScoreColor(attempt.score.grammarScore)
                                                  }}
                                                ></div>
                                              </div>
                                            </div>
                                            
                                            <div className="trans-score-category">
                                              <div className="trans-score-category-header">
                                                <span>Completeness</span>
                                                <span className="trans-category-score" style={{ color: getScoreColor(attempt.score.completenessScore) }}>
                                                  {attempt.score.completenessScore}/100
                                                </span>
                                              </div>
                                              <div className="trans-category-bar">
                                                <div 
                                                  className="trans-category-progress" 
                                                  style={{ 
                                                    width: `${attempt.score.completenessScore}%`,
                                                    backgroundColor: getScoreColor(attempt.score.completenessScore)
                                                  }}
                                                ></div>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {attempt.score.feedback && (
                                            <div className="trans-attempt-feedback">
                                              <h5>Feedback:</h5>
                                              <p>{attempt.score.feedback}</p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="trans-history-actions">
                          <button 
                            className="trans-button trans-history-analyze-button"
                            onClick={() => {
                              // Load the last attempt into the current translation
                              const lastAttempt = selectedHistoryItem.attempts[0];
                              setTranslatedText(lastAttempt.translatedText);
                              // Set up for analysis
                              setTextData({
                                _id: selectedHistoryItem.translationId,
                                text: selectedHistoryItem.originalText
                              });
                              setActiveTab('translation');
                              setIsSubmitted(true);
                              setUserTranslationDoc({
                                _id: selectedHistoryItem.userTranslationId,
                                attempts: selectedHistoryItem.attempts
                              });
                              setCurrentAttempt(lastAttempt.attemptNumber);
                              setMessageType('info');
                              setMessage('Previous translation loaded. You can analyze or improve it.');
                            }}
                          >
                            <ExternalLink size={16} />
                            Continue Working on This Translation
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="trans-history-select-prompt">
                        <div className="trans-history-select-icon">
                          <ArrowLeft size={32} />
                        </div>
                        <h3>Select a Translation</h3>
                        <p>Click on any translation from the list to view details and all previous attempts.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TranslationTask;