import { useState, useRef, useEffect } from 'react'

interface InlineEditProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  as?: 'input' | 'textarea'
  inputClassName?: string
}

export default function InlineEdit({
  value,
  onChange,
  placeholder = 'Clique para editar...',
  className = '',
  as = 'input',
  inputClassName = '',
}: InlineEditProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => { setDraft(value) }, [value])

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus()
      ref.current.select()
    }
  }, [editing])

  const commit = () => {
    setEditing(false)
    if (draft !== value) onChange(draft)
  }

  if (!editing) {
    return (
      <div
        className={`cursor-text rounded px-2 py-1 hover:bg-bg-hover transition-colors min-h-[2em] ${className}`}
        onClick={() => setEditing(true)}
      >
        {value || <span className="text-text-muted italic">{placeholder}</span>}
      </div>
    )
  }

  const sharedProps = {
    ref: ref as any,
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && as === 'input') commit()
      if (e.key === 'Escape') { setDraft(value); setEditing(false) }
    },
    placeholder,
    className: `w-full bg-bg-tertiary border border-border rounded px-2 py-1 text-text outline-none focus:border-gold transition-colors ${inputClassName}`,
  }

  if (as === 'textarea') {
    return <textarea {...sharedProps} rows={3} />
  }
  return <input {...sharedProps} />
}
