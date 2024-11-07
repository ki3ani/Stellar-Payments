from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from stellar_sdk import Server, exceptions
from models import User
from app import db
import os

transactions_bp = Blueprint('transactions', __name__)
server = Server(horizon_url=os.getenv('HORIZON_URL', 'https://horizon.stellar.org'))

@transactions_bp.route('/transactions/get', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.stellar_public_key:
        return jsonify({"error": "User not found or public key not set."}), 404

    public_key = user.stellar_public_key

    try:
        transactions = server.transactions().for_account(public_key).call()

        transactions_dict = {
            "records": [
                {
                    "id": txn.id,
                    "paging_token": txn.paging_token,
                    "source_account": txn.source_account,
                    "type": txn.type,
                    "type_i": txn.type_i,
                    "created_at": txn.created_at,
                    "transaction_hash": txn.hash
                }
                for txn in transactions.records
            ],
            "_links": {
                "self": transactions._links.get("self"),
                "next": transactions._links.get("next"),
                "prev": transactions._links.get("prev")
            }
        }

        return jsonify({"transactions": transactions_dict}), 200

    except exceptions.NotFoundError:
        return jsonify({"error": "Account not found on Stellar network."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@transactions_bp.route('/transactions/send', methods=['POST'])
@jwt_required()
def send_usdc():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json()
    signed_xdr = data.get('signedXDR')

    if not signed_xdr:
        return jsonify({"error": "signedXDR is required."}), 400

    try:
        response = server.submit_transaction(signed_xdr)
        return jsonify({"message": "USDC sent successfully.", "transaction_hash": response['hash']}), 200
    except exceptions.BadRequestError as e:
        return jsonify({"error": "Bad Request.", "details": e.details}), 400
    except exceptions.ForbiddenError as e:
        return jsonify({"error": "Forbidden.", "details": e.details}), 403
    except Exception as e:
        return jsonify({"error": "An error occurred while sending USDC.", "details": str(e)}), 500