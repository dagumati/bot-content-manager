import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Search, Plus, Edit2, Save, X, Trash2, Clock } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import ResponseModal from '../components/ResponseModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingData, setEditingData] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteKey, setDeleteKey] = useState(null)
  const queryClient = useQueryClient()

  // Fetch responses
  const { data: responsesData, isLoading, error } = useQuery(
    ['responses', searchTerm],
    async () => {
      const params = searchTerm ? { search: searchTerm } : {}
      const response = await api.get('/management/responses', { params })
      return response.data
    },
    {
      keepPreviousData: true,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  )

  // Update response mutation
  const updateMutation = useMutation(
    async ({ key, data }) => {
      const response = await api.put(`/management/responses/${key}`, data)
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['responses'])
        setEditingId(null)
        setEditingData({})
        toast.success('Response updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update response')
      },
    }
  )

  // Delete response mutation
  const deleteMutation = useMutation(
    async (key) => {
      const response = await api.delete(`/management/responses/${key}`)
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['responses'])
        setDeleteKey(null)
        toast.success('Response deleted successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to delete response')
      },
    }
  )

  const handleEdit = (response) => {
    setEditingId(response.key)
    setEditingData({
      response_text: response.response_text || '',
      notes: response.notes || ''
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingData({})
  }

  const handleSave = () => {
    if (!editingData.response_text.trim()) {
      toast.error('Response text is required')
      return
    }

    updateMutation.mutate({
      key: editingId,
      data: editingData
    })
  }

  const handleDelete = (key) => {
    setDeleteKey(key)
  }

  const confirmDelete = () => {
    if (deleteKey) {
      deleteMutation.mutate(deleteKey)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-medium">Error loading responses</p>
          <p className="text-sm">{error.response?.data?.error || error.message}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Dashboard</h1>
          <p className="text-gray-600">
            Manage your chatbot responses and content
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Response
        </button>
      </div>

      {/* Search and Stats */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search responses by key or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{responsesData?.total || 0} responses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responses Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Response Text</th>
                <th>Notes</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8">
                    <div className="loading">
                      <div className="spinner"></div>
                    </div>
                  </td>
                </tr>
              ) : responsesData?.responses?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No responses found. {searchTerm && 'Try adjusting your search terms.'}
                  </td>
                </tr>
              ) : (
                responsesData?.responses?.map((response) => (
                  <tr key={response.key}>
                    <td className="font-medium text-blue-600">
                      {response.key}
                    </td>
                    
                    <td className="max-w-md">
                      {editingId === response.key ? (
                        <textarea
                          value={editingData.response_text}
                          onChange={(e) => setEditingData(prev => ({
                            ...prev,
                            response_text: e.target.value
                          }))}
                          className="form-input form-textarea"
                          rows="3"
                          placeholder="Enter response text..."
                        />
                      ) : (
                        <div className="text-sm">
                          {response.response_text || (
                            <span className="text-gray-400 italic">No response text</span>
                          )}
                        </div>
                      )}
                    </td>
                    
                    <td className="max-w-sm">
                      {editingId === response.key ? (
                        <textarea
                          value={editingData.notes}
                          onChange={(e) => setEditingData(prev => ({
                            ...prev,
                            notes: e.target.value
                          }))}
                          className="form-input form-textarea"
                          rows="2"
                          placeholder="Add notes..."
                        />
                      ) : (
                        <div className="text-sm text-gray-600">
                          {response.notes || (
                            <span className="text-gray-400 italic">No notes</span>
                          )}
                        </div>
                      )}
                    </td>
                    
                    <td className="text-sm text-gray-500">
                      {formatDate(response.last_updated)}
                    </td>
                    
                    <td>
                      {editingId === response.key ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSave}
                            disabled={updateMutation.isLoading}
                            className="btn btn-sm btn-primary flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="btn btn-sm btn-secondary flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(response)}
                            className="btn btn-sm btn-secondary flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(response.key)}
                            className="btn btn-sm btn-danger flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <ResponseModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            queryClient.invalidateQueries(['responses'])
          }}
        />
      )}

      {deleteKey && (
        <DeleteConfirmModal
          keyToDelete={deleteKey}
          onClose={() => setDeleteKey(null)}
          onConfirm={confirmDelete}
          isLoading={deleteMutation.isLoading}
        />
      )}
    </div>
  )
}

export default Dashboard

