import { BrowserRouter, Route, Routes } from "react-router-dom";
import TextEditor from "./components/TextEditor";
import UserSignup from './components/UserSignup';
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Diary from "./components/Diary";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AdminTranslate from "./components/AdminTranslate";
import AdminImage from "./components/AdminImage";
import AdminEssay from "./components/AdminEssay";
import AdminRephrase from "./components/AdminRephrase";
import AdminStory from "./components/AdminStory";
import AdminErrorCorrection from "./components/AdminErrorCorrection";
import AdminLetter from "./components/AdminLetter";
import UserTranslation from "./components/UserTranslation";
import DescribeImage from "./components/DescribeImage";
import RephraseSentence from "./components/RephraseSentence";
import StoryCompletion from "./components/StoryCompletion";
import ErrorCorrection from "./components/ErrorCorrection";
import EssaySelection from "./components/EssaySelection";
import AdminAddDiaryPrompt from "./components/AdminAddDailyPrompt";
import AdminAddDailyPrompt from "./components/AdminAddDailyPrompt";
import ChatBot from "./components/ChatBot";

function App() {
  return (
    
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserSignup/>}/>
        <Route path="/admin" element={<AdminLogin/>}/>
        <Route path="/admindashboard" element={<AdminDashboard/>}/>
        <Route path="/add-translation" element={<AdminTranslate/>}/>
        <Route path="/add-image-description" element={<AdminImage/>}/>
        <Route path="/add-essay-topics" element={<AdminEssay/>}/>
        <Route path="/add-rephrase-paragraphs" element={<AdminRephrase/>}/>
        <Route path="/add-story" element={<AdminStory/>}/>
        <Route path="/add-error-sentences"element={<AdminErrorCorrection/>}/>
        <Route path="/add-letter" element={<AdminLetter/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/diary" element={<Diary/>}/>
        <Route path="/translation" element={<UserTranslation/>}/>
        <Route path="/image-description" element={<DescribeImage/>}/>
        <Route path="/rephrase"  element={<RephraseSentence/>}/>
        <Route path="/story-completion" element={<StoryCompletion/>}/>
        <Route path="/error-hunting"  element={<ErrorCorrection/>}/>
        <Route path="/essay-writing" element={<EssaySelection/>}/>
        <Route path="/add-diary-prompt" element={<AdminAddDailyPrompt/>}/>
        <Route path="/chatbot" element={<ChatBot/>}/>
        </Routes>
        </BrowserRouter>
    
  );
}

export default App;

