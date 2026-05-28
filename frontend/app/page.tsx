"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

interface HistoryItem {
  id: number;
  user_email: string;
  transcript: string;
  created_at: string;
}

export default function Home() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState<any>(null);

  const [transcript, setTranscript] = useState("");
  const [audioURL, setAudioURL] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUser(user);
      fetchHistory(user.email!);
    }
  };

  const signUp = async () => {

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Signup successful");
    }
  };

  const signIn = async () => {

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {

      alert(error.message);

    } else {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      fetchHistory(user?.email!);
    }
  };

  const signOut = async () => {

    await supabase.auth.signOut();

    setUser(null);

    setHistory([]);
  };

  const fetchHistory = async (email: string) => {

    const { data, error } = await supabase
      .from("transcripts")
      .select("*")
      .eq("user_email", email)
      .order("created_at", {
        ascending: false,
      });

    if (!error && data) {
      setHistory(data);
    }
  };

  const saveTranscript = async (
    text: string
  ) => {

    if (!user) return;

    await supabase
      .from("transcripts")
      .insert([
        {
          user_email: user.email,
          transcript: text,
        },
      ]);

    fetchHistory(user.email);
  };

  const sendAudioToBackend = async (
    audioFile: Blob | File
  ) => {

    setIsLoading(true);

    const formData = new FormData();

    formData.append(
      "file",
      audioFile,
      "audio.webm"
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

      if (data.transcript) {
        await saveTranscript(
          data.transcript
        );
      }

    } catch (error) {

      console.error(error);

      alert("Failed to process audio");

    } finally {

      setIsLoading(false);
    }
  };

  const startRecording = async () => {

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

    const mediaRecorder =
      new MediaRecorder(stream);

    mediaRecorderRef.current =
      mediaRecorder;

    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (
      event
    ) => {

      audioChunksRef.current.push(
        event.data
      );
    };

    mediaRecorder.onstop = async () => {

      const audioBlob = new Blob(
        audioChunksRef.current,
        {
          type: "audio/webm",
        }
      );

      const url =
        URL.createObjectURL(audioBlob);

      setAudioURL(url);

      await sendAudioToBackend(
        audioBlob
      );
    };

    setIsRecording(true);

    mediaRecorder.start();
  };

  const stopRecording = () => {

    mediaRecorderRef.current?.stop();

    setIsRecording(false);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file =
      event.target.files?.[0];

    if (!file) return;

    const url =
      URL.createObjectURL(file);

    setAudioURL(url);

    await sendAudioToBackend(file);
  };

  // LOGIN UI

  if (!user) {

    return (

      <div className="min-h-screen bg-slate-200 flex items-center justify-center px-4">

        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">

          <h1 className="text-4xl font-bold text-slate-800 text-center mb-3">
            Speech to Text
          </h1>

          <p className="text-center text-slate-500 mb-8 text-lg">
            Login or create account
          </p>

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border-2 border-slate-300 p-4 rounded-xl mb-5 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500"
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border-2 border-slate-300 p-4 rounded-xl mb-8 text-slate-800 placeholder-slate-500 outline-none focus:border-blue-500"
          />

          <div className="flex gap-4">

            <button
              onClick={signUp}
              className="flex-1 bg-green-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition"
            >
              Sign Up
            </button>

            <button
              onClick={signIn}
              className="flex-1 bg-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-600 transition"
            >
              Sign In
            </button>

          </div>

        </div>

      </div>

    );
  }

  // MAIN APP UI

  return (

    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4">

      <div className="w-full max-w-4xl flex justify-between items-center mb-8">

        <div>

          <h1 className="text-4xl font-bold text-slate-800">
            Speech to Text
          </h1>

          <p className="text-slate-500 mt-1">
            Logged in as {user.email}
          </p>

        </div>

        <button
          onClick={signOut}
          className="bg-red-500 text-white px-5 py-3 rounded-xl hover:bg-red-600 transition"
        >
          Logout
        </button>

      </div>

      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-4xl">

        <div className="flex flex-wrap justify-center gap-5 mb-8">

          <button
            onClick={startRecording}
            disabled={
              isRecording || isLoading
            }
            className={`px-6 py-4 rounded-xl font-semibold text-white transition
            ${
              isRecording || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isRecording
              ? "Recording..."
              : "Start Recording"}
          </button>

          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className={`px-6 py-4 rounded-xl font-semibold text-white transition
            ${
              !isRecording
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            Stop Recording
          </button>

        </div>

        <div className="mb-8">

          <label className="block text-xl font-semibold text-slate-700 mb-3">
            Upload Audio File
          </label>

          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="block w-full border-2 border-slate-300 rounded-xl p-4 bg-slate-50 text-slate-700"
          />

        </div>

        {audioURL && (

          <audio
            controls
            className="w-full mb-8"
          >
            <source src={audioURL} />
          </audio>

        )}

        <div className="border-2 border-slate-300 rounded-2xl p-6 min-h-[250px] bg-slate-50 mb-8">

          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Transcript
          </h2>

          {isLoading ? (

            <p className="text-blue-600 text-lg font-semibold">
              Transcribing...
            </p>

          ) : (

            <p className="text-slate-700 text-lg whitespace-pre-wrap leading-relaxed">
              {transcript ||
                "Your speech transcript will appear here..."}
            </p>

          )}

        </div>

        <div className="border-2 border-slate-300 rounded-2xl p-6 bg-white">

          <h2 className="text-2xl font-bold text-slate-800 mb-5">
            Transcript History
          </h2>

          {history.length === 0 ? (

            <p className="text-slate-500">
              No transcript history available.
            </p>

          ) : (

            <div className="space-y-4">

              {history.map((item) => (

                <div
                  key={item.id}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                >

                  <p className="text-sm text-slate-500 mb-2">
                    {new Date(
                      item.created_at
                    ).toLocaleString()}
                  </p>

                  <p className="text-slate-700 text-lg">
                    {item.transcript}
                  </p>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>

  );
}