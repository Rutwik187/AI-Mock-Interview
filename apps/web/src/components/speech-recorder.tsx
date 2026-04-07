"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@ai-mock-interview/ui/components/button";
import { Alert, AlertDescription } from "@ai-mock-interview/ui/components/alert";
import { Mic, Square, RotateCcw } from "lucide-react";

interface SpeechRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function SpeechRecorder({
  onTranscript,
  disabled = false,
}: SpeechRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef("");

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    // Clean up any prior instance
    if (recognitionRef.current) {
      stopRecording();
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const fullText = (finalTranscript + interimTranscript).trim();
      transcriptRef.current = fullText;
      setTranscript(fullText);
      onTranscript(fullText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Ignore benign errors
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }
      console.error("Speech recognition error:", event.error);
      stopRecording();
    };

    recognition.onend = () => {
      // Only auto-restart if still supposed to be recording
      if (recognitionRef.current) {
        try {
          recognition.start();
        } catch {
          // Failed to restart — stop gracefully
          stopRecording();
        }
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsRecording(true);
    } catch {
      stopRecording();
    }
  }, [onTranscript, stopRecording]);

  const resetTranscript = useCallback(() => {
    stopRecording();
    setTranscript("");
    transcriptRef.current = "";
    onTranscript("");
  }, [stopRecording, onTranscript]);

  if (!isSupported) {
    return (
      <Alert>
        <AlertDescription>
          Speech recognition is not supported in your browser. Please use
          Chrome, Edge, or Safari, or type your answer manually below.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {!isRecording ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={startRecording}
            disabled={disabled}
            className="gap-2"
          >
            <Mic data-icon="inline-start" />
            Start Speaking
          </Button>
        ) : (
          <Button
            type="button"
            variant="destructive"
            size="lg"
            onClick={stopRecording}
            disabled={disabled}
            className="gap-2"
          >
            <Square data-icon="inline-start" />
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive-foreground opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-destructive-foreground" />
            </span>
            Stop Recording
          </Button>
        )}

        {transcript && !isRecording && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={resetTranscript}
            disabled={disabled}
          >
            <RotateCcw />
          </Button>
        )}
      </div>

      {isRecording && (
        <p className="text-xs text-muted-foreground animate-pulse">
          Listening... speak your answer clearly
        </p>
      )}
    </div>
  );
}
