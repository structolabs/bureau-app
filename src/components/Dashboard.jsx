import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES_DEPENSES, USERS, formatEuro, getUserColor, getUserLightColor } from '../lib/constants'
import { IconWallet, IconPlus, IconChevronLeft, IconChevronRight } from './Icons'

const GCAL_EMBED_URL = 'https://calendar.google.com/calendar/embed?src=ca65bb4a6552d5fd299d794cd3d1324bfdb89f980414d0620b51a7b1da0e1934%40group.calendar.google.com&ctz=Europe%2FParis&mode=WEEK&showTitle=0&showNav=1&showPrint=0&showTabs=0&showCalendars=0'

export default function Dashboard({ user }) {
  const [depenses, setDepenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  // Form state
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0])
  const [formDesc, setFormDesc] = useState('')
  const [formCategorie, setFormCategorie] = useState(CATEGORIES_DEPENSES[0])
  const [formMontant, setFormMontant] = useState('')
  const [saving, setSaving] = useState(false)

  const monthStart = `${month.year}-${String(month.month + 1).padStart(2, '0')}-01`
  const nextMonth = month.month === 11
    ? `${month.year + 1}-01-01`
    : `${month.year}-${String(month.month + 2).padStart(2, '0')}-01`

  const loadDepenses = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('depenses')
      .select('*')
      .gte('date', monthStart)
      .lt('date', nextMonth)
      .order('date', { ascending: false })
    setDepenses(data || [])
    setLoading(false)
  }, [monthStart, nextMonth])

  useEffect(() => { loadDepenses() }, [loadDepenses])

  const totalDepenses = useMemo(() => depenses.reduce((s, d) => s + Number(d.montant), 0), [depenses])

  const solde = useMemo(() => {
    const payeParUser = depenses.filter(d => d.paye_par === user.nom).reduce((s, d) => s + Number(d.montant), 0)
    return payeParUser - totalDepenses / 3
  }, [depenses, totalDepenses, user.nom])

  const balanceData = useMemo(() => {
    return Object.keys(USERS).map(nom => {
      const paye = depenses.filter(d => d.paye_par === nom).reduce((s, d) => s + Number(d.montant), 0)
      return { nom, paye, solde: paye - totalDepenses / 3 }
    })
  }, [depenses, totalDepenses])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!formDesc.trim() || !formMontant) return
    setSaving(true)
    await supabase.from('depenses').insert({
      date: formDate,
      description: formDesc.trim(),
      categorie: formCategorie,
      paye_par: user.nom,
      montant: parseFloat(formMontant),
    })
    setSaving(false)
    setFormDesc('')
    setFormMontant('')
    loadDepenses()
  }

  function prevMonth() {
    setMonth(m => m.month === 0 ? { year: m.year - 1, month: 11 } : { ...m, month: m.month - 1 })
  }

  function nextMonthNav() {
    setMonth(m => m.month === 11 ? { year: m.year + 1, month: 0 } : { ...m, month: m.month + 1 })
  }

  const monthLabel = new Date(month.year, month.month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

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

      {/* Expense form */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Ajouter une depense</h3>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex flex-wrap items-end gap-2">
            <input
              type="date"
              value={formDate}
              onChange={e => setFormDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm w-[130px]"
              required
            />
            <input
              type="text"
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              placeholder="Description"
              className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm flex-1 min-w-[140px]"
              required
            />
            <select
              value={formCategorie}
              onChange={e => setFormCategorie(e.target.value)}
              className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm"
            >
              {CATEGORIES_DEPENSES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formMontant}
              onChange={e => setFormMontant(e.target.value)}
              placeholder="Montant"
              className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm w-[100px]"
              required
            />
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {saving ? '...' : 'Ajouter'}
            </button>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: user.couleur }} />
            Paye par {user.nom}
          </div>
        </form>
      </div>

      {/* Expenses table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Depenses du mois</h3>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
              <IconChevronLeft className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <span className="text-xs font-medium text-gray-600 capitalize w-28 text-center">{monthLabel}</span>
            <button onClick={nextMonthNav} className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
              <IconChevronRight className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-8 text-center text-gray-400 text-sm">Chargement...</div>
          ) : depenses.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">Aucune depense ce mois</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-500">
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Description</th>
                    <th className="text-left p-3 font-medium hidden sm:table-cell">Categorie</th>
                    <th className="text-left p-3 font-medium">Payeur</th>
                    <th className="text-right p-3 font-medium">Montant</th>
                    <th className="text-right p-3 font-medium hidden sm:table-cell">Part (1/3)</th>
                  </tr>
                </thead>
                <tbody>
                  {depenses.map(d => (
                    <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-gray-600 whitespace-nowrap">
                        {new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                      </td>
                      <td className="p-3 text-gray-900">{d.description}</td>
                      <td className="p-3 text-gray-500 hidden sm:table-cell">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{d.categorie}</span>
                      </td>
                      <td className="p-3">
                        <span
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: getUserLightColor(d.paye_par),
                            color: getUserColor(d.paye_par),
                          }}
                        >
                          {d.paye_par}
                        </span>
                      </td>
                      <td className="p-3 text-right font-medium text-gray-900">{formatEuro(d.montant)}</td>
                      <td className="p-3 text-right text-gray-500 hidden sm:table-cell">
                        {formatEuro(Number(d.montant) / 3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals + balance */}
          {depenses.length > 0 && (
            <div className="border-t border-gray-200 p-3 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-semibold text-gray-900">{formatEuro(totalDepenses)}</span>
              </div>
              <div className="space-y-1.5">
                {balanceData.map(b => (
                  <div key={b.nom} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getUserColor(b.nom) }} />
                      <span className="text-gray-700">{b.nom}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">paye {formatEuro(b.paye)}</span>
                      <span className={`font-medium ${b.solde >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {b.solde >= 0 ? '+' : ''}{formatEuro(b.solde)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
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
