# GuardDogs on Lock

**AI-powered smart-contract auditor with immutable on-chain logs on Rootstock Testnet**

GuardDogs on Lock lets any developer instantly audit a Rootstock smart contract using GPT-4 and record both the request and AI-generated trust score on-chain. Immutable `AuditRequested` and `AuditCompleted` events ensure full transparency.

### How It Works
1. **Wallet Connect** (MetaMask on RSK Testnet)  
2. **On-chain Registry**  
   - `requestAudit(address target)` → emits `AuditRequested(user,target,timestamp)`  
   - Off-chain listener fetches bytecode/source via Alchemy & Blockscout  
   - Runs GPT-4 security analysis  
   - Calls `completeAudit(address target,uint8 score)` → emits `AuditCompleted(target,score,timestamp)`  
3. **Frontend DApp** displays trust score, summary, risks & red flags  
4. **Caching** by contract address or source-hash prevents redundant AI calls  

### Links
- **Demo:** https://guarddogsol.com  
- **Video:** https://youtu.be/WBK7qsCRL4E  
- **GitHub:** https://github.com/GuardDogsTeam/guarddogs-on-lock  
- **Blockscout:** https://rootstock-testnet.blockscout.com/address/0x48A13fa003193e401516ef45b2D7aAde6207c8DC  
- **X:** https://x.com/GuardDogsTeam  
- **Presentation:** https://guarddogsol.com/GuardDogs-presentation.pdf

### AI Usage & Prompt Engineering
We began with a simple free-form prompt to GPT-4 asking for a security analysis, but inconsistent outputs led us to iteratively refine our approach. Today, we use a two-message dialog: a system role (“You are GuardDogs Security Auditor, an EVM/Solidity expert…”) followed by a user message that specifies the chain, contract address, and fenced Solidity source. We demand a strict JSON schema with fields trust_score, summary, security_risks, red_flags, gas_optimizations, and references. Model parameters are tuned to temperature=0.2 and max_tokens=600 for focused, concise results. To minimize latency and API cost, we implemented on-disk caching keyed by address or source-hash. These prompt-engineering steps ensure reliable, machine-readable audit reports that feed directly into our on-chain AuditRegistry.


![menu](https://github.com/user-attachments/assets/300aca98-fbce-4084-8bf7-ffcc243e2d83)

![scanner](https://github.com/user-attachments/assets/f7e90312-0a0d-47be-b480-83f1028219a7)


---

Step-by-Step Guide: Building GuardDogs on Lock

1) Prerequisites: Before you begin, please ensure you have:

Node.js (v16+) and npm installed — https://nodejs.org/
Composer (for PHP dependencies) — https://getcomposer.org/
PHP 8+ (built-in server) — https://www.php.net/
MetaMask extension, pointed to “Rootstock Testnet”
An OpenAI API key — https://platform.openai.com/
2) Clone & Install

# 2.1 Clone our repo
git clone https://github.com/GuardDogsTeam/guarddogs-on-lock.git
 guarddogs-on-lock
cd
# 2.2 Install JavaScript dependencies
npm install
# 2.3 Install any PHP dependencies
composer install
3) Configure Your Environment

# copy the example env file
cp .env.example .env
Open .env in your editor and set:
OPENAI_API_KEY=sk-…
4) Deploy the AuditRegistry Contract

# compile & deploy on Rootstock Testnet
npx hardhat compile
npx hardhat run scripts/deploy.js --network rskTestnet
Copy the deployed address (it will look like 0x48A13f…) and confirm it matches the one in app.js.
5) Start the Backend & Cache Service

# launch PHP’s built-in server (serves index.html, analyze.php, etc.)
php -S 0.0.0.0:8000
This serves the front-end and analyze.php endpoint. The PHP script listens for incoming JSON, calls OpenAI, caches results in analysis-cache.json.
6) Launch the Front-end DApp

Open your browser to:

http://localhost:8000/index.html
Connect MetaMask (RSK Testnet).
Paste any contract address on Rootstock.
Click Analyze Contract.
Triggers AuditRequested on-chain
Backend fetches bytecode (Alchemy + Blockscout), runs GPT-4, caches by source-hash
Calls completeAudit(address,score) → emits AuditCompleted
View Trust Score, summary, risks & red flags — all permanently on-chain.

