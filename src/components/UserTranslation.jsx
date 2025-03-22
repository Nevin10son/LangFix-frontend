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
  Info
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
  const [activeTab, setActiveTab] = useState("translation"); // translation, analysis, score

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

  const handleInputChange = (e) => {
    setTranslatedText(e.target.value);
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
      const response = await axios.post(
        "http://localhost:5000/submit-translation",
        {
          userId,
          translationId: textData._id,
          translatedText,
        },
        { headers: { token } }
      );

      setMessageType("success");
      setMessage(response.data.message);
      setAiAnalysis(null);
      setScoreAnalysis(null);
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
        setMessage("Translation analysis completed!");
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
        },
        { headers: { token } }
      );

      if (response.data.Status === "Success") {
        console.log("Score response:", response.data);
        setScoreAnalysis(response.data);
        setMessageType("success");
        setMessage("Translation scoring completed!");
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

  return (
    <div className="trans-container">
      <div className="trans-header">
        <div className="trans-header-left">
          <Globe className="trans-icon" />
          <h1>Translation Workshop</h1>
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
        {aiAnalysis && (
          <button 
            className={`trans-tab ${activeTab === 'analysis' ? 'trans-tab-active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            <Search size={16} />
            Analysis
          </button>
        )}
        {scoreAnalysis && (
          <button 
            className={`trans-tab ${activeTab === 'score' ? 'trans-tab-active' : ''}`}
            onClick={() => setActiveTab('score')}
          >
            <Star size={16} />
            Score
          </button>
        )}
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
                <span className="trans-panel-title">Your Translation</span>
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
                disabled={loading}
              />
            </div>

            <div className="trans-actions">
              <button 
                onClick={analyzeTranslation} 
                className={`trans-button trans-analyze-button ${analyzing ? 'trans-loading' : ''}`}
                disabled={analyzing || loading || scoring || !textData}
              >
                <Search size={16} />
                {analyzing ? 'Analyzing...' : 'Analyze Translation'}
              </button>
              
              <button 
                onClick={scoreTranslation} 
                className={`trans-button trans-score-button ${scoring ? 'trans-loading' : ''}`}
                disabled={scoring || loading || analyzing || !textData}
              >
                <Star size={16} />
                {scoring ? 'Scoring...' : 'Score Translation'}
              </button>
              
              <button 
                onClick={submitTranslation} 
                className={`trans-button trans-submit-button ${loading ? 'trans-loading' : ''}`}
                disabled={loading || analyzing || scoring || !textData}
              >
                <CheckCircle size={16} />
                {loading ? 'Submitting...' : 'Submit Translation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && aiAnalysis && (
        <div className="trans-analysis-container">
          <div className="trans-analysis-header">
            <h2><Search size={20} /> AI Analysis Results</h2>
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
        </div>
      )}

      {activeTab === 'score' && scoreAnalysis && (
        <div className="trans-score-container">
          <div className="trans-score-header">
            <h2><Star size={20} /> Translation Score</h2>
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
        </div>
      )}
    </div>
  );
};

export default TranslationTask;