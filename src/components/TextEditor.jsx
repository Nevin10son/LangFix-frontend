import { useState } from "react";
import axios from "axios";

const TextEditor = () => {
  const [inputText, setInputText] = useState("");
  const [mistakes, setMistakes] = useState([]);

  // Function to handle text submission
  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    try {
      const response = await axios.post("http://localhost:5000/process-text", {
        text: inputText,
      });

      setMistakes(response.data.mistakes);
    } catch (error) {
      console.error("Error:", error);
      setMistakes([{ mistake: "Error processing text", suggestion: "Try again later" }]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">English Writing Tool</h2>

      {/* Input Box */}
      <textarea
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="5"
        placeholder="Enter your text here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      ></textarea>

      {/* Submit Button */}
      <button
        className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        onClick={handleSubmit}
      >
        Check Grammar
      </button>

      {/* Output: Grammar Mistakes */}
      {mistakes.length > 0 && (
        <div className="mt-4 p-2 border rounded-lg bg-gray-100">
          <h3 className="font-semibold">Grammar Mistakes:</h3>
          <ul className="mt-1 list-disc list-inside">
            {mistakes.map((m, index) => (
              <li key={index}>
                ❌ <b>{m.mistake}</b> → ✅ <i>{m.suggestion}</i>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TextEditor;
