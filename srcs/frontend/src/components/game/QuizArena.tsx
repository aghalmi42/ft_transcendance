import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { useNotification } from '../../context/NotificationContext';
import { soundEffects } from '../../services/audio';
import { Button } from '../common/Button';

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    category: 'École 42 & C',
    question: 'Quelle est la fonction système interdite dans la libft de base de 42 ?',
    options: ['malloc()', 'printf()', 'write()', 'free()'],
    correctIndex: 1,
    explanation: 'printf() est interdit dans la libft de base, on doit réimplémenter ft_printf !',
  },
  {
    id: 2,
    category: 'Architecture Web',
    question: 'Quel protocole bidirectionnel permet la communication temps réel dans ft_transcendence ?',
    options: ['HTTP/1.1 Polling', 'WebSockets (ws://)', 'FTP', 'SMTP'],
    correctIndex: 1,
    explanation: 'WebSockets permet un flux continu full-duplex pour le chat et les jeux.',
  },
  {
    id: 3,
    category: 'Gaming Retro',
    question: 'En quelle année le jeu d\'arcade original "PONG" d\'Atari est-il sorti ?',
    options: ['1969', '1972', '1984', '1990'],
    correctIndex: 1,
    explanation: 'Pong a été créé par Allan Alcorn et commercialisé par Atari en novembre 1972.',
  },
  {
    id: 4,
    category: 'Sécurité & 2FA',
    question: 'Quel algorithme standard est utilisé pour générer les codes 2FA à 6 chiffres ?',
    options: ['TOTP (Time-based One-Time Password)', 'RSA-2048', 'MD5 Hash', 'Bcrypt'],
    correctIndex: 0,
    explanation: 'TOTP (RFC 6238) calcule un code à partir de l’heure actuelle et d’une clé secrète.',
  },
  {
    id: 5,
    category: 'PostgreSQL & TypeORM',
    question: 'Quelle clause SQL permet d\'éviter les injections lors de requêtes backend ?',
    options: ['String concatenation', 'Prepared statements (Paramétrage)', 'Eval()', 'Raw query inline'],
    correctIndex: 1,
    explanation: 'Les requêtes préparées paramétrées séparent les données du code SQL exécuté.',
  },
];

interface QuizArenaProps {
  onExit?: () => void;
}

export const QuizArena: React.FC<QuizArenaProps> = ({ onExit }) => {
  const { user } = useAuth();
  const { recordMatch } = useGame();
  const { addToast } = useNotification();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [timer, setTimer] = useState<number>(12);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  // Timer countdown
  useEffect(() => {
    if (isAnswerChecked || isFinished) return;

    if (timer <= 0) {
      handleTimeout();
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, isAnswerChecked, isFinished]);

  const handleTimeout = () => {
    setIsAnswerChecked(true);
    setStreak(0);
    soundEffects.playDefeat();
  };

  const handleSelectOption = (index: number) => {
    if (isAnswerChecked || isFinished) return;

    setSelectedOption(index);
    setIsAnswerChecked(true);

    if (index === currentQ.correctIndex) {
      // Correct!
      const pointsEarned = 100 + streak * 20 + timer * 5;
      setScore((s) => s + pointsEarned);
      setStreak((st) => st + 1);
      soundEffects.playLevelUp();
    } else {
      // Wrong
      setStreak(0);
      soundEffects.playDefeat();
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex((idx) => idx + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      setTimer(12);
      soundEffects.playClick();
    } else {
      setIsFinished(true);
      soundEffects.playPowerUp();
      const finalVictory = score >= 300 ? 'VICTORY' : 'DEFEAT';
      recordMatch({
        gameType: 'QUIZ',
        opponentName: 'Quiz Battle Bot',
        userScore: score,
        opponentScore: 300,
        result: finalVictory,
      });
      addToast(`🏆 Quiz terminé ! Score final : ${score} pts`, 'success');
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setScore(0);
    setStreak(0);
    setTimer(12);
    setIsFinished(false);
    soundEffects.playPowerUp();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-left font-sans animate-fadeIn">
      {/* Quiz Top Header */}
      <div className="rounded-2xl p-5 bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-violet-400 font-bold uppercase tracking-wider">
            🧠 Quiz Battle 42
          </span>
          <h2 className="text-sm font-bold text-white">
            Question {currentIndex + 1} / {QUIZ_QUESTIONS.length}
          </h2>
        </div>

        {/* Score & Streak */}
        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Série</span>
            <span className="text-xs font-bold text-amber-400">🔥 x{streak}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Score</span>
            <span className="text-xl font-black text-white font-mono">{score}</span>
          </div>
        </div>
      </div>

      {/* Main Quiz Box */}
      {!isFinished ? (
        <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          {/* Timer progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">{currentQ.category}</span>
              <span className={`font-bold ${timer <= 3 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`}>
                ⏱️ {timer}s
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-1000 ${
                  timer <= 3 ? 'bg-rose-500' : 'bg-gradient-to-r from-violet-500 to-cyan-400'
                }`}
                style={{ width: `${(timer / 12) * 100}%` }}
              />
            </div>
          </div>

          {/* Question text */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 min-h-[90px] flex items-center">
            <h3 className="text-base font-bold text-white leading-relaxed">{currentQ.question}</h3>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, idx) => {
              let btnStyle = 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200';

              if (isAnswerChecked) {
                if (idx === currentQ.correctIndex) {
                  btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-500/20';
                } else if (idx === selectedOption) {
                  btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 font-bold shadow-lg shadow-rose-500/20';
                } else {
                  btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerChecked}
                  className={`p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswerChecked && idx === currentQ.correctIndex && <span>✅</span>}
                  {isAnswerChecked && idx === selectedOption && idx !== currentQ.correctIndex && <span>❌</span>}
                </button>
              );
            })}
          </div>

          {/* Explanation & Next Step */}
          {isAnswerChecked && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-fadeIn">
              <p className="text-xs text-slate-300">
                <span className="font-bold text-violet-400">Explication : </span>
                {currentQ.explanation}
              </p>
              <Button variant="primary" size="md" className="w-full justify-center" onClick={handleNextQuestion}>
                {currentIndex + 1 < QUIZ_QUESTIONS.length ? 'Question Suivante →' : 'Voir les Résultats 🏆'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Finished Podium */
        <div className="rounded-3xl p-8 bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6 animate-fadeIn">
          <span className="text-6xl">{score >= 400 ? '🥇' : score >= 200 ? '🥈' : '🥉'}</span>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Quiz Terminé !</h2>
            <p className="text-sm text-slate-400">
              Bravo {user?.username || 'Joueur'} ! Vous avez accumulé{' '}
              <span className="text-violet-400 font-bold font-mono text-lg">{score} points</span>.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button variant="secondary" size="md" onClick={onExit}>
              Menu des Jeux
            </Button>
            <Button variant="primary" size="md" onClick={handleRestart}>
              Recommencer le Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizArena;
