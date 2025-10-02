import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { X } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

function ResponseModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    key: '',
    response_text: '',
    notes: ''
  })
  const [errors, setErrors] = useState({})
  const queryClient = useQueryClient()

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/management/responses', data)
      return response.data
    },
    {
      onSuccess: () => {
        toast.success('Response created successfully')
        onSuccess()
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.error || 'Failed to create response'
        toast.error(errorMessage)
        
        // Handle validation errors
        if (error.response?.data?.details) {
          const validationErrors = {}
          error.response.data.details.forEach(detail => {
            validationErrors[detail.param] = detail.msg
          })
          setErrors(validationErrors)
        }
      },
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors = {}
    if (!formData.key.trim()) newErrors.key = 'Key is required'
    if (!formData.response_text.trim()) newErrors.response_text = 'Response text is required'
    
    // Key format validation (alphanumeric and underscores only)
    if (formData.key && !/^[a-zA-Z0-9_]+$/.test(formData.key)) {
      newErrors.key = 'Key can only contain letters, numbers, and underscores'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    createMutation.mutate(formData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="card-header flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Add New Response
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card-body space-y-4">
          <div className="form-group">
            <label htmlFor="key" className="form-label">
              Key *
            </label>
            <input
              type="text"
              id="key"
              name="key"
              value={formData.key}
              onChange={handleChange}
              className={`form-input ${errors.key ? 'border-red-500' : ''}`}
              placeholder="e.g., greeting_welcome, order_confirmation"
            />
            {errors.key && (
              <p className="form-error">{errors.key}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Unique identifier for this response. Use lowercase letters, numbers, and underscores only.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="response_text" className="form-label">
              Response Text *
            </label>
            <textarea
              id="response_text"
              name="response_text"
              value={formData.response_text}
              onChange={handleChange}
              className={`form-input form-textarea ${errors.response_text ? 'border-red-500' : ''}`}
              rows="4"
              placeholder="Enter the bot's response message..."
            />
            {errors.response_text && (
              <p className="form-error">{errors.response_text}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              You can use variables like #{orderNumber} or #{customerName} in your response.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-input form-textarea"
              rows="3"
              placeholder="Internal notes about this response..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional notes for context or instructions for other team members.
            </p>
          </div>
        </form>

        <div className="card-footer flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={createMutation.isLoading}
            className="btn btn-primary"
          >
            {createMutation.isLoading ? 'Creating...' : 'Create Response'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResponseModal

