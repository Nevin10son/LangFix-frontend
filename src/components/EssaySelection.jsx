import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  PenTool, 
  Clock, 
  FileText,
  CheckCircle,
  Book,
  Star,
  History,
  AlertTriangle,
  PlayCircle,
  RefreshCw,
  Info,
  List,
  Edit,
  Send
} from "lucide-react";
import "./EssaySelection.css";

export default function EssayWriting() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [randomTopic, setRandomTopic] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info, success, error, warning
  const [essayText, setEssayText] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [vocabEnhancement, setVocabEnhancement] = useState(null);
  const [enhancingVocab, setEnhancingVocab] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [activeTab, setActiveTab] = useState("write"); // write, grammar, vocabulary, score, history
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [pastEssays, setPastEssays] = useState([]);
  const textareaRef = useRef(null);
  const navigate = useNavigate();
  
  // New state variables for tracking attempts
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [essaySubmission, setEssaySubmission] = useState(null);

  // Timer logic
  useEffect(() => {
    let interval = null;
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerStarted) {
      if (textareaRef.current) {
        textareaRef.current.disabled = true;
      }
      setTimerActive(false);
      setMessage("Time's up! You can no longer edit your essay, but you can still submit it.");
      setMessageType("warning");
    }
    
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, timerStarted]);

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer
  const startTimer = () => {
    if (!timerStarted) {
      setTimerActive(true);
      setTimerStarted(true);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:5000/essay-categories", {
          headers: { token: sessionStorage.getItem("token") },
        });
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setMessage("Failed to load categories.");
        setMessageType("error");
      }
    };
    fetchCategories();
  }, []);

  // Fetch past essays when history tab is active
  useEffect(() => {
    if (activeTab === "history") {
      fetchPastEssays();
    }
  }, [activeTab]);

  // Reset feedback states
  const resetFeedback = () => {
    setAiAnalysis(null);
    setVocabEnhancement(null);
    setScoreResult(null);
  };

  // Fetch past essays
  const fetchPastEssays = async () => {
    try {
      const userId = sessionStorage.getItem("userid");
      const token = sessionStorage.getItem("token");
      
      if (!userId || !token) {
        setMessage("User is not logged in. Please log in to view past essays.");
        setMessageType("error");
        return;
      }
      
      const response = await axios.get(
        `http://localhost:5000/user-essays/${userId}`,
        { headers: { token } }
      );
      
      if (response.data.status === "Success") {
        setPastEssays(response.data.essays);
      } else {
        setMessage("Failed to load past essays.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error fetching past essays:", error);
      setMessage("Failed to load past essays.");
      setMessageType("error");
    }
  };

  // Handle category selection and get a random topic
  const handleCategoryChange = (event) => {
    const categoryName = event.target.value;
    setSelectedCategory(categoryName);
    setRandomTopic(null);
    setEssayText("");
    resetFeedback();
    setTimeLeft(15 * 60);
    setTimerActive(false);
    setTimerStarted(false);
    setIsSubmitted(false);
    setIsEditing(false);
    setCurrentAttempt(1);
    setEssaySubmission(null);
    
    if (textareaRef.current) {
      textareaRef.current.disabled = false;
    }

    const selected = categories.find((cat) => cat.category === categoryName);
    if (selected && selected.topics.length > 0) {
      const randomIndex = Math.floor(Math.random() * selected.topics.length);
      setRandomTopic(selected.topics[randomIndex]);
    } else {
      setRandomTopic(null);
    }
  };

  // Get a new topic within the same category
  const getNewTopic = () => {
    if (!selectedCategory) {
      setMessage("Please select a category first.");
      setMessageType("error");
      return;
    }
    
    const selected = categories.find((cat) => cat.category === selectedCategory);
    if (selected && selected.topics.length > 0) {
      let randomIndex;
      let newTopic;
      
      // Make sure we get a different topic
      do {
        randomIndex = Math.floor(Math.random() * selected.topics.length);
        newTopic = selected.topics[randomIndex];
      } while (newTopic._id === randomTopic?._id && selected.topics.length > 1);
      
      setRandomTopic(newTopic);
      setEssayText("");
      resetFeedback();
      setTimeLeft(15 * 60);
      setTimerActive(false);
      setTimerStarted(false);
      setIsSubmitted(false);
      setIsEditing(false);
      setCurrentAttempt(1);
      setEssaySubmission(null);
      
      if (textareaRef.current) {
        textareaRef.current.disabled = false;
      }
    }
  };

  // Handle textarea change
  const handleEssayChange = (event) => {
    setEssayText(event.target.value);
  };

  // Count words in essay text
  const countWords = (text) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  // Enable editing for a new attempt
  const enableEditing = () => {
    setIsEditing(true);
    setActiveTab("write");
    resetFeedback();
    // Reset timer states for new attempt
    setTimeLeft(15 * 60);
    setTimerActive(false);
    setTimerStarted(false);
    // Enable textarea
    if (textareaRef.current) {
      textareaRef.current.disabled = false;
    }
    setMessage(`You can now improve your essay for attempt #${currentAttempt + 1}. Submit when ready.`);
    setMessageType("info");
  };

  // Handle essay submission
  const handleSubmit = async () => {
    if (!selectedCategory || !randomTopic || !essayText.trim()) {
      setMessage("Please select a category, get a topic, and write your essay before submitting.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const userId = sessionStorage.getItem("userid");
      const token = sessionStorage.getItem("token");
      if (!userId || !token) {
        setMessage("User is not logged in. Please log in to submit an essay.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      // Check if this is a new submission or an improved one
      if (!isEditing || !essaySubmission) {
        // First submission
        const response = await axios.post(
          "http://localhost:5000/submit-essay",
          { 
            userId, 
            topicId: randomTopic._id, 
            essayText,
            attemptNumber: 1
          },
          { headers: { token } }
        );
        
        if (response.data.status === "Success") {
          setEssaySubmission(response.data.data);
          setCurrentAttempt(1);
          setIsSubmitted(true);
          setIsEditing(false);
          setMessage("Essay submitted successfully! You can now analyze your essay.");
          setMessageType("success");
        } else {
          setMessage("Failed to submit essay: " + response.data.error);
          setMessageType("error");
        }
      } else {
        // Updated submission (a new attempt)
        const nextAttemptNumber = currentAttempt + 1;
        const response = await axios.post(
          "http://localhost:5000/update-essay",
          {
            essaySubmissionId: essaySubmission._id,
            userId,
            topicId: randomTopic._id,
            essayText,
            attemptNumber: nextAttemptNumber
          },
          { headers: { token } }
        );
        
        if (response.data.status === "Success") {
          setEssaySubmission(response.data.data);
          setCurrentAttempt(nextAttemptNumber);
          setIsSubmitted(true);
          setIsEditing(false);
          setMessage(`Improved essay submitted successfully! (Attempt #${nextAttemptNumber})`);
          setMessageType("success");
        } else {
          setMessage("Failed to submit improved essay: " + response.data.error);
          setMessageType("error");
        }
      }
    } catch (error) {
      console.error("Error submitting essay:", error);
      setMessage("Failed to submit essay. Please try again.");
      setMessageType("error");
    }

    setLoading(false);
  };

  // Handle AI Grammar Analysis
  const handleAnalyze = async () => {
    if (!selectedCategory || !randomTopic || !essayText.trim()) {
      setMessage("Please select a category, get a topic, and write your essay before analyzing.");
      setMessageType("error");
      return;
    }

    setAnalyzing(true);
    setMessage("");

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setMessage("User is not logged in. Please log in to analyze an essay.");
        setMessageType("error");
        setAnalyzing(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/analyze-essay",
        { topic: randomTopic.question, essayText },
        { headers: { token } }
      );

      console.log("AI Analysis Response:", response.data);
      setAiAnalysis(response.data);
      setActiveTab("grammar");
      setMessage(`Grammar analysis for attempt #${currentAttempt} completed successfully!`);
      setMessageType("success");
    } catch (error) {
      console.error("Error analyzing essay:", error);
      setMessage("Failed to analyze essay. Please try again.");
      setMessageType("error");
    }

    setAnalyzing(false);
  };

  // Handle Vocabulary Enhancement
  const handleEnhanceVocabulary = async () => {
    if (!selectedCategory || !randomTopic || !essayText.trim()) {
      setMessage("Please select a category, get a topic, and write your essay before enhancing vocabulary.");
      setMessageType("error");
      return;
    }

    setEnhancingVocab(true);
    setMessage("");

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setMessage("User is not logged in. Please log in to enhance vocabulary.");
        setMessageType("error");
        setEnhancingVocab(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/vocabulary/enhance",
        { text: essayText },
        { headers: { token } }
      );

      console.log("Vocabulary Enhancement Response:", response.data);
      
      if (response.data.Status === "Success") {
        setVocabEnhancement(response.data);
        setActiveTab("vocabulary");
        setMessage(`Vocabulary enhancement for attempt #${currentAttempt} completed successfully!`);
        setMessageType("success");
      } else {
        setMessage("Failed to enhance vocabulary: " + (response.data.error || "Unknown error"));
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error enhancing vocabulary:", error);
      setMessage("Failed to enhance vocabulary. Please try again.");
      setMessageType("error");
    }

    setEnhancingVocab(false);
  };

  // Handle Essay Scoring
  const handleScoreEssay = async () => {
    if (!selectedCategory || !randomTopic || !essayText.trim()) {
      setMessage("Please select a category, get a topic, and write your essay before scoring.");
      setMessageType("error");
      return;
    }

    setScoring(true);
    setMessage("");

    try {
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("userid");
      
      if (!token || !userId) {
        setMessage("User is not logged in. Please log in to score an essay.");
        setMessageType("error");
        setScoring(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/score-essay",
        { 
          topic: randomTopic.question, 
          essayText,
          essayId: randomTopic._id,
          userId,
          attemptNumber: currentAttempt
        },
        { headers: { token } }
      );

      console.log("Essay Scoring Response:", response.data);
      
      if (response.data.Status === "Success") {
        // Check and adapt the API response format to match what the UI expects
        const adaptedFeedback = {
          content: response.data.feedback.content || {},
          organization: response.data.feedback.organization || {},
          language: response.data.feedback.language || {},
          coherence: response.data.feedback.coherence || response.data.feedback.grammar || {},
          total: response.data.feedback.total || 0,
          overallFeedback: response.data.feedback.overallFeedback || "",
          recommendations: response.data.feedback.recommendations || []
        };
        
        // Ensure each section has the required properties
        ['content', 'organization', 'language', 'coherence'].forEach(section => {
          if (!adaptedFeedback[section].score) adaptedFeedback[section].score = 5;
          if (!adaptedFeedback[section].feedback && adaptedFeedback[section].description) {
            adaptedFeedback[section].feedback = adaptedFeedback[section].description;
          } else if (!adaptedFeedback[section].feedback) {
            adaptedFeedback[section].feedback = "No detailed feedback available.";
          }
        });
        
        setScoreResult(adaptedFeedback);
        setActiveTab("score");
        setMessage(`Essay scoring for attempt #${currentAttempt} completed successfully!`);
        setMessageType("success");
      } else {
        setMessage("Failed to score essay: " + (response.data.message || "Unknown error"));
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error scoring essay:", error);
      setMessage("Failed to score essay. Please try again.");
      setMessageType("error");
    }

    setScoring(false);
  };

  // Helper function to clean bold markers from issues
  const cleanIssueText = (issue) => {
    return issue.replace(/\*\*(.*?)\*\*/g, "$1"); // Removes ** around text, keeps content
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
      <div className="essay-progress-container">
        <div 
          className="essay-progress-bar" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
        <span className="essay-progress-label">{score}/{maxScore}</span>
      </div>
    );
  };

  return (
    <div className="essay-container">
      <header className="essay-header">
        <div className="essay-header-left">
          <button className="essay-back-button" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        </div>
        
        <div className="essay-title">
          <PenTool className="essay-title-icon" />
          <h1>Essay Writing Workshop</h1>
          {currentAttempt > 1 && (
            <span className="essay-attempt-indicator">Attempt #{currentAttempt}</span>
          )}
        </div>
        
        <div className="essay-header-right">
          <div className={`essay-timer ${timerActive && timeLeft < 60 ? 'essay-timer-warning' : ''}`}>
            <Clock size={18} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      {isSubmitted && (
        <div className="essay-tabs">
          <button 
            className={`essay-tab ${activeTab === 'write' ? 'essay-tab-active' : ''}`}
            onClick={() => setActiveTab('write')}
          >
            <PenTool size={16} />
            Write Essay
          </button>
          <button 
            className={`essay-tab ${activeTab === 'grammar' ? 'essay-tab-active' : ''}`}
            onClick={() => {
              if (aiAnalysis) {
                setActiveTab('grammar');
              } else {
                handleAnalyze();
              }
            }}
          >
            <CheckCircle size={16} />
            Grammar Analysis
          </button>
          <button 
            className={`essay-tab ${activeTab === 'vocabulary' ? 'essay-tab-active' : ''}`}
            onClick={() => {
              if (vocabEnhancement) {
                setActiveTab('vocabulary');
              } else {
                handleEnhanceVocabulary();
              }
            }}
          >
            <Book size={16} />
            Vocabulary
          </button>
          <button 
            className={`essay-tab ${activeTab === 'score' ? 'essay-tab-active' : ''}`}
            onClick={() => {
              if (scoreResult) {
                setActiveTab('score');
              } else {
                handleScoreEssay();
              }
            }}
          >
            <Star size={16} />
            Score
          </button>
          <button 
            className={`essay-tab ${activeTab === 'history' ? 'essay-tab-active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={16} />
            History
          </button>
        </div>
      )}
      
      {message && (
        <div className={`essay-message essay-message-${messageType}`}>
          <span>{message}</span>
          <button 
            className="essay-message-close" 
            onClick={() => setMessage("")}
          >×</button>
        </div>
      )}

      {activeTab === 'write' && (
        <div className="essay-workspace">
          <div className="essay-info-banner">
            <Info size={18} />
            <p>
              Select a category to get a random topic. You have 15 minutes to complete your essay once you click the "Start Timer" button. Write a thoughtful response addressing all aspects of the topic.
            </p>
          </div>
          
          <div className="essay-content">
            <div className="essay-left-panel">
              <div className="essay-category-section">
                <h2>Select Category</h2>
                <div className="essay-dropdown-wrapper">
                  <select 
                    className="essay-category-select" 
                    value={selectedCategory} 
                    onChange={handleCategoryChange}
                    disabled={isSubmitted && !isEditing}
                  >
                    <option value="">-- Select a Category --</option>
                    {categories.map((category) => (
                      <option key={category.category} value={category.category}>
                        {category.category}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedCategory && !isSubmitted && (
                  <button className="essay-new-topic-button" onClick={getNewTopic}>
                    <RefreshCw size={16} />
                    Get New Topic
                  </button>
                )}
              </div>
              
              {randomTopic && (
                <div className="essay-topic-card">
                  <h3>Your Topic</h3>
                  <p>{randomTopic.question}</p>
                </div>
              )}

{isSubmitted && !isEditing && (
  <div className="essay-action-message">
    <p>You've submitted your essay (Attempt #{currentAttempt}). Use the tabs above to see feedback or click "Improve Essay" to make changes for a new attempt.</p>
  </div>
)}

<div className="essay-actions">
  {!isSubmitted ? (
    // Initial state - only show Submit button
    <button 
      className="essay-button essay-submit-button" 
      onClick={handleSubmit} 
      disabled={loading || !randomTopic || !essayText.trim()}
    >
      <Send size={16} />
      {loading ? "Submitting..." : "Submit Essay"}
    </button>
  ) : isEditing ? (
    // Editing state - show Submit button for the improved essay
    <button 
      className="essay-button essay-submit-button" 
      onClick={handleSubmit} 
      disabled={loading || !randomTopic || !essayText.trim()}
    >
      <Send size={16} />
      {loading ? "Submitting..." : `Submit Improved Essay (Attempt #${currentAttempt + 1})`}
    </button>
  ) : (
    // Submitted state - show Improve Essay button and analysis buttons
    <>
      <button 
        className="essay-button essay-edit-button" 
        onClick={enableEditing}
      >
        <Edit size={16} />
        Improve Essay (New Attempt)
      </button>
      
      <button 
        className="essay-button essay-analyze-button" 
        onClick={handleAnalyze} 
        disabled={analyzing}
      >
        <CheckCircle size={16} />
        {analyzing ? "Analyzing..." : aiAnalysis ? "View Grammar Analysis" : "Grammar Analysis"}
      </button>
      
      <button 
        className="essay-button essay-vocab-button" 
        onClick={handleEnhanceVocabulary} 
        disabled={enhancingVocab}
      >
        <Book size={16} />
        {enhancingVocab ? "Enhancing..." : vocabEnhancement ? "View Vocabulary Enhancement" : "Enhance Vocabulary"}
      </button>
      
      <button 
        className="essay-button essay-score-button" 
        onClick={handleScoreEssay} 
        disabled={scoring}
      >
        <Star size={16} />
        {scoring ? "Scoring..." : scoreResult ? "View Score" : "Score Essay"}
      </button>
      
      <button 
        className="essay-button essay-new-button" 
        onClick={getNewTopic}
      >
        <RefreshCw size={16} />
        Try New Topic
      </button>
    </>
  )}
  
  {(!isSubmitted || isEditing) && !timerStarted && (
    <button 
      className="essay-timer-button" 
      onClick={startTimer}
      disabled={!randomTopic}
    >
      <PlayCircle size={16} />
      Start Timer
    </button>
  )}
</div>
</div>

<div className="essay-right-panel">
  <div className="essay-editor-header">
    <h2>Your Essay {isEditing && `(Attempt #${currentAttempt + 1})`}</h2>
    <div className="essay-editor-tools">
      <div className="essay-word-count">
        <FileText size={14} />
        <span>{countWords(essayText)} words</span>
      </div>
    </div>
  </div>
  
  <div className="essay-textarea-container">
    <textarea
      ref={textareaRef}
      className="essay-textarea"
      value={essayText}
      onChange={handleEssayChange}
      placeholder={randomTopic ? "Start writing your essay here..." : "Select a category and topic to begin writing..."}
      disabled={(isSubmitted && !isEditing) || (!randomTopic) || (timerStarted && timeLeft === 0)}
      spellCheck="true"
    ></textarea>
  </div>
</div>
</div>
</div>
)}

{activeTab === 'grammar' && aiAnalysis && (
<div className="essay-analysis-container">
  <div className="essay-analysis-header">
    <h2><CheckCircle size={20} /> Grammar Analysis (Attempt #{currentAttempt})</h2>
    <p>Review of grammatical structure and suggestions for improvement</p>
  </div>
  
  {aiAnalysis.Status === "Success" && (
    <>
      <div className="essay-relevance-card">
        <div className="essay-card-header">
          <h3>Topic Relevance</h3>
        </div>
        <div className="essay-card-content">
          <div className="essay-comparison">
            <div className="essay-comparison-item">
              <h4>Topic</h4>
              <p>{aiAnalysis.feedback.relevance.topic}</p>
            </div>
            <div className="essay-comparison-item">
              <h4>Your Essay</h4>
              <p>{aiAnalysis.feedback.relevance.essayText}</p>
            </div>
          </div>
          <div className="essay-result">
            <h4>Analysis Result</h4>
            <p>{aiAnalysis.feedback.relevance.result}</p>
          </div>
        </div>
      </div>

      <div className="essay-grammar-card">
        <div className="essay-card-header">
          <h3>Grammar Corrections</h3>
        </div>
        <div className="essay-card-content">
          {aiAnalysis.feedback.grammar && aiAnalysis.feedback.grammar.length > 0 ? (
            aiAnalysis.feedback.grammar.map((sentence, index) => (
              <div key={index} className="essay-feedback-item">
                <div className="essay-feedback-original">
                  <h4>Original</h4>
                  <p>{sentence.original}</p>
                </div>
                <div className="essay-feedback-corrected">
                  <h4>Corrected</h4>
                  <p>{sentence.corrected}</p>
                </div>
                <div className="essay-feedback-issues">
                  <h4>Issues</h4>
                  {sentence.issues.length === 1 && sentence.issues[0] === "No grammar mistakes found." ? (
                    <div className="essay-no-issues">
                      <CheckCircle size={16} />
                      <span>No grammar mistakes found</span>
                    </div>
                  ) : (
                    <ul className="essay-issues-list">
                      {sentence.issues.map((issue, i) => (
                        <li key={i}>{cleanIssueText(issue)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="essay-no-issues-container">
              <CheckCircle size={40} />
              <p>Perfect grammar! No mistakes found in your essay.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="essay-feedback-actions">
        <button 
          className="essay-button essay-improve-button" 
          onClick={enableEditing}
        >
          <Edit size={16} />
          Improve Essay Using This Feedback (New Attempt)
        </button>
      </div>
    </>
  )}
</div>
)}
  
{activeTab === 'vocabulary' && vocabEnhancement && (
<div className="essay-analysis-container">
  <div className="essay-analysis-header">
    <h2><Book size={20} /> Vocabulary Enhancement (Attempt #{currentAttempt})</h2>
    <p>Suggestions for improving word choice and language variety</p>
  </div>
  
  <div className="essay-vocab-cards">
    {vocabEnhancement.Status === "Success" && vocabEnhancement.feedback.length > 0 ? (
      vocabEnhancement.feedback.map((item, index) => (
        <div key={index} className="essay-vocab-card">
          <div className="essay-card-header">
            <h3>Enhancement {index + 1}</h3>
          </div>
          <div className="essay-card-content">
            <div className="essay-vocab-comparison">
              <div className="essay-feedback-original">
                <h4>Original</h4>
                <p>{item.original}</p>
              </div>
              <div className="essay-feedback-enhanced">
                <h4>Enhanced</h4>
                <p>{item.enhanced}</p>
              </div>
            </div>
            
            <div className="essay-vocab-details">
              <div className="essay-replaced-words">
                <h4>Replaced Words</h4>
                {item.replaced === "No enhancement needed" ? (
                  <div className="essay-no-issues">
                    <CheckCircle size={16} />
                    <span>No enhancement needed</span>
                  </div>
                ) : (
                  <ul className="essay-replaced-list">
                    {item.replaced.split(", ").map((replacement, i) => (
                      <li key={i}>{replacement}</li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="essay-word-meanings">
                <h4>Word Meanings</h4>
                {item.meanings === "No enhancement needed" ? (
                  <div className="essay-no-issues">
                    <CheckCircle size={16} />
                    <span>No enhancement needed</span>
                  </div>
                ) : (
                  <ul className="essay-meanings-list">
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
      <div className="essay-no-issues-container">
        <CheckCircle size={40} />
        <p>Excellent vocabulary! No enhancements needed for your essay.</p>
      </div>
    )}
  </div>
  
  <div className="essay-feedback-actions">
    <button 
      className="essay-button essay-improve-button" 
      onClick={enableEditing}
    >
      <Edit size={16} />
      Improve Essay Using These Enhancements (New Attempt)
    </button>
  </div>
</div>
)}
  
{activeTab === 'score' && scoreResult && (
<div className="essay-analysis-container">
  <div className="essay-analysis-header">
    <h2><Star size={20} /> Essay Score (Attempt #{currentAttempt})</h2>
    <p>Evaluation of your essay based on content, organization, language, and coherence</p>
  </div>
  
  <div className="essay-score-overview">
    <div className="essay-score-circle" style={{ 
      background: `conic-gradient(${getScoreColor(scoreResult.total)} ${scoreResult.total * 3.6}deg, #f0f0f0 ${scoreResult.total * 3.6}deg 360deg)` 
    }}>
      <div className="essay-score-inner">
        <span className="essay-score-value">{scoreResult.total}</span>
        <span className="essay-score-max">/100</span>
      </div>
    </div>
    <div className="essay-score-feedback">
      <h3>Overall Feedback</h3>
      <p>{scoreResult.overallFeedback || "Keep practicing to improve your writing skills."}</p>
    </div>
  </div>
  
  <div className="essay-score-criteria">
    {/* Content Section */}
    <div className="essay-score-criterion">
      <div className="essay-criterion-header">
        <h4>{scoreResult.content.title || "Content"}</h4>
        <span className="essay-criterion-weight">25%</span>
      </div>
      <p>{scoreResult.content.feedback}</p>
      {renderProgressBar(scoreResult.content.score, 10)}
      
      {scoreResult.content.strengths && (
        <div className="essay-feedback-points">
          <h5>Strengths:</h5>
          <ul className="essay-points-list">
            {scoreResult.content.strengths.map((strength, i) => (
              <li key={i}>
                <strong>{strength.point}</strong>
                {strength.example && (
                  <div className="essay-example">
                    Example: <em>"{strength.example}"</em>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {scoreResult.content.improvements && (
        <div className="essay-feedback-points">
          <h5>Areas for Improvement:</h5>
          <ul className="essay-points-list">
            {scoreResult.content.improvements.map((improvement, i) => (
               <li key={i}>
               <strong>{improvement.point}</strong>
               {improvement.instead && (
                 <div className="essay-instead">
                   Instead of: <em>"{improvement.instead}"</em>
                 </div>
               )}
               {improvement.better && (
                 <div className="essay-better">
                   Better: <em>"{improvement.better}"</em>
                 </div>
               )}
             </li>
           ))}
         </ul>
       </div>
     )}
     
     {/* Handle old format with points array */}
     {scoreResult.content.points && !scoreResult.content.strengths && (
       <div className="essay-feedback-points">
         <h5>Feedback Points:</h5>
         <ul className="essay-points-list">
           {scoreResult.content.points.map((point, i) => (
             <li key={i}>{point}</li>
           ))}
         </ul>
       </div>
     )}
   </div>
   
   {/* Organization Section */}
   <div className="essay-score-criterion">
     <div className="essay-criterion-header">
       <h4>{scoreResult.organization.title || "Organization"}</h4>
       <span className="essay-criterion-weight">25%</span>
     </div>
     <p>{scoreResult.organization.feedback}</p>
     {renderProgressBar(scoreResult.organization.score, 10)}
     
     {scoreResult.organization.strengths && (
       <div className="essay-feedback-points">
         <h5>Strengths:</h5>
         <ul className="essay-points-list">
           {scoreResult.organization.strengths.map((strength, i) => (
             <li key={i}>
               <strong>{strength.point}</strong>
               {strength.example && (
                 <div className="essay-example">
                   Example: <em>"{strength.example}"</em>
                 </div>
               )}
             </li>
           ))}
         </ul>
       </div>
     )}
     
     {scoreResult.organization.improvements && (
       <div className="essay-feedback-points">
         <h5>Areas for Improvement:</h5>
         <ul className="essay-points-list">
           {scoreResult.organization.improvements.map((improvement, i) => (
             <li key={i}>
               <strong>{improvement.point}</strong>
               {improvement.instead && (
                 <div className="essay-instead">
                   Instead of: <em>"{improvement.instead}"</em>
                 </div>
               )}
               {improvement.better && (
                 <div className="essay-better">
                   Better: <em>"{improvement.better}"</em>
                 </div>
               )}
             </li>
           ))}
         </ul>
       </div>
     )}
     
     {/* Handle old format with points array */}
     {scoreResult.organization.points && !scoreResult.organization.strengths && (
       <div className="essay-feedback-points">
         <h5>Feedback Points:</h5>
         <ul className="essay-points-list">
           {scoreResult.organization.points.map((point, i) => (
             <li key={i}>{point}</li>
           ))}
         </ul>
       </div>
     )}
   </div>
   
   {/* Language Section */}
   <div className="essay-score-criterion">
     <div className="essay-criterion-header">
       <h4>{scoreResult.language.title || "Language"}</h4>
       <span className="essay-criterion-weight">25%</span>
     </div>
     <p>{scoreResult.language.feedback}</p>
     {renderProgressBar(scoreResult.language.score, 10)}
     
     {scoreResult.language.strengths && (
       <div className="essay-feedback-points">
         <h5>Strengths:</h5>
         <ul className="essay-points-list">
           {scoreResult.language.strengths.map((strength, i) => (
             <li key={i}>
               <strong>{strength.point}</strong>
               {strength.example && (
                 <div className="essay-example">
                   Example: <em>"{strength.example}"</em>
                 </div>
               )}
             </li>
           ))}
         </ul>
       </div>
     )}
     
     {scoreResult.language.improvements && (
       <div className="essay-feedback-points">
         <h5>Areas for Improvement:</h5>
         <ul className="essay-points-list">
           {scoreResult.language.improvements.map((improvement, i) => (
             <li key={i}>
               <strong>{improvement.point}</strong>
               {improvement.instead && (
                 <div className="essay-instead">
                   Instead of: <em>"{improvement.instead}"</em>
                 </div>
               )}
               {improvement.better && (
                 <div className="essay-better">
                   Better: <em>"{improvement.better}"</em>
                 </div>
               )}
             </li>
           ))}
         </ul>
       </div>
     )}
     
     {/* Handle old format with points array */}
     {scoreResult.language.points && !scoreResult.language.strengths && (
       <div className="essay-feedback-points">
         <h5>Feedback Points:</h5>
         <ul className="essay-points-list">
           {scoreResult.language.points.map((point, i) => (
             <li key={i}>{point}</li>
           ))}
         </ul>
       </div>
     )}
   </div>
   
   {/* Coherence/Grammar Section */}
   <div className="essay-score-criterion">
     <div className="essay-criterion-header">
       <h4>{scoreResult.coherence.title || "Coherence & Grammar"}</h4>
       <span className="essay-criterion-weight">25%</span>
     </div>
     <p>{scoreResult.coherence.feedback}</p>
     {renderProgressBar(scoreResult.coherence.score, 10)}
     
     {scoreResult.coherence.strengths && (
       <div className="essay-feedback-points">
         <h5>Strengths:</h5>
         <ul className="essay-points-list">
           {scoreResult.coherence.strengths.map((strength, i) => (
             <li key={i}>
               <strong>{strength.point}</strong>
               {strength.example && (
                 <div className="essay-example">
                   Example: <em>"{strength.example}"</em>
                 </div>
               )}
             </li>
           ))}
         </ul>
       </div>
     )}
     
     {scoreResult.coherence.improvements && (
       <div className="essay-feedback-points">
         <h5>Areas for Improvement:</h5>
         <ul className="essay-points-list">
           {scoreResult.coherence.improvements.map((improvement, i) => (
             <li key={i}>
               <strong>{improvement.point}</strong>
               {improvement.instead && (
                 <div className="essay-instead">
                   Instead of: <em>"{improvement.instead}"</em>
                 </div>
               )}
               {improvement.better && (
                 <div className="essay-better">
                   Better: <em>"{improvement.better}"</em>
                 </div>
               )}
             </li>
           ))}
         </ul>
       </div>
     )}
     
     {/* Handle old format with points array */}
     {scoreResult.coherence.points && !scoreResult.coherence.strengths && (
       <div className="essay-feedback-points">
         <h5>Feedback Points:</h5>
         <ul className="essay-points-list">
           {scoreResult.coherence.points.map((point, i) => (
             <li key={i}>{point}</li>
           ))}
         </ul>
       </div>
     )}
   </div>
   
   {/* Recommendations Section - Only for new API format */}
   {scoreResult.recommendations && scoreResult.recommendations.length > 0 && (
     <div className="essay-recommendations">
       <h3>Key Recommendations</h3>
       <ul className="essay-recommendations-list">
         {scoreResult.recommendations.map((recommendation, i) => (
           <li key={i}>{recommendation}</li>
         ))}
       </ul>
     </div>
   )}
  </div>
  
  <div className="essay-feedback-actions">
    <button 
      className="essay-button essay-improve-button" 
      onClick={enableEditing}
    >
      <Edit size={16} />
      Try to Improve Your Score (New Attempt)
    </button>
  </div>
</div>
)}
 
{activeTab === 'history' && (
<div className="essay-history-container">
  <div className="essay-history-header">
    <h2><History size={20} /> Past Essays</h2>
    <p>Review your previous essay submissions and scores</p>
  </div>
  
  {pastEssays.length > 0 ? (
    <div className="essay-history-grid">
      {pastEssays.map((essay, index) => (
        <div key={index} className="essay-history-item">
          <div className="essay-history-topic">
            <h3>{essay.topic}</h3>
            <span className="essay-history-date">
              {new Date(essay.timestamp).toLocaleDateString()}
            </span>
          </div>
          <div className="essay-history-content">
            <p>{essay.text.substring(0, 200)}...</p>
          </div>
          <div className="essay-history-footer">
            <div className="essay-history-word-count">
              <FileText size={14} />
              <span>{countWords(essay.text)} words</span>
            </div>
            {essay.score && (
              <div className="essay-history-score">
                <Star size={14} />
                <span>Score: {essay.score}/100</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="essay-no-history">
      <AlertTriangle size={40} />
      <p>You haven't submitted any essays yet.</p>
      <button 
        className="essay-start-button"
        onClick={() => setActiveTab('write')}
      >
        <PenTool size={16} />
        Start Writing
      </button>
    </div>
  )}
</div>
)}
</div>
);
}