import { X, AlertTriangle } from 'lucide-react'

function DeleteConfirmModal({ keyToDelete, onClose, onConfirm, isLoading }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Response
              </h3>
              <p className="text-sm text-gray-500">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="card-body">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Are you sure you want to delete the response with key:
            </p>
            <p className="font-mono text-sm font-semibold text-red-900 mt-2 p-2 bg-red-100 rounded border">
              {keyToDelete}
            </p>
            <p className="text-sm text-red-700 mt-2">
              This will permanently remove the response from your Google Sheet and may affect your bot's functionality.
            </p>
          </div>
        </div>

        <div className="card-footer flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="btn btn-danger"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Deleting...
              </div>
            ) : (
              'Delete Response'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal

