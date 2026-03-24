/**
 * Polymarket Simulation Run - Simulates trading without placing real orders
 */
const axios = require('axios');

const WALLET = {
  address: '0x95Bc4FC11427b908E8CEaA7777fd06e9048480E2',
  privateKey: '0x201873b80be149ec85aa9e18c34a4746c53e5f63e853950dc28389b8d82fe2c5'
};

// Simulated portfolio
let portfolio = {
  usdc: 100, // Starting with $100 simulation
  positions: []
};

function log(msg) {
  console.log(msg);
}

async function getMarkets() {
  const r = await axios.get('https://clob.polymarket.com/markets?limit=20&active=true');
  return r.data?.data || r.data;
}

async function getOrderbook(tokenId) {
  const r = await axios.get(`https://clob.polymarket.com/orderbook?token_id=${tokenId}`);
  return r.data;
}

async function simulate() {
  log('🎮 POLYMARKET SIMULATION RUN');
  log('='.repeat(45));
  log(`\n💰 Starting Balance: $${portfolio.usdc.toFixed(2)}\n`);

  const markets = await getMarkets();
  log(`📊 Analyzing ${markets.length} markets...\n`);

  let opportunities = 0;
  let trades = 0;
  const tradeSize = 10; // $10 per trade simulation

  for (const m of markets.slice(0, 10)) {
    const tokens = m?.clobTokenIds;
    if (!tokens || tokens.length < 2) continue;

    try {
      const [yesBook, noBook] = await Promise.all([
        getOrderbook(tokens[0]),
        getOrderbook(tokens[1])
      ]);

      const yesAsk = parseFloat(yesBook.asks?.[0]?.price || 0);
      const noAsk = parseFloat(noBook.asks?.[0]?.price || 0);

      if (yesAsk > 0 && noAsk > 0) {
        const totalCost = yesAsk + noAsk;
        const profit = ((1 - totalCost) * 100);

        if (totalCost < 1) {
          opportunities++;
          log(`💰 ARB FOUND!`);
          log(`   ${(m.question || 'Unknown').slice(0, 35)}`);
          log(`   YES: $${yesAsk.toFixed(2)} | NO: $${noAsk.toFixed(2)}`);
          log(`   Cost: $${totalCost.toFixed(2)} | Profit: ${profit.toFixed(2)}%`);

          // Simulate trade
          if (portfolio.usdc >= tradeSize) {
            const shares = Math.floor(tradeSize / yesAsk);
            const cost = shares * yesAsk + shares * noAsk;
            const payout = shares; // One side pays $1 per share

            portfolio.usdc -= cost;
            portfolio.positions.push({
              market: m.question,
              yesShares: shares,
              noShares: shares,
              cost: cost,
              potentialPayout: payout,
              profit: payout - cost
            });

            log(`   ✅ SIMULATED TRADE: Bought ${shares} shares each side`);
            log(`   Cost: $${cost.toFixed(2)} | Potential: $${payout.toFixed(2)}`);
            trades++;
          }
          log('');
        }
      }
    } catch (e) {
      // Skip errors
    }
  }

  log('='.repeat(45));
  log('\n📈 SIMULATION RESULTS:');
  log(`   Markets Scanned: 10`);
  log(`   Arbitrage Opps: ${opportunities}`);
  log(`   Trades Executed: ${trades}`);
  log(`   Current Balance: $${portfolio.usdc.toFixed(2)}`);

  if (portfolio.positions.length > 0) {
    log('\n📋 OPEN POSITIONS:');
    for (const p of portfolio.positions) {
      log(`   ${(p.market || 'Unknown').slice(0, 30)}...`);
      log(`   Cost: $${p.cost.toFixed(2)} | Potential: $${p.potentialPayout.toFixed(2)}`);
    }
  }

  log('\n✅ Simulation complete - NO real trades placed!');
  log('💡 To trade for real: fund wallet + configure bot\n');
}

simulate().catch(e => log('Error: ' + e.message));