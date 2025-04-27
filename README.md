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

### Team
- **Gokhan C.** – Founder & lead Solidity/JS developer; prompt-engineering specialist
