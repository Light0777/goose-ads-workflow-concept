'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

const IMAGES = [
  { uri: 'https://placehold.co/400x500/EEE/333?text=Modern+Display', label: 'Modern Display' },
  { uri: 'https://placehold.co/400x300/EEE/333?text=Clean+Promo', label: 'Clean Promo' },
  { uri: 'https://placehold.co/400x600/EEE/333?text=Premium+Offer', label: 'Premium Offer' },
  { uri: 'https://placehold.co/400x400/EEE/333?text=Photo+Banner', label: 'Photo Banner' },
  { uri: 'https://placehold.co/400x350/EEE/333?text=Minimalist+Ad', label: 'Minimalist Ad' },
  { uri: 'https://placehold.co/400x550/EEE/333?text=Bold+Headline', label: 'Bold Headline' },
  { uri: 'https://placehold.co/400x480/EEE/333?text=Calm+Scene', label: 'Calm Scene' },
  { uri: 'https://placehold.co/400x320/EEE/333?text=Tech+Launch', label: 'Tech Launch' },
  { uri: 'https://placehold.co/400x520/EEE/333?text=Software+UI', label: 'Software UI' },
  { uri: 'https://placehold.co/400x380/EEE/333?text=Energetic', label: 'Energetic' },
  { uri: 'https://placehold.co/400x450/EEE/333?text=Warm+Tone', label: 'Warm Tone' },
  { uri: 'https://placehold.co/400x420/EEE/333?text=Wellness', label: 'Wellness' },
  { uri: 'https://placehold.co/400x500/EEE/333?text=3D+Render', label: '3D Render' },
  { uri: 'https://placehold.co/400x340/EEE/333?text=Professional', label: 'Professional' },
  { uri: 'https://placehold.co/400x460/EEE/333?text=Editorial', label: 'Editorial' },
]

const GENERATED_ADS = [
  { uri: 'https://picsum.photos/seed/gen1/600/750', label: 'Variant A – Modern Display' },
  { uri: 'https://picsum.photos/seed/gen2/600/750', label: 'Variant B – Clean Promo' },
  { uri: 'https://picsum.photos/seed/gen3/600/750', label: 'Variant C – Bold Headline' },
  { uri: 'https://picsum.photos/seed/gen4/600/750', label: 'Variant D – Warm Tone' },
]

const FILTERS = ['All','Clean','Premium','Photo','Minimalist','Bold','Calm','Modern','Software','Energetic','Warm','Wellness','3d','Professional','Editorial']

const HISTORY_ITEMS = [
  { id: 1, selectedIds: [2, 4], prompt: 'make an ad for me use these templates', generatedUri: 'https://picsum.photos/seed/h1/600/750', generatedLabel: 'Variant A – Bold + Premium', timestamp: '2 min ago' },
  { id: 2, selectedIds: [0, 6], prompt: 'modern dark theme for tech product', generatedUri: 'https://picsum.photos/seed/h2/600/750', generatedLabel: 'Variant B – Dark Tech', timestamp: '15 min ago' },
  { id: 3, selectedIds: [10, 11], prompt: 'warm wellness vibes', generatedUri: 'https://picsum.photos/seed/h3/600/750', generatedLabel: 'Variant C – Wellness', timestamp: '1 hour ago' },
  { id: 4, selectedIds: [8], prompt: 'showcase the software ui in a clean way', generatedUri: 'https://picsum.photos/seed/h4/600/750', generatedLabel: 'Variant D – Software UI', timestamp: '3 hours ago' },
  { id: 5, selectedIds: [3, 7, 12], prompt: 'photo + 3d combo for premium feel', generatedUri: 'https://picsum.photos/seed/h5/600/750', generatedLabel: 'Variant E – Premium', timestamp: 'yesterday' },
]

type Message = {
  role: 'user' | 'assistant'
  text: string
  image?: string
  label?: string
  selectedIds?: number[]
}

const STATUS_STEPS = [
  { at: 0, text: 'Analyzing your style references...' },
  { at: 25, text: 'Applying brand kit to the composition...' },
  { at: 50, text: 'Generating your ad variants...' },
  { at: 75, text: 'Enhancing resolution and formatting...' },
  { at: 95, text: 'Finalizing output...' },
]

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
      <path d="M8 12.75C8 12.75 9.6 13.6625 10.4 15C10.4 15 12.8 9.75 16 8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function Home() {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [activeFilter, setActiveFilter] = useState(0)
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images')
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [secondaryTab, setSecondaryTab] = useState<'templates' | 'community'>('templates')
  const [mode, setMode] = useState<'browse' | 'generating' | 'complete'>('browse')
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [progress, setProgress] = useState(0)
  const [historyOpen, setHistoryOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const toggleSelect = useCallback((id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    if (selected.size === 0 && textareaRef.current && prompt === '') {
      textareaRef.current.focus()
    }
  }, [selected, prompt])

  const removeRef = useCallback((id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const handleGenerate = useCallback(() => {
    if (selected.size === 0 || generating) return

    const ids = Array.from(selected)
    const userText = prompt || 'Generate ads from selected templates'

    setChatMessages([{ role: 'user', text: userText, selectedIds: ids }])
    setMode('generating')
    setGenerating(true)
    setProgress(0)

    const totalDuration = 3500
    const interval = 60
    const step = 100 / (totalDuration / interval)
    let current = 0

    const timer = setInterval(() => {
      current = Math.min(current + step, 100)
      setProgress(current)

      if (current >= 100) {
        clearInterval(timer)
        const ad = GENERATED_ADS[Math.floor(Math.random() * GENERATED_ADS.length)]
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          text: 'Here are your generated ads. You can refine further or download below.',
          image: ad.uri,
          label: ad.label,
        }])
        setMode('complete')
        setGenerating(false)
      }
    }, interval)
  }, [selected, generating, prompt])

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 80) + 'px'
    }
  }, [])

  const loadHistoryItem = useCallback((item: typeof HISTORY_ITEMS[number]) => {
    setChatMessages([
      { role: 'user', text: item.prompt, selectedIds: item.selectedIds },
      { role: 'assistant', text: 'Here are your generated ads. You can refine further or download below.', image: item.generatedUri, label: item.generatedLabel },
    ])
    setMode('complete')
    setHistoryOpen(false)
  }, [])

  const handleNewGeneration = useCallback(() => {
    setMode('browse')
    setChatMessages([])
    setProgress(0)
    setPrompt('')
  }, [])

  const currentStatus = STATUS_STEPS.slice().reverse().find(s => progress >= s.at)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  return (
    <div>
      {historyOpen && (
        <div onClick={() => setHistoryOpen(false)} style={{
          position:'fixed',inset:0,background:'rgba(0,0,0,0.3)',zIndex:40
        }} />
      )}

      <div className="history-sidebar" style={{
        position:'fixed',top:0,left:0,bottom:0,zIndex:50,
        width:360,background:'var(--panel)',borderRight:'1px solid var(--border)',
        boxShadow:'4px 0 24px rgba(0,0,0,0.1)',
        transform: historyOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform .25s ease',
        display:'flex',flexDirection:'column'
      }}>
        <div style={{
          display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'16px 18px',borderBottom:'1px solid var(--border-soft)'
        }}>
          <span style={{fontSize:15,fontWeight:600,color:'var(--text)'}}>Generate History</span>
          <button onClick={() => setHistoryOpen(false)} style={{
            width:28,height:28,borderRadius:'50%',border:'none',
            background:'var(--panel-2)',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',
            color:'var(--text-dim)',fontSize:14
          }}>✕</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'8px 0'}}>
          {HISTORY_ITEMS.map(item => (
            <div key={item.id} onClick={() => loadHistoryItem(item)} style={{
              display:'flex',gap:12,padding:'12px 18px',cursor:'pointer',
              borderBottom:'1px solid var(--border-soft)',
              transition:'background .1s'
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--panel-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',gap:4,marginBottom:6}}>
                  {item.selectedIds.slice(0, 3).map(id => (
                    <div key={id} style={{
                      width:36,height:36,borderRadius:6,overflow:'hidden',
                      border:'1px solid var(--border)',flex:'none'
                    }}>
                      <img src={IMAGES[id].uri} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                    </div>
                  ))}
                  {item.selectedIds.length > 3 && (
                    <div style={{
                      width:36,height:36,borderRadius:6,border:'1px solid var(--border)',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:11,color:'var(--text-faint)',background:'var(--panel-2)'
                    }}>+{item.selectedIds.length - 3}</div>
                  )}
                </div>
                <div style={{fontSize:13,color:'var(--text)',lineHeight:'1.3',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {item.prompt}
                </div>
                <div style={{fontSize:11,color:'var(--text-faint)',marginTop:3}}>{item.timestamp}</div>
              </div>
              <div style={{
                width:64,height:64,borderRadius:8,overflow:'hidden',
                border:'1px solid var(--border)',flex:'none'
              }}>
                <img src={item.generatedUri} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <header style={{
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'14px 24px',borderBottom:'1px solid var(--border-soft)',
        position:'sticky',top:0,background:'rgba(250,250,248,0.92)',
        backdropFilter:'blur(8px)',zIndex:20,width:'100%',left:0,right:0
      }}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
          <div className="breadcrumb" style={{display:'flex',alignItems:'center',gap:10,fontSize:14,color:'var(--text-dim)'}}>
            <div className="logo-box" style={{width:26,height:26,borderRadius:8,background:'var(--dark)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#fff'}}>A</div>
            <span style={{color:'var(--text)',fontWeight:600}}>Ad Studio</span>
            <span style={{color:'var(--text-faint)'}}>/</span>
            <span>Mybrand</span>
            <span style={{color:'var(--text-faint)'}}>/</span>
            <span style={{color:'var(--text)'}}>Create</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:999,background:'var(--panel-2)',border:'1px solid var(--border)',fontSize:13,color:'var(--text)',cursor:'pointer'}}>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C12.8417 22 14 22.1163 14 21C14 20.391 13.6832 19.9212 13.3686 19.4544C12.9082 18.7715 12.4523 18.0953 13 17C13.6667 15.6667 14.7778 15.6667 16.4815 15.6667C17.3334 15.6667 18.3334 15.6667 19.5 15.5C21.601 15.1999 22 13.9084 22 12Z" strokeLinecap="round"/><circle cx="9.5" cy="8.5" r="1.5"/><circle cx="16.5" cy="9.5" r="1.5"/><path d="M7.125 15H7M7.25 15C7.25 15.1381 7.13807 15.25 7 15.25C6.86193 15.25 6.75 15.1381 6.75 15C6.75 14.8619 6.86193 14.75 7 14.75C7.13807 14.75 7.25 14.8619 7.25 15Z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="brand-label">My brand</span>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{width:30,height:30,borderRadius:'50%',background:'#d8546f',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700}}>L</div>
          </div>
        </div>
      </header>

      <div className="app font-[family-name:var(--font-sans)]">

      {mode === 'browse' && (
        <>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 24px 0 24px',flexWrap:'wrap',gap:12}}>
            <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
              <div onClick={() => setHistoryOpen(true)} style={{
                width:36,height:36,borderRadius:'50%',
                display:'flex',alignItems:'center',justifyContent:'center',
                background:'var(--panel-2)',border:'1px solid var(--border)',
                cursor:'pointer'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:'var(--text-dim)'}}>
                  <path d="M4 5L20 5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 12L20 12" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 19L20 19" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{display:'flex',padding:3,borderRadius:999,border:'1px solid var(--border)',background:'var(--panel)'}}>
                {(['images','videos'] as const).map(tab => (
                  <div key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      display:'flex',alignItems:'center',gap:7,padding:'7px 16px',borderRadius:999,
                      fontSize:13.5,cursor:'pointer',textTransform:'capitalize',
                      background: activeTab === tab ? 'var(--panel-2)' : 'transparent',
                      color: activeTab === tab ? 'var(--text)' : 'var(--text-dim)',
                      transition:'background .15s ease, color .15s ease'
                    }}
                  >
                    <svg className="icon" viewBox="0 0 24 24" style={{width:15,height:15}}>
                      {tab === 'images' ? (
                        <><circle cx="7.5" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.5"/><path d="M5 21C9.37246 15.775 14.2741 8.88406 21.4975 13.5424" stroke="currentColor" strokeWidth="1.5"/></>
                      ) : (
                        <><path d="M2 11C2 7.70017 2 6.05025 3.02513 5.02513C4.05025 4 5.70017 4 9 4H10C13.2998 4 14.9497 4 15.9749 5.02513C17 6.05025 17 7.70017 17 11V13C17 16.2998 17 17.9497 15.9749 18.9749C14.9497 20 13.2998 20 10 20H9C5.70017 20 4.05025 20 3.02513 18.9749C2 17.9497 2 16.2998 2 13V11Z" stroke="currentColor" strokeWidth="1.5"/><path d="M17 8.90585L17.1259 8.80196C19.2417 7.05623 20.2996 6.18336 21.1498 6.60482C22 7.02628 22 8.42355 22 11.2181V12.7819C22 15.5765 22 16.9737 21.1498 17.3952C20.2996 17.8166 19.2417 16.9438 17.1259 15.198L17 15.0941" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="11.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/></>
                      )}
                    </svg>
                    {tab === 'images' ? 'Images' : 'Videos'}
                  </div>
                ))}
              </div>
              <div style={{display:'flex',padding:3,borderRadius:999,border:'1px solid var(--border)',background:'var(--panel)'}}>
                {(['templates','community'] as const).map(tab => (
                  <div key={tab}
                    onClick={() => setSecondaryTab(tab)}
                    style={{
                      display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:999,
                      fontSize:13.5,cursor:'pointer',textTransform:'capitalize',
                      background: secondaryTab === tab ? 'var(--panel-2)' : 'transparent',
                      color: secondaryTab === tab ? 'var(--text)' : 'var(--text-dim)',
                      transition:'background .15s ease, color .15s ease'
                    }}
                  >
                    <svg className="icon" viewBox="0 0 24 24" style={{width:15,height:15}}>
                      {tab === 'templates' ? (
                        <><path d="M13 3H11C7.22876 3 5.34315 3 4.17157 4.17157C3 5.34315 3 7.22876 3 11V13C3 16.7712 3 18.6569 4.17157 19.8284C5.34315 21 7.22876 21 11 21H13C16.7712 21 18.6569 21 19.8284 19.8284C21 18.6569 21 16.7712 21 13V11C21 7.22876 21 5.34315 19.8284 4.17157C18.6569 3 16.7712 3 13 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 3V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 3V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21.0001 9L3.00014 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21.0001 15L3.00014 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>
                      ) : (
                        <><path d="M18.4995 20.5C18.2663 17.5685 15.8417 15.2477 12.808 15.0521L11.9995 15C11.7107 15.0076 11.4416 15.0178 11.1877 15.0298C8.18075 15.1723 5.7304 17.5974 5.49951 20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.2495 9.25C15.2495 11.0449 13.7944 12.5 11.9995 12.5C10.2046 12.5 8.74952 11.0449 8.74952 9.25C8.74952 7.45507 10.2046 6 11.9995 6C13.7944 6 15.2495 7.45507 15.2495 9.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.50249 8.5C5.17908 7.99485 4.99158 7.39432 4.99158 6.75C4.99158 4.95507 6.44665 3.5 8.24157 3.5C8.68752 3.5 9.1125 3.58982 9.49939 3.75235" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.4963 8.5C18.8197 7.99485 19.0072 7.39432 19.0072 6.75C19.0072 4.95507 17.5521 3.5 15.7572 3.5C15.3113 3.5 14.8863 3.58982 14.4994 3.75235" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M22.0007 17.9996C21.8208 15.7374 19.9995 13.5 17.9995 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M1.99927 17.9996C2.17923 15.7374 4.00049 13.5 6.00049 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>
                      )}
                    </svg>
                    {tab === 'templates' ? 'Templates' : 'Community'}
                  </div>
                ))}
              </div>
              <ActionChip icon={<svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.9852 12.1565L18.9283 7.74467C20.8466 5.59831 21.8058 4.52514 21.4133 3.63757C20.979 2.75 19.5869 2.75 16.7193 2.75H7.28068C4.41309 2.75 2.97929 2.75 2.58674 3.63757C2.19419 4.52514 3.15335 5.59831 5.07167 7.74467L9.0148 12.1565C9.26618 12.4378 9.39189 12.5784 9.45764 12.751C9.5234 12.9235 9.5234 13.1128 9.5234 13.4912V18.3704C9.5234 20.0513 9.5234 20.8917 10.0566 21.1712C10.5897 21.4507 11.2734 20.9688 12.6409 20.0049L13.6315 19.3066C14.0456 19.0147 14.2527 18.8688 14.3646 18.6522C14.4766 18.4357 14.4766 18.1812 14.4766 17.6722V13.4912C14.4766 13.1128 14.4766 12.9235 14.5424 12.751C14.6081 12.5784 14.7338 12.4378 14.9852 12.1565Z" strokeLinecap="round" strokeLinejoin="round"/></svg>} label="Brand kit" />
              <div className="action-chip magic" style={{display:'flex',alignItems:'center',gap:6,padding:'9px 14px',borderRadius:999,fontSize:13.5,cursor:'pointer',background:'var(--panel-2)',whiteSpace:'nowrap',color:'#f59e0b'}}>
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13.9258 12.7775L11.7775 10.6292C11.4847 10.3364 11.3383 10.19 11.1803 10.1117C10.8798 9.96277 10.527 9.96277 10.2264 10.1117C10.0685 10.19 9.92207 10.3364 9.62923 10.6292C9.33638 10.9221 9.18996 11.0685 9.11169 11.2264C8.96277 11.527 8.96277 11.8798 9.11169 12.1803C9.18996 12.3383 9.33638 12.4847 9.62923 12.7775L11.7775 14.9258M13.9258 12.7775L20.3708 19.2225C20.6636 19.5153 20.81 19.6617 20.8883 19.8197C21.0372 20.1202 21.0372 20.473 20.8883 20.7736C20.81 20.9315 20.6636 21.0779 20.3708 21.3708C20.0779 21.6636 19.9315 21.81 19.7736 21.8883C19.473 22.0372 19.1202 22.0372 18.8197 21.8883C18.6617 21.81 18.5153 21.6636 18.2225 21.3708L11.7775 14.9258M13.9258 12.7775L11.7775 14.9258" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 2L17.2948 2.7966C17.6813 3.84117 17.8746 4.36345 18.2556 4.74445C18.6366 5.12545 19.1588 5.31871 20.2034 5.70523L21 6L20.2034 6.29477C19.1588 6.68129 18.6366 6.87456 18.2556 7.25555C17.8746 7.63655 17.6813 8.15883 17.2948 9.2034L17 10L16.7052 9.2034C16.3187 8.15884 16.1254 7.63655 15.7444 7.25555C15.3634 6.87455 14.8412 6.68129 13.7966 6.29477L13 6L13.7966 5.70523C14.8412 5.31871 15.3634 5.12545 15.7444 4.74445C16.1254 4.36345 16.3187 3.84117 16.7052 2.7966L17 2Z" strokeLinejoin="round"/><path d="M6 4L6.22108 4.59745C6.51097 5.38087 6.65592 5.77259 6.94167 6.05834C7.22741 6.34408 7.61913 6.48903 8.40255 6.77892L9 7L8.40255 7.22108C7.61913 7.51097 7.22741 7.65592 6.94166 7.94167C6.65592 8.22741 6.51097 8.61913 6.22108 9.40255L6 10L5.77892 9.40255C5.48903 8.61913 5.34408 8.22741 5.05833 7.94167C4.77259 7.65592 4.38087 7.51097 3.59745 7.22108L3 7L3.59745 6.77892C4.38087 6.48903 4.77259 6.34408 5.05833 6.05833C5.34408 5.77259 5.48903 5.38087 5.77892 4.59745L6 4Z" strokeLinejoin="round"/></svg>
                <span style={{color:'var(--text)'}}>Surprise me</span>
              </div>
            </div>
          </div>

          <div className="filter-scroll" style={{display:'flex',gap:8,padding:'16px 24px 8px 24px',overflowX:'auto'}}>
            {FILTERS.map((f, i) => (
              <div key={f}
                className={`filter ${activeFilter === i ? 'active' : ''}`}
                onClick={() => setActiveFilter(i)}
                style={{
                  flex:'none',padding:'7px 14px',borderRadius:999,fontSize:13,whiteSpace:'nowrap',
                  background: activeFilter === i ? 'var(--dark)' : 'var(--panel)',
                  border: '1px solid ' + (activeFilter === i ? 'var(--dark)' : 'var(--border)'),
                  color: activeFilter === i ? '#fff' : 'var(--text-dim)',
                  cursor:'pointer',fontWeight: activeFilter === i ? 600 : 400
                }}
              >{f}</div>
            ))}
          </div>

          <div className="ad-grid" style={{padding:'14px 24px 0 24px'}}>
            <div style={{
              breakInside:'avoid',marginBottom:14,borderRadius:14,
              display:'flex',flexDirection:'column',alignItems:'center',
              justifyContent:'center',gap:10,padding:'40px 12px',
              height:340,cursor:'pointer',color:'var(--text-dim)'
            }} className="upload-card">
              <div style={{width:34,height:34,borderRadius:'50%',background:'var(--panel-2)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text)'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4V20M20 12H4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{fontSize:13.5,color:'var(--text-dim)',fontWeight:600}}>Use your own ad</div>
              <div style={{fontSize:12,color:'var(--text-faint)'}}>Upload or paste a link</div>
            </div>
            {IMAGES.map((item, i) => (
              <div key={i}
                className={`card ${selected.has(i) ? 'selected' : ''}`}
                onClick={() => toggleSelect(i)}
                style={{
                  breakInside:'avoid',marginBottom:14,borderRadius:14,overflow:'hidden',
                  position:'relative',cursor:'pointer',background:'var(--panel)'
                }}
              >
                <span style={{
                  position:'absolute',top:10,left:10,background:'rgba(255,255,255,0.85)',
                  color:'#1c1c1a',fontSize:11,fontWeight:600,padding:'4px 8px',borderRadius:999,
                  display:'flex',alignItems:'center',gap:5
                }}>{item.label}</span>
                <span style={{
                  position:'absolute',top:10,right:10,width:22,height:22,borderRadius:'50%',
                  background: selected.has(i) ? '#f59e0b' : 'rgba(255,255,255,0.85)',
                  border: selected.has(i) ? '1.5px solid #f59e0b' : '1.5px solid rgba(0,0,0,0.15)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  opacity: selected.has(i) ? 1 : 0,transition:'opacity .15s'
                }}>
                  {selected.has(i) && <CheckIcon />}
                </span>
                <img src={item.uri} alt={`Ad example: ${item.label}`} loading="lazy" style={{display:'block',width:'100%',height:'auto'}} />
              </div>
            ))}
          </div>
        </>
      )}

      {mode !== 'browse' && (
        <div style={{
          flex:1,display:'flex',flexDirection:'column',
          padding:'24px 24px 24px 24px',maxWidth:800,margin:'0 auto',
          width:'100%',gap:16,overflowY:'auto'
        }}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={{
              display:'flex',flexDirection:'column',gap:8,
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}>
              {msg.selectedIds && msg.selectedIds.length > 0 && (
                <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'flex-end'}}>
                  {msg.selectedIds.map(id => (
                    <div key={id} style={{
                      width:48,height:48,borderRadius:8,overflow:'hidden',
                      border:'1px solid var(--border)',flex:'none'
                    }}>
                      <img src={IMAGES[id].uri} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                    </div>
                  ))}
                </div>
              )}
              <div style={{
                maxWidth:'85%',padding:'12px 16px',borderRadius:16,
                background: msg.role === 'user' ? 'var(--dark)' : 'var(--panel)',
                color: msg.role === 'user' ? '#fff' : 'var(--text)',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                fontSize:14,lineHeight:'1.5',
              }}>
                {msg.text}
              </div>
              {msg.image && (
                <div style={{
                  borderRadius:14,overflow:'hidden',border:'1px solid var(--border)',
                  maxWidth:400,width:'100%',position:'relative'
                }}>
                  <img src={msg.image} alt={msg.label || ''} style={{width:'100%',height:'auto',display:'block'}} />
                  <div style={{
                    position:'absolute',bottom:10,right:10,
                    display:'flex',gap:6
                  }}>
                    <button style={{
                      width:40,height:40,borderRadius:'50%',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      border:'1px solid rgba(255,255,255,0.5)',
                      background:'rgba(255,255,255,0.75)',
                      backdropFilter:'blur(8px)',
                      boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
                      color:'var(--text)',cursor:'pointer',padding:0
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2.99969 17.0002C2.99969 17.9302 2.99969 18.3952 3.10192 18.7767C3.37932 19.8119 4.18796 20.6206 5.22324 20.898C5.60474 21.0002 6.06972 21.0002 6.99969 21.0002L16.9997 21.0002C17.9297 21.0002 18.3947 21.0002 18.7762 20.898C19.8114 20.6206 20.6201 19.8119 20.8975 18.7767C20.9997 18.3952 20.9997 17.9302 20.9997 17.0002" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.4998 11.5002C16.4998 11.5002 13.1856 16.0002 11.9997 16.0002C10.8139 16.0002 7.49976 11.5002 7.49976 11.5002M11.9997 15.0002V3.00016" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button style={{
                      width:40,height:40,borderRadius:'50%',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      border:'1px solid rgba(255,255,255,0.5)',
                      background:'rgba(255,255,255,0.75)',
                      backdropFilter:'blur(8px)',
                      boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
                      color:'var(--text)',cursor:'pointer',padding:0
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.39584 4.5H8.35417C5.40789 4.5 3.93475 4.5 3.01946 5.37868C2.10417 6.25736 2.10417 7.67157 2.10417 10.5V14.5C2.10417 17.3284 2.10417 18.7426 3.01946 19.6213C3.93475 20.5 5.40789 20.5 8.35417 20.5H12.5608C15.5071 20.5 16.9802 20.5 17.8955 19.6213C18.4885 19.052 18.6973 18.2579 18.7708 17" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.1667 7V3.85355C16.1667 3.65829 16.3316 3.5 16.535 3.5C16.6326 3.5 16.7263 3.53725 16.7954 3.60355L21.5275 8.14645C21.7634 8.37282 21.8958 8.67986 21.8958 9C21.8958 9.32014 21.7634 9.62718 21.5275 9.85355L16.7954 14.3964C16.7263 14.4628 16.6326 14.5 16.535 14.5C16.3316 14.5 16.1667 14.3417 16.1667 14.1464V11H13.1157C8.875 11 7.3125 14.5 7.3125 14.5V12C7.3125 9.23858 9.64435 7 12.5208 7H16.1667Z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {mode === 'generating' && (
            <div style={{
              display:'flex',flexDirection:'column',gap:12,alignItems:'flex-start',width:'100%'
            }}>
              <div style={{
                padding:'12px 16px',borderRadius:16,
                background:'var(--panel)',border:'1px solid var(--border)',
                fontSize:14,color:'var(--text)',lineHeight:'1.5',
              }}>
                {currentStatus ? currentStatus.text : 'Starting...'}
              </div>

              <div style={{
                borderRadius:14,overflow:'hidden',border:'1px solid var(--border)',
                maxWidth:400,width:'100%',position:'relative'
              }}>
                <div style={{
                  width:'100%',aspectRatio:'4/5',background:'#e0e0e0',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  position:'relative',overflow:'hidden'
                }}>
                  <div style={{
                    position:'absolute',inset:0,
                    background:'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                    backgroundSize:'200% 100%',
                    animation:'shimmer 1.5s infinite'
                  }} />
                  <svg width="64" height="64" viewBox="0 0 64 64" style={{position:'relative',zIndex:1}}>
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#ccc" strokeWidth="5" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#1c1c1a" strokeWidth="5"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                      strokeLinecap="round" transform="rotate(-90 32 32)"
                      style={{transition:'stroke-dashoffset .3s ease'}}
                    />
                    <text x="32" y="38" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1c1c1a">
                      {Math.round(progress)}%
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {mode === 'complete' && (
            <div style={{
              display:'flex',gap:8,alignItems:'flex-start'
            }}>
              <button onClick={handleNewGeneration}
                style={{
                  display:'flex',alignItems:'center',gap:6,padding:'9px 16px',borderRadius:999,
                  background:'var(--panel-2)',border:'1px solid var(--border)',
                  fontSize:13,color:'var(--text)',cursor:'pointer'
                }}
              >
                ← Generate more ads
              </button>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      )}

      <div className="composer" style={{
        position:'fixed',bottom:0,left:0,right:0,zIndex:30,
        display:'flex',justifyContent:'center',padding:'0 24px 18px 24px',
        pointerEvents:'none'
      }}>
        <div className="composer-inner" style={{
          pointerEvents:'auto',width:'100%',maxWidth:900,
          borderRadius:18,boxShadow:'0 12px 34px rgba(0,0,0,0.12)',overflow:'hidden'
        }}>
          <div style={{
            display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'10px 16px',borderBottom:'1px solid var(--border-soft)',fontSize:12.5,color:'var(--text-dim)'
          }}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'var(--accent)'}}></span>
              Brand kit applied to every generation
            </div>
            <div style={{
              color:'var(--text)',cursor:'pointer',fontWeight:600,
              padding:'5px 12px',borderRadius:999,
              background:'var(--panel-2)',border:'1px solid var(--border)',
              fontSize:12.5
            }}>Review brand kit</div>
          </div>

          {mode === 'browse' && (
            <>
              <div style={{display:'flex',gap:8,padding:'12px 16px 0 16px',flexWrap:'wrap',minHeight:0}} id="refs">
                {Array.from(selected).map(id => (
                  <div key={id} style={{
                    position:'relative',width:52,height:52,borderRadius:10,overflow:'hidden',flex:'none',
                    border:'1px solid var(--border)'
                  }}>
                    <img src={IMAGES[id].uri} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                    <span onClick={() => removeRef(id)} style={{
                      position:'absolute',top:2,right:2,width:16,height:16,borderRadius:'50%',
                      background:'rgba(0,0,0,0.6)',color:'#fff',fontSize:10,display:'flex',alignItems:'center',
                      justifyContent:'center',cursor:'pointer',lineHeight:1
                    }}>✕</span>
                  </div>
                ))}
              </div>

              <div style={{display:'flex',gap:8,padding:'6px 16px 0 16px',flexWrap:'wrap'}}>
                <Control label="Styling" value="My brand" />
                <Control label="Angle" value="Auto" />
              </div>


            </>
          )}

          {mode === 'complete' && (
            <div style={{fontSize:12,color:'var(--text-faint)',padding:'4px 16px 0 16px'}}>
              Generation complete — you can start a new one or refine.
            </div>
          )}

          <div style={{padding:'10px 16px 6px 16px'}}>
            <textarea ref={textareaRef}
              value={prompt}
              onChange={handlePromptChange}
              placeholder={mode === 'browse' ? 'Select ads above, then add optional instructions here…' : 'Add follow-up instructions...'}
              rows={1}
              disabled={mode === 'generating'}
              style={{
                width:'100%',border:'none',background:'transparent',resize:'none',color:'var(--text)',
                fontSize:14.5,fontFamily:'inherit',outline:'none',minHeight:44,maxHeight:100,
                opacity: mode === 'generating' ? 0.4 : 1
              }}
            />
          </div>

          <div style={{
            display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'10px 12px 12px 16px',gap:10,flexWrap:'wrap'
          }}>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <Control label="Product" value="Mybrand" />
              <div style={{
                display:'flex',alignItems:'center',gap:6,padding:'7px 11px',borderRadius:9,
                background:'var(--panel-2)',border:'1px solid var(--border)',fontSize:12.5,
                color:'var(--text-dim)',whiteSpace:'nowrap'
              }}>4:5 · Medium</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div className="plan-btn-mob" style={{
                display:'flex',alignItems:'center',gap:6,padding:'9px 14px',borderRadius:999,
                background:'var(--panel-2)',border:'1px solid var(--border)',fontSize:13,color:'var(--text)',cursor:'pointer'
              }}>
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16.9459 3.17305C17.5332 2.58578 17.8268 2.29215 18.1521 2.15173C18.6208 1.94942 19.1521 1.94942 19.6208 2.15173C19.946 2.29215 20.2397 2.58578 20.8269 3.17305C21.4142 3.76032 21.7079 4.05395 21.8483 4.37925C22.0506 4.8479 22.0506 5.37924 21.8483 5.84789C21.7079 6.17319 21.4142 6.46682 20.8269 7.05409L15.8054 12.0757C14.5682 13.3129 13.9496 13.9315 13.1748 14.298C12.4 14.6645 11.5294 14.7504 9.78823 14.9222L9 15L9.07778 14.2118C9.24958 12.4706 9.33549 11.6 9.70201 10.8252C10.0685 10.0504 10.6871 9.43183 11.9243 8.19464L16.9459 3.17305Z" strokeLinejoin="round"/><path d="M6 15H3.75C2.7835 15 2 15.7835 2 16.75C2 17.7165 2.7835 18.5 3.75 18.5H13.25C14.2165 18.5 15 19.2835 15 20.25C15 21.2165 14.2165 22 13.25 22H11" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="plan-label">Plan it</span>
              </div>
              <button className="gen-btn-mob"
                onClick={mode === 'complete' ? handleNewGeneration : handleGenerate}
                disabled={(mode === 'browse' && selected.size === 0) || generating}
                style={{
                  display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:999,
                  fontSize:13.5,fontWeight:600,border:'none',cursor:'pointer',
                  background:'var(--dark)',color:'#fff',
                  opacity: ((mode === 'browse' && selected.size === 0) || generating) ? 0.4 : 1
                }}>
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M15 2L15.5387 4.39157C15.9957 6.42015 17.5798 8.00431 19.6084 8.46127L22 9L19.6084 9.53873C17.5798 9.99569 15.9957 11.5798 15.5387 13.6084L15 16L14.4613 13.6084C14.0043 11.5798 12.4202 9.99569 10.3916 9.53873L8 9L10.3916 8.46127C12.4201 8.00431 14.0043 6.42015 14.4613 4.39158L15 2Z" strokeLinejoin="round"/><path d="M7 12L7.38481 13.7083C7.71121 15.1572 8.84275 16.2888 10.2917 16.6152L12 17L10.2917 17.3848C8.84275 17.7112 7.71121 18.8427 7.38481 20.2917L7 22L6.61519 20.2917C6.28879 18.8427 5.15725 17.7112 3.70827 17.3848L2 17L3.70827 16.6152C5.15725 16.2888 6.28879 15.1573 6.61519 13.7083L7 12Z" strokeLinejoin="round"/></svg>
                <span className="gen-label">{generating ? 'Generating…' : mode === 'complete' ? 'Generate more' : 'Generate'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

function ActionChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{
      display:'flex',alignItems:'center',gap:6,padding:'9px 14px',borderRadius:999,
      background:'var(--panel-2)',border:'1px solid var(--border)',fontSize:13.5,cursor:'pointer',color:'var(--text)',whiteSpace:'nowrap'
    }}>
      {icon}
      {label}
    </div>
  )
}

function Control({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display:'flex',alignItems:'center',gap:6,padding:'7px 11px',borderRadius:9,
      background:'var(--panel-2)',border:'1px solid var(--border)',fontSize:12.5,
      color:'var(--text-dim)',whiteSpace:'nowrap',cursor:'pointer'
    }}>
      {label} <b style={{color:'var(--text)',fontWeight:600}}>{value}</b>
    </div>
  )
}
