'use client'

import dynamic from 'next/dynamic'

const AppContent = dynamic(() => import('./app-content'), { ssr: false })

export default function AppContentWrapper() {
  return <AppContent />
}
