import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getUserColor, getUserLightColor } from '../lib/constants'
import { IconPlus, IconTrash, IconCheck, IconListCheck } from './Icons'

const PRIORITES = [
  { value: 'haute',   label: 'Haute',   color: 'text-red-500',    bg: 'bg-red-50',    dot: 'bg-red-500' },
  { value: 'normale', label: 'Normale', color: 'text-amber-500',  bg: 'bg-amber-50',  dot: 'bg-amber-400' },
  { value: 'basse',   label: 'Basse',   color: 'text-gray-400',   bg: 'bg-gray-100',  dot: 'bg-gray-300' },
]

function getPriorite(value) {
  return PRIORITES.find(p => p.value === value) || PRIORITES[1]
}

export default function TodoList({ user }) {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTexte, setNewTexte] = useState('')
  const [newPriorite, setNewPriorite] = useState('normale')
  const [saving, setSaving] = useState(false)

  const loadTodos = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true })
    setTodos(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadTodos() }, [loadTodos])

  async function handleAdd(e) {
    e.preventDefault()
    if (!newTexte.trim()) return
    setSaving(true)
    await supabase.from('todos').insert({
      texte: newTexte.trim(),
      cree_par: user.nom,
      priorite: newPriorite,
      fait: false,
    })
    setSaving(false)
    setNewTexte('')
    setNewPriorite('normale')
    loadTodos()
  }

  async function toggleFait(todo) {
    const nowFait = !todo.fait
    await supabase.from('todos').update({
      fait: nowFait,
      fait_par: nowFait ? user.nom : null,
      fait_le: nowFait ? new Date().toISOString() : null,
    }).eq('id', todo.id)
    setTodos(prev => prev.map(t => t.id === todo.id
      ? { ...t, fait: nowFait, fait_par: nowFait ? user.nom : null }
      : t
    ))
  }

  async function handleDelete(todo) {
    await supabase.from('todos').delete().eq('id', todo.id)
    setTodos(prev => prev.filter(t => t.id !== todo.id))
  }

  const prioriteOrder = { haute: 0, normale: 1, basse: 2 }
  const enCours = todos
    .filter(t => !t.fait)
    .sort((a, b) => (prioriteOrder[a.priorite] ?? 1) - (prioriteOrder[b.priorite] ?? 1))
  const termines = todos.filter(t => t.fait)

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <IconListCheck className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900">To-do list</h3>
        {enCours.length > 0 && (
          <span className="text-xs font-medium bg-gray-900 text-white px-1.5 py-0.5 rounded-full">
            {enCours.length}
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Formulaire d'ajout */}
        <form onSubmit={handleAdd} className="p-3 border-b border-gray-100 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTexte}
              onChange={e => setNewTexte(e.target.value)}
              placeholder="Ajouter une tâche..."
              className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none"
            />
            <button
              type="submit"
              disabled={saving || !newTexte.trim()}
              className="p-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 transition-colors shrink-0"
            >
              <IconPlus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-1.5">
            {PRIORITES.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setNewPriorite(p.value)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  newPriorite === p.value
                    ? `${p.bg} ${p.color} ring-1 ring-current`
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                {p.label}
              </button>
            ))}
          </div>
        </form>

        {loading ? (
          <div className="py-6 text-center text-gray-400 text-sm">Chargement...</div>
        ) : todos.length === 0 ? (
          <div className="py-6 text-center text-gray-400 text-sm">Aucune tâche pour l'instant</div>
        ) : (
          <ul>
            {enCours.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                user={user}
                onToggle={toggleFait}
                onDelete={handleDelete}
              />
            ))}
            {termines.length > 0 && enCours.length > 0 && (
              <li className="px-3 py-1.5 text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
                Terminées ({termines.length})
              </li>
            )}
            {termines.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                user={user}
                onToggle={toggleFait}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function TodoItem({ todo, user, onToggle, onDelete }) {
  const prio = getPriorite(todo.priorite)

  return (
    <li className="flex items-center gap-3 px-3 py-2.5 border-t border-gray-100 first:border-0 hover:bg-gray-50 group">
      <button
        onClick={() => onToggle(todo)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
          todo.fait
            ? 'border-emerald-500 bg-emerald-500'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {todo.fait && <IconCheck className="w-3 h-3 text-white" />}
      </button>

      <span className={`flex-1 text-sm ${todo.fait ? 'line-through text-gray-400' : 'text-gray-900'}`}>
        {todo.texte}
      </span>

      <div className="flex items-center gap-1.5 shrink-0">
        {!todo.fait && todo.priorite && (
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${prio.bg} ${prio.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} />
            {prio.label}
          </span>
        )}
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: getUserLightColor(todo.cree_par),
            color: getUserColor(todo.cree_par),
          }}
        >
          {todo.cree_par}
        </span>
        {(todo.cree_par === user.nom || todo.fait_par === user.nom) && (
          <button
            onClick={() => onDelete(todo)}
            className="p-1 rounded text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </li>
  )
}
