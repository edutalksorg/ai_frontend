import React, { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle, RotateCcw, Send, Volume2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { pronunciationService } from '../services/pronunciation';
import { formatTime } from '../utils/helpers';
import Button from './Button';
import { SpeakerPlayButton } from './common/SpeakerPlayButton';

interface PronunciationRecorderProps {
  paragraphId: string;
  paragraphText: string;
  title?: string;
  onSubmit?: (result: any) => void;
  onCancel?: () => void;
  onNext?: () => void;
  showNextButton?: boolean;
}

export const PronunciationRecorder: React.FC<PronunciationRecorderProps> = ({
  paragraphId,
  paragraphText,
  title,
  onSubmit,
  onCancel,
  onNext,
  showNextButton = true,
}) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  // AI Voice-Over State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [referenceAudioUrl, setReferenceAudioUrl] = useState<string | null>(null);
  const referenceAudioRef = useRef<HTMLAudioElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlayRef = useRef<HTMLAudioElement>(null);

  // Speech Recognition
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Standalone microphone initialization
  const initMicrophone = async () => {
    try {
      if (streamRef.current && mediaRecorderRef.current) {
        return true;
      }

      console.log('🎤 Initializing microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Detect supported mime type
      const mimeTypes = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/aac'];
      let selectedMimeType = '';

      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }

      console.log(`🎙️ Selected mime type: ${selectedMimeType || 'default'}`);
      const options = selectedMimeType ? { mimeType: selectedMimeType } : {};

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const type = selectedMimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type });
        setRecordedAudio(audioBlob);
        audioChunksRef.current = [];
      };

      return true;
    } catch (err: any) {
      console.error('Microphone error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access is blocked. Please click the camera/mic icon in your browser address bar to allow access and then reload the page.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError(`Microphone error: ${err.message || 'Unknown error'}`);
      }
      return false;
    }
  };

  // Initialize microphone on mount (optional, but good for early feedback)
  useEffect(() => {
    initMicrophone();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Reset state when paragraph changes
  useEffect(() => {
    handleReset();
    setIsSpeaking(false);
    setReferenceAudioUrl(null); // Clear cached audio when paragraph changes
  }, [paragraphId, paragraphText]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Start recording
  const handleStartRecording = async () => {
    // Stop speaking if recording starts
    if (isSpeaking) {
      setIsSpeaking(false);
      if (referenceAudioRef.current) {
        referenceAudioRef.current.pause();
        referenceAudioRef.current.currentTime = 0;
      }
    }

    try {
      setError(null);

      // Ensure microphone is initialized
      const isReady = await initMicrophone();
      if (!isReady || !mediaRecorderRef.current) {
        return; // Error state handled in initMicrophone
      }

      audioChunksRef.current = [];
      setRecordingTime(0);
      setTranscript('');

      // Start Media Recorder
      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Start Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let finalTrans = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTrans += event.results[i][0].transcript;
            }
          }
          if (finalTrans) {
            setTranscript(prev => prev + ' ' + finalTrans);
          }
        };

        recognition.onstart = () => {
          console.log('Speech recognition started');
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

    } catch (err: any) {
      console.error('Record start error:', err);
      setError(`Failed to start recording: ${err.message || 'Unknown error'}`);
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    try {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (err: any) {
      setError('Failed to stop recording');
    }
  };

  // Reset recording
  const handleReset = () => {
    setRecordedAudio(null);
    setRecordingTime(0);
    setIsRecording(false);
    setError(null);
    setAssessmentResult(null);
    setShowResult(false);
    audioChunksRef.current = [];
  };

  // Play recording
  const handlePlayRecording = () => {
    if (recordedAudio && audioPlayRef.current) {
      const audioUrl = URL.createObjectURL(recordedAudio);
      audioPlayRef.current.src = audioUrl;
      audioPlayRef.current.play();
    }
  };

  // AI Voice-Over: Convert paragraph to speech and play
  const handleSpeakerToggle = async () => {
    // If already playing, stop it
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsLoadingAudio(true);
      setError(null);
      console.log('🎤 Using Browser TTS...');

      const utterance = new SpeechSynthesisUtterance(paragraphText);
      utterance.lang = 'en-US'; // Default to US English

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsLoadingAudio(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (e) => {
        // Ignore errors caused by pausing/cancelling
        if (e.error === 'interrupted' || e.error === 'canceled') {
          setIsSpeaking(false);
          setIsLoadingAudio(false);
          return;
        }



        console.error('Speech synthesis error:', e);
        setIsSpeaking(false);
        setIsLoadingAudio(false);
        setError('Failed to play audio.');
      };

      window.speechSynthesis.speak(utterance);

    } catch (err: any) {
      console.error('❌ Speech synthesis error:', err);
      setError('Failed to generate reference audio. Please try again.');
      setIsLoadingAudio(false);
    }
  };

  // Play reference audio
  const playReferenceAudio = (audioUrl: string) => {
    console.log('🔊 Playing reference audio:', audioUrl);

    if (!referenceAudioRef.current) {
      console.log('📱 Creating new Audio element');
      referenceAudioRef.current = new Audio(audioUrl);

      referenceAudioRef.current.onended = () => {
        console.log('✅ Audio playback ended');
        setIsSpeaking(false);
      };

      referenceAudioRef.current.onerror = (e) => {
        console.error('❌ Audio error:', e);
        console.error('Audio URL:', audioUrl);
        setError('Failed to play reference audio. The audio file may be inaccessible.');
        setIsSpeaking(false);
      };

      referenceAudioRef.current.onloadeddata = () => {
        console.log('✅ Audio loaded successfully');
      };
    } else {
      console.log('♻️ Reusing existing Audio element');
      referenceAudioRef.current.src = audioUrl;
    }

    console.log('▶️ Attempting to play audio...');
    referenceAudioRef.current.play()
      .then(() => {
        console.log('✅ Audio playback started');
        setIsSpeaking(true);
      })
      .catch((err) => {
        console.error('❌ Audio playback error:', err);
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        setError(`Failed to play audio: ${err.message}`);
        setIsSpeaking(false);
      });
  };

  // Submit for assessment
  const handleSubmitForAssessment = async () => {
    if (!recordedAudio) {
      setError('No recording found');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Submit audio (and transcript) for assessment
      // Note: We pass transcript for better accuracy in backend
      let result: any = await pronunciationService.assessAudio(paragraphId, recordedAudio, transcript);
      console.log('Initial assessment response:', result);

      // Handle raw string ID response
      let attemptId = null;
      if (typeof result === 'string') {
        attemptId = result;
        // If we just got an ID, we MUST fetch details immediately
        const details = await pronunciationService.getAttemptDetails(attemptId);
        result = details || { id: attemptId };
      } else if (result && result.id) {
        attemptId = result.id;
      }

      // Check strictly for processing status
      let isPending = result?.processing?.status === 'Pending' || result?.processing?.status === 'Processing' || result?.processing?.isPending || result?.processing?.isProcessing;

      // Also treat as pending if we have an ID but absolutely no score data yet (and no error)
      if (!isPending && attemptId && !result.scores && result.pronunciationAccuracy === undefined) {
        isPending = true;
      }

      // Polling Loop
      let attempts = 0;
      const maxAttempts = 10;

      while (isPending && attempts < maxAttempts) {
        attempts++;
        console.log(`Assessment pending (Attempt ${attempts}/${maxAttempts})... waiting...`);

        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s

        try {
          const details = await pronunciationService.getAttemptDetails(attemptId);
          console.log('Polled details:', details);

          if (details) {
            result = details; // Update result with latest details

            // Update pending status
            isPending = result?.processing?.status === 'Pending' || result?.processing?.status === 'Processing' || result?.processing?.isPending || result?.processing?.isProcessing;

            // If completed, break
            if (result?.processing?.status === 'Completed' || result?.processing?.isCompleted) {
              isPending = false;
            }
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }

      setAssessmentResult(result);
      setShowResult(true);

      if (onSubmit) {
        onSubmit(result);
      }
    } catch (err: any) {
      console.error('Assessment error:', err);

      if (err.validationErrors && (
        err.validationErrors.includes('SUBSCRIPTION_REQUIRED') ||
        err.validationErrors === 'SUBSCRIPTION_REQUIRED'
      )) {
        setError('SUBSCRIPTION_REQUIRED');
      } else {
        setError('Failed to assess pronunciation. Please try again.');
        // Debug: still show result if partial data exists
        if (err.data || err.response?.data) {
          console.warn('Attempting to show partial results from error response');
          // optional: setAssessmentResult(err.data || err.response?.data);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Assessment result view (Blue re-theme)
  if (showResult && assessmentResult) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-red-50 dark:border-red-900/20">
        <div className="bg-[#E10600] p-8 text-center sm:text-left">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Assessment Results</h2>
          <p className="text-red-100 text-sm mt-1">Excellent effort! Review your performance metrics below.</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 text-center border border-red-100 dark:border-red-900/30">
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">Accuracy</p>
              <p className="text-4xl font-black text-red-600 dark:text-red-400">
                {(assessmentResult.scores?.accuracy ?? assessmentResult.pronunciationAccuracy ?? assessmentResult.accuracy)?.toFixed(0) || '0'}%
              </p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 text-center border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Fluency</p>
              <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                {(assessmentResult.scores?.fluency ?? assessmentResult.fluencyScore ?? assessmentResult.fluency)?.toFixed(0) || '0'}%
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 text-center border border-amber-100 dark:border-amber-900/30">
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Overall</p>
              <p className="text-4xl font-black text-amber-600 dark:text-amber-400">
                {(assessmentResult.scores?.overall ?? assessmentResult.overallScore ?? assessmentResult.OverallScore)?.toFixed(0) || '0'}%
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Lounge Feedback</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{assessmentResult.feedback || "You did a great job! Keep practicing to improve your consistency."}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReset}
                className="flex-1 py-4 bg-white dark:bg-slate-800 border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Try Practice Again
              </button>
              {showNextButton && onNext && (
                <button
                  onClick={() => {
                    handleReset();
                    onNext();
                  }}
                  className="flex-1 py-4 bg-[#E10600] hover:bg-red-700 text-white shadow-lg shadow-red-200 dark:shadow-none rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Next Passage
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Recording interface (Reference Style Match)
  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
      {/* Header (Red Theme) */}
      <div className={`p-10 ${isRecording ? 'bg-red-700' : 'bg-[#E10600]'} transition-colors duration-500`}>
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
            {title || 'My Daily Routine'}
          </h2>
          <p className="text-red-100 text-sm font-medium">
            {t('pronunciation.practiceHelp') || 'Read the text below carefully and clearly'}
          </p>
        </div>
      </div>

      {/* Main Practice Content */}
      <div className="p-8 sm:p-12 bg-white dark:bg-slate-900">
        <div className="mb-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-[10px] sm:text-xs font-black text-black uppercase tracking-[0.2em]">
              {t('pronunciation.textToRead') || 'TEXT TO READ'}
            </h3>
            <button
              onClick={handleSpeakerToggle}
              disabled={isRecording || isLoadingAudio}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${isSpeaking
                ? 'bg-red-600 text-white ring-4 ring-red-100 dark:ring-red-900/30'
                : 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                }`}
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
              {t('pronunciation.aiVoiceover') || 'AI VOICEOVER'}
            </button>
          </div>

          <div className={`relative bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 sm:p-12 border-2 transition-all duration-500 ${isSpeaking ? 'border-red-500 scale-[1.01] shadow-xl' : 'border-slate-50 dark:border-slate-800'
            }`}>
            <p className="text-xl sm:text-2xl leading-relaxed text-slate-800 dark:text-slate-100 font-bold text-center sm:text-left">
              {paragraphText}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-500 text-sm font-bold text-center">
            {error === 'SUBSCRIPTION_REQUIRED' ? 'Premium subscription required for unlimited assessments.' : error}
          </div>
        )}

        {/* Action Button Section */}
        <div className="flex flex-col items-center gap-6 mb-12">
          {!recordedAudio ? (
            <div className="w-full flex flex-col items-center">
              {isRecording ? (
                <button
                  onClick={handleStopRecording}
                  className="w-full sm:w-80 group relative flex items-center justify-center gap-4 py-6 bg-orange-500 hover:bg-orange-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-orange-200 dark:shadow-none transition-all transform hover:scale-105"
                >
                  <StopCircle className="w-8 h-8 animate-pulse text-white" />
                  STOP RECORDING
                </button>
              ) : (
                <button
                  onClick={handleStartRecording}
                  className="w-full sm:w-80 group relative flex items-center justify-center gap-4 py-6 bg-[#E10600] hover:bg-red-700 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-red-200 dark:shadow-none transition-all transform hover:scale-105"
                >
                  <Mic className="w-8 h-8 text-white/50 group-hover:text-white transition-colors" />
                  START RECORDING
                </button>
              )}

              <div className="mt-6 text-center">
                {isRecording ? (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-6 py-2 rounded-full border border-red-100">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span className="font-mono text-red-600 font-bold text-lg">{formatTime(recordingTime)}</span>
                  </div>
                ) : (
                  <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest max-w-xs leading-loose">
                    {t('pronunciation.recordingInstructions') || 'CLICK THE BUTTON ABOVE TO START RECORDING. READ THE TEXT CLEARLY AND NATURALLY.'}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={handlePlayRecording} className="flex-1 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-500 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                  <Volume2 className="w-5 h-5" /> Play Recording
                </button>
                <button onClick={handleReset} className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                  <RotateCcw className="w-5 h-5" /> Reset
                </button>
              </div>
              <button
                onClick={handleSubmitForAssessment}
                disabled={isLoading}
                className="w-full py-5 bg-[#E10600] hover:bg-red-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-200 dark:shadow-none flex items-center justify-center gap-3 transition-all"
              >
                {isLoading ? <><span className="animate-spin text-2xl">⟳</span> ASSESSING...</> : <><Send className="w-5 h-5" /> SUBMIT NOW</>}
              </button>
            </div>
          )}
        </div>

        {/* Recording Tips (2x2 Grid) */}
        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-black text-red-500 uppercase tracking-widest">
              {t('pronunciation.recordingTips') || 'RECORDING TIPS:'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">Speak clearly and at a natural pace</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">Avoid background noise for better accuracy</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">Make sure your microphone is working properly</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">Pause briefly between sentences if needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invisible Audio Player for playback */}
      <audio ref={audioPlayRef} className="hidden" />
    </div>
  );
};


export default PronunciationRecorder;
