import { AlertTriangle } from 'lucide-react'

export default function DisclaimerBanner() {
  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 flex items-center justify-center gap-3">
      <AlertTriangle size={16} className="text-yellow-500" />
      <p className="text-yellow-200/80 text-xs sm:text-sm text-center">
        <strong className="text-yellow-500 mr-1">DISCLAIMER:</strong>
        ClauseGuard is an AI reading aid for education and awareness. It is <strong className="text-yellow-500">not legal advice</strong> and does not replace a licensed lawyer. Do not treat outputs as a reason to sign or reject a document.
      </p>
    </div>
  )
}
