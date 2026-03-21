# Orion Vault — Demo Script 🎬

> A step-by-step walkthrough for a compelling 3–5 minute demo.
> Goal: show judges real autonomous agents, real WDK wallets, real on-chain transactions.

---

## Setup (before recording)

```bash
# Terminal 1 — Agent engine
cd agent && npm start

# Terminal 2 — Frontend
cd frontend && npm run dev

# Terminal 3 — MCP server (optional, for AI assistant demo)
cd agent && npm run mcp
```

Wait for the agent terminal to print:
```
🌌 Swarm online with 5 agents
⏱  Autonomous loop starting (8s cycles)
```

Open the dashboard at **http://localhost:5173**

---

## Scene 1 — The Swarm (0:00–0:45)

**Open the dashboard landing page.**

> *"Orion Vault is a swarm of five autonomous AI agents. Each agent holds its own self-custodial wallet, created with Tether's WDK. No shared keys. No central custody. Each agent is its own economic actor."*

**Navigate to Dashboard.**

Point to the Agent Swarm section:
> *"Five agents — Alpha is aggressive, Epsilon is conservative. They have different risk tolerances, different strategies, and they genuinely disagree with each other."*

Point to the wallet addresses under each agent card:
> *"These are real Ethereum addresses on Sepolia, each derived from a unique BIP-39 seed phrase via WDK's HD wallet derivation. The private key never leaves the agent process."*

---

## Scene 2 — Autonomous Proposals (0:45–1:30)

**Watch the Proposal Feed update in real time.**

> *"Every 8 seconds, each agent independently observes market conditions — ETH price, BTC price, volatility — and generates a capital allocation strategy."*

Point to a proposal from Alpha:
> *"Alpha just proposed deploying 30% of the treasury to leveraged yield positions. That's consistent with its aggressive growth personality."*

Point to a proposal from Epsilon:
> *"Epsilon proposed a 5% conservative allocation. Now watch what happens when Epsilon votes on Alpha's proposal..."*

Wait for the vote to appear in the Event Feed:
> *"Epsilon voted against Alpha's proposal. That's not scripted — Epsilon's risk model evaluated Alpha's proposal and rejected it as too aggressive. This is a real swarm debate."*

---

## Scene 3 — On-chain Execution (1:30–2:30)

**Open Sepolia Etherscan in a new tab:**
`https://sepolia.etherscan.io/address/0xeB7e65Ba425DFCeEb8ccF3e4BE5196e33A91bc66`

> *"This is the OrionVault smart contract, live on Sepolia. Let's watch a proposal go on-chain."*

**Click "Force Cycle" on the dashboard.**

Switch to the Etherscan tab and refresh after ~15 seconds:
> *"You can see the transaction landing — an agent wallet signing a `propose()` call directly to the contract. No human signed this. The WDK wallet did."*

Point to the tx hash in the Proposal Feed:
> *"Every executed proposal links directly to its Etherscan transaction. The treasury, the votes, the reputation changes — all verifiable on-chain."*

---

## Scene 4 — Treasury & Reputation (2:30–3:15)

**Scroll to Treasury & Market panel.**

> *"The treasury holds 100,000 USDT — real ERC-20 tokens deposited into the OrionVault contract on Sepolia. The agents are managing real on-chain capital."*

Point to the market data:
> *"Agents observe live price signals. When volatility spikes above 50%, Gamma automatically pivots to XAU₮ hedging proposals. The strategy adapts to market conditions."*

**Scroll to Agent Swarm, sorted by reputation.**

> *"Reputation is the economic backbone. Every successful proposal earns the proposer +100 reputation. That reputation directly weights their voting power. Agents that consistently make good decisions accumulate influence. Bad actors get slashed."*

---

## Scene 5 — MCP Integration (3:15–4:00)

**Open Claude or Cursor with the MCP server running.**

Type:
```
What's the current state of the Orion Vault swarm?
```

> *"The MCP server exposes 8 tools that let any AI assistant interact with the swarm directly. Claude can query the treasury, read proposals, even submit new ones."*

Type:
```
Submit a proposal as Gamma to hedge 15% into XAU₮
```

Switch back to the dashboard and show the new proposal appearing:
> *"That proposal was submitted by an external AI assistant through the MCP interface, and now the swarm is voting on it autonomously. This is what agent-to-agent coordination looks like."*

---

## Scene 6 — Close (4:00–4:30)

**Show the full dashboard one more time.**

> *"Orion Vault demonstrates what agentic finance infrastructure looks like. Five self-custodial WDK wallets. A shared on-chain treasury. Autonomous governance with real economic incentives. No human in the loop."*

> *"The architecture is multi-chain ready — swap the EVM wallet module for TON, Solana, or Tron and the swarm extends across chains. The MCP server means any AI assistant can plug in as a participant."*

> *"Builders define the rules. Agents do the work. Value settles onchain."*

---

## Key Talking Points (for Q&A)

**"How is this different from a simple agent with a wallet?"**
> Most projects are one agent + one wallet doing a single action. Orion Vault is five agents with five wallets operating as a collective — proposing, debating, voting, and executing as a DAO. The governance layer is what makes it infrastructure, not a demo.

**"How does WDK fit in?"**
> WDK is the foundation. Every agent wallet is HD-derived from a unique seed phrase using `@tetherto/wdk-wallet-evm`. The private key extraction, signing, and transaction submission all go through WDK primitives. Without WDK, there's no self-custody — you'd need a centralized key manager.

**"Is the AI reasoning real?"**
> The reasoning is deterministic heuristics — each agent has a risk tolerance and strategy set that shapes its decisions. The architecture is LLM-ready: the `_generateProposal` method in `agentBrain.js` is a single function swap away from GPT-4. We prioritized correctness and on-chain verifiability over stochastic outputs.

**"Can this scale?"**
> The WDK architecture supports trillions of wallets. The SwarmCoordinator can handle hundreds of agents. The OrionVault contract supports up to 20 agents per deployment. Multi-vault deployments are trivial.

---

## Etherscan Links (have these open)

- OrionVault: https://sepolia.etherscan.io/address/0xeB7e65Ba425DFCeEb8ccF3e4BE5196e33A91bc66
- MockUSDT: https://sepolia.etherscan.io/address/0x15e6d94AD51bC813d74e034FC067778F85D26936
- Alpha wallet: https://sepolia.etherscan.io/address/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
