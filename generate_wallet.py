"""
Generate a new Ethereum/Polygon wallet
"""
import os
import json

# Try to use eth_account
try:
    from eth_account import Account
except ImportError:
    print("eth_account not available, using basic method")
    Account = None

def generate_wallet():
    if Account:
        # Generate new account
        acct = Account.create()
        return {
            "address": acct.address,
            "private_key": acct.key.hex(),
            "mnemonic": None  # Account.create() doesn't give mnemonic by default
        }
    else:
        # Fallback - generate random 32 bytes as private key
        # This won't give a valid wallet without web3
        return None

if __name__ == "__main__":
    wallet = generate_wallet()
    if wallet:
        print(json.dumps(wallet, indent=2))
    else:
        print("Could not generate wallet - packages not available")
