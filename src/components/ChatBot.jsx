import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaUser, FaPaperPlane, FaTrash, FaArrowLeft, FaLightbulb } from 'react-icons/fa';
import './ChatBot.css';

// Helper function to convert markdown to HTML with table support
const convertMarkdownToHTML = (markdown) => {
  if (!markdown) return '';
  
  let html = markdown
    // Process tables before other elements
    .replace(/\|(.+)\|\n\|([-:]+\|)+\n((\|.+\|\n)+)/g, (match) => {
      // Extract header and rows
      const lines = match.split('\n').filter(line => line.trim());
      
      if (lines.length < 3) return match; // Not enough lines for a table
      
      const headerRow = lines[0];
      const alignmentRow = lines[1];
      const dataRows = lines.slice(2);
      
      // Process header
      const headerCells = headerRow
        .split('|')
        .filter(cell => cell.trim())
        .map(cell => `<th>${cell.trim()}</th>`)
        .join('');
      
      // Process data rows
      const bodyRows = dataRows
        .map(row => {
          const cells = row
            .split('|')
            .filter(cell => cell.trim())
            .map(cell => `<td>${cell.trim()}</td>`)
            .join('');
          return `<tr>${cells}</tr>`;
        })
        .join('');
      
      return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    })
    // Process headers
    .replace(/## (.*?)\n/g, '<h2>$1</h2>\n')
    .replace(/### (.*?)\n/g, '<h3>$1</h3>\n')
    // Process bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Process lists
    .replace(/^\* (.*?)$/gm, '<li>$1</li>')
    // Wrap list items in ul
    .replace(/(<li>.*?<\/li>)\n(<li>)/g, '$1$2')
    .replace(/(<li>.*?<\/li>)(?!\n<li>)/g, '<ul>$1</ul>')
    // Process paragraphs
    .replace(/^([^<\n].*?)$/gm, '<p>$1</p>')
    // Fix double wrapping
    .replace(/<p><(h[23]|ul|table)>/g, '<$1>')
    .replace(/<\/(h[23]|ul|table)><\/p>/g, '</$1>')
    // Process line breaks
    .replace(/\n\n/g, '<br/>')
    .replace(/\n/g, ' ');
  
  return html;
};

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your English learning assistant. Ask me anything about English grammar, vocabulary, pronunciation, or usage!",
      fromUser: false,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Get userId from sessionStorage
  const getUserId = () => {
    const userId = sessionStorage.getItem('userid');
    if (!userId) {
      console.error("No userId found in sessionStorage");
    }
    return userId;
  };

  // Example suggestions for users
  const suggestions = [
    "What's the difference between 'affect' and 'effect'?",
    "How do I use the present perfect tense?",
    "Can you explain conditional sentences?",
    "What are some common English idioms?",
    "How to use articles (a, an, the) correctly?",
    "What's the difference between 'who' and 'whom'?",
  ];

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when component mounts
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        setIsHistoryLoaded(true);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/chat/history/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.status}`);
      }
      
      const chatHistory = await response.json();
      
      if (chatHistory.length > 0) {
        // Convert chat history to message format
        const historyMessages = [];
        
        // Add welcome message first
        historyMessages.push({
          text: "Hello! I'm your English learning assistant. Ask me anything about English grammar, vocabulary, pronunciation, or usage!",
          fromUser: false,
        });
        
        // Add each Q&A pair from history
        chatHistory.forEach(entry => {
          historyMessages.push({
            text: entry.question,
            fromUser: true,
            timestamp: entry.timestamp
          });
          
          historyMessages.push({
            text: entry.answer,
            fromUser: false,
            timestamp: entry.timestamp
          });
        });
        
        setMessages(historyMessages);
      }
      
      setIsHistoryLoaded(true);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setIsHistoryLoaded(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage = { text: inputMessage, fromUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Get userId from sessionStorage
      const userId = getUserId();
      if (!userId) {
        throw new Error("No userId found in sessionStorage");
      }
      
      // Call the backend API with user ID
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.text,
          userId: userId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Small delay to make the bot seem more natural
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: data.response, fromUser: false },
        ]);
        setIsLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "I'm having trouble connecting right now. Please try again later.",
          fromUser: false,
        },
      ]);
      setIsLoading(false);
    }
  };

  // Handle clicking on a suggestion
  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    inputRef.current.focus();
  };

  // Clear the chat history
  const clearChatHistory = () => {
    // Reset to just the welcome message
    setMessages([
      {
        text: "Hello! I'm your English learning assistant. Ask me anything about English grammar, vocabulary, pronunciation, or usage!",
        fromUser: false,
      }
    ]);
    
    // Could also add an API endpoint to clear history in the database
  };

  // Toggle suggestions visibility
  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  // Navigate back to dashboard
  const navigateBack = () => {
    window.history.back();
  };

  return (
    <div className="chatbot-layout">
      <div className="chatbot-wrapper">
        <div className="chatbot-container" ref={chatContainerRef}>
          {/* Header with improved navigation and controls */}
          <div className="chatbot-header">
            <div className="header-left">
              <button 
                className="back-button" 
                onClick={navigateBack}
                title="Return to Dashboard"
              >
                <FaArrowLeft />
              </button>
              <div className="chatbot-logo">
                <FaRobot />
              </div>
              <div className="header-title">
                <h2>English Learning Assistant</h2>
                <p>Improve your English skills through conversation</p>
              </div>
            </div>
            <div className="header-actions">
              <button 
                className="suggestion-toggle" 
                onClick={toggleSuggestions}
                title={showSuggestions ? "Hide suggestions" : "Show suggestions"}
              >
                <FaLightbulb />
              </button>
              <button 
                className="clear-chat-button" 
                onClick={clearChatHistory} 
                title="Clear chat history"
              >
                <FaTrash />
              </button>
            </div>
          </div>

          {/* Main chat area with improved message styling */}
          <div className="messages-container">
            {!isHistoryLoaded ? (
              <div className="loading-history">
                <div className="loading-spinner"></div>
                <p>Loading your conversation history...</p>
              </div>
            ) : (
              <>
                <div className="messages-date-divider">
                  <span>Today</span>
                </div>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${message.fromUser ? 'user-message' : 'bot-message'}`}
                  >
                    <div className="message-avatar">
                      {message.fromUser ? <FaUser /> : <FaRobot />}
                    </div>
                    <div className="message-content">
                      <div className="message-text">
                        {message.fromUser ? (
                          message.text
                        ) : (
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: convertMarkdownToHTML(message.text) 
                            }} 
                          />
                        )}
                      </div>
                      <div className="message-time">
                        {message.timestamp 
                          ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {isLoading && (
              <div className="message bot-message">
                <div className="message-avatar">
                  <FaRobot />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Collapsible suggestions panel */}
          {showSuggestions && (
            <div className="suggestions-panel">
              <h3><FaLightbulb /> Suggested Questions</h3>
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-button"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Improved input area */}
          <form className="input-container" onSubmit={handleSendMessage}>
            <input
              type="text"
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question about English..."
              className="message-input"
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={!inputMessage.trim() || isLoading}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;