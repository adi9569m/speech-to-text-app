"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
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

  const [user, setUser] = useState<User | null>(null);

  const [transcript, setTranscript] = useState("");
  const [audioURL, setAudioURL] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const fetchHistory = useCallback(async (email: string) => {

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
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(({
      data: { user },
    }) => {
      if (!isMounted || !user?.email) return;

      setUser(user);
      fetchHistory(user.email);
    });

    return () => {
      isMounted = false;
    };
  }, [fetchHistory]);

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

      if (user?.email) {
        fetchHistory(user.email);
      }
    }
  };

  const signOut = async () => {

    await supabase.auth.signOut();

    setUser(null);

    setHistory([]);
  };

  const saveTranscript = async (
    text: string
  ) => {

    if (!user?.email) return;

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

  if (!user) {

    return (

      <div className="min-h-screen bg-blue-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">

        <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">

          <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">

            <section className="hidden lg:block">

              <div className="max-w-xl">

                <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                  Speech to Text
                </p>

                <h1 className="text-5xl font-bold leading-tight text-slate-950">
                  Turn voice notes into clean text in seconds.
                </h1>

                <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
                  Record audio, upload files, review transcripts, and keep your
                  history in one polished dashboard.
                </p>

                <div className="mt-8 grid max-w-lg grid-cols-2 gap-4">

                  <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-lg shadow-blue-100/60">
                    <p className="text-3xl font-bold text-blue-600">Live</p>
                    <p className="mt-2 text-sm text-slate-500">Record from your browser</p>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-lg shadow-blue-100/60">
                    <p className="text-3xl font-bold text-blue-600">Saved</p>
                    <p className="mt-2 text-sm text-slate-500">Transcript history stays available</p>
                  </div>

                </div>

              </div>

            </section>

            <section className="mx-auto w-full max-w-md rounded-3xl border border-blue-100 bg-white p-6 shadow-2xl shadow-blue-200/60 sm:p-8">

              <div className="mb-8 text-center">

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-300">
                  ST
                </div>

                <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
                  Speech to Text
                </h1>

                <p className="mt-3 text-base text-slate-500">
                  Sign in or create an account to continue.
                </p>

              </div>

              <div className="space-y-5">

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Email address
                  </span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </span>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </label>

              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">

                <button
                  onClick={signIn}
                  className="rounded-2xl bg-blue-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  Sign In
                </button>

                <button
                  onClick={signUp}
                  className="rounded-2xl border border-blue-200 bg-white px-5 py-3.5 font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  Create Account
                </button>

              </div>

            </section>

          </div>

        </main>

      </div>

    );
  }

  return (

    <div className="min-h-screen bg-blue-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">

      <main className="mx-auto w-full max-w-7xl">

        <header className="mb-8 flex flex-col gap-5 rounded-3xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/70 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Dashboard
            </p>

            <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
              Speech to Text
            </h1>

            <p className="mt-2 break-all text-sm text-slate-500 sm:text-base">
              Logged in as {user.email}
            </p>

          </div>

          <button
            onClick={signOut}
            className="w-full rounded-2xl border border-red-100 bg-red-50 px-5 py-3 font-semibold text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-100 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-100 sm:w-auto"
          >
            Logout
          </button>

        </header>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">

          <section className="space-y-6">

            <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/70 sm:p-6">

              <div className="mb-6">

                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                  Capture
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Record audio
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Use your microphone to create a fresh transcription.
                </p>

              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                <button
                  onClick={startRecording}
                  disabled={
                    isRecording || isLoading
                  }
                  className={`rounded-2xl px-5 py-4 font-semibold text-white shadow-lg transition focus:outline-none focus:ring-4
                  ${
                    isRecording || isLoading
                      ? "cursor-not-allowed bg-slate-300 shadow-none"
                      : "bg-blue-600 shadow-blue-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl focus:ring-blue-200"
                  }`}
                >
                  {isRecording
                    ? "Recording..."
                    : "Start Recording"}
                </button>

                <button
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className={`rounded-2xl px-5 py-4 font-semibold shadow-lg transition focus:outline-none focus:ring-4
                  ${
                    !isRecording
                      ? "cursor-not-allowed bg-slate-100 text-slate-400 shadow-none"
                      : "bg-red-500 text-white shadow-red-100 hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-xl focus:ring-red-100"
                  }`}
                >
                  Stop Recording
                </button>

              </div>

              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-800">
                  {isRecording
                    ? "Recording in progress. Stop when you are ready to transcribe."
                    : isLoading
                      ? "Audio is being processed."
                      : "Ready to record or upload audio."}
                </p>
              </div>

            </div>

            <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/70 sm:p-6">

              <div className="mb-5">

                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                  Upload
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Audio file
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Select any supported audio file and transcribe it instantly.
                </p>

              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50 px-5 py-8 text-center transition hover:border-blue-400 hover:bg-blue-100/70">

                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-bold text-blue-600 shadow-sm">
                  +
                </span>

                <span className="text-base font-semibold text-slate-800">
                  Choose an audio file
                </span>

                <span className="mt-1 text-sm text-slate-500">
                  WAV, MP3, WEBM, or other audio formats
                </span>

                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="sr-only"
                />

              </label>

              {audioURL && (

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3">

                  <audio
                    controls
                    className="w-full"
                  >
                    <source src={audioURL} />
                  </audio>

                </div>

              )}

            </div>

          </section>

          <section className="space-y-6">

            <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/70 sm:p-6">

              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                    Output
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    Transcript
                  </h2>

                </div>

                {isLoading && (

                  <span className="inline-flex w-fit rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                    Transcribing...
                  </span>

                )}

              </div>

              <div className="min-h-[260px] rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">

                {isLoading ? (

                  <div className="flex h-full min-h-[210px] items-center justify-center text-center">

                    <div>

                      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>

                      <p className="text-lg font-semibold text-blue-700">
                        Transcribing your audio...
                      </p>

                    </div>

                  </div>

                ) : (

                  <p className="whitespace-pre-wrap text-base leading-8 text-slate-700 sm:text-lg">
                    {transcript ||
                      "Your speech transcript will appear here after recording or uploading audio."}
                  </p>

                )}

              </div>

            </div>

            <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/70 sm:p-6">

              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                <div>

                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                    Library
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    Transcript History
                  </h2>

                </div>

                <p className="text-sm font-medium text-slate-500">
                  {history.length} saved
                </p>

              </div>

              {history.length === 0 ? (

                <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50 p-6 text-center">

                  <p className="font-semibold text-slate-700">
                    No transcript history available.
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Completed transcripts will be saved here.
                  </p>

                </div>

              ) : (

                <div className="max-h-[520px] space-y-4 overflow-y-auto pr-1">

                  {history.map((item) => (

                    <article
                      key={item.id}
                      className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/70 sm:p-5"
                    >

                      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                        <p className="text-sm font-semibold text-blue-700">
                          Transcript
                        </p>

                        <time className="text-xs font-medium text-slate-400">
                          {new Date(
                            item.created_at
                          ).toLocaleString()}
                        </time>

                      </div>

                      <p className="whitespace-pre-wrap text-base leading-7 text-slate-700">
                        {item.transcript}
                      </p>

                    </article>

                  ))}

                </div>

              )}

            </div>

          </section>

        </div>

      </main>

    </div>

  );
}
