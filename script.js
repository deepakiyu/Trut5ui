const usdtInput = document.getElementById("usdtInput");
const usdtValue = document.getElementById("usdtValue");
const btcUsd = document.getElementById("btcUsd");

function updateBTC() {
  let usdt = parseFloat(usdtInput.value);

  if (usdt < 200 || isNaN(usdt)) {
    usdt = 200;
    usdtInput.value = 200;
  }

  const usd = usdt.toFixed(2);
  const calculatedUSD = (usdt * 3).toFixed(2);

  usdtValue.innerText = `$${usd}`;
  btcUsd.innerHTML = `$${calculatedUSD} <span class="red">(-1%)</span>`;
}

usdtInput.addEventListener("input", updateBTC);
