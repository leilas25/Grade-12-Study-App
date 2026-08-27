import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Trophy,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  Flame,
  Search,
  Grid,
  Check,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { GameType, Topic, KeyTerm } from '../types';

interface GameCentreProps {
  initialSubjectId?: string;
  initialTopicId?: string;
}

export const GameCentre: React.FC<GameCentreProps> = ({
  initialSubjectId,
  initialTopicId,
}) => {
  const { subjects, recordGamePlayed, celebrate } = useStudy();
  const enrolledSubjects = subjects.filter((s) => s.isEnrolled);

  // Selected subject & topic for the game
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || enrolledSubjects[0]?.id || ''
  );
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    initialTopicId || selectedSubject?.topics[0]?.id || ''
  );
  const selectedTopic = selectedSubject?.topics.find((t) => t.id === selectedTopicId) || selectedSubject?.topics[0];

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [activeGame, setActiveGame] = useState<GameType | null>(null);

  // Update selected topic if subject changes
  useEffect(() => {
    if (selectedSubject && selectedSubject.topics.length > 0) {
      if (!selectedSubject.topics.find((t) => t.id === selectedTopicId)) {
        setSelectedTopicId(selectedSubject.topics[0].id);
      }
    }
  }, [selectedSubjectId, selectedSubject]);

  // Extract Terms & Questions from the topic (or use safe fallback terms)
  const terms: KeyTerm[] =
    selectedTopic?.keyTerms && selectedTopic.keyTerms.length >= 4
      ? selectedTopic.keyTerms
      : selectedTopic?.notes?.definitions && selectedTopic.notes.definitions.length >= 4
      ? selectedTopic.notes.definitions.map((d) => ({
          word: d.term.toUpperCase().replace(/[^A-Z]/g, ''),
          clue: d.definition,
        }))
      : [
          { word: 'GENE', clue: 'Unit of heredity transferred from parent to offspring' },
          { word: 'ALLELE', clue: 'Alternative form of a specific gene' },
          { word: 'DNA', clue: 'Molecule carrying the genetic code' },
          { word: 'MUTATION', clue: 'Sudden alteration in genetic sequence' },
          { word: 'GAMETE', clue: 'Mature haploid reproductive cell' },
          { word: 'NUCLEOTIDE', clue: 'Monomer building block of nucleic acids' },
        ];

  const questions =
    selectedTopic?.quizQuestions && selectedTopic.quizQuestions.length > 0
      ? selectedTopic.quizQuestions
      : [
          {
            id: 'demo-1',
            question: 'What is the primary unit of hereditary information?',
            type: 'multiple_choice' as const,
            options: ['Gene', 'Lipid', 'Carbohydrate', 'Minerals'],
            correctAnswer: 'Gene',
            explanation: 'Genes are the functional units of heredity.',
            difficulty: 'easy' as const,
          },
        ];

  // GAME LIST
  const gameCards = [
    {
      type: 'match_cards' as GameType,
      title: 'Match the Cards',
      description: 'Match key scientific terms with their accurate definitions.',
      icon: '🎴',
      color: 'from-blue-600 to-indigo-600',
      badge: 'Vocabulary',
    },
    {
      type: 'memory_match' as GameType,
      title: 'Memory Match Grid',
      description: 'Flip pairs of hidden cards to find matching concepts.',
      icon: '🃏',
      color: 'from-purple-600 to-pink-600',
      badge: 'Visual Recall',
    },
    {
      type: 'word_search' as GameType,
      title: 'Word Search Puzzle',
      description: 'Find important topic keywords hidden in the letter matrix.',
      icon: '🔍',
      color: 'from-emerald-600 to-teal-600',
      badge: 'Focus & Speed',
    },
    {
      type: 'speed_round' as GameType,
      title: '60s Speed Round',
      description: 'Answer as many rapid questions as possible before the timer runs out!',
      icon: '⚡',
      color: 'from-amber-500 to-orange-600',
      badge: 'High Octane',
    },
    {
      type: 'crossword' as GameType,
      title: 'Study Crossword',
      description: 'Solve crossword clues using key terms from your notes.',
      icon: '🧩',
      color: 'from-cyan-600 to-blue-600',
      badge: 'Deep Recall',
    },
    {
      type: 'true_false_gauntlet' as GameType,
      title: 'True / False Gauntlet',
      description: 'Evaluate rapid concept statements with streak bonuses.',
      icon: '✔️',
      color: 'from-rose-600 to-red-600',
      badge: 'Decision Speed',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header & Topic Selector */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
              <Gamepad2 className="w-4 h-4" />
              <span>Interactive Study Arcade</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Grade 12 Game Centre
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Turn your study material into active recall games. Play from saved topic terms and questions without extra API latency!
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  difficulty === diff
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Subject & Topic Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
              Select Subject:
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {enrolledSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
              Select Topic:
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {selectedSubject?.topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area: Active Game Engine OR Game Selection Hub */}
      {activeGame ? (
        <div className="space-y-4">
          <button
            onClick={() => setActiveGame(null)}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Game Centre</span>
          </button>

          {activeGame === 'match_cards' && (
            <MatchCardsGame
              terms={terms}
              topic={selectedTopic!}
              difficulty={difficulty}
              onFinish={(score) => {
                recordGamePlayed(selectedSubjectId, selectedTopicId, 'Match the Cards', score, 35);
              }}
            />
          )}

          {activeGame === 'memory_match' && (
            <MemoryMatchGame
              terms={terms}
              topic={selectedTopic!}
              difficulty={difficulty}
              onFinish={(score) => {
                recordGamePlayed(selectedSubjectId, selectedTopicId, 'Memory Match', score, 35);
              }}
            />
          )}

          {activeGame === 'word_search' && (
            <WordSearchGame
              terms={terms}
              topic={selectedTopic!}
              difficulty={difficulty}
              onFinish={(score) => {
                recordGamePlayed(selectedSubjectId, selectedTopicId, 'Word Search', score, 40);
              }}
            />
          )}

          {activeGame === 'speed_round' && (
            <SpeedRoundGame
              questions={questions}
              topic={selectedTopic!}
              difficulty={difficulty}
              onFinish={(score) => {
                recordGamePlayed(selectedSubjectId, selectedTopicId, 'Speed Round', score, 45);
              }}
            />
          )}

          {activeGame === 'crossword' && (
            <CrosswordGame
              terms={terms}
              topic={selectedTopic!}
              difficulty={difficulty}
              onFinish={(score) => {
                recordGamePlayed(selectedSubjectId, selectedTopicId, 'Crossword', score, 40);
              }}
            />
          )}

          {activeGame === 'true_false_gauntlet' && (
            <TrueFalseGauntletGame
              questions={questions}
              topic={selectedTopic!}
              difficulty={difficulty}
              onFinish={(score) => {
                recordGamePlayed(selectedSubjectId, selectedTopicId, 'True/False Gauntlet', score, 35);
              }}
            />
          )}
        </div>
      ) : (
        /* Game Hub Cards Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Choose a Game Challenge for <span className="text-blue-600 dark:text-blue-400">{selectedTopic?.name}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {gameCards.map((game) => (
              <div
                key={game.type}
                onClick={() => setActiveGame(game.type)}
                className="bg-white dark:bg-slate-850 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-blue-400 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{game.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {game.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {game.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                    <span>Play Now</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                    +35-50 XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 1. MATCH THE CARDS GAME ENGINE
// ==========================================
const MatchCardsGame: React.FC<{
  terms: KeyTerm[];
  topic: Topic;
  difficulty: 'easy' | 'medium' | 'hard';
  onFinish: (score: number) => void;
}> = ({ terms, topic, difficulty, onFinish }) => {
  const count = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
  const gameTerms = terms.slice(0, count);

  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedClue, setSelectedClue] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [shuffledClues, setShuffledClues] = useState<KeyTerm[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameDone, setGameDone] = useState(false);

  useEffect(() => {
    setShuffledClues([...gameTerms].sort(() => Math.random() - 0.5));
    setMatchedPairs([]);
    setSelectedTerm(null);
    setSelectedClue(null);
    setMoves(0);
    setGameDone(false);
  }, [terms, difficulty]);

  const handleSelectTerm = (term: string) => {
    if (matchedPairs.includes(term)) return;
    setSelectedTerm(term);
    if (selectedClue) {
      checkMatch(term, selectedClue);
    }
  };

  const handleSelectClue = (clueWord: string) => {
    if (matchedPairs.includes(clueWord)) return;
    setSelectedClue(clueWord);
    if (selectedTerm) {
      checkMatch(selectedTerm, clueWord);
    }
  };

  const checkMatch = (term: string, clueWord: string) => {
    setMoves((m) => m + 1);
    if (term === clueWord) {
      const updated = [...matchedPairs, term];
      setMatchedPairs(updated);
      setSelectedTerm(null);
      setSelectedClue(null);
      if (updated.length === gameTerms.length) {
        setGameDone(true);
        onFinish(100);
      }
    } else {
      setTimeout(() => {
        setSelectedTerm(null);
        setSelectedClue(null);
      }, 600);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Match the Cards</span>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{topic.name}</h2>
        </div>
        <div className="text-right text-xs">
          <span className="text-slate-400">Matched: </span>
          <span className="font-bold text-emerald-500">
            {matchedPairs.length} / {gameTerms.length}
          </span>
        </div>
      </div>

      {!gameDone ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Terms Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400">1. Select a Term:</h3>
            <div className="space-y-2.5">
              {gameTerms.map((t, idx) => {
                const isMatched = matchedPairs.includes(t.word);
                const isSelected = selectedTerm === t.word;
                return (
                  <button
                    key={idx}
                    disabled={isMatched}
                    onClick={() => handleSelectTerm(t.word)}
                    className={`w-full p-4 rounded-2xl border text-left font-bold text-sm transition-all flex items-center justify-between ${
                      isMatched
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-300 opacity-60'
                        : isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-750 hover:border-blue-400 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>{t.word}</span>
                    {isMatched && <Check className="w-4 h-4 text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Definitions Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400">2. Match with Definition:</h3>
            <div className="space-y-2.5">
              {shuffledClues.map((t, idx) => {
                const isMatched = matchedPairs.includes(t.word);
                const isSelected = selectedClue === t.word;
                return (
                  <button
                    key={idx}
                    disabled={isMatched}
                    onClick={() => handleSelectClue(t.word)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                      isMatched
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-300 opacity-60'
                        : isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-750 hover:border-blue-400 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span className="leading-relaxed">{t.clue}</span>
                    {isMatched && <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 space-y-4">
          <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">All Cards Matched! 🌟</h3>
          <p className="text-xs text-slate-500">You matched all {gameTerms.length} terms in {moves} attempts.</p>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. MEMORY MATCH GRID GAME ENGINE
// ==========================================
const MemoryMatchGame: React.FC<{
  terms: KeyTerm[];
  topic: Topic;
  difficulty: 'easy' | 'medium' | 'hard';
  onFinish: (score: number) => void;
}> = ({ terms, topic, difficulty, onFinish }) => {
  const count = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
  const gameTerms = terms.slice(0, count);

  interface MemoryCard {
    id: string;
    pairId: string;
    text: string;
    isTerm: boolean;
    isFlipped: boolean;
    isMatched: boolean;
  }

  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);

  useEffect(() => {
    const deck: MemoryCard[] = [];
    gameTerms.forEach((t, idx) => {
      deck.push({
        id: `term-${idx}`,
        pairId: t.word,
        text: t.word,
        isTerm: true,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: `clue-${idx}`,
        pairId: t.word,
        text: t.clue,
        isTerm: false,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(deck.sort(() => Math.random() - 0.5));
    setFlippedIndices([]);
    setMatchedCount(0);
  }, [terms, difficulty]);

  const handleCardClick = (idx: number) => {
    if (flippedIndices.length >= 2 || cards[idx].isFlipped || cards[idx].isMatched) return;

    const newCards = [...cards];
    newCards[idx].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].pairId === cards[second].pairId) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === first || i === second ? { ...c, isMatched: true } : c))
          );
          setFlippedIndices([]);
          setMatchedCount((m) => {
            const next = m + 1;
            if (next === gameTerms.length) {
              onFinish(100);
            }
            return next;
          });
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === first || i === second ? { ...c, isFlipped: false } : c))
          );
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Memory Match Grid</span>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{topic.name}</h2>
        </div>
        <div className="text-right text-xs">
          <span className="text-slate-400">Pairs: </span>
          <span className="font-bold text-purple-500">
            {matchedCount} / {gameTerms.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
        {cards.map((card, idx) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(idx)}
            className={`h-32 p-3 rounded-2xl border text-center flex items-center justify-center cursor-pointer transition-all select-none ${
              card.isMatched
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 opacity-60'
                : card.isFlipped
                ? 'bg-purple-900 border-purple-500 text-white font-semibold'
                : 'bg-slate-800 border-slate-700 hover:border-purple-400 text-transparent'
            }`}
          >
            {card.isFlipped || card.isMatched ? (
              <span className={`text-xs ${card.isTerm ? 'font-black text-sm' : 'line-clamp-4 leading-tight'}`}>
                {card.text}
              </span>
            ) : (
              <Sparkles className="w-5 h-5 text-slate-600" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 3. WORD SEARCH PUZZLE GAME ENGINE
// ==========================================
const WordSearchGame: React.FC<{
  terms: KeyTerm[];
  topic: Topic;
  difficulty: 'easy' | 'medium' | 'hard';
  onFinish: (score: number) => void;
}> = ({ terms, topic, difficulty, onFinish }) => {
  const targetWords = terms.slice(0, 5).map((t) => t.word.replace(/[^A-Z]/g, '').slice(0, 8));
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [grid, setGrid] = useState<string[][]>([]);

  // Generate 8x8 letter grid with placed words
  useEffect(() => {
    const size = 8;
    const g: string[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
    );

    // Place words horizontally or vertically
    targetWords.forEach((word, rowIdx) => {
      const r = rowIdx % size;
      for (let c = 0; c < word.length && c < size; c++) {
        g[r][c] = word[c];
      }
    });

    setGrid(g);
    setFoundWords([]);
  }, [terms]);

  const handleWordFound = (word: string) => {
    if (!foundWords.includes(word)) {
      const updated = [...foundWords, word];
      setFoundWords(updated);
      if (updated.length === targetWords.length) {
        onFinish(100);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Word Search Puzzle</span>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{topic.name}</h2>
        </div>
        <div className="text-right text-xs">
          <span className="text-slate-400">Found: </span>
          <span className="font-bold text-emerald-500">
            {foundWords.length} / {targetWords.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Letter Matrix */}
        <div className="md:col-span-2 bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-center items-center overflow-x-auto">
          <div className="grid grid-cols-8 gap-1.5 font-mono font-bold text-white text-sm">
            {grid.map((row, r) =>
              row.map((letter, c) => (
                <div
                  key={`${r}-${c}`}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  {letter}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Word Bank */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-slate-400">Word Bank:</h3>
          <div className="space-y-2">
            {targetWords.map((word, idx) => {
              const isFound = foundWords.includes(word);
              return (
                <button
                  key={idx}
                  onClick={() => handleWordFound(word)}
                  className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    isFound
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 line-through'
                      : 'bg-slate-800 border-slate-700 text-white hover:border-emerald-400'
                  }`}
                >
                  <span>{word}</span>
                  {isFound ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="text-[10px] text-slate-400">Click when found</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. SPEED ROUND (60 SECONDS RAPID FIRE)
// ==========================================
const SpeedRoundGame: React.FC<{
  questions: any[];
  topic: Topic;
  difficulty: 'easy' | 'medium' | 'hard';
  onFinish: (score: number) => void;
}> = ({ questions, topic, difficulty, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentQ = questions[qIndex % questions.length];

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsGameOver(true);
      onFinish(score);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswer = (option: string) => {
    if (isGameOver) return;
    const isCorrect = option.toLowerCase().trim() === currentQ.correctAnswer.toLowerCase().trim();
    if (isCorrect) {
      setScore((s) => s + 10 * (streak + 1));
      setStreak((st) => st + 1);
    } else {
      setStreak(0);
    }
    setQIndex((idx) => idx + 1);
  };

  return (
    <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-500">60-Second Speed Round</span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{topic.name}</h2>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400">Time Left</span>
            <div className="text-xl font-black text-amber-500">{timeLeft}s</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400">Score</span>
            <div className="text-xl font-black text-blue-500">{score}</div>
          </div>
        </div>
      </div>

      {!isGameOver && currentQ ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-orange-500">Streak: {streak}x Multiplier!</span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQ.question}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(currentQ.options || ['True', 'False']).map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:bg-blue-600 hover:text-white text-sm font-semibold text-left transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 space-y-4">
          <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Time's Up! Final Score: {score}</h3>
          <p className="text-xs text-slate-500">Speed and accuracy reward: +45 XP earned</p>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. CROSSWORD PUZZLE ENGINE
// ==========================================
const CrosswordGame: React.FC<{
  terms: KeyTerm[];
  topic: Topic;
  difficulty: 'easy' | 'medium' | 'hard';
  onFinish: (score: number) => void;
}> = ({ terms, topic, onFinish }) => {
  const clues = terms.slice(0, 4);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [solved, setSolved] = useState<string[]>([]);

  const handleCheck = (word: string) => {
    const entered = (inputs[word] || '').toUpperCase().trim();
    if (entered === word.toUpperCase().trim()) {
      const updated = [...solved, word];
      setSolved(updated);
      if (updated.length === clues.length) {
        onFinish(100);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">Study Crossword Clues</span>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{topic.name}</h2>
        </div>
        <div className="text-right text-xs font-bold text-cyan-500">
          Solved: {solved.length} / {clues.length}
        </div>
      </div>

      <div className="space-y-4">
        {clues.map((clue, idx) => {
          const isDone = solved.includes(clue.word);
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                isDone
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <strong>Clue #{idx + 1}:</strong> {clue.clue} ({clue.word.length} letters)
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  maxLength={clue.word.length}
                  disabled={isDone}
                  placeholder={`Enter ${clue.word.length} letters...`}
                  value={inputs[clue.word] || ''}
                  onChange={(e) => setInputs({ ...inputs, [clue.word]: e.target.value })}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono uppercase tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />

                {!isDone ? (
                  <button
                    onClick={() => handleCheck(clue.word)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm"
                  >
                    Check
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-500 flex items-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>Solved!</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 6. TRUE / FALSE GAUNTLET ENGINE
// ==========================================
const TrueFalseGauntletGame: React.FC<{
  questions: any[];
  topic: Topic;
  difficulty: 'easy' | 'medium' | 'hard';
  onFinish: (score: number) => void;
}> = ({ questions, topic, onFinish }) => {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[index % questions.length];

  const handleDecision = (val: 'True' | 'False') => {
    const isCorrect = val.toLowerCase() === (current.correctAnswer || 'True').toLowerCase();
    if (isCorrect) setScore((s) => s + 1);

    if (index < 5) {
      setIndex((i) => i + 1);
    } else {
      setFinished(true);
      onFinish(score * 20);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">True / False Gauntlet</span>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{topic.name}</h2>
        </div>
        <div className="text-xs font-bold text-rose-500">Score: {score}</div>
      </div>

      {!finished && current ? (
        <div className="space-y-6 text-center py-4">
          <p className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
            "{current.question}"
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-4">
            <button
              onClick={() => handleDecision('True')}
              className="py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-lg shadow-emerald-600/20"
            >
              TRUE
            </button>
            <button
              onClick={() => handleDecision('False')}
              className="py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-base shadow-lg shadow-rose-600/20"
            >
              FALSE
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 space-y-4">
          <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Gauntlet Complete!</h3>
          <p className="text-xs text-slate-500">You scored {score} / 6 correct</p>
        </div>
      )}
    </div>
  );
};
