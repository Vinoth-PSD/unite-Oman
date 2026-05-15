import { Trash2, X } from 'lucide-react'

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  title = 'Delete Item',
  description = 'Are you sure you want to delete this item?',
  confirmText = 'Delete',
  cancelText = 'Cancel'
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-0">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-ink">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          
          {/* <div className="w-10 h-10 mx-auto rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <Trash2 size={30} />
          </div> */}

          <p className="text-md text-gray-500 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-gray-100">
          
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>

          <button
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting...' : confirmText}
          </button>

        </div>
      </div>
    </div>
  )
}