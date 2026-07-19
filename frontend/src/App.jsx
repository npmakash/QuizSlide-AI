import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QuestionInput from './components/QuestionInput';
import PreviewQuestions from './components/PreviewQuestions';
import PresentationConfig from './components/PresentationConfig';
import ExportZone from './components/ExportZone';
import { useAuth } from './hooks/useAuth';
import api from './services/api';
import { Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function App() {
  const { user, isAuthenticated, loading: authLoading, login, logout } = useAuth();
  
  const DEFAULT_TEMPLATE = 'https://docs.google.com/presentation/d/1ecwiq4ZlzlQv8kapXBWEXViSXxhDIPnsgmT7F4-EpPo/edit?slide=id.g3f4dc597ed3_2_45#slide=id.g3f4dc597ed3_2_45';

  // App States
  const [rawText, setRawText] = useState('');
  
  // Persist generated questions in localStorage for up to 2 hours
  const [questions, setQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('quiz_questions');
      const timestamp = localStorage.getItem('quiz_questions_time');
      if (saved && timestamp) {
        const parsedTime = parseInt(timestamp, 10);
        const now = Date.now();
        // 2 hours in ms = 2 * 60 * 60 * 1000 = 7,200,000
        if (now - parsedTime < 7200000) {
          return JSON.parse(saved);
        } else {
          localStorage.removeItem('quiz_questions');
          localStorage.removeItem('quiz_questions_time');
        }
      }
    } catch (err) {
      console.error('Failed to restore questions cache:', err);
    }
    return [];
  });
  
  const [templateUrl, setTemplateUrl] = useState(() => localStorage.getItem('quiz_template_url') || DEFAULT_TEMPLATE);
  const [parseLoading, setParseLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Save questions changes to localStorage
  useEffect(() => {
    if (questions && questions.length > 0) {
      localStorage.setItem('quiz_questions', JSON.stringify(questions));
      localStorage.setItem('quiz_questions_time', Date.now().toString());
    } else {
      localStorage.removeItem('quiz_questions');
      localStorage.removeItem('quiz_questions_time');
    }
  }, [questions]);
  
  // Generation output
  const [presentationId, setPresentationId] = useState('');
  const [presentationUrl, setPresentationUrl] = useState('');

  // Notifications
  const [toast, setToast] = useState(null);

  // Theme configuration
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Save template URL to localstorage for convenience
  useEffect(() => {
    if (templateUrl.trim()) {
      localStorage.setItem('quiz_template_url', templateUrl);
    }
  }, [templateUrl]);

  // Sync theme class with HTML document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Check URL queries on mount for OAuth redirect successes/failures
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      showToast('Connected to Google Account successfully!', 'success');
      // Clean query params from URL bar
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('auth_error')) {
      showToast(`Google Connection failed: ${params.get('auth_error')}`, 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // 1. AI Parsing Flow
  const handleParseRawText = async () => {
    if (!rawText.trim()) return;
    setParseLoading(true);
    setPresentationId(''); // Reset past results
    setPresentationUrl('');

    try {
      const response = await api.post('/quiz/generate-json', { rawText });
      const data = response.data;

      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        showToast(`AI successfully parsed ${data.questions.length} questions!`, 'success');
      } else {
        throw new Error('No questions returned from AI parser.');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.details || err.response?.data?.error || err.message;
      showToast(`AI Parsing failed: ${errMsg}`, 'error');
    } finally {
      setParseLoading(true); // wait, should be false!
      setParseLoading(false);
    }
  };

  // Load direct JSON questions from file
  const handleDirectJsonUpload = (jsonArray) => {
    setQuestions(jsonArray);
    setPresentationId('');
    setPresentationUrl('');
    showToast(`Loaded ${jsonArray.length} questions directly from JSON file.`, 'success');
  };

  // Clear questions sheet
  const handleClearQuestions = () => {
    setQuestions([]);
    setPresentationId('');
    setPresentationUrl('');
    showToast('Cleared questions list.', 'info');
  };

  // 2. Slide Generation flow
  const handleGenerateSlides = async () => {
    if (questions.length === 0 || !templateUrl.trim()) return;

    setGenerating(true);
    setProgress(5);
    setPresentationId('');
    setPresentationUrl('');

    // Smoothly animate progress updates up to 90% while waiting for Google Slides API callback
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        const step = prev < 40 ? 15 : prev < 75 ? 8 : 2;
        return prev + step;
      });
    }, 800);

    try {
      const response = await api.post('/quiz/replace-placeholders', {
        presentationId: templateUrl,
        questions: questions
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = response.data;
      setPresentationId(data.presentationId);
      setPresentationUrl(data.url);
      showToast('Google Slides presentation generated successfully!', 'success');
    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      const errMsg = err.response?.data?.details || err.response?.data?.error || err.message;
      showToast(`Slide Generation failed: ${errMsg}`, 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Download local JSON file backup
  const handleDownloadLocalJson = () => {
    if (questions.length === 0) return;
    const jsonStr = JSON.stringify(questions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'quiz_questions.json';
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Questions JSON downloaded.', 'success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-darkbg dark:text-gray-100 transition-colors duration-200">
      
      {/* Toast Banner Alerts */}
      {toast && (
        <div className="fixed top-20 right-6 z-[200] max-w-md p-4 rounded-xl shadow-premium border flex items-start gap-3 animate-fade-in bg-white dark:bg-darkbg-card border-gray-200 dark:border-darkbg-border">
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />}
          
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold capitalize text-gray-800 dark:text-white">
              {toast.type}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {toast.message}
            </span>
          </div>
        </div>
      )}

      {/* Header Profile Navigation */}
      <Header
        user={user}
        isAuthenticated={isAuthenticated}
        authLoading={authLoading}
        login={login}
        logout={logout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Core Dashboard Layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Hand Input Panel */}
        <div className="w-full lg:w-[45%] flex flex-col gap-6 shrink-0">
          <QuestionInput
            rawText={rawText}
            setRawText={setRawText}
            onParse={handleParseRawText}
            parseLoading={parseLoading}
            onDirectJsonUpload={handleDirectJsonUpload}
          />

          <PresentationConfig
            templateUrl={templateUrl}
            setTemplateUrl={setTemplateUrl}
            onGenerate={handleGenerateSlides}
            generating={generating}
            progress={progress}
            isAuthenticated={isAuthenticated}
            questionsCount={questions.length}
          />

          <ExportZone
            presentationId={presentationId}
            presentationUrl={presentationUrl}
            onDownloadJson={handleDownloadLocalJson}
          />
        </div>

        {/* Right Hand Question List Editor */}
        <div className="flex-grow w-full lg:w-[55%]">
          <PreviewQuestions
            questions={questions}
            setQuestions={setQuestions}
            onClear={handleClearQuestions}
          />
        </div>

      </main>

      {/* Simple Aesthetic Footer */}
      <footer className="w-full py-4 text-center text-[10px] text-gray-400 dark:text-gray-600 border-t border-gray-200 dark:border-darkbg-border/60">
        QuizSlide AI Automation Tool &bull; Powered by Google Gemini and Google Slides API &bull; 2026
      </footer>

    </div>
  );
}
