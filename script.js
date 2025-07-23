const usdtInput = document.getElementById("usdtInput");
const usdtValue = document.getElementById("usdtValue");
const btcAmount = document.getElementById("btcAmount");
const btcUsd = document.getElementById("btcUsd");
const rateLine = document.getElementById("rateLine");

// Current rate of BTC in USDT (unlink this if dynamic)
const BTC_RATE = 119489.153599;

function update() {
  let usdt = parseFloat(usdtInput.value);
  if (isNaN(usdt) || usdt < 200) {
    usdt = 200;
    usdtInput.value = 200;
  }

  const usdtDisplay = usdt.toFixed(2);
  usdtValue.innerText = `$${usdtDisplay}`;

  const usdOut = usdt * 3;  // 3x rule
  const btcOut = usdOut / BTC_RATE;

  btcUsd.innerHTML = `$${usdOut.toFixed(2)} <span class="red">(-1%)</span>`;
  btcAmount.innerText = btcOut.toFixed(8);
  rateLine.innerText = `1 BTC ≈ ${BTC_RATE.toLocaleString('en')} USDT`;
}

usdtInput.addEventListener("input", update);
update();
