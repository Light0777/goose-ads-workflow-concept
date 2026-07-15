'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

const IMAGES = [
  { uri: 'https://picsum.photos/seed/ad1/400/500', label: 'Modern Display' },
  { uri: 'https://picsum.photos/seed/ad2/400/300', label: 'Clean Promo' },
  { uri: 'https://picsum.photos/seed/ad3/400/600', label: 'Premium Offer' },
  { uri: 'https://picsum.photos/seed/ad4/400/400', label: 'Photo Banner' },
  { uri: 'https://picsum.photos/seed/ad5/400/350', label: 'Minimalist Ad' },
  { uri: 'https://picsum.photos/seed/ad6/400/550', label: 'Bold Headline' },
  { uri: 'https://picsum.photos/seed/ad7/400/480', label: 'Calm Scene' },
  { uri: 'https://picsum.photos/seed/ad8/400/320', label: 'Tech Launch' },
  { uri: 'https://picsum.photos/seed/ad9/400/520', label: 'Software UI' },
  { uri: 'https://picsum.photos/seed/ad10/400/380', label: 'Energetic' },
  { uri: 'https://picsum.photos/seed/ad11/400/450', label: 'Warm Tone' },
  { uri: 'https://picsum.photos/seed/ad12/400/420', label: 'Wellness' },
  { uri: 'https://picsum.photos/seed/ad13/400/500', label: '3D Render' },
  { uri: 'https://picsum.photos/seed/ad14/400/340', label: 'Professional' },
  { uri: 'https://picsum.photos/seed/ad15/400/460', label: 'Editorial' },
]

const GENERATED_ADS = [
  { uri: 'https://picsum.photos/seed/gen1/600/750', label: 'Variant A – Modern Display' },
  { uri: 'https://picsum.photos/seed/gen2/600/750', label: 'Variant B – Clean Promo' },
  { uri: 'https://picsum.photos/seed/gen3/600/750', label: 'Variant C – Bold Headline' },
  { uri: 'https://picsum.photos/seed/gen4/600/750', label: 'Variant D – Warm Tone' },
]

const FILTERS = ['All','Clean','Premium','Photo','Minimalist','Bold','Calm','Modern','Software','Energetic','Warm','Wellness','3d','Professional','Editorial']

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
    <svg viewBox="0 0 24 24" width="12" height="12" stroke="#fff" strokeWidth="3" fill="none">
      <path d="M4 12l5 5L20 6" />
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
      <header style={{
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'14px 24px',borderBottom:'1px solid var(--border-soft)',
        position:'sticky',top:0,background:'rgba(250,250,248,0.92)',
        backdropFilter:'blur(8px)',zIndex:20,width:'100%',left:0,right:0
      }}>
        <div className="app-inner" style={{display:'flex',alignItems:'center',justifyContent:'space-between',maxWidth:1400,margin:'0 auto',width:'100%'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,fontSize:14,color:'var(--text-dim)'}}>
            <div style={{width:26,height:26,borderRadius:8,background:'var(--dark)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#fff'}}>A</div>
            <span style={{color:'var(--text)',fontWeight:600}}>Ad Studio</span>
            <span style={{color:'var(--text-faint)'}}>/</span>
            <span>I Know Tech World</span>
            <span style={{color:'var(--text-faint)'}}>/</span>
            <span style={{color:'var(--text)'}}>Create</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:999,background:'var(--panel-2)',border:'1px solid var(--border)',fontSize:13,color:'var(--text)',cursor:'pointer'}}>
              <svg className="icon" viewBox="0 0 24 24" style={{width:15,height:15}}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
              My brand
              <svg className="icon" viewBox="0 0 24 24" style={{width:11,height:11}}><path d="M6 9l6 6 6-6"/></svg>
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
                        <><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5-9 9"/></>
                      ) : (
                        <><rect x="3" y="5" width="14" height="14" rx="2"/><path d="M17 9l4-2v10l-4-2"/></>
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
                        <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>
                      ) : (
                        <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5"/></>
                      )}
                    </svg>
                    {tab === 'templates' ? 'Templates' : 'Community'}
                  </div>
                ))}
              </div>
              <ActionChip icon={<svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>} label="Brand kit" />
              <div className="action-chip magic" style={{display:'flex',alignItems:'center',gap:6,padding:'9px 14px',borderRadius:999,fontSize:13.5,cursor:'pointer',background:'var(--panel-2)',whiteSpace:'nowrap'}}>
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 3.5l6 6L9 21H3v-6l11.5-11.5z"/><circle cx="17" cy="7" r="1.5"/></svg>
                Surprise me
              </div>
            </div>
          </div>

          <div style={{display:'flex',gap:8,padding:'16px 24px 8px 24px',overflowX:'auto'}}>
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

          <div style={{
            columns:'5 220px',columnGap:14,padding:'14px 24px 0 24px'
          }}>
            <div style={{
              breakInside:'avoid',marginBottom:14,borderRadius:14,
              display:'flex',flexDirection:'column',alignItems:'center',
              justifyContent:'center',gap:10,padding:'40px 12px',
              height:340,cursor:'pointer',color:'var(--text-dim)'
            }} className="upload-card">
              <div style={{width:34,height:34,borderRadius:'50%',background:'var(--panel-2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:'var(--text)'}}>+</div>
              <div style={{fontSize:13.5,color:'var(--text)'}}>Use your own ad</div>
              <div style={{fontSize:12,color:'var(--text-faint)'}}>Upload or paste a link</div>
            </div>
            {IMAGES.map((item, i) => (
              <div key={i}
                className={`card ${selected.has(i) ? 'selected' : ''}`}
                onClick={() => toggleSelect(i)}
                style={{
                  breakInside:'avoid',marginBottom:14,borderRadius:14,overflow:'hidden',
                  position:'relative',cursor:'pointer',background:'var(--panel)',
                  transition:'transform .15s ease, border-color .15s ease'
                }}
              >
                <span style={{
                  position:'absolute',top:10,left:10,background:'rgba(255,255,255,0.85)',
                  color:'#1c1c1a',fontSize:11,fontWeight:600,padding:'4px 8px',borderRadius:999,
                  display:'flex',alignItems:'center',gap:5
                }}>{item.label}</span>
                <span style={{
                  position:'absolute',top:10,right:10,width:22,height:22,borderRadius:'50%',
                  background: selected.has(i) ? 'var(--accent)' : 'rgba(255,255,255,0.85)',
                  border: selected.has(i) ? '1.5px solid var(--accent)' : '1.5px solid rgba(0,0,0,0.15)',
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
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
            <div style={{color:'var(--text)',cursor:'pointer',fontWeight:600}}>Review brand kit</div>
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

              {selected.size === 0 && (
                <div style={{fontSize:12,color:'var(--text-faint)',padding:'0 16px 4px 16px'}}>
                  Tap any ad on the left to use it as a style reference here.
                </div>
              )}
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
                fontSize:14.5,fontFamily:'inherit',outline:'none',minHeight:22,maxHeight:80,
                opacity: mode === 'generating' ? 0.4 : 1
              }}
            />
          </div>

          <div style={{
            display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'10px 12px 12px 16px',gap:10,flexWrap:'wrap'
          }}>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <Control label="Styling" value="My brand" />
              <Control label="Angle" value="Auto" />
              <Control label="Product" value="I Know Tech World" />
              <div style={{
                display:'flex',alignItems:'center',gap:6,padding:'7px 11px',borderRadius:9,
                background:'var(--panel-2)',border:'1px solid var(--border)',fontSize:12.5,
                color:'var(--text-dim)',whiteSpace:'nowrap'
              }}>4:5 · Medium</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{
                display:'flex',alignItems:'center',gap:6,padding:'9px 14px',borderRadius:9,
                background:'var(--panel-2)',border:'1px solid var(--border)',fontSize:13,color:'var(--text)',cursor:'pointer'
              }}>
                <svg className="icon" viewBox="0 0 24 24" style={{width:15,height:15}}><path d="M9 5H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-4M13 3l7 7-9 9H7v-4l9-9z"/></svg>
                Plan it
              </div>
              <button
                onClick={mode === 'complete' ? handleNewGeneration : handleGenerate}
                disabled={(mode === 'browse' && selected.size === 0) || generating}
                style={{
                  display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:9,
                  fontSize:13.5,fontWeight:600,border:'none',cursor:'pointer',
                  background:'var(--dark)',color:'#fff',
                  opacity: ((mode === 'browse' && selected.size === 0) || generating) ? 0.4 : 1
                }}>
                <svg className="icon" viewBox="0 0 24 24" style={{stroke:'#fff',width:15,height:15}}><path d="M12 3l1.6 4.8L18 9l-4.4 1.2L12 15l-1.6-4.8L6 9l4.4-1.2L12 3z"/></svg>
                {generating ? 'Generating…' : mode === 'complete' ? 'Generate more' : 'Generate'}
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
