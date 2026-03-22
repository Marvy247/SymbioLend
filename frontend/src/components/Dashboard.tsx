import { useSymbio } from '../context/SymbioContext'

const CONTRACT = import.meta.env.VITE_CONTRACT_ADDRESS || ''
const SEPOLIA   = 'https://sepolia.etherscan.io'

export function Dashboard() {
  const { state, triggerTick } = useSymbio()
  const s = state?.stats

  const cards = [
    { label: 'Total Loans',    value: s?.totalLoans    ?? '—', color: 'text-violet-400' },
    { label: 'Active',         value: s?.activeLoans   ?? '—', color: 'text-blue-400' },
    { label: 'Repaid',         value: s?.repaidLoans   ?? '—', color: 'text-emerald-400' },
    { label: 'Defaulted',      value: s?.defaultedLoans ?? '—', color: 'text-red-400' },
    { label: 'Capital Deployed', value: s ? `$${s.totalDeployed.toLocaleString()}` : '—', color: 'text-amber-400' },
    { label: 'On-chain Txs',   value: state?.txCount   ?? '—', color: 'text-cyan-400' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">SymbioLend</h1>
          <p className="text-sm text-slate-400">Agent-to-Agent Lending Protocol · Sepolia</p>
        </div>
        <div className="flex gap-3 items-center">
          {CONTRACT && (
            <a href={`${SEPOLIA}/address/${CONTRACT}`} target="_blank" rel="noreferrer"
               className="text-xs text-violet-400 hover:text-violet-300 font-mono">
              {CONTRACT.slice(0,6)}…{CONTRACT.slice(-4)} ↗
            </a>
          )}
          <button onClick={triggerTick}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors">
            Force Cycle
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map(c => (
          <div key={c.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-xs text-slate-400 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Market bar */}
      {state?.market && (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-wrap gap-6 text-sm">
          <span className="text-slate-400">Market</span>
          <span>ETH <span className="text-white font-mono">${state.market.ETH.toLocaleString()}</span></span>
          <span>BTC <span className="text-white font-mono">${state.market.BTC.toLocaleString()}</span></span>
          <span>XAUT <span className="text-white font-mono">${state.market.XAUT.toLocaleString()}</span></span>
          <span>Volatility <span className={`font-mono ${state.market.volatility > 0.5 ? 'text-red-400' : state.market.volatility > 0.25 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {(state.market.volatility * 100).toFixed(0)}%
          </span></span>
          <span className="ml-auto text-slate-500">Cycle #{state.cycle}</span>
        </div>
      )}
    </div>
  )
}
