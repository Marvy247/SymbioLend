import { useSymbio } from '../context/SymbioContext'

export function CreditPanel() {
  const { state } = useSymbio()
  if (!state) return null

  const loans = state.loans ?? []
  const borrowers = state.borrowers ?? []

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-white">Credit Scores</h2>
      </div>
      <div className="divide-y divide-slate-700">
        {borrowers.map(b => {
          const bLoans   = loans.filter(l => l.borrower === b.name)
          const repaid   = bLoans.filter(l => l.status === 'repaid').length
          const defaulted = bLoans.filter(l => l.status === 'defaulted').length
          const total    = bLoans.length
          const repayRate = total > 0 ? Math.round(repaid / total * 100) : null

          // Estimate credit score from repayment history
          const score = Math.min(1000, Math.max(200,
            500 + repaid * 50 - defaulted * 150
          ))
          const pct = score / 10

          return (
            <div key={b.name} className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white font-medium">{b.name}</span>
                <span className={`font-mono font-bold ${score >= 700 ? 'text-emerald-400' : score >= 400 ? 'text-amber-400' : 'text-red-400'}`}>
                  {score}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full transition-all ${score >= 700 ? 'bg-emerald-400' : score >= 400 ? 'bg-amber-400' : 'bg-red-400'}`}
                     style={{ width: `${pct}%` }} />
              </div>
              <div className="flex gap-4 text-xs text-slate-400">
                <span>{total} loans</span>
                <span className="text-emerald-400">{repaid} repaid</span>
                {defaulted > 0 && <span className="text-red-400">{defaulted} defaulted</span>}
                {repayRate !== null && <span>Repay rate: {repayRate}%</span>}
              </div>
            </div>
          )
        })}
        {borrowers.length === 0 && (
          <div className="px-4 py-6 text-center text-slate-500 text-sm">No borrowers yet</div>
        )}
      </div>
    </div>
  )
}
