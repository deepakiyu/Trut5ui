let btcRate = 0;

async function fetchBtcRate() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usdt");
    const json = await res.json();
    btcRate = json.bitcoin.usdt || 0;
  } catch {
    btcRate = 0;
  }
}

function updateDisplay() {
  const input = parseFloat(document.getElementById("usdtInput").value) || 0;
  const totalUSD = input * 3;

  document.getElementById("btcUsd").innerText = `$${totalUSD.toFixed(2)}`;
  document.getElementById("rateLine").innerText = `1 BTC ≈ ${btcRate ? btcRate.toLocaleString('en') : '--'} USDT`;

  const btcVal = btcRate ? totalUSD / btcRate : 0;
  document.getElementById("btcAmount").innerText = btcVal.toFixed(8);

  // ऊपर के बॉक्स में भी USD वैल्यू अपडेट होती रहे:
  document.getElementById("usdtValue").innerText = `$${totalUSD.toFixed(2)}`;
}

document.getElementById("usdtInput").addEventListener("input", updateDisplay);

async function init() {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  signer = provider.getSigner();

  await fetchBtcRate();
  updateDisplay(); // ⬅️ ये करेगा initial UI अपडेट
}

init();
