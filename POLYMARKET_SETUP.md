# POLYMARKET SETUP - SECURE

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

### 🔐 Private Key Management
- **NEVER hardcode private keys in code**
- Use environment variables only
- Add `.env` to `.gitignore` ✓ (already configured)
- Never commit keys to version control
- Regenerate keys if accidentally exposed

### 🛡️ .env File Security
```bash
# Set restrictive permissions on .env file (Linux/Mac)
chmod 600 .env

# Never add to git
git status | grep .env  # Should show nothing
```

### ⚠️ Best Practices
- **Dry Run First:** Always test with `DRY_RUN=true` before live trading
- **Validate Config:** All numeric values are validated for correctness
- **Error Logging:** All API errors are logged for debugging
- **URL Safety:** All API requests use safe parameter encoding
- **Input Validation:** Trade size and profit margins are validated

### 🔄 Recommended Setup
```bash
# 1. Generate new wallet
node -e "const { ethers } = require('ethers'); const w = ethers.Wallet.createRandom(); console.log('Address:', w.address); console.log('Key:', w.privateKey);"

# 2. Create .env file with proper permissions
cat > .env << 'EOF'
POLY_PRIVATE_KEY=<paste_your_key>
POLY_PROXY_WALLET=<proxy_wallet_address>
TRADE_SIZE=5
MIN_PROFIT=0.02
DRY_RUN=true
TIMEOUT=10000
EOF
chmod 600 .env

# 3. Test with dry run
node polymarket-bot.js
```
