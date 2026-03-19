import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES_DEPENSES, USERS, formatEuro, getUserColor, getUserLightColor } from '../lib/constants'
import { IconChevronLeft, IconChevronRight, IconPlus } from './Icons'

export default function Depenses({ user }) {
  const [depenses, setDepenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [showForm, setShowForm] = useState(false)

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

  function prevMonth() {
    setMonth(m => m.month === 0 ? { year: m.year - 1, month: 11 } : { ...m, month: m.month - 1 })
  }

  function nextMonthNav() {
    setMonth(m => m.month === 11 ? { year: m.year + 1, month: 0 } : { ...m, month: m.month + 1 })
  }

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
    setShowForm(false)
    loadDepenses()
  }

  const total = useMemo(() => depenses.reduce((s, d) => s + Number(d.montant), 0), [depenses])

  const cumulParPersonne = useMemo(() => {
    const names = Object.keys(USERS)
    return names.map(nom => ({
      nom,
      total: depenses.filter(d => d.paye_par === nom).reduce((s, d) => s + Number(d.montant), 0),
    }))
  }, [depenses])

  const monthLabel = new Date(month.year, month.month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <IconChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={nextMonthNav} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <IconChevronRight className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-700 capitalize">{monthLabel}</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <IconPlus className="w-4 h-4" />
          Depense
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date</label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Categorie</label>
              <select
                value={formCategorie}
                onChange={e => setFormCategorie(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                {CATEGORIES_DEPENSES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Description</label>
            <input
              type="text"
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              placeholder="Ex: Capsules Nespresso"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Montant</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formMontant}
              onChange={e => setFormMontant(e.target.value)}
              placeholder="0,00"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: user.couleur }} />
            Paye par {user.nom}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
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

        {/* Totals */}
        {depenses.length > 0 && (
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-900">Total</span>
              <span className="font-semibold text-gray-900">{formatEuro(total)}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {cumulParPersonne.map(c => (
                <div key={c.nom} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getUserColor(c.nom) }} />
                  <span className="text-gray-600">{c.nom} : {formatEuro(c.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
