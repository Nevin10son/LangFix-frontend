import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ErrorCorrection.css";

export default function ErrorCorrection() {
  const [sentence, setSentence] = useState(null);
  const [correctedSentence, setCorrectedSentence] = useState("");
  const [errorDescription, setErrorDescription] = useState(""); // New state for error description
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(null); // State for score
  const [aiFeedback, setAiFeedback] = useState([]); // State for AI feedback
  const navigate = useNavigate();

  useEffect(() => {
    verifyToken();
    fetchRandomSentence();
  }, []);

  // ✅ Verify token and set authorization
  const verifyToken = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Unauthorized! Please log in.");
      navigate("/login");
      return;
    }
    axios.defaults.headers.common["token"] = token;
  };

  // ✅ Fetch a random error-filled sentence
  const fetchRandomSentence = async () => {
    try {
      const response = await axios.get("http://localhost:5000/random-error-sentence", {
        headers: { token: sessionStorage.getItem("token") },
      });
      setSentence(response.data);
      setCorrectedSentence("");
      setErrorDescription("");
      setScore(null);
      setAiFeedback([]);
    } catch (error) {
      console.error("Error fetching sentence", error);
      setMessage("Failed to load sentence.");
    }
  };

  // ✅ Submit the user's corrected sentence
  const submitCorrection = async () => {
    if (!correctedSentence.trim() || !errorDescription.trim()) {
      setMessage("Please enter both your corrected sentence and error description!");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/submit-error-correction",
        {
          userId: sessionStorage.getItem("userid"),
          errorSentenceId: sentence._id,
          errorDescription,
          correctedText: correctedSentence,
        },
        { headers: { token: sessionStorage.getItem("token") } }
      );
      setMessage("Your correction has been submitted!");
      setCorrectedSentence("");
      setErrorDescription("");
      setScore(null);
      setAiFeedback([]);
      fetchRandomSentence();
    } catch (error) {
      console.error("Error submitting correction", error);
      setMessage("Failed to submit.");
    }
  };

  // ✅ Analyze the user's answer with AI
  const analyzeAnswer = async () => {
    if (!correctedSentence.trim() || !errorDescription.trim()) {
      setMessage("Please enter both your corrected sentence and error description to analyze!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/analyze-error-correction",
        {
          errorSentenceId: sentence._id,
          errorDescription,
          correctedText: correctedSentence,
        },
        { headers: { token: sessionStorage.getItem("token") } }
      );
      if (response.data.Status === "Success") {
        setScore(response.data.score);
        setAiFeedback(response.data.feedback);
        setMessage("Answer analysis completed!");
      } else {
        setMessage("Failed to analyze: " + response.data.error);
      }
    } catch (error) {
      console.error("Error analyzing answer:", error);
      setMessage("Failed to analyze answer with AI.");
    }
  };

  return (
    <div className="error-correction-container">
      <h1 className="title">Find & Fix the Error</h1>

      {sentence ? (
        <>
          <p className="sentence">❌ {sentence.sentence}</p>

          <textarea
            className="text-editor"
            value={errorDescription}
            onChange={(e) => setErrorDescription(e.target.value)}
            placeholder="Describe the grammar mistake(s) here..."
          />

          <textarea
            className="text-editor"
            value={correctedSentence}
            onChange={(e) => setCorrectedSentence(e.target.value)}
            placeholder="Write the corrected version here..."
          />

          <div className="button-container">
            <button className="submit-button" onClick={submitCorrection}>
              Submit
            </button>
            <button className="analyze-button" onClick={analyzeAnswer}>
              Check Answer
            </button>
          </div>

          {/* Score and AI Feedback Display */}
          {score && (
            <div className="score-feedback">
              <h3>Your Score</h3>
              <p>
                <strong>Score:</strong> {score.userScore}/{score.maxScore}
              </p>
            </div>
          )}

          {aiFeedback.length > 0 && (
            <div className="ai-feedback">
              <h3>AI Feedback</h3>
              {aiFeedback.map((feedback, index) => (
                <p key={index} className="feedback-text">{feedback}</p>
              ))}
            </div>
          )}
        </>
      ) : (
        <p>Loading sentence...</p>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}