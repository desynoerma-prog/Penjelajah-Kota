import React, { useState, useEffect, useCallback } from 'react';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Shield,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { TrafficSign } from '../game/types';
import { sound } from '../game/sound';

interface SignQuizModalProps {
  sign: TrafficSign;
  onAnswerComplete: (isCorrect: boolean, pointsAwarded: number) => void;
}

export const SignQuizModal: React.FC<SignQuizModalProps> = ({
  sign,
  onAnswerComplete,
}) => {
  const quiz = sign.quiz;
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (quiz) {
      sound.speakIndonesian(quiz.question);
    }
  }, [quiz]);

  const handleSelectOption = useCallback((idx: number) => {
    if (hasSubmitted || !quiz) return;
    setSelectedIdx(idx);
    setHasSubmitted(true);

    const isCorrect = idx === quiz.correctIndex;
    if (isCorrect) {
      sound.playQuizSuccess();
      sound.speakIndonesian(`Hebat! Jawabanmu benar. ${quiz.explanation}`);
    } else {
      sound.playQuizWrong();
      sound.speakIndonesian(
        `Jawaban yang tepat: ${quiz.options[quiz.correctIndex]}. ${quiz.explanation}`
      );
    }
  }, [hasSubmitted, quiz]);

  const handleContinue = useCallback(() => {
    if (!quiz) return;
    const isCorrect = selectedIdx === quiz.correctIndex;
    const pts = isCorrect ? 25 : 5;
    onAnswerComplete(isCorrect, pts);
  }, [quiz, selectedIdx, onAnswerComplete]);

  // Keyboard shortcut support: A/B/C/D or 1/2/3/4 to choose, Enter or Space to continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!hasSubmitted) {
        if (key === '1' || key === 'a') handleSelectOption(0);
        else if (key === '2' || key === 'b') handleSelectOption(1);
        else if (key === '3' || key === 'c') handleSelectOption(2);
        else if (key === '4' || key === 'd') handleSelectOption(3);
      } else {
        if (e.key === 'Enter' || e.key === ' ' || key === 'escape') {
          e.preventDefault();
          handleContinue();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasSubmitted, handleSelectOption, handleContinue]);

  if (!quiz) {
    return null;
  }

  const speakQuestion = () => {
    sound.speakIndonesian(quiz.question);
  };

  // Compact Sign Graphic for clean zero-scroll laptop fit
  const renderSignGraphic = () => {
    switch (sign.type) {
      case 'stop':
        return (
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-red-600 border-2 border-white flex items-center justify-center shadow shrink-0">
            <span className="text-white font-black text-sm tracking-wider font-mono">
              STOP
            </span>
          </div>
        );
      case 'traffic_light':
        return (
          <div className="w-8 h-12 bg-slate-900 border-2 border-yellow-400 rounded-lg flex flex-col items-center justify-around p-0.5 shadow shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.9)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.9)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(34,197,94,0.9)]" />
          </div>
        );
      case 'railway':
        return (
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-yellow-400 border-2 border-slate-950 rounded-xl rotate-45 flex items-center justify-center shadow shrink-0">
            <div className="-rotate-45 flex flex-col items-center justify-center text-center">
              <span className="text-sm">🚆</span>
              <span className="text-[7px] font-black text-slate-950 leading-none">REL KA</span>
            </div>
          </div>
        );
      case 'school_zone':
        return (
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-yellow-400 border-2 border-slate-950 rounded-xl rotate-45 flex items-center justify-center shadow shrink-0">
            <div className="-rotate-45 flex flex-col items-center justify-center text-center">
              <span className="text-sm">🚸</span>
              <span className="text-[7px] font-black text-slate-950 leading-none">ZOSS 20</span>
            </div>
          </div>
        );
      case 'zebra':
        return (
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-blue-600 border-2 border-white rounded-xl flex flex-col items-center justify-center shadow shrink-0">
            <span className="text-sm">🚶‍♂️</span>
            <div className="w-7 h-1 bg-white mt-0.5 rounded-sm flex justify-between px-0.5">
              <div className="w-1 h-full bg-slate-900" />
              <div className="w-1 h-full bg-slate-900" />
            </div>
          </div>
        );
      case 'no_right_turn':
        return (
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 bg-white border-2 border-red-600 rounded-full flex items-center justify-center shadow overflow-hidden shrink-0">
            <div className="absolute w-14 h-1 bg-red-600 -rotate-45" />
            <span className="text-sm text-slate-900">↪️</span>
          </div>
        );
      case 'no_entry':
        return (
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-red-600 border-2 border-white rounded-full flex items-center justify-center shadow shrink-0">
            <div className="w-7 sm:w-8 h-1.5 bg-white rounded-sm shadow" />
          </div>
        );
      default:
        return (
          <div className="w-11 h-11 rounded-xl bg-emerald-600 border-2 border-white flex items-center justify-center shadow text-lg shrink-0">
            🛑
          </div>
        );
    }
  };

  const isSelectedCorrect = selectedIdx === quiz.correctIndex;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Zero-Scroll Ultra Compact Container: strictly engineered to fit within any laptop screen without scrollbars */}
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 sm:border-3 border-amber-400 rounded-2xl shadow-2xl p-3 sm:p-4 flex flex-col gap-2.5 text-left text-slate-100 max-h-[92vh] overflow-hidden">
        
        {/* Compact Single-Line Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-black text-white">
                Kuis Rambu Lalu Lintas
              </h3>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-400/40">
                {quiz.curriculumConcept}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={speakQuestion}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] sm:text-[11px] shadow transition-transform active:scale-95 cursor-pointer shrink-0"
              title="Dengarkan Suara Pertanyaan"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Dengarkan Suara</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Body - Optimized for Zero Scroll */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-stretch">
          
          {/* Left Column: Sign Graphic & Question Box (5 cols) */}
          <div className="md:col-span-5 bg-slate-950/80 p-2.5 sm:p-3 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
            <div className="flex items-center gap-2.5">
              {renderSignGraphic()}
              <div className="min-w-0">
                <span className="text-[9px] text-amber-400 uppercase font-black tracking-wider block">
                  Rambu Di Depanmu:
                </span>
                <h4 className="text-xs sm:text-sm font-black text-white leading-tight truncate">
                  {sign.title}
                </h4>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-2 flex flex-col gap-1">
              <div className="flex items-center gap-1 text-[10px] font-black text-amber-300">
                <HelpCircle className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Pertanyaan Pak Polisi:</span>
              </div>
              <p className="text-xs sm:text-[13px] font-extrabold text-white leading-snug">
                "{quiz.question}"
              </p>
            </div>

            <div className="text-[9px] text-slate-400 bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <span>💡 Keyboard: Tekan <b>A/B/C/D</b> atau <b>1/2/3/4</b></span>
            </div>
          </div>

          {/* Right Column: 2x2 Options Grid & Instant Feedback (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between gap-2">
            
            {/* 2x2 Grid of Answer Options (saves 50% vertical space compared to single stacked column) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {quiz.options.map((option, idx) => {
                const isChosen = selectedIdx === idx;
                const isThisCorrect = idx === quiz.correctIndex;

                let cardStyle =
                  'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-200';
                if (hasSubmitted) {
                  if (isThisCorrect) {
                    cardStyle =
                      'bg-emerald-950 border-emerald-400 text-emerald-100 ring-1 ring-emerald-400';
                  } else if (isChosen && !isThisCorrect) {
                    cardStyle =
                      'bg-red-950 border-red-400 text-red-100 ring-1 ring-red-400';
                  } else {
                    cardStyle = 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-40';
                  }
                } else if (isChosen) {
                  cardStyle = 'bg-sky-950 border-sky-400 text-white';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={hasSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-2 rounded-xl border text-left transition-all flex items-start gap-2 cursor-pointer ${
                      !hasSubmitted ? 'hover:border-amber-400 active:scale-[0.98]' : ''
                    } ${cardStyle}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[11px] shrink-0 border ${
                        hasSubmitted && isThisCorrect
                          ? 'bg-emerald-500 text-white border-emerald-300'
                          : hasSubmitted && isChosen && !isThisCorrect
                          ? 'bg-red-500 text-white border-red-300'
                          : 'bg-slate-700 text-amber-300 border-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-[11px] leading-tight block">
                        {option.replace(/^[A-D]\.\s*/, '')}
                      </span>
                    </div>

                    {hasSubmitted && isThisCorrect && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    {hasSubmitted && isChosen && !isThisCorrect && (
                      <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Bottom Banner: Explanation & Immediate Continue Button (Integrated in 1 compact bar) */}
            {hasSubmitted ? (
              <div
                className={`p-2 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-2 transition-all ${
                  isSelectedCorrect
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100'
                    : 'bg-amber-950/90 border-amber-400 text-amber-100'
                }`}
              >
                <div className="flex-1 min-w-0 pr-1 text-left">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {isSelectedCorrect ? (
                      <>
                        <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="font-black text-[11px] text-emerald-300">
                          Jawaban Benar! (+25 Poin)
                        </span>
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="font-black text-[11px] text-amber-300">
                          Pembahasan (+5 Poin)
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-[10px] leading-snug text-slate-200 line-clamp-2">
                    {quiz.explanation}
                  </p>
                </div>

                <button
                  type="button"
                  autoFocus
                  onClick={handleContinue}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer border border-emerald-300 shrink-0"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                  <span className="text-[9px] font-mono opacity-70 hidden sm:inline">(Enter)</span>
                </button>
              </div>
            ) : (
              <div className="text-center text-[10px] text-slate-400 py-1 bg-slate-950/40 rounded-lg border border-slate-800/50">
                Pilih jawaban A, B, C, atau D untuk melanjutkan simulasi
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
