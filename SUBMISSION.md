# Orion Vault 🌌
### Autonomous Agent Swarm with Self-Custodial WDK Wallets & Collective On-chain Governance

> **Hackathon Galáctica · WDK Edition 1 · Agent Wallets Track**

---

## The Problem

AI agents are becoming economic actors — but today's wallet infrastructure wasn't built for them. Existing solutions either require a human to approve every transaction, rely on centralized key custody, or treat "agent wallet" as a single wallet doing a single task.

**Orion Vault answers a different question:** what does it look like when a *swarm* of agents — each with its own self-custodial wallet — collectively manages capital, debates strategy, and executes on-chain without any human in the loop?

---

## What We Built

A decentralized swarm of **5 autonomous AI agents**, each holding its own **self-custodial EVM wallet derived via Tether's WDK**, that collectively govern a shared treasury of **100,000 USDT on Sepolia**. Agents propose capital allocation strategies, vote via reputation-weighted consensus, and execute on-chain — permanently, verifiably, without human approval.

> **Builders define the rules → Agents do the work → Value settles onchain**

---

## WDK Integration

Every agent wallet is created using `@tetherto/wdk` + `@tetherto/wdk-wallet-evm`:

```js
const wdk = new WDK(agentSeed)
  .registerWallet('evm', WalletManagerEvm, { provider: RPC_URL })

const account = await wdk.getAccount('evm', 0)
const address = await account.getAddress()  // unique per agent, HD-derived
```

- **5 agents, 5 unique HD-derived EVM wallets** — no shared keys, fully self-custodial
- Each agent signs its own `propose()`, `vote()`, and `finalizeProposal()` transactions
- Private keys are extracted from WDK's HD node (`privateKeyBuffer`) and used to construct ethers.js signers — the key never leaves the agent process
- Architecture is **multi-chain ready**: swap `WalletManagerEvm` for `WalletManagerTon`, `WalletManagerSolana`, or `WalletManagerTron` to extend the swarm across chains

---

## Agent Autonomy

Each agent runs an **independent 8-second reasoning cycle** with no human trigger:

1. **Observe** — reads live market signals (ETH/BTC/XAUT prices, volatility index)
2. **Strategize** — generates a capital allocation proposal shaped by its personality
3. **Propose** — submits to the swarm coordinator and fires an on-chain `propose()` tx
4. **Vote** — evaluates every open proposal against its own risk model and votes

Five distinct personalities create genuine swarm diversity and visible disagreement:

| Agent | Personality | Risk Tolerance | Behaviour |
|-------|-------------|---------------|-----------|
| Alpha 🚀 | Aggressive Growth | 80% | Proposes 25–35% allocations; supports most proposals |
| Beta 📈 | Yield Optimizer | 50% | Targets Aave lending and stablecoin yield |
| Gamma 🛡️ | Risk Manager | 30% | Pivots to XAU₮ hedging when volatility > 50% |
| Delta ⚖️ | Diversifier | 50% | Spreads across protocols; balanced voter |
| Epsilon 🏦 | Conservative | 20% | Proposes 5–8% only; votes ❌ on Alpha's aggressive proposals |

This is not a coordinated script. Epsilon genuinely rejects Alpha's proposals based on its own risk evaluation. The swarm debates.

---

## Economic Soundness

The `OrionVault.sol` contract enforces a full on-chain reputation economy:

- **Quorum gate** — proposals require 51% of total reputation weight to pass
- **Reputation-weighted voting** — each vote carries the agent's current reputation score
- **Reward** — successful proposals earn the proposer +100 reputation
- **Slash** — `AgentSlash` proposals can reduce bad actors by −200 reputation, eventually deactivating them
- **Treasury bounds** — `Transfer` proposals are validated against the actual on-chain USDT balance

Agents that consistently propose good strategies accumulate influence. Agents that propose recklessly lose it. The system self-corrects.

---

## Real-world Viability

**Deployed and live on Sepolia:**

| Contract | Address |
|----------|---------|
| OrionVault | [`0xeB7e65Ba425DFCeEb8ccF3e4BE5196e33A91bc66`](https://sepolia.etherscan.io/address/0xeB7e65Ba425DFCeEb8ccF3e4BE5196e33A91bc66) |
| MockUSDT | [`0x15e6d94AD51bC813d74e034FC067778F85D26936`](https://sepolia.etherscan.io/address/0x15e6d94AD51bC813d74e034FC067778F85D26936) |
| Treasury | 100,000 USDT deposited on-chain |

**MCP Server — 8 tools for AI assistant integration:**

Any AI assistant (Claude, Cursor, Copilot, OpenClaw) can connect to the swarm via MCP and query state, submit proposals, cast votes, or trigger cycles — making Orion Vault composable infrastructure for the agent economy.

```bash
npm run mcp   # stdio MCP server, auto-picked up by .vscode/mcp.json
```

**Production-quality stack:**
- REST + SSE API for real-time frontend streaming
- Foundry test suite — 8 passing tests covering all contract logic
- Typed React dashboard with live swarm state, Etherscan links, reputation leaderboard
- Deployable to any EVM chain with a single config change

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Wallets | `@tetherto/wdk` + `@tetherto/wdk-wallet-evm` |
| Smart Contracts | Solidity 0.8.29, Foundry, OpenZeppelin |
| Agent Engine | Node.js ESM, Express, ethers.js |
| AI Integration | MCP (`@modelcontextprotocol/sdk`), stdio transport |
| Frontend | React 18, Vite, Tailwind CSS v4, Framer Motion |
| Network | Ethereum Sepolia testnet |

---

## How to Run

```bash
# Agent engine (autonomous swarm + REST/SSE API)
cd agent && npm install && npm start

# Frontend dashboard
cd frontend && npm install && npm run dev

# MCP server (for AI assistant integration)
cd agent && npm run mcp
```

---

## Repository

Full source code, architecture docs, and demo script:
**https://github.com/[your-repo]/orion-vault**
