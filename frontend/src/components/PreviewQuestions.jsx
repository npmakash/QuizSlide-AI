import React, { useState } from 'react';
import { Eye, Trash2, Copy, Check, Info, FileCode } from 'lucide-react';

export default function PreviewQuestions({
  questions,
  setQuestions,
  onClear
}) {
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit question inline
  const handleEdit = (index, field, value) => {
    const updated = [...questions];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setQuestions(updated);
  };

  // Delete individual question
  const handleDelete = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  // Copy JSON to clipboard
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(questions, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-200 dark:border-darkbg-border bg-gray-50/30 dark:bg-darkbg-card/20 rounded-2xl">
        <Info className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">No questions loaded</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[280px] mt-1">
          Paste some quiz text or upload a document on the left, then click Parse to inspect.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-gray-200 dark:border-darkbg-border flex flex-col gap-4 max-h-[85vh]">
      
      {/* Top Header Actions */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-darkbg-border">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-full">
            {questions.length} Questions
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ready to review</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJsonModal(true)}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
            title="Inspect Raw JSON"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Raw JSON</span>
          </button>
          
          <button
            onClick={onClear}
            className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-950/30 dark:hover:bg-red-950/20 py-1.5 px-3 text-xs flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Questions Scrollable Editor Sheet */}
      <div className="overflow-y-auto flex-grow pr-1 flex flex-col gap-4">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-gray-100 dark:border-darkbg-border/60 bg-gray-50/50 dark:bg-darkbg-input/30 flex flex-col gap-3 group hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-200"
          >
            {/* Slide title row */}
            <div className="flex justify-between items-start gap-4">
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
                Slide #{idx + 1}
              </span>

              {/* Editable Question Body */}
              <input
                type="text"
                value={q.question}
                onChange={(e) => handleEdit(idx, 'question', e.target.value)}
                className="flex-grow font-semibold text-sm bg-transparent border-b border-transparent focus:border-indigo-400 dark:focus:border-indigo-500 focus:outline-none text-gray-900 dark:text-white pb-0.5 px-1 w-full"
                placeholder="Question text"
              />

              <button
                onClick={() => handleDelete(idx)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition-all duration-150"
                title="Delete question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* A, B Options Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold border transition-colors duration-150 ${
                  q.correctAnswer === 'A'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900'
                    : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-darkbg-border dark:text-gray-400 dark:border-transparent'
                }`}>A</span>
                <input
                  type="text"
                  value={q.optionA}
                  onChange={(e) => handleEdit(idx, 'optionA', e.target.value)}
                  className="input-field py-1 px-3 text-xs bg-white dark:bg-darkbg-input"
                  placeholder="Option A"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold border transition-colors duration-150 ${
                  q.correctAnswer === 'B'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900'
                    : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-darkbg-border dark:text-gray-400 dark:border-transparent'
                }`}>B</span>
                <input
                  type="text"
                  value={q.optionB}
                  onChange={(e) => handleEdit(idx, 'optionB', e.target.value)}
                  className="input-field py-1 px-3 text-xs bg-white dark:bg-darkbg-input"
                  placeholder="Option B"
                />
              </div>
            </div>

            {/* C, D Options Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold border transition-colors duration-150 ${
                  q.correctAnswer === 'C'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900'
                    : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-darkbg-border dark:text-gray-400 dark:border-transparent'
                }`}>C</span>
                <input
                  type="text"
                  value={q.optionC}
                  onChange={(e) => handleEdit(idx, 'optionC', e.target.value)}
                  className="input-field py-1 px-3 text-xs bg-white dark:bg-darkbg-input"
                  placeholder="Option C"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold border transition-colors duration-150 ${
                  q.correctAnswer === 'D'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900'
                    : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-darkbg-border dark:text-gray-400 dark:border-transparent'
                }`}>D</span>
                <input
                  type="text"
                  value={q.optionD}
                  onChange={(e) => handleEdit(idx, 'optionD', e.target.value)}
                  className="input-field py-1 px-3 text-xs bg-white dark:bg-darkbg-input"
                  placeholder="Option D"
                />
              </div>
            </div>

            {/* Correct Option Selector */}
            <div className="flex items-center justify-between gap-4 border-t border-gray-100 dark:border-darkbg-border/30 pt-2.5 mt-0.5">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                Set correct slide answer key:
              </span>
              <div className="flex gap-2">
                {['A', 'B', 'C', 'D'].map(key => (
                  <button
                    key={key}
                    onClick={() => handleEdit(idx, 'correctAnswer', key)}
                    className={`px-3 py-1 rounded text-xs font-bold active:scale-95 transition-all duration-100 ${
                      q.correctAnswer === key
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/10'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-darkbg-card dark:text-gray-400 dark:hover:bg-darkbg-border'
                    }`}
                  >
                    Option {key}
                  </button>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* JSON Viewer Modal Popup */}
      {showJsonModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl shadow-premium border border-gray-200 dark:border-darkbg-border overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-darkbg-border">
              <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <FileCode className="w-5 h-5 text-indigo-500" />
                Inspect JSON Schema
              </h3>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-lg"
              >
                &times;
              </button>
            </div>
            
            <div className="p-5 overflow-auto flex-grow bg-gray-950">
              <pre className="text-xs text-emerald-400 font-mono select-all">
                {JSON.stringify(questions, null, 2)}
              </pre>
            </div>

            <div className="flex justify-between items-center p-5 border-t border-gray-200 dark:border-darkbg-border">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                This schema conforms strictly to the presentation duplicate format.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyJson}
                  className="btn-primary py-2 text-xs flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={() => setShowJsonModal(false)}
                  className="btn-secondary py-2 text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
