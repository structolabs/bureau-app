export const USERS = {
  Simon: { couleur: '#3B82F6', light: '#DBEAFE' },
  Franck: { couleur: '#10B981', light: '#D1FAE5' },
  Flo: { couleur: '#F59E0B', light: '#FEF3C7' },
}

export const MOTIFS = ['Client RDV', 'Reunion interne', 'Travail solo', 'Autre']

export const CATEGORIES_DEPENSES = [
  'Cafe/The',
  'Eau/Boissons',
  'Fournitures',
  'Nettoyage',
  'Impression',
  'Repas partage',
  'Autre',
]

export const HEURES = Array.from({ length: 11 }, (_, i) => 9 + i) // 9..19

export function getUserColor(nom) {
  return USERS[nom]?.couleur || '#6B7280'
}

export function getUserLightColor(nom) {
  return USERS[nom]?.light || '#F3F4F6'
}

export function formatEuro(montant) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(montant)
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}

export function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isoDate(date) {
  return date.toISOString().split('T')[0]
}
