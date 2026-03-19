import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { USERS, formatEuro, formatDate, getUserColor, getUserLightColor, isoDate } from '../lib/constants'
import { IconCalendar, IconWallet, IconClock } from './Icons'

export default function Dashboard({ user }) {
  const [reservations, setReservations] = useState([])
  const [depenses, setDepenses] = useState([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const nextMonth = month === 11 ? `${year + 1}-01-01` : `${year}-${String(month + 2).padStart(2, '0')}-01`

  useEffect(() => {
    async function load() {
      const [resRes, depRes] = await Promise.all([
        supabase.from('reservations').select('*').gte('date', monthStart).lt('date', nextMonth).order('date'),
        supabase.from('depenses').select('*').gte('date', monthStart).lt('date', nextMonth).order('created_at', { ascending: false }),
      ])
      setReservations(resRes.data || [])
      setDepenses(depRes.data || [])
      setLoading(false)
    }
    load()
  }, [monthStart, nextMonth])

  const totalDepenses = useMemo(() => depenses.reduce((s, d) => s + Number(d.montant), 0), [depenses])
  const joursOccupes = useMemo(() => new Set(reservations.map(r => r.date)).size, [reservations])

  const solde = useMemo(() => {
    const payeParUser = depenses.filter(d => d.paye_par === user.nom).reduce((s, d) => s + Number(d.montant), 0)
    const partUser = totalDepenses / 3
    return payeParUser - partUser
  }, [depenses, totalDepenses, user.nom])

  const prochaineReservation = useMemo(() => {
    const today = isoDate(new Date())
    return reservations.find(r => r.date >= today && r.occupant === user.nom)
  }, [reservations, user.nom])

  // Mini calendar
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDay = firstDay.getDay() || 7 // Monday = 1
    const days = []
    for (let i = 1; i < startDay; i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(d)
    return days
  }, [year, month])

  const reservationsByDate = useMemo(() => {
    const map = {}
    reservations.forEach(r => {
      if (!map[r.date]) map[r.date] = []
      map[r.date].push(r.occupant)
    })
    return map
  }, [reservations])

  // Balance table
  const balanceData = useMemo(() => {
    const names = Object.keys(USERS)
    return names.map(nom => {
      const paye = depenses.filter(d => d.paye_par === nom).reduce((s, d) => s + Number(d.montant), 0)
      const part = totalDepenses / 3
      return { nom, paye, solde: paye - part }
    })
  }, [depenses, totalDepenses])

  // Occupation bars
  const occupationData = useMemo(() => {
    const names = Object.keys(USERS)
    const totalHours = reservations.reduce((s, r) => s + (r.heure_fin - r.heure_debut), 0)
    return names.map(nom => {
      const hours = reservations.filter(r => r.occupant === nom).reduce((s, r) => s + (r.heure_fin - r.heure_debut), 0)
      return { nom, hours, pct: totalHours > 0 ? (hours / totalHours) * 100 : 0 }
    })
  }, [reservations])

  // Recent activity
  const recentActivity = useMemo(() => {
    const items = [
      ...reservations.map(r => ({
        type: 'reservation',
        date: r.date,
        created: r.created_at,
        label: `${r.occupant} — ${r.motif}`,
        who: r.occupant,
      })),
      ...depenses.map(d => ({
        type: 'depense',
        date: d.date,
        created: d.created_at,
        label: `${d.paye_par} — ${d.description} (${formatEuro(d.montant)})`,
        who: d.paye_par,
      })),
    ]
    items.sort((a, b) => new Date(b.created) - new Date(a.created))
    return items.slice(0, 5)
  }, [reservations, depenses])

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-gray-400">Chargement...</div>
  }

  const monthName = new Date(year, month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={<IconWallet className="w-5 h-5 text-gray-400" />}
          label="Depenses du mois"
          value={formatEuro(totalDepenses)}
        />
        <MetricCard
          icon={<IconCalendar className="w-5 h-5 text-gray-400" />}
          label="Jours occupes"
          value={joursOccupes}
        />
        <MetricCard
          icon={<IconWallet className="w-5 h-5 text-gray-400" />}
          label="Mon solde"
          value={formatEuro(solde)}
          valueColor={solde >= 0 ? 'text-emerald-600' : 'text-red-500'}
        />
        <MetricCard
          icon={<IconClock className="w-5 h-5 text-gray-400" />}
          label="Prochaine resa"
          value={prochaineReservation ? formatDate(prochaineReservation.date) : '—'}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Mini Calendar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3 capitalize">{monthName}</h3>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <div key={i} className="text-center text-gray-400 font-medium py-1">{d}</div>
            ))}
            {calendarDays.map((day, i) => {
              if (!day) return <div key={i} />
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const occupants = reservationsByDate[dateStr] || []
              const uniqueOccupants = [...new Set(occupants)]
              const isToday = dateStr === isoDate(now)
              return (
                <div key={i} className={`text-center py-1 rounded-md text-xs relative ${isToday ? 'font-bold ring-1 ring-gray-900' : ''}`}>
                  <span className="text-gray-700">{day}</span>
                  {uniqueOccupants.length > 0 && (
                    <div className="flex justify-center gap-0.5 mt-0.5">
                      {uniqueOccupants.map(o => (
                        <div key={o} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getUserColor(o) }} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Balance Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Equilibre des depenses</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs">
                <th className="text-left pb-2 font-medium">Personne</th>
                <th className="text-right pb-2 font-medium">Paye</th>
                <th className="text-right pb-2 font-medium">Solde</th>
              </tr>
            </thead>
            <tbody>
              {balanceData.map(b => (
                <tr key={b.nom} className="border-t border-gray-100">
                  <td className="py-2 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getUserColor(b.nom) }} />
                    <span className="text-gray-900">{b.nom}</span>
                  </td>
                  <td className="py-2 text-right text-gray-600">{formatEuro(b.paye)}</td>
                  <td className={`py-2 text-right font-medium ${b.solde >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {b.solde >= 0 ? '+' : ''}{formatEuro(b.solde)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Activite recente</h3>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune activite</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: getUserColor(item.who) }} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                        {item.type === 'reservation' ? 'Resa' : 'Dep.'}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(item.date)}</span>
                    </div>
                    <p className="text-gray-700 truncate">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Occupation Bars */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Occupation du bureau</h3>
          <div className="space-y-3">
            {occupationData.map(o => (
              <div key={o.nom}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{o.nom}</span>
                  <span className="text-gray-500">{o.hours}h ({Math.round(o.pct)}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${o.pct}%`, backgroundColor: getUserColor(o.nom) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, valueColor = 'text-gray-900' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className={`text-lg font-semibold ${valueColor}`}>{value}</div>
    </div>
  )
}
