import React, { useState, useRef } from 'react';
import { Upload, Sparkles, FileJson, Check } from 'lucide-react';

const DEMO_QUESTIONS = `1. What is the primary gas in the Earth's atmosphere?
A. Oxygen
B. Nitrogen
C. Carbon Dioxide
D. Hydrogen
Answer: B

2. Which planet is known as the Red Planet?
A. Earth
B. Jupiter
C. Mars
D. Saturn
Answer: C

3. What is the chemical symbol for gold?
A. Gd
B. Au
C. Ag
D. Fe
Answer: B

4. Who wrote the play "Romeo and Juliet"?
A. Charles Dickens
B. William Shakespeare
C. Mark Twain
D. Jane Austen
Answer: B

5. What is the capital city of Australia?
A. Sydney
B. Melbourne
C. Canberra
D. Brisbane
Answer: C`;

export default function QuestionInput({
  rawText,
  setRawText,
  onParse,
  parseLoading,
  onDirectJsonUpload
}) {
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'upload'
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Counter helpers
  const charCount = rawText.length;
  const wordCount = rawText.trim() === '' ? 0 : rawText.trim().split(/\s+/).length;
  
  // Estimate number of questions by searching for "Answer: [A-D]" or similar patterns
  const estimateQuestionCount = () => {
    if (!rawText.trim()) return 0;
    const answerMatches = rawText.match(/(?:Answer|Ans|Correct):\s*[A-D]/gi);
    if (answerMatches) return answerMatches.length;

    // Alternative: Count lines that start with numbers (e.g., "1. " or "1) ")
    const numberMatches = rawText.match(/^\s*\d+[\.\)]\s/gm);
    return numberMatches ? numberMatches.length : 0;
  };

  const estimatedQuestions = estimateQuestionCount();

  // Load sample questions
  const loadDemo = () => {
    setRawText(DEMO_QUESTIONS);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  // Read file contents
  const processUploadedFile = (file) => {
    const reader = new FileReader();
    const extension = file.name.split('.').pop().toLowerCase();

    reader.onload = (e) => {
      const content = e.target.result;
      
      if (extension === 'json') {
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            onDirectJsonUpload(parsed);
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000);
          } else {
            alert('Invalid JSON: Root must be a JSON array of question objects.');
          }
        } catch (err) {
          alert(`Failed to parse JSON file: ${err.message}`);
        }
      } else {
        // Assume text file
        setRawText(content);
        setActiveTab('paste');
      }
    };

    if (extension === 'json') {
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-gray-200 dark:border-darkbg-border flex flex-col gap-4">
      
      {/* Input Mode Navigation */}
      <div className="flex border-b border-gray-200 dark:border-darkbg-border pb-1">
        <button
          onClick={() => setActiveTab('paste')}
          className={`flex items-center gap-2 pb-2.5 px-4 font-semibold text-sm relative transition-all duration-200 ${
            activeTab === 'paste'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <ClipboardText className="w-4 h-4" />
          Paste Questions
          {activeTab === 'paste' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 pb-2.5 px-4 font-semibold text-sm relative transition-all duration-200 ${
            activeTab === 'upload'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Document (.txt, .json)
          {activeTab === 'upload' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'paste' ? (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              Paste your raw quiz text below. Gemini will structure it for you.
            </span>
            <button
              onClick={loadDemo}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 active:scale-95"
            >
              <Sparkles className="w-3 h-3" /> Load Sample Demo
            </button>
          </div>

          <div className="relative">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Example format:
1. What is the capital of India?
A. Delhi
B. Mumbai
C. Chennai
D. Kolkata
Answer: A`}
              className="w-full h-80 px-4 py-3 rounded-xl border border-gray-200 dark:border-darkbg-border bg-white dark:bg-darkbg-input text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 font-mono text-sm resize-none"
            />
          </div>

          {/* Counters Row */}
          <div className="flex flex-wrap justify-between items-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">
            <div className="flex gap-4">
              <span>{charCount.toLocaleString()} Characters</span>
              <span>{wordCount.toLocaleString()} Words</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={estimatedQuestions > 60 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}>
                Estimated Questions: <strong className="text-gray-800 dark:text-gray-200">{estimatedQuestions}</strong>/60
              </span>
              {estimatedQuestions > 60 && (
                <span className="text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded">
                  Max 60 limit exceeded
                </span>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={onParse}
            disabled={parseLoading || !rawText.trim() || estimatedQuestions > 60}
            className="btn-primary w-full py-3 mt-1 shadow-indigo-600/10 hover:shadow-indigo-600/20"
          >
            {parseLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>AI Parsing with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4.5 h-4.5" />
                <span>Parse Questions with AI</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Upload Area */
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`h-96 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/10'
              : 'border-gray-300 dark:border-darkbg-border bg-white dark:bg-darkbg-input hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50/50 dark:hover:bg-darkbg-card'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.json"
            className="hidden"
          />

          {uploadSuccess ? (
            <div className="bg-emerald-500 text-white p-4 rounded-full shadow-lg shadow-emerald-500/10 animate-bounce">
              <Check className="w-8 h-8" />
            </div>
          ) : (
            <div className="bg-indigo-50 dark:bg-darkbg-border p-4 rounded-full text-indigo-600 dark:text-indigo-400 shadow-md">
              <FileJson className="w-8 h-8" />
            </div>
          )}

          <div className="text-center px-6">
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              {uploadSuccess ? 'JSON File Loaded successfully!' : 'Drag & drop a file here, or click to browse'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
              Supports <strong className="text-gray-700 dark:text-gray-300">.txt</strong> for raw unstructured questions, and <strong className="text-gray-700 dark:text-gray-300">.json</strong> for pre-formatted question templates.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ClipboardText icon fallback
function ClipboardText(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 14h6" />
      <path d="M9 18h6" />
      <path d="M9 10h6" />
    </svg>
  );
}
