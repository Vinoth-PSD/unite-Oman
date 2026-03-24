export const getErrorMessage = (err) => {
  if (!err) return 'An unknown error occurred'
  
  // Handle Axios response errors
  if (err.response?.data) {
    const { detail } = err.response.data
    
    // FastAPI 422 Unprocessable Entity returns an array of error objects
    if (Array.isArray(detail)) {
      return detail.map(d => d.msg || JSON.stringify(d)).join(', ')
    }
    
    // Other FastAPI errors usually return a single string in detail
    if (typeof detail === 'string') {
      return detail
    }
    
    // Fallback for other data structures
    return JSON.stringify(detail)
  }
  
  // Handle generic Error objects
  return err.message || 'An unexpected error occurred'
}
