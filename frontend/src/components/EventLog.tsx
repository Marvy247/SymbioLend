import { useSymbio } from '../context/SymbioContext'

const EVENT_ICON: Record<string, string> = {
  loan_requested: '📋',
  loan_funded:    '💰',
  loan_rejected:  '❌',
  repayment:      '✅',
  default:        '⚠️',
}

export function EventLog() {
  const { events } = useSymbio()

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Live Events</h2>
        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          live
        </span>
      </div>
      <div className="divide-y divide-slate-700/50 max-h-64 overflow-y-auto">
        {events.length === 0 && (
          <div className="px-4 py-6 text-center text-slate-500 text-sm">Waiting for events…</div>
        )}
        {events.map((e, i) => (
          <div key={i} className="px-4 py-2 flex items-start gap-2 text-xs">
            <span>{EVENT_ICON[e.type] ?? '•'}</span>
            <div className="flex-1 min-w-0">
              <span className="text-slate-300">
                {e.type === 'loan_requested' && `${e.borrower} requested $${e.amount?.toLocaleString()} (${e.agentType})`}
                {e.type === 'loan_funded'    && `${e.lender} funded $${e.amount?.toLocaleString()} → ${e.borrower} @ ${(e.terms?.interestBps/100).toFixed(1)}%`}
                {e.type === 'loan_rejected'  && `${e.borrower} rejected — ${e.reason}`}
                {e.type === 'repayment'      && `${e.borrower} repaid $${e.amount?.toLocaleString()}${e.fullRepayment ? ' (FULL)' : ''}`}
                {e.type === 'default'        && `${e.borrower} defaulted on loan #${e.loanId}`}
              </span>
            </div>
            <span className="text-slate-600 shrink-0">{new Date(e.ts).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
