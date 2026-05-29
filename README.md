# Speech To Text Application

## Overview

Speech To Text Application is a full-stack web application that allows users to record audio or upload audio files and convert speech into text using AI-powered transcription.

The application also provides user authentication and transcript history storage, allowing users to securely access their previous transcripts.

---

## Features

### Authentication

* User Signup
* User Login
* Secure Authentication using Supabase
* User Logout

### Audio Recording

* Record audio directly from the browser
* Start and Stop recording controls
* Audio preview support

### Audio Upload

* Upload audio files for transcription
* Supports browser-compatible audio formats

### Speech-to-Text Conversion

* AI-powered transcription using Deepgram API
* Fast and accurate speech recognition

### Transcript Management

* Display generated transcripts
* Save transcripts to Supabase Database
* View transcript history
* User-specific transcript storage

### Responsive UI

* Modern dashboard design
* Mobile-friendly interface
* Clean and professional user experience

---

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Python
* Flask
* Flask-CORS

### Database & Authentication

* Supabase

### Speech Recognition

* Deepgram API

### Version Control

* Git
* GitHub

---

## Project Structure

```text
speech-to-text-app/

├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
├── backend/
│   ├── uploads/
│   ├── app.py
│   └── venv/
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/adi9569m/speech-to-text-app.git
```

```bash
cd speech-to-text-app
```

---

## Frontend Setup

```bash
cd frontend
```

```bash
npm install
```

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

---

## Backend Setup

```bash
cd backend
```

Activate virtual environment:

### Windows PowerShell

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend:

```bash
python app.py
```

Backend runs on:

```text
http://127.0.0.1:5000
```

---

## Environment Variables

### Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### Deepgram

```env
DEEPGRAM_API_KEY=YOUR_DEEPGRAM_API_KEY
```

---

## Application Workflow

1. User logs in or creates an account.
2. User records audio or uploads an audio file.
3. Frontend sends audio to Flask backend.
4. Backend sends audio to Deepgram API.
5. Deepgram returns transcript text.
6. Transcript is displayed on the frontend.
7. Transcript is stored in Supabase.
8. User can view transcript history.

---

## Learning Outcomes

This project helped in learning:

* Full Stack Development
* Frontend and Backend Integration
* REST APIs
* Authentication Systems
* Database Operations
* Audio Processing
* Speech Recognition APIs
* Version Control with Git and GitHub

---

## Future Improvements

* Download transcript as TXT file
* Copy transcript to clipboard
* Multiple language support
* Dark mode
* Cloud deployment

---

## Author

Aditya Kumar Mishra

GitHub:
https://github.com/adi9569m
