import { useSymbio } from '../context/SymbioContext'

const SEPOLIA = 'https://sepolia.etherscan.io'

const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-amber-500/20 text-amber-300 border-amber-500/30',
  active:    'bg-blue-500/20 text-blue-300 border-blue-500/30',
  repaid:    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  defaulted: 'bg-red-500/20 text-red-300 border-red-500/30',
  rejected:  'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

const GRADE_STYLE: Record<string, string> = {
  A: 'bg-emerald-500/20 text-emerald-300',
  B: 'bg-teal-500/20 text-teal-300',
  C: 'bg-amber-500/20 text-amber-300',
  D: 'bg-orange-500/20 text-orange-300',
  E: 'bg-red-500/20 text-red-300',
}

const AGENT_EMOJI: Record<string, string> = {
  'DeFi Yield Agent': '📈',
  'Trading Agent':    '⚡',
  'Tipping Agent':    '💸',
  'Arbitrage Agent':  '🔄',
  'Content Agent':    '✍️',
}

export function LoanFeed() {
  const { state } = useSymbio()
  const loans = state?.loans ?? []
  const sorted = [...loans].sort((a, b) => b.requestedAt - a.requestedAt).slice(0, 20)

  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">Loan Feed</h2>
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            live
          </span>
        </div>
        <span className="text-xs text-slate-400">{loans.length} loans</span>
      </div>

      <div className="divide-y divide-slate-700/40 max-h-[560px] overflow-y-auto">
        {sorted.length === 0 && (
          <div className="px-4 py-12 text-center text-slate-500 text-sm">
            <div className="text-2xl mb-2">⏳</div>
            Waiting for first cycle…
          </div>
        )}
        {sorted.map(loan => {
          const grade = loan.scoring?.grade
          return (
            <div key={loan.id} className="px-4 py-3 space-y-2 hover:bg-slate-700/20 transition-colors">
              {/* Row 1: status + agent + amount */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${STATUS_STYLE[loan.status]}`}>
                    {loan.status}
                  </span>
                  <span className="text-sm font-semibold text-white">{loan.borrower}</span>
                  <span className="text-xs text-slate-500 hidden sm:inline">
                    {AGENT_EMOJI[loan.agentType] ?? '🤖'} {loan.agentType}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {grade && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${GRADE_STYLE[grade]}`}>
                      {grade}
                    </span>
                  )}
                  <span className="text-sm font-mono font-bold text-amber-300">
                    ${loan.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Row 2: LLM rationale */}
              {loan.rationale?.purpose && (
                <p className="text-xs text-slate-400 italic leading-relaxed">
                  "{loan.rationale.purpose}"
                </p>
              )}

              {/* Row 3: terms + ZK */}
              {loan.terms && (
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="text-slate-400">Rate: <span className="text-white font-medium">{(loan.terms.interestBps / 100).toFixed(1)}%</span></span>
                  <span className="text-slate-400">Duration: <span className="text-white font-medium">{loan.terms.durationDays}d</span></span>
                  {loan.scoring && (
                    <span className="text-slate-400">PD: <span className={`font-medium ${loan.scoring.pd > 0.4 ? 'text-red-400' : loan.scoring.pd > 0.15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {(loan.scoring.pd * 100).toFixed(0)}%
                    </span></span>
                  )}
                  {(loan.repaid ?? 0) > 0 && (
                    <span className="text-slate-400">Repaid: <span className="text-emerald-400 font-medium">${loan.repaid!.toLocaleString()}</span></span>
                  )}
                  {loan.zkProof?.verified && (
                    <span className="text-violet-400 font-medium">🔐 ZK verified</span>
                  )}
                </div>
              )}

              {/* Row 4: LLM reasoning */}
              {loan.terms?.reasoning && (
                <p className="text-xs text-slate-500">🤖 {loan.terms.reasoning}</p>
              )}

              {/* Row 5: tx link */}
              {loan.txHash && (
                <a href={`${SEPOLIA}/tx/${loan.txHash}`} target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-1 text-xs font-mono text-violet-400 hover:text-violet-300 transition-colors">
                  {loan.txHash.slice(0, 12)}… ↗
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
