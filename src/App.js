import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@/App.css";
import LoginPage from "@/pages/LoginPage";
import ChatPage from "@/pages/ChatPage";
import ThanksPage from "@/pages/ThanksPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/thanks" element={<ThanksPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
