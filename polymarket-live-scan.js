/**
 * Polymarket Live Scanner - 1 Hour Run
 * Scans every 30 seconds for 1 hour
 * NOTE: This is SCANNER ONLY - no actual trading
 */
const axios = require('axios');

const CONFIG = {
  scanInterval: 30000, // 30 seconds
  duration: 60 * 60 * 1000, // 1 hour
  minProfit: 0.02 // 2% threshold
};

const CLOB = 'https://clob.polymarket.com';

let stats = {
  scans: 0,
  opportunities: 0,
  startTime: Date.now()
};

console.log('🤖 POLYMARKET LIVE SCANNER');
console.log('='.repeat(45));
console.log('Duration: 1 hour');
console.log('Scan interval: 30 seconds');
console.log('Mode: SCANNER ONLY (no trading)');
console.log('Min profit threshold: ' + (CONFIG.minProfit * 100) + '%');
console.log('');

async function getMarkets() {
  try {
    const r = await axios.get(CLOB + '/markets?limit=50&active=true', {timeout: 10000});
    return r.data?.data || r.data;
  } catch(e) {
    console.error('❌ Error fetching markets:', e.message);
    return [];
  }
}

async function getOrderbook(tokenId) {
  try {
    // Safely construct URL to prevent injection attacks
    const url = new URL(CLOB + '/orderbook');
    url.searchParams.append('token_id', String(tokenId));
    const r = await axios.get(url.toString(), {timeout: 5000});
    return r.data;
  } catch(e) {
    console.error('❌ Error fetching orderbook:', e.message);
    return null;
  }
}

async function scan() {
  stats.scans++;
  const markets = await getMarkets();
  
  if (markets.length === 0) {
    console.log('[' + new Date().toLocaleTimeString() + '] ⚠️ No markets fetched');
    return;
  }
  
  let found = 0;
  
  for (const m of markets.slice(0, 20)) {
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
          stats.opportunities++;
          const profit = ((1 - total) * 100).toFixed(2);
          
          console.log('💰 [' + new Date().toLocaleTimeString() + '] ARBITRAGE!');
          console.log('   ' + (m.question || '?').slice(0, 40));
          console.log('   YES: $' + yesAsk.toFixed(2) + ' | NO: $' + noAsk.toFixed(2));
          console.log('   Profit: ' + profit + '%');
          console.log('');
        }
      }
    } catch(e) { }
  }
  
  const elapsed = Math.floor((Date.now() - stats.startTime) / 1000);
  const remaining = Math.floor((CONFIG.duration - (Date.now() - stats.startTime)) / 1000 / 60);
  
  if (found === 0) {
    console.log('[' + new Date().toLocaleTimeString() + '] Scan ' + stats.scans + ' - No opportunities | Elapsed: ' + elapsed + 's | Remaining: ' + remaining + 'min');
  }
}

async function run() {
  console.log('🚀 Starting 1-hour scan session...\n');
  
  const endTime = Date.now() + CONFIG.duration;
  
  while (Date.now() < endTime) {
    await scan();
    
    if (Date.now() < endTime) {
      await new Promise(r => setTimeout(r, CONFIG.scanInterval));
    }
  }
  
  console.log('='.repeat(45));
  console.log('\n📊 FINAL STATS:');
  console.log('   Total scans: ' + stats.scans);
  console.log('   Opportunities found: ' + stats.opportunities);
  console.log('   Duration: 1 hour');
  console.log('\n⚠️  This was SCANNER ONLY - no trades executed');
  console.log('💡 To trade, would need trading logic + live wallet\n');
}

run();