import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { USERS, formatEuro, formatDate, getUserColor } from '../lib/constants'
import { IconWallet, IconPlus } from './Icons'

const GCAL_EMBED_URL = 'https://calendar.google.com/calendar/embed?src=ca65bb4a6552d5fd299d794cd3d1324bfdb89f980414d0620b51a7b1da0e1934%40group.calendar.google.com&ctz=Europe%2FParis&mode=WEEK&showTitle=0&showNav=1&showPrint=0&showTabs=0&showCalendars=0'

export default function Dashboard({ user }) {
  const [depenses, setDepenses] = useState([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const nextMonth = month === 11 ? `${year + 1}-01-01` : `${year}-${String(month + 2).padStart(2, '0')}-01`

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('depenses')
        .select('*')
        .gte('date', monthStart)
        .lt('date', nextMonth)
        .order('created_at', { ascending: false })
      setDepenses(data || [])
      setLoading(false)
    }
    load()
  }, [monthStart, nextMonth])

  const totalDepenses = useMemo(() => depenses.reduce((s, d) => s + Number(d.montant), 0), [depenses])

  const solde = useMemo(() => {
    const payeParUser = depenses.filter(d => d.paye_par === user.nom).reduce((s, d) => s + Number(d.montant), 0)
    const partUser = totalDepenses / 3
    return payeParUser - partUser
  }, [depenses, totalDepenses, user.nom])

  // Balance table
  const balanceData = useMemo(() => {
    const names = Object.keys(USERS)
    return names.map(nom => {
      const paye = depenses.filter(d => d.paye_par === nom).reduce((s, d) => s + Number(d.montant), 0)
      const part = totalDepenses / 3
      return { nom, paye, solde: paye - part }
    })
  }, [depenses, totalDepenses])

  // Recent activity (depenses only — reservations are in Google Calendar)
  const recentActivity = useMemo(() => {
    return depenses.slice(0, 5).map(d => ({
      date: d.date,
      label: `${d.paye_par} — ${d.description} (${formatEuro(d.montant)})`,
      who: d.paye_par,
    }))
  }, [depenses])

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-gray-400">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={<IconWallet className="w-5 h-5 text-gray-400" />}
          label="Depenses du mois"
          value={formatEuro(totalDepenses)}
        />
        <MetricCard
          icon={<IconWallet className="w-5 h-5 text-gray-400" />}
          label="Mon solde"
          value={formatEuro(solde)}
          valueColor={solde >= 0 ? 'text-emerald-600' : 'text-red-500'}
        />
      </div>

      {/* Google Calendar */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Calendrier du bureau</h3>
        <a
          href="https://calendar.google.com/calendar/r/eventedit?cid=ca65bb4a6552d5fd299d794cd3d1324bfdb89f980414d0620b51a7b1da0e1934@group.calendar.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <IconPlus className="w-4 h-4" />
          Reserver le bureau
        </a>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <iframe
          src={GCAL_EMBED_URL}
          className="w-full border-0"
          style={{ height: '500px' }}
          title="Calendrier Bureau"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
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

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Depenses recentes</h3>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune depense ce mois</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: getUserColor(item.who) }} />
                  <div className="min-w-0">
                    <span className="text-xs text-gray-400">{formatDate(item.date)}</span>
                    <p className="text-gray-700 truncate">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
