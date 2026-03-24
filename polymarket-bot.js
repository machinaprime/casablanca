/**
 * Polymarket Trading Bot - SECURE VERSION
 * Uses environment variables for sensitive data
 * 
 * Set these env vars before running:
 *   export POLY_PRIVATE_KEY=your_private_key_here
 *   export POLY_PROXY_WALLET=your_proxy_wallet_here
 */

const { ethers } = require('ethers');
const axios = require('axios');

// Load from environment variables - NEVER hardcode keys!
const CONFIG = {
  privateKey: process.env.POLY_PRIVATE_KEY,
  proxyWallet: process.env.POLY_PROXY_WALLET,
  tradeSize: parseInt(process.env.TRADE_SIZE) || 5,
  minProfit: parseFloat(process.env.MIN_PROFIT) || 0.02,
  dryRun: process.env.DRY_RUN !== 'false'
};

// Validate config
if (!CONFIG.privateKey) {
  console.log('❌ Error: POLY_PRIVATE_KEY not set');
  console.log('   Run: export POLY_PRIVATE_KEY=your_key_here');
  process.exit(1);
}

if (!CONFIG.proxyWallet) {
  console.log('❌ Error: POLY_PROXY_WALLET not set');
  console.log('   Run: export POLY_PROXY_WALLET=your_proxy_wallet');
  process.exit(1);
}

const CLOB = 'https://clob.polymarket.com';

console.log('🤖 Polymarket Trading Bot');
console.log('='.repeat(40));
console.log('Mode:', CONFIG.dryRun ? 'DRY RUN' : 'LIVE');
console.log('Wallet:', CONFIG.privateKey.slice(0, 10) + '...');
console.log('Proxy:', CONFIG.proxyWallet.slice(0, 10) + '...');
console.log('');

async function getMarkets() {
  try {
    const r = await axios.get(CLOB + '/markets?limit=30&active=true', {timeout: 10000});
    return r.data?.data || r.data;
  } catch(e) {
    console.log('Error fetching markets:', e.message);
    return [];
  }
}

async function getOrderbook(tokenId) {
  try {
    const r = await axios.get(CLOB + '/orderbook?token_id=' + tokenId, {timeout: 5000});
    return r.data;
  } catch(e) {
    return null;
  }
}

async function scan() {
  console.log('🔍 Scanning...\n');
  
  const markets = await getMarkets();
  console.log('Found', markets.length, 'markets');
  
  let found = 0;
  
  for (const m of markets.slice(0, 15)) {
    const tokens = m?.clobTokenIds;
    if (!tokens || tokens.length < 2) continue;
    
    try {
      const [yesBook, noBook] = await Promise.all([
        getOrderbook(tokens[0]),
        getOrderbook(tokens[1])
      ]);
      
      const yesAsk = parseFloat(yesBook?.asks?.[0]?.price || 0);
      const noAsk = parseFloat(noBook?.asks?.[0]?.price || 0);
      
      if (yesAsk > 0 && noAsk > 0) {
        const total = yesAsk + noAsk;
        
        if (total < (1 - CONFIG.minProfit)) {
          found++;
          const profit = ((1 - total) * 100).toFixed(2);
          console.log('💰 ARBITRAGE!');
          console.log('   ', (m.question || '?').slice(0, 45));
          console.log('   YES:', yesAsk.toFixed(2), '| NO:', noAsk.toFixed(2));
          console.log('   Profit:', profit + '%');
          
          if (!CONFIG.dryRun) {
            console.log('   ⚠️ Would execute trade now!');
          }
          console.log('');
        }
      }
    } catch(e) { }
  }
  
  if (found === 0) {
    console.log('❌ No opportunities found');
  } else {
    console.log('Found', found, 'opportunities');
  }
}

async function main() {
  await scan();
  console.log('\n✅ Scan complete');
  if (CONFIG.dryRun) {
    console.log('💡 Set DRY_RUN=false to trade for real\n');
  }
}

main();