'use client';

export class VoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphoneStream: MediaStream | null = null;
  private recognition: any = null;

  /**
   * Checks if browser speech recognition is supported
   */
  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  /**
   * Starts native Speech Recognition for Tamil & Tanglish
   */
  public startSpeechRecognition(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (err: any) => void,
    onEnd: () => void,
    lang: string = 'ta-IN'
  ): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError(new Error('Speech recognition not supported in this browser'));
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = lang; // 'ta-IN' or 'en-IN'

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
          onResult(currentText, Boolean(finalTranscript));
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        onError(event);
      };

      this.recognition.onend = () => {
        onEnd();
      };

      this.recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      onError(err);
    }
  }

  /**
   * Stops active speech recognition
   */
  public stopSpeechRecognition(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.recognition = null;
    }
  }

  /**
   * Starts raw microphone audio recording with live volume visualization callback
   */
  public async startMicrophoneRecording(
    onVolumeChange?: (vol: number) => void
  ): Promise<void> {
    if (typeof window === 'undefined') return;

    this.audioChunks = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.microphoneStream = stream;

    // Setup visualizer analyzer
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      if (onVolumeChange) {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const checkVolume = () => {
          if (!this.analyser) return;
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          onVolumeChange(Math.min(100, Math.round((average / 128) * 100)));
          if (this.microphoneStream) {
            requestAnimationFrame(checkVolume);
          }
        };
        requestAnimationFrame(checkVolume);
      }
    } catch (e) {
      console.warn('AudioContext visualization not available', e);
    }

    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };
    this.mediaRecorder.start();
  }

  /**
   * Stops microphone recording and returns audio Blob
   */
  public async stopMicrophoneRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(new Blob([], { type: 'audio/webm' }));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanupMicrophone();
        resolve(audioBlob);
      };

      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      } else {
        this.cleanupMicrophone();
        resolve(new Blob(this.audioChunks, { type: 'audio/webm' }));
      }
    });
  }

  /**
   * Releases microphone tracks and audio context
   */
  private cleanupMicrophone(): void {
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach((track) => track.stop());
      this.microphoneStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
    this.analyser = null;
    this.mediaRecorder = null;
  }

  /**
   * Speaks response text via Sarvam Bulbul TTS or Browser SpeechSynthesis
   */
  public async speakResponse(text: string, lang: 'ta-IN' | 'en-IN' = 'ta-IN'): Promise<void> {
    if (typeof window === 'undefined') return;

    // 1. Try calling the Sarvam Bulbul TTS API endpoint
    try {
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: lang }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          await audio.play();
          return;
        }
      }
    } catch (e) {
      // Fallback to browser SpeechSynthesis
    }

    // 2. Browser SpeechSynthesis fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Find best matching Indian/Tamil voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(
        (v) => v.lang.includes('ta') || v.lang.includes('IN') || v.name.includes('India')
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  }
}

export const voiceService = new VoiceService();
