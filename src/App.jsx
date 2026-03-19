import { useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { IconLogout } from './components/Icons'

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bureau_user')
    return saved ? JSON.parse(saved) : null
  })

  function handleLogin(u) {
    setUser(u)
    localStorage.setItem('bureau_user', JSON.stringify(u))
  }

  function handleLogout() {
    setUser(null)
    localStorage.removeItem('bureau_user')
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <h1 className="text-lg font-semibold text-gray-900">Bureau</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: user.couleur || '#6B7280' }} />
            <span className="text-sm font-medium text-gray-700">{user.nom}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Deconnexion"
          >
            <IconLogout className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
        <Dashboard user={user} />
      </main>
    </div>
  )
}
