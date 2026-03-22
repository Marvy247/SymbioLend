import { useSymbio } from '../context/SymbioContext'

const SEPOLIA = 'https://sepolia.etherscan.io'

const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-amber-500/20 text-amber-300',
  active:    'bg-blue-500/20 text-blue-300',
  repaid:    'bg-emerald-500/20 text-emerald-300',
  defaulted: 'bg-red-500/20 text-red-300',
  rejected:  'bg-slate-500/20 text-slate-400',
}

export function LoanFeed() {
  const { state } = useSymbio()
  const loans = state?.loans ?? []

  const sorted = [...loans].sort((a, b) => b.requestedAt - a.requestedAt).slice(0, 20)

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Loan Feed</h2>
        <span className="text-xs text-slate-400">{loans.length} total</span>
      </div>
      <div className="divide-y divide-slate-700 max-h-[520px] overflow-y-auto">
        {sorted.length === 0 && (
          <div className="px-4 py-8 text-center text-slate-500 text-sm">Waiting for first cycle…</div>
        )}
        {sorted.map(loan => (
          <div key={loan.id} className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[loan.status]}`}>
                  {loan.status}
                </span>
                <span className="text-sm font-medium text-white">{loan.borrower}</span>
                <span className="text-xs text-slate-400">{loan.agentType}</span>
              </div>
              <span className="text-sm font-mono text-amber-300">${loan.amount.toLocaleString()}</span>
            </div>

            {loan.rationale && (
              <p className="text-xs text-slate-400 italic">"{loan.rationale.purpose}"</p>
            )}

            {loan.terms && (
              <div className="flex gap-4 text-xs text-slate-400">
                <span>Rate: <span className="text-white">{(loan.terms.interestBps / 100).toFixed(1)}%</span></span>
                <span>Duration: <span className="text-white">{loan.terms.durationDays}d</span></span>
                {loan.scoring && <span>PD: <span className={loan.scoring.pd > 0.5 ? 'text-red-400' : 'text-emerald-400'}>{(loan.scoring.pd * 100).toFixed(0)}%</span></span>}
                {loan.repaid && <span>Repaid: <span className="text-emerald-400">${loan.repaid.toLocaleString()}</span></span>}
                {loan.zkProof?.verified && <span className="text-violet-400">🔐 ZK verified</span>}
              </div>
            )}

            {loan.terms?.reasoning && (
              <p className="text-xs text-slate-500">🤖 {loan.terms.reasoning}</p>
            )}

            {loan.txHash && (
              <a href={`${SEPOLIA}/tx/${loan.txHash}`} target="_blank" rel="noreferrer"
                 className="text-xs font-mono text-violet-400 hover:text-violet-300">
                {loan.txHash.slice(0,10)}… ↗
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
