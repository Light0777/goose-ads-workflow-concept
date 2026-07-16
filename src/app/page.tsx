'use client'

import { useEffect, useState } from 'react'
import Home from './app-content'

export default function Page() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  return <Home />
}
