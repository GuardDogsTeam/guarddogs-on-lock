# 🐶 GuardDogs On Lock

**AI-Powered Smart-Contract Auditor on Rootstock Testnet**

---

## 🚀 Elevator Pitch  
Every day, over **10 000 new EVM contracts** go live on major networks—yet traditional security audits take days, cost thousands, and live behind paywalls. **GuardDogs On Lock** combines GPT-4 code analysis with on-chain logging on Rootstock, delivering a verifiable **Trust Score** in minutes and recording both request and result immutably on-chain.

---

## 📋 Table of Contents  
- [Demo](#demo)  
- [Features](#features)  
- [Problem Statement](#problem-statement)  
- [Solution Overview](#solution-overview)  
- [Architecture](#architecture)  
- [Tech Stack](#tech-stack)  
- [Prerequisites](#prerequisites)  
- [Installation & Setup](#installation--setup)  
- [Usage](#usage)  
- [Configuration](#configuration)  
- [Testing](#testing)  
- [Roadmap](#roadmap)  
- [Team](#team)  
- [License](#license)  

---

## 📺 Demo  
Live on Rootstock Testnet: [guarddogsol.com](https://guarddogsol.com)  
![Demo Screenshot](docs/demo-screenshot.png)

---

## ⭐ Features  
- **Seamless Wallet Connect** (MetaMask, TronLink)  
- **On-Chain Audit Requests** via a lightweight Ownable Registry contract  
- **GPT-4 Security Analysis**: Trust Score (0–100), description, risks, red flags  
- **Immutable Logs**: AuditRequested & AuditCompleted events on-chain  
- **Caching** by code-hash or contract address to reuse prior results  
- **Fallback Score** (50/100) when AI fails, ensuring a result every time  

---

## ❗ Problem Statement  
1. **Rapid Growth**: Thousands of contracts deploy daily—manual audits can’t keep up.  
2. **High Friction**: Traditional audits take days/weeks and cost thousands of dollars.  
3. **Lack of Transparency**: Reports live off-chain in PDFs or private dashboards.  
4. **Single Point of Trust**: Relying on one auditor creates a bottleneck and single point of failure.

---

## 💡 Solution Overview  
1. **Submit any Rootstock Testnet contract** via our web DApp.  
2. **AuditRequested** event is emitted on-chain.  
3. Off-chain service fetches code (Alchemy + Blockscout) & runs GPT-4.  
4. **AuditCompleted** event logs results (Trust Score + findings) on-chain.  
5. Frontend displays live results; anyone can verify via Rootstock explorer.

---

## 🏗️ Architecture  
