from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

DEEPGRAM_API_KEY = "c1d25ff97bb64066aff2be3c7a904af946ff306e"

@app.route("/")
def home():
    return {"message": "Backend Running"}

@app.route("/transcribe", methods=["POST"])
def transcribe():

    audio_file = request.files.get("file")

    if not audio_file:
        return jsonify({"error": "No file uploaded"}), 400

    file_path = os.path.join(
        UPLOAD_FOLDER,
        audio_file.filename
    )

    audio_file.save(file_path)

    with open(file_path, "rb") as file:

        response = requests.post(
            "https://api.deepgram.com/v1/listen",
            headers={
                "Authorization": f"Token {DEEPGRAM_API_KEY}",
                "Content-Type": "audio/webm"
            },
            data=file
        )

    result = response.json()

    transcript = result["results"]["channels"][0]["alternatives"][0]["transcript"]

    return jsonify({
        "transcript": transcript
    })

if __name__ == "__main__":
    app.run(debug=True)