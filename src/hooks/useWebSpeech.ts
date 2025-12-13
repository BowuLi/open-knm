import { useState, useRef, useEffect, useCallback } from 'react';

type SpeechState = {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
};

// Define minimal types for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

// Extend window to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

export function useWebSpeech() {
  const [state, setState] = useState<SpeechState>({
    isListening: false,
    transcript: '',
    isSupported: false,
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // TTS Setup
      if ('speechSynthesis' in window) {
        synthesisRef.current = window.speechSynthesis;
      }

      // STT Capability Check
      const SpeechRecognitionCtor =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognitionCtor) {
        // Use a timeout to avoid synchronous state update warning
        setTimeout(() => {
            setState((prev) => ({ ...prev, isSupported: true }));
        }, 0);
      } else {
        setTimeout(() => {
            setState((prev) => ({ ...prev, isSupported: false, error: 'Speech recognition not supported in this browser.' }));
        }, 0);
      }
    }
  }, []);

  const speak = useCallback((text: string, rate: number = 0.85, lang: string = 'nl-NL') => {
    if (synthesisRef.current) {
      // Cancel any ongoing speech
      synthesisRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Explicitly try to find a voice for the requested language
      // This ensures we get a Dutch voice instead of the system default (which might be English)
      const voices = synthesisRef.current.getVoices();
      const targetVoice = 
        voices.find(v => v.lang === lang) || 
        voices.find(v => v.lang.startsWith(lang.split('-')[0]));
      
      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      utterance.lang = lang;
      utterance.rate = rate; // Use the provided rate
      synthesisRef.current.speak(utterance);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null; // Cleanup
    }
    setState((prev) => ({ ...prev, isListening: false }));
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return;

    // Stop any existing instance
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = true; 
      recognition.interimResults = true; 
      recognition.lang = 'nl-NL'; 

      recognition.onstart = () => {
        setState((prev) => ({ ...prev, isListening: true, error: null }));
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        setState((prev) => ({ ...prev, transcript: finalTranscript }));
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        // Ignore 'no-speech' errors as they just mean silence
        if (event.error === 'no-speech') {
            return;
        }
        setState((prev) => ({ 
          ...prev, 
          isListening: false, 
          error: event.error === 'not-allowed' ? 'Microphone access denied' : event.error 
        }));
      };

      recognition.onend = () => {
        setState((prev) => ({ ...prev, isListening: false }));
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
      setState((prev) => ({ ...prev, error: "Failed to start recording" }));
    }
  }, []);

  return {
    ...state,
    speak,
    startListening,
    stopListening,
  };
}
