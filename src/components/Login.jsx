import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login({ onLogin }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (pin.length !== 4) return
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase
      .from('users')
      .select('*')
      .eq('pin', pin)

    setLoading(false)

    if (err) {
      setError('Erreur de connexion')
      return
    }
    if (!data || data.length === 0) {
      setError('PIN incorrect')
      setPin('')
      return
    }

    // If multiple users share the same PIN, show selection
    if (data.length === 1) {
      onLogin(data[0])
    } else {
      // Multiple users with same PIN — show picker
      setUsers(data)
    }
  }

  const [users, setUsers] = useState(null)

  function handleDigit(d) {
    if (pin.length < 4) {
      const next = pin + d
      setPin(next)
      setError('')
    }
  }

  function handleBackspace() {
    setPin(pin.slice(0, -1))
    setError('')
  }

  if (users) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-8">Bureau</h1>
          <p className="text-center text-gray-600 mb-6">Qui etes-vous ?</p>
          <div className="space-y-3">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => onLogin(u)}
                className="w-full py-3 px-4 rounded-lg border border-gray-200 bg-white text-gray-900 font-medium hover:border-gray-400 transition-colors"
                style={{ borderLeftWidth: 4, borderLeftColor: u.couleur }}
              >
                {u.nom}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setUsers(null); setPin('') }}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-xs">
        <h1 className="text-2xl font-semibold text-center text-gray-900 mb-2">Bureau</h1>
        <p className="text-center text-gray-500 text-sm mb-8">Entrez votre PIN</p>

        <form onSubmit={handleSubmit}>
          {/* PIN dots */}
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border-2 border-gray-300 transition-colors"
                style={i < pin.length ? { backgroundColor: '#111827', borderColor: '#111827' } : {}}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => handleDigit(String(d))}
                className="h-14 rounded-lg bg-white border border-gray-200 text-xl font-medium text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                {d}
              </button>
            ))}
            <div />
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-14 rounded-lg bg-white border border-gray-200 text-xl font-medium text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-14 rounded-lg bg-white border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            </button>
          </div>

          <button
            type="submit"
            disabled={pin.length !== 4 || loading}
            className="w-full py-3 rounded-lg bg-gray-900 text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            {loading ? 'Connexion...' : 'Entrer'}
          </button>
        </form>
      </div>
    </div>
  )
}
