import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import './App.css'

const formatCZK = (v: number) =>
  v.toLocaleString('cs-CZ', { maximumFractionDigits: 0 }) + ' Kč'

function calculateMonthlyPayment(principal: number, annualRate: number, years: number) {
  const r = annualRate / 100 / 12
  const n = years * 12
  if (r === 0) return principal / n
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

function buildYearlyBreakdown(principal: number, annualRate: number, years: number) {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, years)
  const r = annualRate / 100 / 12
  let balance = principal
  const data: { rok: string; jistina: number; uroky: number }[] = []

  for (let y = 1; y <= years; y++) {
    let yearPrincipal = 0
    let yearInterest = 0
    for (let m = 0; m < 12; m++) {
      const interest = balance * r
      const principalPart = monthlyPayment - interest
      yearInterest += interest
      yearPrincipal += principalPart
      balance -= principalPart
      if (balance < 0) balance = 0
    }
    data.push({
      rok: `${y}`,
      jistina: Math.round(yearPrincipal),
      uroky: Math.round(yearInterest),
    })
  }
  return data
}

function App() {
  const [loanAmount, setLoanAmount] = useState(3000000)
  const [rate, setRate] = useState(5.5)
  const [years, setYears] = useState(25)

  const monthlyPayment = useMemo(
    () => calculateMonthlyPayment(loanAmount, rate, years),
    [loanAmount, rate, years],
  )

  const chartData = useMemo(
    () => buildYearlyBreakdown(loanAmount, rate, years),
    [loanAmount, rate, years],
  )

  const totalPaid = monthlyPayment * years * 12
  const totalInterest = totalPaid - loanAmount

  return (
    <div className="app">
      <header>
        <h1>Hypoteční kalkulačka</h1>
        <p className="subtitle">Spočítejte si svou měsíční splátku a rozložení splátek</p>
      </header>

      <div className="layout">
        <section className="card inputs">
          <h2>Parametry hypotéky</h2>

          <label>
            <span>Výše hypotéky (Kč)</span>
            <input
              type="number"
              value={loanAmount}
              min={100000}
              step={100000}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
            />
          </label>

          <label>
            <span>Úroková sazba (%)</span>
            <input
              type="number"
              value={rate}
              min={0.1}
              step={0.1}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </label>

          <label>
            <span>Doba splácení (roky)</span>
            <input
              type="number"
              value={years}
              min={1}
              max={40}
              onChange={(e) => setYears(Number(e.target.value))}
            />
          </label>
        </section>

        <section className="card result">
          <h2>Měsíční splátka</h2>
          <div className="payment">{formatCZK(monthlyPayment)}</div>
          <div className="summary">
            <div>
              <span className="label">Celkem zaplaceno</span>
              <span className="value">{formatCZK(totalPaid)}</span>
            </div>
            <div>
              <span className="label">Z toho úroky</span>
              <span className="value accent">{formatCZK(totalInterest)}</span>
            </div>
          </div>
        </section>
      </div>

      <section className="card chart-section">
        <h2>Rozložení splátek podle roku</h2>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="rok"
              label={{ value: 'Rok', position: 'insideBottomRight', offset: -5 }}
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCZK(Number(value)),
                name === 'jistina' ? 'Jistina' : 'Úroky',
              ]}
              labelFormatter={(l) => `Rok ${l}`}
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.12)' }}
            />
            <Legend
              formatter={(value: string) => (value === 'jistina' ? 'Jistina' : 'Úroky')}
            />
            <Bar dataKey="uroky" stackId="a" fill="#0f766e" radius={[0, 0, 0, 0]} name="uroky" />
            <Bar dataKey="jistina" stackId="a" fill="#1e3a5f" radius={[4, 4, 0, 0]} name="jistina" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  )
}

export default App
