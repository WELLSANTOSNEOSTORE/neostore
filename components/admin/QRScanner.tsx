'use client'

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Camera } from 'lucide-react'
import { credentialId } from '@/types'

interface ScanResult {
  name: string
  seq: number
  type: string
  company: string | null
  dayLabel: string
  alreadyCheckedIn: boolean
}

interface QRScannerProps {
  onClose: () => void
  onCheckedIn: () => void
}

export default function QRScanner({ onClose, onCheckedIn }: QRScannerProps) {
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const activeRef = useRef(true)
  const scannerInstanceRef = useRef<{ clear: () => void } | null>(null)

  const startScanner = useCallback(() => {
    activeRef.current = true
    setResult(null)
    setError('')

    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      if (!activeRef.current) return

      const scanner = new Html5QrcodeScanner(
        'qr-reader-container',
        { fps: 10, qrbox: { width: 240, height: 240 }, rememberLastUsedCamera: true },
        false
      )

      const handleDecode = async (decoded: string) => {
        if (!activeRef.current) return
        activeRef.current = false
        try { scanner.clear() } catch { /* ignore */ }

        try {
          const res = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participantId: decoded }),
          })
          const data = await res.json()
          if (res.ok) {
            setResult(data)
            onCheckedIn()
          } else {
            setError(data.error || 'QR inválido')
          }
        } catch {
          setError('Erro de conexão')
        }
      }

      scanner.render(handleDecode, () => {})
      scannerInstanceRef.current = scanner
    })
  }, [onCheckedIn])

  useEffect(() => {
    startScanner()
    return () => {
      activeRef.current = false
      try { scannerInstanceRef.current?.clear() } catch { /* ignore */ }
    }
  }, [])

  const handleReset = () => {
    try { scannerInstanceRef.current?.clear() } catch { /* ignore */ }
    scannerInstanceRef.current = null
    startScanner()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
      <div className="glass-card w-full max-w-sm fade-in overflow-hidden"
        style={{ border: '1px solid rgba(139,60,247,0.3)' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <Camera size={16} style={{ color: '#c4b5fd' }} />
            <span className="text-sm font-semibold text-white">Leitor de QR Code</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Scanner */}
        {!result && !error && (
          <div className="p-4">
            <p className="text-xs text-white/40 text-center mb-3">
              Aponte para o QR Code do credencial
            </p>
            <div id="qr-reader-container" className="rounded-xl overflow-hidden" />
          </div>
        )}

        {/* Sucesso */}
        {result && (
          <div className="p-6 text-center fade-in">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                background: result.alreadyCheckedIn ? 'rgba(251,191,36,0.15)' : 'rgba(20,217,176,0.15)',
                border: `2px solid ${result.alreadyCheckedIn ? '#fbbf24' : '#14d9b0'}`,
              }}>
              <CheckCircle size={32} style={{ color: result.alreadyCheckedIn ? '#fbbf24' : '#14d9b0' }} />
            </div>
            <p className="text-lg font-bold text-white mb-1">{result.name}</p>
            <p className="text-sm font-mono mb-1" style={{ color: '#c4b5fd' }}>
              {credentialId(result.seq)}
            </p>
            <p className="text-xs text-white/40 mb-1">{result.type} · {result.dayLabel}</p>
            {result.company && <p className="text-xs text-white/30 mb-3">{result.company}</p>}
            <p className="text-sm font-medium mb-5" style={{ color: result.alreadyCheckedIn ? '#fbbf24' : '#14d9b0' }}>
              {result.alreadyCheckedIn ? 'Já havia feito check-in' : '✓ Check-in realizado!'}
            </p>
            <button onClick={handleReset}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(139,60,247,0.2)', border: '1px solid rgba(139,60,247,0.3)', color: '#c4b5fd' }}>
              Escanear próximo
            </button>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="p-6 text-center fade-in">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(248,113,113,0.15)', border: '2px solid #f87171' }}>
              <AlertCircle size={32} style={{ color: '#f87171' }} />
            </div>
            <p className="text-sm font-medium mb-5" style={{ color: '#f87171' }}>{error}</p>
            <button onClick={handleReset}
              className="w-full py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(139,60,247,0.2)', border: '1px solid rgba(139,60,247,0.3)', color: '#c4b5fd' }}>
              Tentar novamente
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        #qr-reader-container { background: transparent !important; border: none !important; }
        #qr-reader-container video { border-radius: 12px; }
        #qr-reader-container__dashboard_section_csr span { color: rgba(255,255,255,0.5) !important; font-size: 12px; }
        #qr-reader-container select { background: rgba(255,255,255,0.08) !important; color: white !important; border-radius: 8px !important; border: 1px solid rgba(255,255,255,0.1) !important; padding: 6px 8px !important; width: 100% !important; margin-bottom: 8px !important; font-size: 12px; }
        #qr-reader-container button { background: rgba(139,60,247,0.2) !important; color: #c4b5fd !important; border: 1px solid rgba(139,60,247,0.3) !important; border-radius: 8px !important; padding: 8px 16px !important; width: 100% !important; margin-bottom: 4px !important; font-size: 13px; }
        #qr-reader-container__header_message { display: none !important; }
        #qr-reader-container__filescan_input { display: none !important; }
      `}</style>
    </div>
  )
}
