import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { MOTIFS, HEURES, getUserColor, getUserLightColor, getMonday, isoDate } from '../lib/constants'
import { IconChevronLeft, IconChevronRight, IconX, IconTrash } from './Icons'

export default function Reservations({ user }) {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // { mode: 'create' | 'view', date, heure_debut, heure_fin, reservation }
  const [formMotif, setFormMotif] = useState(MOTIFS[0])
  const [formStart, setFormStart] = useState(9)
  const [formEnd, setFormEnd] = useState(10)
  const [saving, setSaving] = useState(false)

  const weekDates = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [weekStart])

  const weekEndStr = useMemo(() => isoDate(weekDates[4]), [weekDates])
  const weekStartStr = useMemo(() => isoDate(weekStart), [weekStart])

  const loadReservations = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reservations')
      .select('*')
      .gte('date', weekStartStr)
      .lte('date', weekEndStr)
      .order('heure_debut')
    setReservations(data || [])
    setLoading(false)
  }, [weekStartStr, weekEndStr])

  useEffect(() => { loadReservations() }, [loadReservations])

  function prevWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
  }

  function nextWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
  }

  function goToday() {
    setWeekStart(getMonday(new Date()))
  }

  function handleCellClick(date, heure) {
    const dateStr = isoDate(date)
    const existing = reservations.find(r => r.date === dateStr && r.heure_debut <= heure && r.heure_fin > heure)
    if (existing) {
      setModal({ mode: 'view', reservation: existing })
    } else {
      setFormStart(heure)
      setFormEnd(heure + 1)
      setFormMotif(MOTIFS[0])
      setModal({ mode: 'create', date: dateStr })
    }
  }

  async function handleCreate() {
    if (formEnd <= formStart) return
    setSaving(true)
    await supabase.from('reservations').insert({
      date: modal.date,
      heure_debut: formStart,
      heure_fin: formEnd,
      occupant: user.nom,
      motif: formMotif,
    })
    setSaving(false)
    setModal(null)
    loadReservations()
  }

  async function handleDelete(id) {
    setSaving(true)
    await supabase.from('reservations').delete().eq('id', id)
    setSaving(false)
    setModal(null)
    loadReservations()
  }

  // Get reservation at specific cell
  function getReservationAt(dateStr, heure) {
    return reservations.find(r => r.date === dateStr && r.heure_debut <= heure && r.heure_fin > heure)
  }

  function isReservationStart(dateStr, heure) {
    return reservations.find(r => r.date === dateStr && r.heure_debut === heure)
  }

  const today = isoDate(new Date())

  return (
    <div>
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <IconChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={nextWeek} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <IconChevronRight className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={goToday} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600">
            Aujourd'hui
          </button>
        </div>
        <span className="text-sm font-medium text-gray-700">
          {weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} — {weekDates[4].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="w-16 p-2 text-xs text-gray-400 font-medium" />
                {weekDates.map(d => {
                  const ds = isoDate(d)
                  return (
                    <th key={ds} className={`p-2 text-center ${ds === today ? 'bg-gray-50' : ''}`}>
                      <div className="text-xs text-gray-400 font-medium">
                        {d.toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </div>
                      <div className={`text-sm font-medium ${ds === today ? 'text-gray-900' : 'text-gray-600'}`}>
                        {d.getDate()}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {HEURES.slice(0, -1).map(h => (
                <tr key={h} className="border-t border-gray-100">
                  <td className="p-1 text-xs text-gray-400 text-right pr-2 align-top">
                    {h}h
                  </td>
                  {weekDates.map(d => {
                    const ds = isoDate(d)
                    const res = getReservationAt(ds, h)
                    const isStart = isReservationStart(ds, h)

                    if (res && !isStart) {
                      return <td key={ds} className="border-l border-gray-100" />
                    }

                    if (res && isStart) {
                      const span = res.heure_fin - res.heure_debut
                      return (
                        <td
                          key={ds}
                          rowSpan={span}
                          className="border-l border-gray-100 p-0.5 align-top cursor-pointer"
                          onClick={() => setModal({ mode: 'view', reservation: res })}
                        >
                          <div
                            className="rounded-md p-1.5 h-full text-xs"
                            style={{
                              backgroundColor: getUserLightColor(res.occupant),
                              borderLeft: `3px solid ${getUserColor(res.occupant)}`,
                            }}
                          >
                            <div className="font-medium text-gray-900 truncate">{res.occupant}</div>
                            <div className="text-gray-500 truncate">{res.motif}</div>
                          </div>
                        </td>
                      )
                    }

                    return (
                      <td
                        key={ds}
                        className={`border-l border-gray-100 p-0.5 cursor-pointer hover:bg-gray-50 transition-colors ${ds === today ? 'bg-gray-50/50' : ''}`}
                        onClick={() => handleCellClick(d, h)}
                      >
                        <div className="h-8" />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            {modal.mode === 'create' ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Nouvelle reservation</h3>
                  <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                    <IconX className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {new Date(modal.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Debut</label>
                      <select
                        value={formStart}
                        onChange={e => setFormStart(Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      >
                        {HEURES.slice(0, -1).map(h => (
                          <option key={h} value={h}>{h}h00</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Fin</label>
                      <select
                        value={formEnd}
                        onChange={e => setFormEnd(Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      >
                        {HEURES.filter(h => h > formStart).map(h => (
                          <option key={h} value={h}>{h}h00</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Motif</label>
                    <select
                      value={formMotif}
                      onChange={e => setFormMotif(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    >
                      {MOTIFS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: user.couleur }} />
                    Reserve par {user.nom}
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="mt-4 w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Enregistrement...' : 'Reserver'}
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Reservation</h3>
                  <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                    <IconX className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getUserColor(modal.reservation.occupant) }} />
                    <span className="font-medium text-gray-900">{modal.reservation.occupant}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(modal.reservation.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {modal.reservation.heure_debut}h00 — {modal.reservation.heure_fin}h00
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">Motif : </span>
                    <span className="text-gray-700">{modal.reservation.motif}</span>
                  </div>
                </div>

                {modal.reservation.occupant === user.nom && (
                  <button
                    onClick={() => handleDelete(modal.reservation.id)}
                    disabled={saving}
                    className="mt-4 w-full py-2.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <IconTrash className="w-4 h-4" />
                    {saving ? 'Suppression...' : 'Supprimer'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
