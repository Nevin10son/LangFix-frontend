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
  CheckCircle
} from "lucide-react";
import "./RephraseSentence.css";

export default function RephraseSentence() {
  const [question, setQuestion] = useState(null);
  const [rephrasedText, setRephrasedText] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success, error, info
  const [grammarFeedback, setGrammarFeedback] = useState(null);
  const [vocabFeedback, setVocabFeedback] = useState(null);
  const [rephraseFeedback, setRephraseFeedback] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);
  const [showTips, setShowTips] = useState(false);
  const [activeTab, setActiveTab] = useState("write"); // write, grammar, vocabulary, score
  const [loading, setLoading] = useState({
    submit: false,
    vocab: false,
    grammar: false,
    score: false
  });
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
      const response = await axios.get("http://localhost:5000/random-rephrase", {
        headers: { token: sessionStorage.getItem("token") },
      });
      setQuestion(response.data);
      setRephrasedText("");
      setGrammarFeedback(null);
      setVocabFeedback(null);
      setRephraseFeedback(null);
      setScoreResult(null);
    } catch (error) {
      console.error("Error fetching rephrase question", error);
      showMessage("Failed to load question.", "error");
    }
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
      await axios.post(
        "http://localhost:5000/submit-rephrase",
        {
          userId: sessionStorage.getItem("userid"),
          rephraseId: question._id,
          rephrasedText,
        },
        { headers: { token: sessionStorage.getItem("token") } }
      );
      showMessage("Your rephrased text has been submitted successfully!", "success");
      fetchRandomRephrase();
    } catch (error) {
      console.error("Error submitting rephrased text", error);
      showMessage("Failed to submit.", "error");
    } finally {
      setLoading({...loading, submit: false});
    }
  };

  const enhanceVocabulary = async () => {
    if (!rephrasedText.trim()) {
      showMessage("Please enter your rephrased text to enhance vocabulary!", "error");
      return;
    }

    setLoading({...loading, vocab: true});

    try {
      const response = await axios.post(
        "http://localhost:5000/vocabulary/enhance",
        { text: rephrasedText },
        { headers: { token: sessionStorage.getItem("token") } }
      );
      if (response.data.Status === "Success") {
        setVocabFeedback(response.data.feedback);
        setActiveTab("vocabulary");
        showMessage("Vocabulary enhancement completed!", "success");
      } else {
        showMessage("Failed to enhance vocabulary: " + response.data.error, "error");
      }
    } catch (error) {
      console.error("Error enhancing vocabulary:", error);
      showMessage("Failed to enhance vocabulary with AI.", "error");
    } finally {
      setLoading({...loading, vocab: false});
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
      console.log("Raw API Response:", response.data);
      if (response.data.Status === "Success") {
        setRephraseFeedback(response.data);
        setActiveTab("grammar");
        showMessage("Rephrase analysis completed!", "success");
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
      const response = await axios.post(
        "http://localhost:5000/score-rephrase",
        { 
          originalText: question.text, 
          rephrasedText 
        },
        { headers: { token: sessionStorage.getItem("token") } }
      );
      
      console.log("Score Response:", response.data);
      
      if (response.data.Status === "Success") {
        setScoreResult(response.data.feedback);
        setActiveTab("score");
        showMessage("Scoring completed!", "success");
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

      <div className="rephrase-tabs">
        <button 
          className={`rephrase-tab ${activeTab === 'write' ? 'rephrase-tab-active' : ''}`}
          onClick={() => setActiveTab('write')}
        >
          <Send size={16} />
          Write
        </button>
        {rephraseFeedback && (
          <button 
            className={`rephrase-tab ${activeTab === 'grammar' ? 'rephrase-tab-active' : ''}`}
            onClick={() => setActiveTab('grammar')}
          >
            <Check size={16} />
            Grammar
          </button>
        )}
        {vocabFeedback && (
          <button 
            className={`rephrase-tab ${activeTab === 'vocabulary' ? 'rephrase-tab-active' : ''}`}
            onClick={() => setActiveTab('vocabulary')}
          >
            <Book size={16} />
            Vocabulary
          </button>
        )}
        {scoreResult && (
          <button 
            className={`rephrase-tab ${activeTab === 'score' ? 'rephrase-tab-active' : ''}`}
            onClick={() => setActiveTab('score')}
          >
            <Star size={16} />
            Score
          </button>
        )}
      </div>
      
      {message && (
        <div className={`message-banner message-${messageType}`}>
          <span>{message}</span>
          <button className="message-close" onClick={() => setMessage("")}>×</button>
        </div>
      )}

      <div className="rephrase-container">
        {question ? (
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
                    <h3>Your Rephrased Version</h3>
                  </div>
                  <div className="card-content">
                    <textarea
                      className="text-editor"
                      value={rephrasedText}
                      onChange={(e) => setRephrasedText(e.target.value)}
                      placeholder="Write your rephrased version here..."
                    />
                  </div>
                </div>

                <div className="action-buttons">
                  <button 
                    className="primary-button" 
                    onClick={submitRephrasedText}
                    disabled={loading.submit || !rephrasedText.trim()}
                  >
                    <Send size={18} />
                    {loading.submit ? "Submitting..." : "Submit"}
                  </button>
                  <button 
                    className="secondary-button" 
                    onClick={enhanceVocabulary}
                    disabled={loading.vocab || !rephrasedText.trim()}
                  >
                    <Book size={18} />
                    {loading.vocab ? "Enhancing..." : "Enhance Vocabulary"}
                  </button>
                  <button 
                    className="secondary-button" 
                    onClick={handleAnalyzeRephrase}
                    disabled={loading.grammar || !rephrasedText.trim()}
                  >
                    <Search size={18} />
                    {loading.grammar ? "Analyzing..." : "Analyze Grammar"}
                  </button>
                  <button 
                    className="secondary-button score-button" 
                    onClick={scoreRephrase}
                    disabled={loading.score || !rephrasedText.trim()}
                  >
                    <Star size={18} />
                    {loading.score ? "Scoring..." : "Score Rephrase"}
                  </button>
                </div>
              </div>
            )}

            {/* Grammar Analysis Tab */}
            {activeTab === 'grammar' && rephraseFeedback && (
              <div className="grammar-container">
                <div className="card feedback-card">
                  <div className="card-header feedback-header">
                    <h3><Check size={20} /> Grammar Analysis</h3>
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
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vocabulary Tab */}
            {activeTab === 'vocabulary' && vocabFeedback && (
              <div className="vocabulary-container">
                <div className="card feedback-card">
                  <div className="card-header feedback-header">
                    <h3><Book size={20} /> Vocabulary Enhancement</h3>
                    <p>Suggestions for improving word choice and language variety</p>
                  </div>
                  
                  <div className="card-content">
                    {vocabFeedback.map((item, index) => (
                      <div key={index} className="vocab-item">
                        <div className="vocab-original">
                          <span className="vocab-label">Original:</span>
                          <p>{item.original}</p>
                        </div>
                        <div className="vocab-enhanced">
                          <span className="vocab-label">Enhanced:</span>
                          <p>{item.enhanced}</p>
                        </div>
                        
                        <div className="vocab-details">
                          <div className="vocab-replaced">
                            <span className="vocab-label">Replaced Words:</span>
                            {item.replaced === "No enhancement needed" || item.replaced === "No enhancement or correction needed" ? (
                              <div className="no-issues">
                                <CheckCircle size={16} />
                                <span>No enhancement needed</span>
                              </div>
                            ) : (
                              <ul className="replaced-list">
                                {item.replaced.split(", ").map((replacement, i) => (
                                  <li key={i}>{replacement}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          
                          <div className="vocab-meanings">
                            <span className="vocab-label">Word Meanings:</span>
                            {item.meanings === "No enhancement needed" || item.meanings === "No enhancement or correction needed" ? (
                              <div className="no-issues">
                                <CheckCircle size={16} />
                                <span>No enhancement needed</span>
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
                  </div>
                </div>
              </div>
            )}

            {/* Score Tab */}
            {activeTab === 'score' && scoreResult && (
              <div className="score-container">
                <div className="card feedback-card">
                  <div className="card-header feedback-header">
                    <h3><Star size={20} /> Rephrase Score</h3>
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
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading question...</p>
          </div>
        )}
      </div>
    </div>
  );
}