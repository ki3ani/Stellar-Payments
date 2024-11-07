# app.py

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# =====================
# Configuration
# =====================

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default_jwt_secret_key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///stellar_payments.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# =====================
# Initialize Extensions
# =====================

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

# Initialize Limiter without passing the app instance
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Initialize extensions with the app
db.init_app(app)
migrate.init_app(app, db)
jwt.init_app(app)
limiter.init_app(app)

# Configure CORS to allow only your frontend's domain
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Replace with your frontend's URL

# =====================
# Register Blueprints
# =====================

from auth import auth_bp
from transactions import transactions_bp

app.register_blueprint(auth_bp)
app.register_blueprint(transactions_bp)

# =====================
# Routes
# =====================

@app.route('/')
def home():
    return jsonify({"message": "Stellar Payments Backend is running."})

# =====================
# Error Handlers
# =====================

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource not found."}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({"error": "An internal error occurred."}), 500

# =====================
# Run the Application
# =====================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)