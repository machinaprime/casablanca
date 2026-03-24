/**
 * Polymarket Backtest - High-Volatility Strategy
 */
const axios = require('axios');

const INITIAL_CAPITAL = 1000;
const TRADE_SIZE = 50;
let portfolio = { cash: INITIAL_CAPITAL, trades: [], wins: 0, losses: 0 };

function log(msg) { console.log(msg); }

async function getMarkets() {
  try {
    const r = await axios.get('https://clob.polymarket.com/markets?limit=30&active=true', {timeout: 10000});
    return r.data?.data || r.data;
  } catch(e) {
    log('❌ Error fetching markets: ' + e.message);
    return [];
  }
}

async function getOrderbook(tokenId) {
  try {
    // Safely construct URL to prevent injection attacks
    const url = new URL('https://clob.polymarket.com/orderbook');
    url.searchParams.append('token_id', String(tokenId));
    const r = await axios.get(url.toString(), {timeout: 5000});
    return r.data;
  } catch(e) {
    log('❌ Error fetching orderbook: ' + e.message);
    return null;
  }
}

// High volatility simulation
function simulateVolatile(currentPrice) {
  const change = (Math.random() - 0.5) * 0.25; // ±12.5%
  return Math.max(0.1, Math.min(0.9, currentPrice + change));
}

async function backtest() {
  log('📊 POLYMARKET BACKTEST - High Volatility');
  log('='.repeat(50));
  log('\n💰 Initial: $' + INITIAL_CAPITAL);
  log('📈 Entry: Buy dips < 40%, Exit: > 60% or < 25%\n');

  const markets = await getMarkets();
  log('📊 Testing ' + markets.length + ' markets...\n');

  for (const m of markets.slice(0, 30)) {
    const tokens = m?.clobTokenIds;
    if (!tokens || tokens.length < 2) continue;

    try {
      const yesBook = await getOrderbook(tokens[0]);
      const startPrice = parseFloat(yesBook.asks?.[0]?.price || yesBook.bids?.[0]?.price || 0.5);
      if (startPrice < 0.15 || startPrice > 0.85) continue;

      let price = startPrice;
      let position = null;

      for (let tick = 0; tick < 30; tick++) {
        price = simulateVolatile(price);

        // Entry: Buy the dip
        if (!position && price < 0.40 && portfolio.cash >= TRADE_SIZE) {
          const shares = Math.floor(TRADE_SIZE / price);
          position = { entry: price, shares: shares, cost: shares * price };
          portfolio.cash -= position.cost;
        }

        // Exit
        if (position) {
          if (price > 0.60 || price < 0.25 || tick === 29) {
            const proceeds = position.shares * price;
            const profit = proceeds - position.cost;
            portfolio.cash += proceeds;
            portfolio.trades.push({ profit: profit, won: profit > 0 });
            if (profit > 0) portfolio.wins++;
            else portfolio.losses++;
            position = null;
          }
        }
      }
      
      if (position) {
        const proceeds = position.shares * price;
        const profit = proceeds - position.cost;
        portfolio.cash += proceeds;
        portfolio.trades.push({ profit: profit, won: profit > 0 });
        if (profit > 0) portfolio.wins++;
        else portfolio.losses++;
      }
    } catch (e) {
      log('⚠️  Error processing market: ' + (e.message || 'Unknown error'));
    }
  }

  const final = portfolio.cash;
  const ret = ((final - INITIAL_CAPITAL) / INITIAL_CAPITAL) * 100;

  log('='.repeat(50));
  log('\n📈 RESULTS:');
  log('   Trades: ' + portfolio.trades.length);
  log('   Win Rate: ' + (portfolio.trades.length ? ((portfolio.wins/portfolio.trades.length)*100).toFixed(1) : 0) + '%');
  log('\n💰 Start: $' + INITIAL_CAPITAL + ' | Final: $' + final.toFixed(2));
  log('📊 Return: ' + (ret >= 0 ? '+' : '') + ret.toFixed(2) + '%');
  
  if (portfolio.trades.length) {
    const avg = portfolio.trades.reduce((a,b) => a+b.profit, 0) / portfolio.trades.length;
    log('   Avg Trade: $' + avg.toFixed(2));
  }
  log('\n✅ Backtest complete!\n');
}

backtest().catch(e => log('Error: ' + e.message));