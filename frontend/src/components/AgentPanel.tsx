import { useSymbio } from '../context/SymbioContext'

const SEPOLIA = 'https://sepolia.etherscan.io'

const TYPE_EMOJI: Record<string, string> = {
  'Lender Agent':    '🏦',
  'DeFi Yield Agent':'📈',
  'Trading Agent':   '⚡',
  'Tipping Agent':   '💸',
  'Arbitrage Agent': '🔄',
}

export function AgentPanel() {
  const { state } = useSymbio()
  if (!state) return null

  const agents = [state.lender, ...state.borrowers]

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-white">Agents</h2>
      </div>
      <div className="divide-y divide-slate-700">
        {agents.map(agent => (
          <div key={agent.name} className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{TYPE_EMOJI[agent.type] ?? '🤖'}</span>
              <div>
                <div className="text-sm font-medium text-white">{agent.name}</div>
                <div className="text-xs text-slate-400">{agent.type}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-400">
                {agent.activeLoans} active loan{agent.activeLoans !== 1 ? 's' : ''}
              </span>
              <a href={`${SEPOLIA}/address/${agent.address}`} target="_blank" rel="noreferrer"
                 className="font-mono text-violet-400 hover:text-violet-300">
                {agent.address.slice(0,6)}…{agent.address.slice(-4)} ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
