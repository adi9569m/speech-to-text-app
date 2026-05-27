"use client";

import { useRef, useState } from "react";

export default function Home() {

  const [transcript, setTranscript] = useState("");
  const [audioURL, setAudioURL] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;

    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {

      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      const url = URL.createObjectURL(audioBlob);

      setAudioURL(url);

      const formData = new FormData();

      formData.append(
        "file",
        audioBlob,
        "recording.webm"
      );

      try {

        const response = await fetch(
          "http://127.0.0.1:5000/transcribe",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        setTranscript(data.transcript);

      } catch (error) {

        console.error("Upload failed:", error);

      }
    };

    setIsRecording(true);

    mediaRecorder.start();
  };

  const stopRecording = () => {

    mediaRecorderRef.current?.stop();

    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4">

      <h1 className="text-4xl font-bold text-slate-800 mb-10 text-center">
        Speech to Text Application
      </h1>

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl">

        <div className="flex justify-center gap-6 mb-8">

          <button
            onClick={startRecording}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            {isRecording ? "Recording..." : "Start Recording"}
          </button>

          <button
            onClick={stopRecording}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Stop Recording
          </button>

        </div>

        {audioURL && (
          <audio controls className="w-full mb-6">
            <source src={audioURL} type="audio/webm" />
          </audio>
        )}

        <div className="border border-slate-300 rounded-xl p-5 min-h-[250px] bg-slate-50">

          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Transcript
          </h2>

          <p className="text-slate-700 text-lg leading-relaxed">
            {transcript || "Your speech transcript will appear here..."}
          </p>

        </div>

      </div>

    </div>
  );
}