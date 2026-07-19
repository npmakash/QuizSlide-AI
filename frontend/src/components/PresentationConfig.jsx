import React, { useState } from 'react';
import { Presentation, ArrowRight, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

export default function PresentationConfig({
  templateUrl,
  setTemplateUrl,
  onGenerate,
  generating,
  progress,
  isAuthenticated,
  questionsCount
}) {
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  // Validate the URL or ID format
  const isValidTemplateInput = () => {
    if (!templateUrl.trim()) return false;
    const isUrl = templateUrl.includes('/presentation/d/');
    const isId = /^[a-zA-Z0-9-_]{20,}$/.test(templateUrl.trim());
    return isUrl || isId;
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-gray-200 dark:border-darkbg-border flex flex-col gap-4">
      <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-darkbg-border">
        <Presentation className="w-5 h-5 text-indigo-500" />
        <h3 className="font-bold text-gray-900 dark:text-white">Google Slides Configuration</h3>
      </div>

      {!isAuthenticated ? (
        /* Alert if user has not linked their Google account */
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex gap-3 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex flex-col gap-1 text-amber-800 dark:text-amber-300">
            <span className="font-bold">Google account connection required</span>
            <span>You must sign in with Google using the button in the top bar to unlock slides template duplication and PDF/PowerPoint exports.</span>
          </div>
        </div>
      ) : (
        /* Form inputs when connected */
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-xs">
            <label className="text-gray-600 dark:text-gray-400 font-semibold">
              Template Presentation ID or URL
            </label>
            <button
              onClick={() => setShowCheatSheet(!showCheatSheet)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 font-medium transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Template Help
            </button>
          </div>

          <input
            type="text"
            value={templateUrl}
            onChange={(e) => setTemplateUrl(e.target.value)}
            placeholder="https://docs.google.com/presentation/d/.../edit"
            disabled={generating}
            className="input-field"
          />

          {/* Placeholders Cheat Sheet Panel */}
          {showCheatSheet && (
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-darkbg-card/50 border border-gray-200 dark:border-darkbg-border text-xs text-gray-600 dark:text-gray-400 animate-fade-in flex flex-col gap-2">
              <span className="font-bold text-gray-800 dark:text-gray-200">Placeholder Labels:</span>
              <p>Your Google Slides template must contain a slide with these exact markers. The app will automatically duplicate this slide for each question:</p>
              <div className="grid grid-cols-2 gap-2 font-mono text-[10px] bg-white dark:bg-darkbg-input p-2.5 rounded-lg border border-gray-100 dark:border-darkbg-border/60">
                <div>{'{{number}}'} - Slide Num</div>
                <div>{'{{question}}'} - Question Text</div>
                <div>{'{{optionA}}'} - Option A</div>
                <div>{'{{optionB}}'} - Option B</div>
                <div>{'{{optionC}}'} - Option C</div>
                <div>{'{{optionD}}'} - Option D</div>
                <div>{'{{answer}}'} - Correct Key</div>
              </div>
            </div>
          )}

          {/* Progress Section */}
          {generating && (
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                <span>Generating presentation...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-darkbg-border h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Generate Presentation Trigger */}
          <button
            onClick={onGenerate}
            disabled={generating || !isValidTemplateInput() || questionsCount === 0}
            className="btn-primary py-3 w-full mt-2 font-bold shadow-indigo-600/10 hover:shadow-indigo-600/20"
          >
            {generating ? (
              <>
                <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running Automation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4.5 h-4.5" />
                <span>Generate Presentation ({questionsCount} slides)</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
