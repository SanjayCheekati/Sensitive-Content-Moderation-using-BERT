const API_URL = 'http://localhost:5000/api';

export const analyzeText = async (text) => {
  try {
    const response = await fetch(`${API_URL}/content/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze text');
    }
    
    return response.json();
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
};

export const fetchHistory = async () => {
  try {
    const response = await fetch(`${API_URL}/content/history`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch history');
    }
    
    return response.json();
  } catch (error) {
    console.error('History fetch error:', error);
    throw error;
  }
};

export const clearHistory = async () => {
  try {
    const response = await fetch(`${API_URL}/content/clear-history`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to clear history');
    }
    
    return response.json();
  } catch (error) {
    console.error('History clear error:', error);
    throw error;
  }
}; 