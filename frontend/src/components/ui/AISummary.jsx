import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

export default function AISummary({ business }) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [generated, setGenerated] = useState(false)

  const generate = async () => {
    if (generated) { setExpanded(e => !e); return }
    setLoading(true)
    setExpanded(true)

    try {
      const prompt = `You are a helpful business directory assistant. Write a concise, friendly 3-sentence summary of this business for potential customers. Be specific and highlight key strengths.

Business: ${business.name_en}
Category: ${business.category?.name_en || 'General'}
Location: ${business.governorate?.name_en || 'Oman'}
Description: ${business.description || business.short_description || 'No description provided'}
Rating: ${business.rating_avg || 'N/A'} (${business.rating_count || 0} reviews)
Tags/Services: ${business.tags?.join(', ') || 'N/A'}

Write only the summary, no preamble.`

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      const data = await res.json()
      const text = data.content?.find(b => b.type === 'text')?.text || 'Unable to generate summary.'
      setSummary(text)
      setGenerated(true)
    } catch {
      setSummary('Unable to generate summary at this time. Please try again.')
      setGenerated(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-dashed border-gray-200 rounded-2xl overflow-hidden transition-all">
      <button onClick={generate}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg,#EDE5F7,#FCE8F1)' }}>
            
          </div>
          <span className="text-sm font-semibold text-purple">
            {loading ? 'Generating AI Summary…' : generated ? 'AI Summary' : 'Generate AI Summary of this business'}
          </span>
        </div>
        {loading
          ? <div className="w-4 h-4 rounded-full border-2 border-purple/30 border-t-purple animate-spin" />
          : generated
            ? expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />
            : <Sparkles size={15} className="text-purple" />
        }
      </button>

      {expanded && summary && (
        <div className="px-5 pb-4 pt-1 border-t border-dashed border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>
          <button onClick={() => { setGenerated(false); setSummary(''); setExpanded(false) }}
            className="text-xs text-gray-400 hover:text-gray-500 mt-2 underline">
            Regenerate
          </button>
        </div>
      )}
    </div>
  )
}
