import type { ReactNode, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  clickable?: boolean
}

export default function Card({ children, clickable, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-xl p-5 transition-colors ${
        clickable ? 'hover:bg-surface-hover hover:border-border-light cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
