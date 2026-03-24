# POLYMARKET SETUP - SECURE

## ⚠️ OLD WALLET COMPROMISED - DO NOT USE
- Old Address: 0x95Bc4FC11427b908E8CEaA7777fd06e9048480E2
- Old Key: [COMPROMISED - DO NOT USE]

---

## NEW WALLET - FRESH

**⚠️ Private key will be shown ONCE only when generated. Save it securely!**

To generate a new wallet, run:
```bash
node -e "const { ethers } = require('ethers'); const w = ethers.Wallet.createRandom(); console.log('Address:', w.address); console.log('Key:', w.privateKey);"
```

---

## Environment Variables Setup

Create `.env` file (DO NOT commit to git!):
```bash
POLY_PRIVATE_KEY=your_new_private_key_here
POLY_PROXY_WALLET=your_proxy_wallet_from_polymarket_settings
TRADE_SIZE=5
MIN_PROFIT=0.02
DRY_RUN=true
```

Or set before running:
```bash
export POLY_PRIVATE_KEY=your_key
export POLY_PROXY_WALLET=your_proxy
```

---

## Run the Bot

```bash
# Install deps
npm install ethers axios

# Run (dry run mode)
node polymarket-bot.js

# Run live
DRY_RUN=false node polymarket-bot.js
```

---

## Security Notes
- NEVER hardcode private keys in code
- Use environment variables
- Add `.env` to `.gitignore`
- Never commit keys to version control
