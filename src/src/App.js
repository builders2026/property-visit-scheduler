import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPanel from "./pages/AdminPanel";
import Chatbot from "./pages/Chatbot";
import VisitsList from "./pages/VisitsList";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminPanel />} />
        <Route path="/visits" element={<VisitsList />} />
        <Route path="/chat/:siteId" element={<Chatbot />} />
      </Routes>
    </BrowserRouter>
  );
}
