// app.js - Updated: Regex-based address validation, no ethers checksum enforcement
import {
  ethers
} from "https://esm.sh/ethers@6";
import {
  Alchemy,
  Network
} from "https://esm.sh/alchemy-sdk";
// Simple regex to validate 0x hex addresses (40 hex chars)
const addressRegex = /^0x[0-9a-fA-F]{40}$/;
// Helper to detect Ethereum provider
function getEthereumProvider() {
  if (!window.ethereum) throw new Error("No injected Ethereum provider found");
  if (Array.isArray(window.ethereum.providers)) {
    return window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum.providers[0];
  }
  return window.ethereum;
}
// Alchemy & Registry configuration
const ALCHEMY_API_KEY = "TZ5A1D3RvnVCpng-5hLxUrh9Ws4Uyjkg";
const ALCHEMY_RPC_URL = `https://rootstock-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
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
    }, {
      indexed: true,
      internalType: "address",
      name: "target",
      type: "address"
    }, {
      indexed: false,
      internalType: "uint256",
      name: "timestamp",
      type: "uint256"
    }],
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
    }, {
      indexed: false,
      internalType: "uint8",
      name: "score",
      type: "uint8"
    }, {
      indexed: false,
      internalType: "uint256",
      name: "timestamp",
      type: "uint256"
    }],
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
    }, {
      internalType: "uint8",
      name: "score",
      type: "uint8"
    }],
    name: "completeAudit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];
let signer, registry;
window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connect");
  const walletEl = document.getElementById("wallet");
  const analyzeBtn = document.getElementById("analyze");
  const addressInput = document.getElementById("contractAddress");
  const resultEl = document.getElementById("output");
  // Initialize Alchemy for off-chain reads (not used directly here)
  new Alchemy({
    apiKey: ALCHEMY_API_KEY,
    network: Network.RSK_TESTNET
  });
  connectBtn.onclick = async () => {
    try {
      const ethProvider = getEthereumProvider();
      const accounts = await ethProvider.request({
        method: "eth_requestAccounts"
      });
      if (!accounts || accounts.length === 0) throw new Error("No accounts returned");
      const provider = new ethers.BrowserProvider(ethProvider);
      signer = await provider.getSigner();
      const addr = await signer.getAddress();
      walletEl.textContent = `Connected: ${addr}`;
      connectBtn.disabled = true;
      registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
    } catch (err) {
      console.error(err);
      alert("🔴 Wallet connection failed:\n" + err.message);
    }
  };
  analyzeBtn.onclick = async () => {
    if (!signer) {
      alert("🔴 Please connect your wallet first");
      return;
    }
    const raw = addressInput.value.trim();
    if (!addressRegex.test(raw)) {
      resultEl.innerHTML = `<p style=\"color:red\">❌ Invalid address format</p>`;
      return;
    }
    const target = raw.toLowerCase();
    try {
      resultEl.innerHTML = `<p>⏳ Checking for deployed code…</p>`;
      const rpc = new ethers.JsonRpcProvider(ALCHEMY_RPC_URL);
      const code = await rpc.getCode(target);
      if (code === "0x") {
        resultEl.innerHTML = `<p style=\"color:red\">❌ No contract found at ${target}</p>`;
        return;
      }
      resultEl.innerHTML = `<p>🔗 Sending audit request…</p>`;
      const tx = await registry.requestAudit(target);
      resultEl.innerHTML += `<p>🔗 Tx hash: ${tx.hash}</p><p>⏳ Waiting confirmation…</p>`;
      await tx.wait();
      const balance = await rpc.getBalance(target);
      resultEl.innerHTML = `
        <p><strong>Address:</strong> ${target}</p>
        <p><strong>Bytecode length:</strong> ${code.length}</p>
        <p><strong>Balance:</strong> ${ethers.formatEther(balance)} RBTC</p>
      `;
      resultEl.innerHTML += `<p>🛰 Fetching source verification…</p>`;
      const metaRes = await fetch(
        `https://rootstock-testnet.blockscout.com/api/v2/smart-contracts/${target}`
      );
      const meta = await metaRes.json();
      if (meta.name) {
        resultEl.innerHTML += `
          <p><strong>Name:</strong> ${meta.name}</p>
          <p><strong>Compiler:</strong> ${meta.compiler_version}</p>
          <p><strong>Optimized:</strong> ${meta.optimization_enabled ? "Yes" : "No"}</p>
          <pre style=\"background:#f6f6f6;padding:1em;overflow:auto\">${meta.source_code}</pre>
        `;
      } else {
        resultEl.innerHTML += `<p style=\"color:orange\">⚠️ Source not verified on Blockscout</p>`;
      }
      resultEl.innerHTML += `<p>🤖 Running AI audit…</p>`;
      const aiRes = await fetch("analyze.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          source: meta.source_code || code,
          address: target
        })
      });
      const aiData = await aiRes.json();
      if (aiData.error) throw new Error(aiData.error);
      resultEl.innerHTML += `
        <h3>🧠 AI Audit</h3>
        <p><strong>Score:</strong> ${aiData.score}/100</p>
        <pre>${aiData.analysis}</pre>
        <p style=\"color:green\">✅ AuditCompleted event will be emitted on-chain shortly</p>
      `;
      await registry.completeAudit(target, aiData.score);
    } catch (err) {
      console.error(err);
      resultEl.innerHTML = `<p style=\"color:red\">❌ ${err.message}</p>`;
    }
  };
});