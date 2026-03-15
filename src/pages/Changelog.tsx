import { Link } from 'react-router-dom'
import { APP_VERSION, changelog } from '@/lib/version'

export default function Changelog() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/" className="text-sm text-text-muted hover:text-gold transition-colors">&larr; Voltar</Link>
        <h1 className="text-3xl font-serif text-gold mt-3">Changelog</h1>
        <p className="text-text-secondary text-sm mt-1">
          Historico de alteracoes do Story Canvas — versao atual: {APP_VERSION}
        </p>
      </div>

      <div className="space-y-8">
        {changelog.map((entry, i) => (
          <div key={entry.version} className="relative">
            {/* Version header */}
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-lg font-mono font-bold ${
                i === 0 ? 'text-gold' : 'text-text'
              }`}>
                v{entry.version}
              </span>
              {i === 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gold/20 text-gold">
                  atual
                </span>
              )}
              <span className="text-xs text-text-muted">
                {new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR')}
              </span>
            </div>

            {/* Items */}
            <ul className="space-y-2 pl-4 border-l-2 border-border">
              {entry.items.map((item, j) => (
                <li key={j} className="text-sm text-text-secondary relative pl-4">
                  <span className="absolute left-[-5px] top-2 w-2 h-2 rounded-full bg-border" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
