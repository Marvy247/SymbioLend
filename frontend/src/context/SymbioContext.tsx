import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { api } from '../utils/api'

interface Loan {
  id: string | number
  borrower: string
  agentType: string
  amount: number
  status: 'pending' | 'active' | 'repaid' | 'defaulted' | 'rejected'
  terms?: { interestBps: number; durationDays: number; collateralPct: number; reasoning: string }
  scoring?: { pd: number; interestBps: number }
  rationale?: { purpose: string; expectedReturn: string; repaymentPlan: string }
  repaid?: number
  txHash?: string
  zkProof?: { commitment: string; verified: boolean } | null
  requestedAt: number
}

interface Agent {
  name: string
  address: string
  type: string
  activeLoans: number
}

interface State {
  cycle: number
  txCount: number
  market: { ETH: number; BTC: number; XAUT: number; volatility: number }
  lender: Agent
  borrowers: Agent[]
  loans: Loan[]
  stats: { totalLoans: number; activeLoans: number; repaidLoans: number; defaultedLoans: number; rejectedLoans: number; totalDeployed: number }
}

interface SymbioCtx {
  state: State | null
  events: any[]
  triggerTick: () => Promise<void>
}

const Ctx = createContext<SymbioCtx>({ state: null, events: [], triggerTick: async () => {} })

export function SymbioProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const esRef = useRef<EventSource | null>(null)

  const fetchState = () => api.state().then(s => setState(s)).catch(() => {})

  useEffect(() => {
    fetchState()
    const interval = setInterval(fetchState, 8000)

    esRef.current = api.events()
    esRef.current.onmessage = (e) => {
      try {
        const ev = JSON.parse(e.data)
        setEvents(prev => [ev, ...prev].slice(0, 100))
      } catch {}
    }

    return () => {
      clearInterval(interval)
      esRef.current?.close()
    }
  }, [])

  const triggerTick = async () => {
    await api.tick()
    await fetchState()
  }

  return <Ctx.Provider value={{ state, events, triggerTick }}>{children}</Ctx.Provider>
}

export const useSymbio = () => useContext(Ctx)
