
import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Info } from 'lucide-react';
import Button from './Button';

interface JumbleGameProps {
    originalSentence: string;
    explanation: string;
    translations?: { lang: string; text: string }[];
    currentLanguage?: string;
    onSuccess?: (success: boolean) => void;
}

const JumbleGame: React.FC<JumbleGameProps> = ({ originalSentence, explanation, translations, currentLanguage, onSuccess }) => {
    const [words, setWords] = useState<{ id: number; text: string }[]>([]);
    const [userSentence, setUserSentence] = useState<{ id: number; text: string }[]>([]);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);

    // Determine the prompt (translated sentence) based on language
    const currentPrompt = React.useMemo(() => {
        if (!translations || !currentLanguage) return '';
        const translation = translations.find(t => t.lang === currentLanguage || t.lang === currentLanguage.split('-')[0]);
        // If no translation found for current language, we return empty string or maybe a default message?
        // User said "original sentence should display in the language selected by the user".
        // If not found, we shouldn't show the English answer!
        return translation ? translation.text : '';
    }, [translations, currentLanguage]);

    // Fallback message if no translation is found - to help debugging/user feedback
    const showFallbackMessage = !currentPrompt && currentLanguage && currentLanguage !== 'en';

    useEffect(() => {
        resetGame();
    }, [originalSentence]);

    const resetGame = () => {
        if (!originalSentence) return;
        const splitWords = originalSentence.split(' ').filter(w => w.trim());
        const mappedWords = splitWords.map((word, index) => ({ id: index, text: word }));

        // Shuffle
        const shuffled = [...mappedWords].sort(() => Math.random() - 0.5);
        setWords(shuffled);
        setUserSentence([]);
        setIsSuccess(false);
        setIsError(false);
        if (onSuccess) onSuccess(false);
    };

    const handleWordClick = (word: { id: number; text: string }, from: 'pool' | 'sentence') => {
        if (isSuccess) return;
        if (isError) setIsError(false);

        if (from === 'pool') {
            setWords(prev => prev.filter(w => w.id !== word.id));
            setUserSentence(prev => [...prev, word]);
        } else {
            setUserSentence(prev => prev.filter(w => w.id !== word.id));
            setWords(prev => [...prev, word]);
        }
    };

    const checkAnswer = () => {
        const currentText = userSentence.map(w => w.text).join(' ');
        if (currentText === originalSentence) {
            setIsSuccess(true);
            setIsError(false);
            if (onSuccess) onSuccess(true);
        } else {
            setIsError(true);
        }
    };

    if (!originalSentence) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 my-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Info className="text-blue-500" size={24} />
                Grammar Challenge
            </h3>

            {currentPrompt ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Translate this sentence:</h4>
                    <p className="text-blue-900 dark:text-blue-100 text-lg">
                        {currentPrompt}
                    </p>
                </div>
            ) : showFallbackMessage ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mb-6 border border-amber-200 dark:border-amber-800">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Translation Unavailable</h4>
                    <p className="text-amber-900 dark:text-amber-100 text-sm">
                        No translation provided for your language ({currentLanguage}).
                    </p>
                </div>
            ) : null}

            <div className="mb-6">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Arrange the words to form the correct sentence:
                </p>

                {/* User Sentence Area */}
                <div className={`min-h-[60px] border-2 border-dashed rounded-xl p-4 flex flex-wrap gap-2 mb-4 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-200 ${isError ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-slate-300 dark:border-slate-600'}`}
                    style={{ borderColor: isSuccess ? '#22c55e' : isError ? '#ef4444' : '' }}>
                    {userSentence.map((word) => (
                        <button
                            key={word.id}
                            onClick={() => handleWordClick(word, 'sentence')}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition-all animate-in fade-in zoom-in duration-200"
                        >
                            {word.text}
                        </button>
                    ))}
                    {userSentence.length === 0 && !isSuccess && (
                        <span className="text-slate-400 italic">Tap words below to build sentence...</span>
                    )}
                    {isSuccess && (
                        <span className="ml-auto flex items-center text-green-600 font-bold">
                            <CheckCircle size={20} className="mr-1" /> Correct!
                        </span>
                    )}

                    {isError && (
                        <span className="w-full text-red-500 text-sm font-medium mt-2">
                            Incorrect order, try again!
                        </span>
                    )}
                </div>

                {/* Word Pool */}
                <div className="flex flex-wrap gap-2">
                    {words.map((word) => (
                        <button
                            key={word.id}
                            onClick={() => handleWordClick(word, 'pool')}
                            className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium shadow-sm hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                        >
                            {word.text}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    onClick={resetGame}
                    className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                    <RefreshCw size={20} />
                </button>
                {!isSuccess && userSentence.length > 0 && (
                    <Button variant="primary" onClick={checkAnswer}>
                        Check Answer
                    </Button>
                )}
            </div>
        </div>
    );
};

export default JumbleGame;
