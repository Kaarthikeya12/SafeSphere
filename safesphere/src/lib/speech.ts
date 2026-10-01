// Web Speech API Voice Distress Detection Service

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: unknown) => void;
  onend: () => void;
}

type TriggerCallback = (keyword: string, transcript: string) => void;

class SpeechDistressDetector {
  private recognition: SpeechRecognitionInstance | null = null;
  private listening = false;
  private onTrigger: TriggerCallback | null = null;

  private keywords = [
    "help me",
    "help",
    "bachao",
    "save me",
    "emergency",
    "police",
    "ambulance",
    "madat",
  ];

  isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );
  }

  start(callback: TriggerCallback) {
    if (typeof window === "undefined") return;
    this.onTrigger = callback;
    this.listening = true;

    const SpeechClass =
      (window as unknown as { SpeechRecognition: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechClass) return;

    try {
      this.recognition = new SpeechClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-IN";

      this.recognition.onresult = (e: SpeechRecognitionEvent) => {
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          const t = e.results[i][0].transcript.toLowerCase();
          for (const kw of this.keywords) {
            if (t.includes(kw)) {
              this.onTrigger?.(kw, t);
              break;
            }
          }
        }
      };

      this.recognition.onend = () => {
        if (this.listening) {
          try {
            this.recognition?.start();
          } catch {
            // ignore
          }
        }
      };

      this.recognition.start();
    } catch {
      // ignore
    }
  }

  stop() {
    this.listening = false;
    this.onTrigger = null;
    try {
      this.recognition?.stop();
    } catch {
      // ignore
    }
  }

  isListening() {
    return this.listening;
  }
}

export const speechDetector = new SpeechDistressDetector();
