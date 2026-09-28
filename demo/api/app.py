from flask import Flask, jsonify
import psycopg2
import os

app = Flask(__name__)

DB_HOST = os.getenv("DB_HOST", "demo-db")
DB_NAME = os.getenv("DB_NAME", "sentinelops")
DB_USER = os.getenv("DB_USER", "sentinel")
DB_PASSWORD = os.getenv("DB_PASSWORD", "sentinel")


@app.route("/health")
def health():
    try:
        connection = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )

        connection.close()

        return jsonify({
            "status": "healthy",
            "database": "connected"
        }), 200

    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "database": "unavailable",
            "error": str(e)
        }), 503


@app.route("/")
def home():
    return "SentinelOps Demo API"


app.run(host="0.0.0.0", port=8000)
