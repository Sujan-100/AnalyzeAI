from datetime import timedelta
from threading import Lock
import os
import uuid

from flask import Flask, jsonify, request, send_from_directory, session
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

from extract_text import extract_text
from summarizer import summarize_text
from analyzer import analyze_summary_metrics
from highlight import highlight_terms
from gemini_helper import generate_gemini_response

load_dotenv()

# ---------- PATH SETUP ----------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_FOLDER = os.path.join(BASE_DIR, "Frontend two", "dist", "public")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------- APP INIT ----------

app = Flask(__name__, static_folder=FRONTEND_FOLDER, static_url_path="")

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY") or os.urandom(32)
app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_CONTENT_LENGTH", str(10 * 1024 * 1024)))
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(
    minutes=int(os.getenv("SESSION_LIFETIME_MINUTES", "60"))
)

app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = os.getenv("SESSION_COOKIE_SECURE", "0") == "1"

# ---------- CORS ----------

cors_origins = os.getenv("CORS_ORIGINS", "*")

if cors_origins == "*":
    CORS(app)
else:
    origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
    CORS(app, resources={r"/*": {"origins": origins}})

# ---------- GLOBAL CONTEXT ----------

ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}

_context_lock = Lock()
_user_contexts = {}

# ---------- HELPERS ----------


def _allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _get_user_context():
    session.permanent = True

    sid = session.get("sid")
    if not sid:
        sid = uuid.uuid4().hex
        session["sid"] = sid

    with _context_lock:
        context = _user_contexts.get(sid)

        if not context:
            context = {"text": "", "summary": ""}
            _user_contexts[sid] = context

        return context


# ---------- HEALTH CHECK ----------


@app.route("/health")
def health():
    return jsonify({"status": "running"})


# ---------- FRONTEND ROUTES ----------


@app.route("/")
def serve_frontend():
    try:
        return send_from_directory(app.static_folder, "index.html")
    except:
        return jsonify({"message": "AnalyzeAI backend running"})


@app.route("/<path:path>")
def serve_static_or_frontend(path):
    file_path = os.path.join(app.static_folder, path)

    if os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)

    return send_from_directory(app.static_folder, "index.html")


# ---------- FILE UPLOAD ----------


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if not file or file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not _allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type"}), 400

    safe_name = secure_filename(file.filename)
    unique_name = f"{uuid.uuid4().hex}_{safe_name}"

    file_path = os.path.join(UPLOAD_FOLDER, unique_name)
    file.save(file_path)

    try:
        extracted_text = extract_text(file_path)

        user_context = _get_user_context()
        user_context["text"] = extracted_text

        return jsonify({"text": extracted_text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        try:
            os.remove(file_path)
        except OSError:
            pass


# ---------- HIGHLIGHT ----------


@app.route("/highlight", methods=["POST"])
def highlight_text_route():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        highlighted = highlight_terms(text)

        return jsonify({"highlighted_text": highlighted})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------- SUMMARIZE ----------


@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    text = data.get("text")
    model_name = data.get("model", "bart")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        summary = summarize_text(model_name, text)

        user_context = _get_user_context()
        user_context["summary"] = summary

        analysis_data = analyze_summary_metrics(text, summary)

        return jsonify({
            "model": model_name,
            "summary": summary,
            "metrics": analysis_data
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------- MODEL COMPARISON ----------


@app.route("/compare_models_full", methods=["POST"])
def compare_models_full():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    text = data.get("text")

    if not text:
        return jsonify({"error": "No text provided for comparison"}), 400

    models_to_compare = ["bart", "t5", "gemini-2.5-pro"]

    comparison_results = []

    user_context = _get_user_context()

    full_text = user_context["text"] if user_context["text"] else text

    for model_name in models_to_compare:

        try:
            summary = summarize_text(model_name, full_text)

            analysis_data = analyze_summary_metrics(full_text, summary)

            comparison_results.append({
                "model": model_name,
                "summary": summary,
                "metrics": analysis_data
            })

        except Exception as e:

            comparison_results.append({
                "model": model_name,
                "error": f"Model failed: {str(e)}"
            })

    return jsonify({"results": comparison_results})


# ---------- GEMINI CHAT ----------


@app.route("/chat", methods=["POST"])
def chat_with_gemini():

    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    prompt = data.get("prompt", "")

    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    user_context = _get_user_context()

    if not user_context["text"] and not user_context["summary"]:
        return jsonify({
            "error": "No document context available. Upload and summarize first."
        }), 400

    context = (
        "Answer the user's question ONLY based on the following context.\n"
        "If the answer cannot be found, say 'The information is not available in the uploaded document.'\n\n"
        f"Extracted text:\n{user_context['text'][:4000]}\n\n"
        f"Summary:\n{user_context['summary'][:2000]}\n\n"
        f"User question: {prompt}"
    )

    try:
        response = generate_gemini_response(context)

        return jsonify({"response": response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------- LOCAL RUN ----------


if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "0") == "1"
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5000"))

    app.run(host=host, port=port, debug=debug)