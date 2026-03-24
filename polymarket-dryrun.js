const axios = require('axios');

async function main() {
  console.log('🔍 Polymarket Dry Run\n');
  
  try {
    const r = await axios.get('https://clob.polymarket.com/markets?limit=3&active=true', {timeout: 5000});
    const m = r.data?.data?.[0];
    console.log(`📈 Market: ${m?.question?.slice(0, 40) || 'OK'}`);
    console.log('✅ API OK - Dry run complete!');
  } catch (e) {
    console.log('API Error:', e.message);
  }
}

main();