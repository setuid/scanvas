import type { Diagnostic } from '@/lib/storyDiagnostics'

interface DiagnosticPanelProps {
  diagnostics: Diagnostic[]
  onNavigate: (target: string) => void
}

const severityConfig = {
  error: {
    bg: 'bg-negative/10',
    border: 'border-negative/30',
    icon: '!',
    iconBg: 'bg-negative/20 text-negative',
    label: 'Lacuna',
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    icon: '?',
    iconBg: 'bg-warning/20 text-warning',
    label: 'Atenção',
  },
  ok: {
    bg: 'bg-positive/10',
    border: 'border-positive/30',
    icon: '\u2713',
    iconBg: 'bg-positive/20 text-positive',
    label: 'OK',
  },
}

export default function DiagnosticPanel({ diagnostics, onNavigate }: DiagnosticPanelProps) {
  const errors = diagnostics.filter(d => d.severity === 'error')
  const warnings = diagnostics.filter(d => d.severity === 'warning')
  const oks = diagnostics.filter(d => d.severity === 'ok')

  const sorted = [...errors, ...warnings, ...oks]

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        <p className="text-sm">Nenhum diagnostico disponivel.</p>
        <p className="text-xs mt-1">Adicione cenas e personagens para receber sugestoes.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-xs text-text-muted mb-3">
        {errors.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-negative" />
            {errors.length} lacuna{errors.length > 1 ? 's' : ''}
          </span>
        )}
        {warnings.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-warning" />
            {warnings.length} atencao
          </span>
        )}
        {oks.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-positive" />
            {oks.length} ok
          </span>
        )}
      </div>

      {sorted.map(d => {
        const cfg = severityConfig[d.severity]
        return (
          <button
            key={d.id}
            onClick={() => onNavigate(d.target)}
            className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${cfg.bg} ${cfg.border} hover:opacity-90`}
          >
            <div className="flex items-start gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${cfg.iconBg}`}>
                {cfg.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-text">{d.message}</div>
                {d.detail && (
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{d.detail}</p>
                )}
                <span className="text-xs text-gold mt-1 inline-block">{d.action} &rarr;</span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
