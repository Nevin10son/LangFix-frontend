import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Book, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  Award,
  Feather,
  Target,
  ArrowUp,
  Bookmark,
  Settings,
  User,
  Moon,
  Sun
} from "lucide-react";
import "./Diary.css";

const Diary = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [entry, setEntry] = useState({
    gratitude: "",
    goals: "",
    improvement: "",
    narrative: "",
  });
  const [prompts, setPrompts] = useState([]);
  const [promptResponses, setPromptResponses] = useState({});
  const [message, setMessage] = useState("");
  const [analysisVisible, setAnalysisVisible] = useState({});
  const [grammarFeedback, setGrammarFeedback] = useState({});
  const [vocabFeedback, setVocabFeedback] = useState({});
  const [scoreFeedback, setScoreFeedback] = useState({});
  const [completedDates, setCompletedDates] = useState([]);
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const token = sessionStorage.getItem("token");

  // Available fonts
  const fontOptions = [
    "Inter", 
    "Roboto", 
    "Montserrat", 
    "Playfair Display", 
    "Lora",
    "Open Sans",
    "Source Serif Pro",
    "Merriweather"
  ];

  useEffect(() => {
    verifyToken();
    fetchDiaryEntry(selectedDate);
    fetchCompletedDates();
    
    // Check user's preferred color scheme
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);
    
    // Apply theme to body
    document.body.className = prefersDark ? "dark-theme" : "";
  }, []);
  
  useEffect(() => {
    fetchDiaryEntry(selectedDate);
  }, [selectedDate]);

  const verifyToken = () => {
    if (!token) {
      alert("Unauthorized! Please log in.");
      navigate("/login");
      return;
    }
    axios.defaults.headers.common["token"] = token;
  };

  const fetchCompletedDates = async () => {
    const userid = sessionStorage.getItem("userid");
    
    if (!userid || !token) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/diary/completed-dates/${userid}`, {
        headers: { token },
      });
      
      if (response.data.Status === "Success") {
        setCompletedDates(response.data.dates);
      }
    } catch (error) {
      console.error("Error fetching completed dates", error);
    }
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const dayOfWeek = firstDay.getDay();
    
    // Add previous month days
    for (let i = dayOfWeek; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dateString: prevDate.toISOString().split("T")[0]
      });
    }
    
    // Add current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        dateString: currentDate.toISOString().split("T")[0]
      });
    }
    
    // Add next month days to complete the row
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const nextDate = new Date(year, month + 1, i);
        days.push({
          date: nextDate,
          isCurrentMonth: false,
          dateString: nextDate.toISOString().split("T")[0]
        });
      }
    }
    
    // Group days into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return weeks;
  };

  const changeMonth = (increment) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
  };

  const fetchDiaryEntry = async (date) => {
    const userid = sessionStorage.getItem("userid");

    if (!userid || !token) {
      alert("Unauthorized! Please log in.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/diary/${userid}/${date}`, {
        headers: { token },
      });

      if (response.data.Status === "No Entry Found") {
        setEntry({ gratitude: "", goals: "", improvement: "", narrative: "" });
        setGrammarFeedback({});
        setVocabFeedback({});
        setScoreFeedback({});
        fetchRandomPrompts();
      } else {
        setEntry(response.data);

        const savedPrompts = response.data.prompts || [];
        setPrompts(savedPrompts);

        const formattedResponses = {};
        savedPrompts.forEach((p) => {
          formattedResponses[p.promptId || p._id] = p.response || "";
        });
        setPromptResponses(formattedResponses);

        // Clear feedback for a new entry
        setGrammarFeedback({});
        setVocabFeedback({});
        setScoreFeedback({});
        setAnalysisVisible({});
      }
    } catch (error) {
      console.error("Error fetching diary entry", error);
    }
  };

  const fetchRandomPrompts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/diary/random-prompts", {
        headers: { token },
      });

      if (response.data.status === "Success") {
        setPrompts(response.data.prompts);

        const initialResponses = {};
        response.data.prompts.forEach((prompt) => {
          initialResponses[prompt._id] = "";
        });
        setPromptResponses(initialResponses);
      } else {
        setMessage("⚠️ No prompts available.");
      }
    } catch (error) {
      console.error("Error fetching prompts:", error);
      setMessage("❌ Failed to load prompts.");
    }
  };

  const handlePromptChange = (promptId, text) => {
    setPromptResponses((prev) => ({ ...prev, [promptId]: text }));
  };

  const handleChange = (e) => {
    setEntry({ ...entry, [e.target.name]: e.target.value });
  };

  const submitDiary = async () => {
    if (selectedDate > today) {
      setMessage("⚠️ Future diary entries are not allowed!");
      return;
    }

    const userid = sessionStorage.getItem("userid");
    if (!userid || !token) {
      alert("Unauthorized! Please log in.");
      navigate("/login");
      return;
    }

    try {
      const formattedPrompts = prompts.map((prompt) => ({
        promptId: prompt.promptId || prompt._id,
        response: promptResponses[prompt.promptId || prompt._id] || "",
      }));

      const response = await axios.post(
        "http://localhost:5000/diary",
        {
          userid,
          date: selectedDate,
          prompts: formattedPrompts,
          ...entry,
        },
        {
          headers: { token },
        }
      );

      setMessage("✅ " + response.data.Status);
      setTimeout(() => setMessage(""), 3000);
      
      // Refresh completed dates
      fetchCompletedDates();
    } catch (error) {
      console.error("Error saving diary entry", error);
      setMessage("❌ Failed to save diary entry.");
    }
  };

  const toggleAnalysis = (sectionId) => {
    setAnalysisVisible(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const analyzeText = async (text, type, section, sectionId, prompt = "") => {
    if (!text.trim()) {
      setMessage(`⚠️ Please write something in ${section} before analysis!`);
      return;
    }
    
    try {
      setMessage(`🔍 Analyzing ${section}...`);
      
      const apiUrl =
        type === "grammar"
          ? "http://localhost:5000/diary/grammar-check"
          : "http://localhost:5000/vocabulary/enhance";

      const response = await axios.post(
        apiUrl,
        { text, section, prompt },
        { headers: { token } }
      );

      if (response.data.Status === "Success") {
        if (type === "grammar") {
          setGrammarFeedback(prevState => ({
            ...prevState,
            [sectionId]: response.data.feedback
          }));
        } else {
          setVocabFeedback(prevState => ({
            ...prevState,
            [sectionId]: response.data.feedback
          }));
        }
        
        // Make analysis visible
        setAnalysisVisible(prev => ({
          ...prev,
          [sectionId]: true
        }));
        
        setMessage(`✅ ${type === "grammar" ? "Grammar" : "Vocabulary"} analysis completed for ${section}!`);
      } else {
        setMessage(`❌ Failed to analyze ${type}: ${response.data.message || response.data.error}`);
      }
    } catch (error) {
      console.error(`Error analyzing ${type}:`, error);
      setMessage(`❌ Failed to analyze ${type}.`);
    }
  };

  const scoreText = async (text, section, sectionId, prompt = "") => {
    if (!text.trim()) {
      setMessage(`⚠️ Please write something in ${section} before scoring!`);
      return;
    }
    
    try {
      setMessage(`🔍 Scoring ${section}...`);
      
      const response = await axios.post(
        "http://localhost:5000/diary/score",
        { text, section, prompt },
        { headers: { token } }
      );

      if (response.data.Status === "Success") {
        setScoreFeedback(prevState => ({
          ...prevState,
          [sectionId]: response.data.score
        }));
        
        // Make analysis visible
        setAnalysisVisible(prev => ({
          ...prev,
          [sectionId]: true
        }));
        
        setMessage(`✅ Scoring completed for ${section}!`);
      } else {
        setMessage(`❌ Failed to score ${section}: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error scoring text:", error);
      setMessage("❌ Failed to score text.");
    }
  };

  const renderGrammarFeedback = (feedback) => {
    if (!feedback || !Array.isArray(feedback) || feedback.length === 0) return null;
    
    return (
      <div className="journal-feedback-card journal-grammar-card">
        <div className="journal-feedback-header">
          <h4>Grammar Analysis</h4>
        </div>
        {feedback.map((item, idx) => (
          <div key={idx} className="journal-feedback-item">
            <div className="journal-feedback-original">
              <strong>Original:</strong> {item.original}
            </div>
            <div className="journal-feedback-corrected">
              <strong>Corrected:</strong> {item.corrected}
            </div>
            <div className="journal-feedback-issues">
              <strong>Issues:</strong>
              <ul>
                {item.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderVocabFeedback = (feedback) => {
    if (!feedback || !Array.isArray(feedback) || feedback.length === 0) return null;
    
    return (
      <div className="journal-feedback-card journal-vocab-card">
        <div className="journal-feedback-header">
          <h4>Vocabulary Enhancement</h4>
        </div>
        {feedback.map((item, idx) => {
          const replacedItems = item.replaced.split(', ').map(item => item.trim());
          const meaningItems = item.meanings.split(', ').map(item => item.trim());
          
          return (
            <div key={idx} className="journal-feedback-item">
              <div className="journal-feedback-original">
                <strong>Original:</strong> {item.original}
              </div>
              <div className="journal-feedback-enhanced">
                <strong>Enhanced:</strong> {item.enhanced}
              </div>
              <div className="journal-feedback-details">
                <div className="journal-feedback-column">
                  <strong>Replaced:</strong>
                  <ul>
                    {replacedItems.map((replaced, i) => (
                      <li key={i}>{replaced}</li>
                    ))}
                  </ul>
                </div>
                <div className="journal-feedback-column">
                  <strong>Meanings:</strong>
                  <ul>
                    {meaningItems.map((meaning, i) => (
                      <li key={i}>{meaning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderScoreFeedback = (feedback) => {
    if (!feedback) return null;
    
    // Create color based on score
    const getScoreColor = (score) => {
      if (score >= 45) return '#4CAF50'; // Green for high scores
      if (score >= 35) return '#8BC34A'; // Light green
      if (score >= 25) return '#CDDC39'; // Lime
      if (score >= 15) return '#FFC107'; // Amber
      return '#F44336'; // Red for low scores
    };
    
    const scoreColor = getScoreColor(feedback.total);
    
    return (
      <div className="journal-feedback-card journal-score-card">
        <div className="journal-feedback-header">
          <h4>Writing Score</h4>
        </div>
        <div className="journal-score-overview">
          <div 
            className="journal-score-circle" 
            style={{ 
              background: `conic-gradient(${scoreColor} ${feedback.total * 3.6}deg, #e0e0e0 ${feedback.total * 3.6}deg 360deg)` 
            }}
          >
            <span className="journal-score-number">{feedback.total}</span>
          </div>
          <div className="journal-score-label">out of 50</div>
        </div>
        
        <div className="journal-score-details">
          {feedback.details.map((detail, idx) => (
            <div key={idx} className="journal-score-category">
              <div className="journal-score-category-header">
                <h5>{detail.name}</h5>
                <span className="journal-score-value">{detail.score}/10</span>
              </div>
              <div className="journal-score-bar-container">
                <div 
                  className="journal-score-bar" 
                  style={{ width: `${detail.score * 10}%`, background: getScoreColor(detail.score * 5) }}
                ></div>
              </div>
              <div className="journal-score-reason">
                {detail.reason}
              </div>
              <div className="journal-score-evaluation">
                <strong>Details:</strong>
                <ul>
                  {Object.entries(detail.evaluation).map(([key, value], i) => (
                    <li key={i}>{`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const isDateCompleted = (dateString) => {
    return completedDates.includes(dateString);
  };

  const getMonthName = (date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    document.body.className = !isDarkMode ? "dark-theme" : "";
  };

  const calendarWeeks = getCalendarDays();
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className={`journal-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="journal-sidebar">
        <div className="journal-brand">
          <Book size={24} />
          <h2>Journal</h2>
        </div>
        
        <div className="journal-date-display">
          <h3>{new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" })}</h3>
          <p>{new Date(selectedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
        
        <div className="journal-calendar-toggle" onClick={() => setCalendarVisible(!calendarVisible)}>
          <Calendar size={18} />
          <span>Select Date</span>
        </div>
        
        {calendarVisible && (
          <div className="journal-calendar">
            <div className="journal-calendar-header">
              <button onClick={() => changeMonth(-1)} className="journal-calendar-nav">
                <ChevronLeft size={16} />
              </button>
              <h4>{getMonthName(currentMonth)}</h4>
              <button onClick={() => changeMonth(1)} className="journal-calendar-nav">
                <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="journal-calendar-grid">
              <div className="journal-calendar-weekdays">
                {weekDays.map(day => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              
              {calendarWeeks.map((week, weekIndex) => (
                <div key={weekIndex} className="journal-calendar-week">
                  {week.map((day, dayIndex) => {
                    const isToday = day.dateString === today;
                    const isSelected = day.dateString === selectedDate;
                    const isCompleted = isDateCompleted(day.dateString);
                    
                    return (
                      <div 
                        key={dayIndex}
                        className={`journal-calendar-day 
                          ${!day.isCurrentMonth ? 'journal-calendar-inactive' : ''} 
                          ${isToday ? 'journal-calendar-today' : ''} 
                          ${isSelected ? 'journal-calendar-selected' : ''}
                          ${isCompleted ? 'journal-calendar-completed' : ''}`}
                        onClick={() => {
                          if (day.date <= new Date(today)) {
                            setSelectedDate(day.dateString);
                            setCalendarVisible(false);
                          }
                        }}
                      >
                        {day.date.getDate()}
                        {isCompleted && <CheckCircle className="journal-completed-icon" size={10} />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="journal-font-selector">
          <label htmlFor="font-select">Font Style</label>
          <select 
            id="font-select" 
            value={selectedFont} 
            onChange={(e) => setSelectedFont(e.target.value)}
          >
            {fontOptions.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>
        
        <div className="journal-theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </div>
        
        <button className="journal-home-button" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
      
      <div className="journal-content">
        {message && (
          <div className="journal-message">
            {message}
          </div>
        )}
        
        <div className="journal-sections">
          {/* Daily Prompts Section */}
          <div className="journal-section-header">
            <h3><Feather size={20} /> Daily Prompts</h3>
          </div>
          
          {prompts.map((prompt) => {
            const promptId = prompt.promptId || prompt._id;
            const sectionId = `prompt_${promptId}`;
            
            return (
              <div key={promptId} className="journal-card">
                <div className="journal-prompt">
                  <Bookmark size={16} className="journal-icon" />
                  <p>{prompt.question}</p>
                </div>
                
                <textarea
                  className="journal-textarea"
                  value={promptResponses[promptId] || ""}
                  onChange={(e) => handlePromptChange(promptId, e.target.value)}
                  placeholder="Write your response..."
                  style={{ fontFamily: selectedFont }}
                  spellCheck="false"
                ></textarea>
                
                <div className="journal-actions">
                  <div className="journal-buttons">
                    <button 
                      className="journal-button journal-grammar-button"
                      onClick={() => analyzeText(promptResponses[promptId], "grammar", "Prompt", sectionId, prompt.question)}
                    >
                      Analyze Grammar
                    </button>
                    <button 
                      className="journal-button journal-vocab-button"
                      onClick={() => analyzeText(promptResponses[promptId], "vocabulary", "Prompt", sectionId)}
                    >
                      Enhance Vocabulary
                    </button>
                    <button 
                      className="journal-button journal-score-button"
                      onClick={() => scoreText(promptResponses[promptId], "Prompt", sectionId, prompt.question)}
                    >
                      Score Writing
                    </button>
                  </div>
                  
                  {(grammarFeedback[sectionId] || vocabFeedback[sectionId] || scoreFeedback[sectionId]) && (
                    <button 
                      className="journal-toggle-analysis"
                      onClick={() => toggleAnalysis(sectionId)}
                    >
                      {analysisVisible[sectionId] ? 'Hide Analysis' : 'Show Analysis'}
                      <ArrowUp className={`journal-toggle-icon ${analysisVisible[sectionId] ? 'journal-toggle-rotated' : ''}`} size={16} />
                    </button>
                  )}
                </div>
                
                {analysisVisible[sectionId] && (
                  <div className="journal-analysis">
                    {renderGrammarFeedback(grammarFeedback[sectionId])}
                    {renderVocabFeedback(vocabFeedback[sectionId])}
                    {renderScoreFeedback(scoreFeedback[sectionId])}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Main diary sections */}
          <div className="journal-section-header">
            <h3><Book size={20} /> Diary Entries</h3>
          </div>
          
          <div className="journal-grid">
            {/* Gratitude section */}
            <div className="journal-card">
              <div className="journal-card-header">
                <h4><Award size={16} className="journal-icon" /> Gratitude</h4>
              </div>
              
              <textarea 
                className="journal-textarea" 
                name="gratitude" 
                value={entry.gratitude} 
                onChange={handleChange} 
                placeholder="What are you grateful for today?" 
                style={{ fontFamily: selectedFont }}
                spellCheck="false"
              ></textarea>
              
              <div className="journal-actions">
                <div className="journal-buttons">
                  <button 
                    className="journal-button journal-grammar-button"
                    onClick={() => analyzeText(entry.gratitude, "grammar", "Gratitude", "gratitude")}
                  >
                    Analyze Grammar
                  </button>
                  <button 
                    className="journal-button journal-vocab-button"
                    onClick={() => analyzeText(entry.gratitude, "vocabulary", "Gratitude", "gratitude")}
                  >
                    Enhance Vocabulary
                  </button>
                  <button 
                    className="journal-button journal-score-button"
                    onClick={() => scoreText(entry.gratitude, "Gratitude", "gratitude")}
                  >
                    Score Writing
                  </button>
                </div>
                
                {(grammarFeedback.gratitude || vocabFeedback.gratitude || scoreFeedback.gratitude) && (
                  <button 
                    className="journal-toggle-analysis"
                    onClick={() => toggleAnalysis("gratitude")}
                  >
                    {analysisVisible.gratitude ? 'Hide Analysis' : 'Show Analysis'}
                    <ArrowUp className={`journal-toggle-icon ${analysisVisible.gratitude ? 'journal-toggle-rotated' : ''}`} size={16} />
                  </button>
                )}
              </div>
              
              {analysisVisible.gratitude && (
                <div className="journal-analysis">
                  {renderGrammarFeedback(grammarFeedback.gratitude)}
                  {renderVocabFeedback(vocabFeedback.gratitude)}
                  {renderScoreFeedback(scoreFeedback.gratitude)}
                </div>
              )}
            </div>
            
            {/* Improvement section */}
            <div className="journal-card">
              <div className="journal-card-header">
                <h4><Target size={16} className="journal-icon" /> Improvement</h4>
              </div>
              
              <textarea 
                className="journal-textarea" 
                name="improvement" 
                value={entry.improvement} 
                onChange={handleChange} 
                placeholder="What would you like to improve?" 
                style={{ fontFamily: selectedFont }}
                spellCheck="false"
              ></textarea>
              
              <div className="journal-actions">
                <div className="journal-buttons">
                  <button 
                    className="journal-button journal-grammar-button"
                    onClick={() => analyzeText(entry.improvement, "grammar", "Improvement", "improvement")}
                  >
                    Analyze Grammar
                  </button>
                  <button 
                    className="journal-button journal-vocab-button"
                    onClick={() => analyzeText(entry.improvement, "vocabulary", "Improvement", "improvement")}
                  >
                    Enhance Vocabulary
                  </button>
                  <button 
                    className="journal-button journal-score-button"
                    onClick={() => scoreText(entry.improvement, "Improvement", "improvement")}
                  >
                    Score Writing
                  </button>
                </div>
                
                {(grammarFeedback.improvement || vocabFeedback.improvement || scoreFeedback.improvement) && (
                  <button 
                    className="journal-toggle-analysis"
                    onClick={() => toggleAnalysis("improvement")}
                  >
                    {analysisVisible.improvement ? 'Hide Analysis' : 'Show Analysis'}
                    <ArrowUp className={`journal-toggle-icon ${analysisVisible.improvement ? 'journal-toggle-rotated' : ''}`} size={16} />
                  </button>
                )}
              </div>
              
              {analysisVisible.improvement && (
                <div className="journal-analysis">
                  {renderGrammarFeedback(grammarFeedback.improvement)}
                  {renderVocabFeedback(vocabFeedback.improvement)}
                  {renderScoreFeedback(scoreFeedback.improvement)}
                </div>
              )}
            </div>
            
            {/* Goals section */}
            <div className="journal-card">
              <div className="journal-card-header">
                <h4><Target size={16} className="journal-icon" /> Goals</h4>
              </div>
              
              <textarea 
                className="journal-textarea" 
                name="goals" 
                value={entry.goals} 
                onChange={handleChange} 
                placeholder="What are your goals for tomorrow?" 
                style={{ fontFamily: selectedFont }}
                spellCheck="false"
              ></textarea>
              
              <div className="journal-actions">
                <div className="journal-buttons">
                  <button 
                    className="journal-button journal-grammar-button"
                    onClick={() => analyzeText(entry.goals, "grammar", "Goals", "goals")}
                  >
                    Analyze Grammar
                  </button>
                  <button 
                    className="journal-button journal-vocab-button"
                    onClick={() => analyzeText(entry.goals, "vocabulary", "Goals", "goals")}
                  >
                    Enhance Vocabulary
                  </button>
                  <button 
                    className="journal-button journal-score-button"
                    onClick={() => scoreText(entry.goals, "Goals", "goals")}
                  >
                    Score Writing
                  </button>
                </div>
                
                {(grammarFeedback.goals || vocabFeedback.goals || scoreFeedback.goals) && (
                  <button 
                    className="journal-toggle-analysis"
                    onClick={() => toggleAnalysis("goals")}
                  >
                    {analysisVisible.goals ? 'Hide Analysis' : 'Show Analysis'}
                    <ArrowUp className={`journal-toggle-icon ${analysisVisible.goals ? 'journal-toggle-rotated' : ''}`} size={16} />
                  </button>
                )}
              </div>
              
              {analysisVisible.goals && (
                <div className="journal-analysis">
                  {renderGrammarFeedback(grammarFeedback.goals)}
                  {renderVocabFeedback(vocabFeedback.goals)}
                  {renderScoreFeedback(scoreFeedback.goals)}
                </div>
              )}
            </div>
            
            {/* Narrative section */}
            <div className="journal-card">
              <div className="journal-card-header">
                <h4><Feather size={16} className="journal-icon" /> Narrative</h4>
              </div>
              
              <textarea 
                className="journal-textarea" 
                name="narrative" 
                value={entry.narrative} 
                onChange={handleChange} 
                placeholder="Write about your day..." 
                style={{ fontFamily: selectedFont }}
                spellCheck="false"
              ></textarea>
              
              <div className="journal-actions">
                <div className="journal-buttons">
                  <button 
                    className="journal-button journal-grammar-button"
                    onClick={() => analyzeText(entry.narrative, "grammar", "Narrative", "narrative")}
                  >
                    Analyze Grammar
                  </button>
                  <button 
                    className="journal-button journal-vocab-button"
                    onClick={() => analyzeText(entry.narrative, "vocabulary", "Narrative", "narrative")}
                  >
                    Enhance Vocabulary
                  </button>
                  <button 
                    className="journal-button journal-score-button"
                    onClick={() => scoreText(entry.narrative, "Narrative", "narrative")}
                  >
                    Score Writing
                  </button>
                </div>
                
                {(grammarFeedback.narrative || vocabFeedback.narrative || scoreFeedback.narrative) && (
                  <button 
                    className="journal-toggle-analysis"
                    onClick={() => toggleAnalysis("narrative")}
                  >
                    {analysisVisible.narrative ? 'Hide Analysis' : 'Show Analysis'}
                    <ArrowUp className={`journal-toggle-icon ${analysisVisible.narrative ? 'journal-toggle-rotated' : ''}`} size={16} />
                  </button>
                )}
              </div>
              
              {analysisVisible.narrative && (
                <div className="journal-analysis">
                  {renderGrammarFeedback(grammarFeedback.narrative)}
                  {renderVocabFeedback(vocabFeedback.narrative)}
                  {renderScoreFeedback(scoreFeedback.narrative)}
                </div>
              )}
            </div>
          </div>
          
          <button className="journal-save-button" onClick={submitDiary}>
            Save Journal Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default Diary;