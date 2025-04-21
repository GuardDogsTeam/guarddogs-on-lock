import {
  Alchemy,
  Network
} from "https://esm.sh/alchemy-sdk";
const ethers = window.ethers;

function getEthereumProvider() {
  if (!window.ethereum) {
    throw new Error("No injected Ethereum provider found");
  }
  if (Array.isArray(window.ethereum.providers)) {
    return window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum.providers[0];
  }
  return window.ethereum;
}
const ALCHEMY_API_KEY = "TZ5A1D3RvnVCpng-5hLxUrh9Ws4Uyjkg";
const ALCHEMY_RPC_URL = "https://rootstock-testnet.g.alchemy.com/v2/TZ5A1D3RvnVCpng-5hLxUrh9Ws4Uyjkg";
const REGISTRY_ADDRESS = "0x48a13FA003193e401516EF45B2D7AADE6207c8dc";
const REGISTRY_ABI = [{
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [{
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "target",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256"
      }
    ],
    name: "AuditRequested",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{
        indexed: true,
        internalType: "address",
        name: "target",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "score",
        type: "uint8"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256"
      }
    ],
    name: "AuditCompleted",
    type: "event"
  },
  {
    inputs: [{
      internalType: "address",
      name: "target",
      type: "address"
    }],
    name: "requestAudit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{
        internalType: "address",
        name: "target",
        type: "address"
      },
      {
        internalType: "uint8",
        name: "score",
        type: "uint8"
      }
    ],
    name: "completeAudit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];
let provider, signer, registry, alchemy;
window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connect");
  const walletEl = document.getElementById("wallet");
  const analyzeBtn = document.getElementById("analyze");
  const addressInput = document.getElementById("contractAddress");
  const resultEl = document.getElementById("output");
  alchemy = new Alchemy({
    apiKey: ALCHEMY_API_KEY,
    network: Network.RSK_TESTNET
  });
  connectBtn.onclick = async () => {
    try {
      const ethProvider = getEthereumProvider();
      const accounts = await ethProvider.request({
        method: "eth_requestAccounts"
      });
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned");
      }
      provider = new ethers.BrowserProvider(ethProvider);
      signer = await provider.getSigner();
      const addr = await signer.getAddress();
      walletEl.textContent = `Connected: ${addr}`;
      connectBtn.disabled = true;
      registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
    } catch (err) {
      console.error("Wallet connect error:", err);
      alert("Wallet connection failed:\n" + (err.message || err));
    }
  };
  analyzeBtn.onclick = async () => {
    if (!signer) {
      alert("Please connect your wallet first");
      return;
    }
    const target = addressInput.value.trim();
    if (!ethers.isAddress(target)) {
      alert("Invalid address");
      return;
    }
    resultEl.innerHTML = "⏳ Requesting audit…";
    try {
      const tx1 = await registry.requestAudit(target);
      resultEl.innerHTML = `<p>⏳ Audit requested (tx: ${tx1.hash})</p>`;
      await tx1.wait();
      const rpcProvider = new ethers.JsonRpcProvider(ALCHEMY_RPC_URL);
      const bytecode = await rpcProvider.getCode(target);
      if (!bytecode || bytecode === "0x") {
        resultEl.innerHTML = `<p style="color:red">❌ No contract found</p>`;
        return;
      }
      const balance = await rpcProvider.getBalance(target);
      resultEl.innerHTML += `
        <p><strong>Address:</strong> ${target}</p>
        <p><strong>Bytecode length:</strong> ${bytecode.length}</p>
        <p><strong>Balance:</strong> ${ethers.formatEther(balance)} RBTC</p>
      `;
      const metaRes = await fetch(
        `https://rootstock-testnet.blockscout.com/api/v2/smart-contracts/${target}`
      );
      const meta = await metaRes.json();
      if (!meta.name) {
        resultEl.innerHTML += `<p style="color:red">❌ Source not verified</p>`;
        return;
      }
      resultEl.innerHTML += `
        <p><strong>Name:</strong> ${meta.name}</p>
        <p><strong>Compiler:</strong> ${meta.compiler_version}</p>
        <p><strong>Optimized:</strong> ${meta.optimization_enabled ? "Yes" : "No"}</p>
        <pre style="background:#f6f6f6;padding:1em;overflow:auto">${meta.source_code}</pre>
      `;
      const aiRes = await fetch("analyze.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          source: meta.source_code
        })
      });
      const aiData = await aiRes.json();
      if (aiData.error) {
        resultEl.innerHTML += `<p style="color:red">❌ AI Error: ${aiData.error}</p>`;
        return;
      }
      resultEl.innerHTML += `
        <h3>🧠 AI Audit</h3>
        <p><strong>Score:</strong> ${aiData.score}/100</p>
        <pre>${aiData.analysis}</pre>
      `;
      resultEl.innerHTML += `<p style="color:green">✅ Audit will be logged on‑chain shortly</p>`;
    } catch (err) {
      console.error("Analyze error:", err);
      resultEl.innerHTML = `<p style="color:red">❌ Error: ${err.message}</p>`;
    }
  };
});