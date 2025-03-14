import { useEffect, useState } from "react";

let recognition = null;
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "fr-FR";
}

const corrections = {
  "traître": "traitre",
};

const useSpeechRecognition = () => {
  const [text, setText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  // Request microphone permissions
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      setPermissionError(null);
      return true;
    } catch (error) {
      console.error("Microphone permission error:", error);
      setPermissionError(error.message);
      setHasPermission(false);
      return false;
    }
  };

  useEffect(() => {
    if (!recognition) return;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const recognizedText = event.results[0][0].transcript
        .toLowerCase()
        .trim();

      const corrected = corrections[recognizedText] || recognizedText;
      setText(recognizedText);
      setCorrectedText(corrected);

      recognition.stop();
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Erreur de reconnaissance vocale :", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        setPermissionError("L'accès au microphone a été refusé");
        setHasPermission(false);
      }
    };
  }, []);

  const startListening = async () => {
    if (!recognition) return;

    // Check/request permission before starting
    const permissionGranted = await requestMicrophonePermission();
    if (!permissionGranted) {
      return;
    }

    setText("");
    setIsListening(true);
    try {
      await recognition.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (!recognition) return;

    setIsListening(false);
    recognition.stop();
  };

  return {
    correctedText,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport: !!recognition,
    hasPermission,
    permissionError,
  };
};

export default useSpeechRecognition;
