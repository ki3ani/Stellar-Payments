from stellar_sdk import Asset, Keypair, Server, TransactionBuilder, Network
import requests

def create_stellar_account():
    keypair = Keypair.random()
    public_key = keypair.public_key
    secret_seed = keypair.secret

    try:
        fund_account(public_key)
        return public_key, secret_seed
    except Exception as e:
        print(f"Error funding account: {e}")
        return None, None

def fund_account(public_key):
    friendbot_url = "https://friendbot.stellar.org"
    response = requests.get(friendbot_url, params={"addr": public_key}) 

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to fund account: {response.text}")

def check_account_balance(account_id):
    server = Server(horizon_url="https://horizon-testnet.stellar.org")
    account = server.accounts().account_id(account_id).call()
    return account['balances']

def send_payment(from_account, to_account, amount, asset_code="XLM", asset_issuer=None):
    server = Server(horizon_url="https://horizon-testnet.stellar.org")
    source_keypair = Keypair.from_secret(from_account.secret_seed)
    source_account = server.load_account(account_id=from_account.account_id)
    base_fee = server.fetch_base_fee()
    
    # Determine the asset
    if asset_code == "XLM":
        asset = Asset.native()  # Lumens
    else:
        asset = Asset(asset_code, asset_issuer)  # Custom asset
    
    transaction = TransactionBuilder(
        source_account=source_account,
        network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
        base_fee=base_fee
    ).add_text_memo("Test Transaction").append_payment_op(
        destination=to_account,
        amount=str(amount),
        asset=asset
    ).build()
    
    transaction.sign(source_keypair)
    response = server.submit_transaction(transaction)
    return response

def get_transaction_history(account_id):
    server = Server(horizon_url="https://horizon-testnet.stellar.org")
    transactions = server.transactions().for_account(account_id).call()
    return transactions['_embedded']['records']
