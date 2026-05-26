from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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

    return jsonify({
        "message": "File received successfully",
        "filename": audio_file.filename
    })

if __name__ == "__main__":
    app.run(debug=True)