# auth.py

from flask import Blueprint, request, jsonify
from app import db
from models import User
from flask_jwt_extended import create_access_token
from stellar_sdk import Keypair
from sqlalchemy.exc import IntegrityError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')
    public_key = data.get('publicKey')  # Public key generated on the client side

    if not username or not password or not public_key:
        return jsonify({"error": "Username, password, and publicKey are required."}), 400

    # Check if user already exists
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists."}), 409

    # Validate Stellar public key format
    try:
        Keypair.from_public_key(public_key)
    except Exception:
        return jsonify({"error": "Invalid Stellar public key format."}), 400

    # Check if public key is already in use
    if User.query.filter_by(stellar_public_key=public_key).first():
        return jsonify({"error": "Stellar public key already in use."}), 409

    # Hash the password
    hashed_password = User.generate_hash(password)

    # Create new user
    new_user = User(username=username, password=hashed_password, stellar_public_key=public_key)

    try:
        new_user.save_to_db()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Database integrity error."}), 500

    # **Important:** Do NOT send the secret key to the backend
    # The client should handle secret key storage securely

    return jsonify({
        "message": "User registered successfully.",
        "publicKey": public_key
    }), 201
    

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not User.verify_hash(password, user.password):
        return jsonify({"error": "Invalid username or password."}), 401

    access_token = create_access_token(identity=user.id)

    return jsonify({
        "message": "Login successful.",
        "accessToken": access_token
    }), 200