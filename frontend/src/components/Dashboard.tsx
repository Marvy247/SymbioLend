import { useSymbio } from '../context/SymbioContext'

const SEPOLIA = 'https://sepolia.etherscan.io'
const CONTRACT = '0xbde3971085989d183cf3108380ff73ee776ef354'

export function Dashboard() {
  const { state, triggerTick } = useSymbio()
  const s = state?.stats

  const cards = [
    { label: 'Total Loans',      value: s?.totalLoans      ?? '—', color: 'text-violet-400',  bg: 'bg-violet-500/10' },
    { label: 'Active',           value: s?.activeLoans     ?? '—', color: 'text-blue-400',    bg: 'bg-blue-500/10' },
    { label: 'Repaid',           value: s?.repaidLoans     ?? '—', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Defaulted',        value: s?.defaultedLoans  ?? '—', color: 'text-red-400',     bg: 'bg-red-500/10' },
    { label: 'Capital Deployed', value: s ? `$${s.totalDeployed.toLocaleString()}` : '—', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'On-chain Txs',     value: state?.txCount     ?? '—', color: 'text-cyan-400',    bg: 'bg-cyan-500/10' },
  ]

  const vol = state?.market?.volatility ?? 0
  const volColor = vol > 0.5 ? 'text-red-400' : vol > 0.25 ? 'text-amber-400' : 'text-emerald-400'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-lg">🔗</div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">SymbioLend</h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live · Sepolia
              </span>
              <span>·</span>
              <a href={`${SEPOLIA}/address/${CONTRACT}`} target="_blank" rel="noreferrer"
                 className="font-mono text-violet-400 hover:text-violet-300">
                {CONTRACT.slice(0,6)}…{CONTRACT.slice(-4)} ↗
              </a>
              {state && <span>· Cycle #{state.cycle}</span>}
            </div>
          </div>
        </div>
        <button onClick={triggerTick}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-sm font-medium rounded-lg transition-all">
          ⚡ Force Cycle
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {cards.map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl p-3 border border-slate-700/50`}>
            <div className={`text-xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Market ticker */}
      {state?.market && (
        <div className="bg-slate-800/60 rounded-xl px-4 py-2.5 border border-slate-700/50 flex flex-wrap gap-5 text-xs items-center">
          <span className="text-slate-500 font-medium uppercase tracking-wider">Market</span>
          {[['ETH', state.market.ETH], ['BTC', state.market.BTC], ['XAUT', state.market.XAUT]].map(([k, v]) => (
            <span key={k as string} className="text-slate-300">
              {k as string} <span className="text-white font-mono font-medium">${(v as number).toLocaleString()}</span>
            </span>
          ))}
          <span className="text-slate-300">
            Volatility <span className={`font-mono font-medium ${volColor}`}>{(vol * 100).toFixed(0)}%</span>
          </span>
          <span className="ml-auto text-slate-500">Agent-to-Agent Lending Protocol</span>
        </div>
      )}
    </div>
  )
}
