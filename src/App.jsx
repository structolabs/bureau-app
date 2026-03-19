import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Reservations from './components/Reservations'
import Depenses from './components/Depenses'
import { IconDashboard, IconCalendar, IconWallet, IconLogout } from './components/Icons'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
  { id: 'reservations', label: 'Reservations', icon: IconCalendar },
  { id: 'depenses', label: 'Depenses', icon: IconWallet },
]

function getUserColor(user) {
  return user?.couleur || '#6B7280'
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bureau_user')
    return saved ? JSON.parse(saved) : null
  })
  const [tab, setTab] = useState('dashboard')

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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">Bureau</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getUserColor(user) }} />
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

      {/* Content */}
      <main className="flex-1 p-4 pb-20 lg:pb-4 max-w-5xl mx-auto w-full">
        {tab === 'dashboard' && <Dashboard user={user} />}
        {tab === 'reservations' && <Reservations />}
        {tab === 'depenses' && <Depenses user={user} />}
      </main>

      {/* Bottom tab bar (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-40">
        <div className="flex">
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-colors ${active ? 'text-gray-900' : 'text-gray-400'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{t.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Desktop sidebar tabs */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-14 bg-white border-r border-gray-200 flex-col items-center pt-16 gap-1 z-40">
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              title={t.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          )
        })}
      </nav>
    </div>
  )
}
