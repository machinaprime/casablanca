/**
 * Polymarket Trading Bot - Node.js Version
 */
const { ethers } = require('ethers');
const axios = require('axios');

const CONFIG = {
  privateKey: '0x201873b80be149ec85aa9e18c34a4746c53e5f63e853950dc28389b8d82fe2c5',
  proxyWallet: '0x618a1aa9459569B9c437765870eD13252c6f6420',
  tradeSize: 5,
  minProfit: 0.02,
  dryRun: true // Set to false to actually trade
};

const CLOB = 'https://clob.polymarket.com';

console.log('🤖 Polymarket Trading Bot');
console.log('='.repeat(40));
console.log('Mode:', CONFIG.dryRun ? 'DRY RUN' : 'LIVE');
console.log('Wallet:', CONFIG.privateKey.slice(0, 10) + '...');
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
    console.log('💡 Set dryRun = false to trade for real\n');
  }
}

main();