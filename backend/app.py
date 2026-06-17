import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from backend.config import Config
from backend.github_client import GitHubClient
from backend.cache_manager import CacheManager

app = Flask(__name__, static_folder="../dist", static_url_path="")
CORS(app)  # Enables cross-origin requests for Vite dev server

@app.route("/api/stats/<username>", methods=["GET"])
def get_user_stats(username):
    """Fetch GitHub stats for a given username, with caching."""
    payload, status_code = GitHubClient.get_user_stats(username)
    return jsonify(payload), status_code

@app.route("/api/rate-limit", methods=["GET"])
def get_rate_limit():
    """Get the current rate limit status of the server's token."""
    rate_limit_info = GitHubClient.get_rate_limit()
    return jsonify(rate_limit_info)

@app.route("/api/cache/clear", methods=["POST"])
def clear_cache():
    """Clear all server-side file cache entries."""
    success = CacheManager.clear()
    if success:
        return jsonify({"message": "Cache cleared successfully"}), 200
    return jsonify({"error": "Failed to clear cache"}), 500

# Catch-all route to serve the React frontend index.html for client-side routing
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # Fallback to index.html if file doesn't exist (for single page routing)
        if os.path.exists(os.path.join(app.static_folder, "index.html")):
            return send_from_directory(app.static_folder, "index.html")
        else:
            return jsonify({
                "message": "GitPulse Backend API is running. Build the frontend to view the dashboard UI."
            }), 200

if __name__ == "__main__":
    print(f"Starting GitPulse Flask server on port {Config.PORT}...")
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.FLASK_ENV == "development")
