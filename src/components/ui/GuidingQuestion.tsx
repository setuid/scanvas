interface GuidingQuestionProps {
  question: string
  author?: string
}

export default function GuidingQuestion({ question, author }: GuidingQuestionProps) {
  return (
    <div className="bg-bg-secondary/50 border-l-2 border-gold-dim rounded-r px-3 py-2 mb-2">
      <p className="text-text-secondary text-sm italic leading-relaxed">
        {question}
      </p>
      {author && (
        <p className="text-text-muted text-xs mt-1">— {author}</p>
      )}
    </div>
  )
}
