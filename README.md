# Project Synapse 🧠⚙️

**An Autonomous Web3 Intent Execution Agent with Self-Healing Routing**

Project Synapse is a decentralized, AI-driven execution terminal that translates natural language into on-chain realities. By bridging Google's Gemini LLM with the OKX V6 DEX Aggregator, it allows users to command complex DeFi operations through simple conversational prompts, entirely bypassing the steep learning curve of traditional Web3 UIs.

## ⚠️ The Problem
The current Web3 UX is broken. Users are forced to navigate fragmented interfaces, manually calculate 18-decimal precision, handle complex contract approvals, and constantly monitor liquidity. When third-party routing APIs or DEX aggregators crash or deprecate (e.g., V5 to V6 migrations), traditional trading bots silently fail, leaving users exposed and frustrated.

## 💡 The Solution: Project Synapse
Synapse acts as your absolute rational on-chain proxy. You speak; it executes. 

It is built with a unique **Fault-Tolerant & Self-Healing Architecture**. When market liquidity dries up or third-party DEX nodes return errors, Synapse does not crash. Instead, it dynamically falls back to a Plan B (e.g., self-transfer mechanisms to maintain on-chain activity and wallet liveliness) ensuring continuous execution without manual intervention.

## ✨ Core Features
* **NLP to On-Chain Calldata:** Powered by Google Gemini 2.5 Flash, extracting precise intents (Action, Chain, Slippage, Hex Addresses) from plain text.
* **Smart DEX Routing:** Seamless integration with OKX Onchain OS (V6 API) for optimal swap paths.
* **Self-Healing Execution (Plan B):** Built-in tactical downgrade protocols. If route planning fails (e.g., `Error 51000`), the Agent autonomously executes alternative smart contract interactions to preserve execution flow.
* **Cyber-Terminal UI:** A minimalist, hacker-style local dashboard for real-time monitoring of AI cognitive processes and blockchain receipts.

## 🏗️ Architecture



1.  **Input Layer:** User submits natural language intent via the local Cyber UI.
2.  **Cognitive Brain (AI):** Node.js backend pushes the prompt to Gemini API, enforcing a strict JSON schema response.
3.  **Nervous System (Routing):** The structured JSON is mapped to the OKX V6 Aggregator to fetch executable `calldata`.
4.  **Execution Spine (Smart Contract):** The `calldata` is broadcasted via ethers.js to a dedicated Vault Contract on the X Layer Testnet, returning the final `TxHash`.

## 🚀 Quick Start
### Prerequisites
* Node.js (v18+)
* Google Gemini API Key
* OKX API Credentials
* Funded Wallet Private Key (X Layer Testnet)

### Installation
1. Clone the repository and install dependencies:
   ```bash
   npm install express cors ethers axios dotenv
