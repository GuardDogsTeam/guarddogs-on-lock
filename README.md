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

