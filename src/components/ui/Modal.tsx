import { useEffect, useRef } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm'

interface ModalAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  type?: ModalType
  title: string
  message: string
  actions?: ModalAction[]
}

const typeConfig = {
  success: {
    icon: CheckCircle2,
    accent: '#1ECAD3',
    bg: 'rgba(30,202,211,0.08)',
    border: 'rgba(30,202,211,0.25)',
    glow: '0 0 40px rgba(30,202,211,0.15)',
    iconColor: '#1ECAD3',
  },
  error: {
    icon: XCircle,
    accent: '#EF4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
    glow: '0 0 40px rgba(239,68,68,0.15)',
    iconColor: '#EF4444',
  },
  warning: {
    icon: AlertTriangle,
    accent: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    glow: '0 0 40px rgba(245,158,11,0.15)',
    iconColor: '#F59E0B',
  },
  info: {
    icon: Info,
    accent: '#3B82F6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.25)',
    glow: '0 0 40px rgba(59,130,246,0.15)',
    iconColor: '#3B82F6',
  },
  confirm: {
    icon: AlertTriangle,
    accent: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    glow: '0 0 40px rgba(245,158,11,0.15)',
    iconColor: '#F59E0B',
  },
}

const buttonStyles: Record<string, string> = {
  primary:
    'bg-[#1ECAD3] hover:bg-[#19b2ba] text-white font-bold shadow-sm transition-all duration-150',
  secondary:
    'bg-transparent border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all duration-150',
  danger:
    'bg-[#EF4444] hover:bg-[#dc2626] text-white font-bold shadow-sm transition-all duration-150',
}

const Modal = ({ isOpen, onClose, type = 'info', title, message, actions }: ModalProps) => {
  const config = typeConfig[type]
  const Icon = config.icon
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Lock scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const defaultActions: ModalAction[] =
    type === 'confirm'
      ? [
          { label: 'Batal', onClick: onClose, variant: 'secondary' },
          { label: 'Konfirmasi', onClick: onClose, variant: 'primary' },
        ]
      : [{ label: 'Tutup', onClick: onClose, variant: 'primary' }]

  // Ensure resolvedActions is always an array with a fallback to defaultActions
  const resolvedActions = Array.isArray(actions) && actions.length > 0 ? actions : defaultActions

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(6, 10, 20, 0.75)',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes pulse-ring { 0%, 100% { opacity: 0.4; transform: scale(1) } 50% { opacity: 0.8; transform: scale(1.08) } }
      `}</style>

      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: '#0D1B2E',
          border: `1px solid ${config.border}`,
          boxShadow: `0 24px 64px rgba(0, 0, 0, 0.5), ${config.glow}`,
          animation: 'slideUp 0.22s cubic-bezier(0.34, 1.2, 0.64, 1)',
        }}
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, transparent, ${config.accent}, transparent)` }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ background: '#0A1628', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-2.5">
            {/* Pulse ring */}
            <div className="relative flex items-center justify-center">
              <div
                className="absolute w-8 h-8 rounded-full"
                style={{
                  background: config.bg,
                  border: `1px solid ${config.border}`,
                  animation: 'pulse-ring 2.4s ease-in-out infinite',
                }}
              />
              <Icon size={16} style={{ color: config.iconColor, position: 'relative', zIndex: 1 }} />
            </div>
            <span
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: config.accent }}
            >
              {type === 'success' ? 'Berhasil' :
               type === 'error' ? 'Terjadi Kesalahan' :
               type === 'warning' ? 'Peringatan' :
               type === 'confirm' ? 'Konfirmasi' : 'Informasi'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150"
            style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Icon circle */}
          <div className="flex justify-center mb-5">
            <div
              className="relative flex items-center justify-center w-16 h-16 rounded-2xl"
              style={{ background: config.bg, border: `1px solid ${config.border}` }}
            >
              <Icon size={28} style={{ color: config.iconColor }} />
            </div>
          </div>

          <h2
            className="text-center text-lg font-bold mb-2 font-fraunces"
            style={{ color: '#E8F4F8' }}
          >
            {title}
          </h2>
          <p
            className="text-center text-[13px] leading-relaxed"
            style={{ color: 'rgba(229,247,251,0.9)' }}
          >
            {message}
          </p>
        </div>

        {/* Actions */}
        <div
          className="flex gap-3 px-6 pb-6"
          style={{ justifyContent: resolvedActions.length === 1 ? 'center' : 'flex-end' }}
        >
          {resolvedActions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className={`px-5 py-2.5 rounded-xl text-[12px] tracking-wide ${buttonStyles[action.variant ?? 'primary']}`}
              style={resolvedActions.length === 1 ? { minWidth: '120px' } : {}}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Modal
