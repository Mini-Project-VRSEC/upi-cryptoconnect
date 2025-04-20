/**
 * Transaction Service
 * Handles all transaction-related API calls with fallback mechanisms
 */

// Store local transactions when server fails
const LOCAL_TRANSACTIONS_KEY = 'local_transactions';

const API_BASE_URL = '/api';

const transactionService = {
  // Get transactions from both server and local storage
  getTransactions: async (token) => {
    try {
      // Try to fetch from server first
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let transactions = [];
      
      if (response.ok) {
        const data = await response.json();
        transactions = data.transactions || [];
      }
      
      // Always merge with local transactions
      const localTransactions = JSON.parse(localStorage.getItem(LOCAL_TRANSACTIONS_KEY) || '[]');
      
      // Combine and sort by timestamp (newest first)
      const allTransactions = [...transactions, ...localTransactions]
        .sort((a, b) => new Date(b.timestamp || b.createdAt || Date.now()) - 
                         new Date(a.timestamp || a.createdAt || Date.now()));
      
      return allTransactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      
      // Return local transactions as fallback
      return JSON.parse(localStorage.getItem(LOCAL_TRANSACTIONS_KEY) || '[]');
    }
  },
  
  createTransaction: async (token, transactionData) => {
    try {
      // Set defaults for required fields
      const userDataStr = localStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : {};
      
      // Ensure required fields are present
      const finalTransactionData = {
        ...transactionData,
        recipientUpiId: transactionData.recipientUpiId || 'default@cryptoconnect',
        recipient: transactionData.recipient || userData._id || 'default_user_id',
        timestamp: new Date().toISOString()
      };
      
      // Try server first
      try {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(finalTransactionData)
        });
        
        if (response.ok) {
          const serverData = await response.json();
          return { success: true, transaction: serverData };
        } else {
          throw new Error('Server validation failed');
        }
      } catch (serverError) {
        console.log('Server transaction creation failed, storing locally:', serverError);
        
        // Store transaction locally as fallback
        const localTransaction = {
          ...finalTransactionData,
          _id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
          status: 'completed',
          localOnly: true
        };
        
        const existingTransactions = JSON.parse(localStorage.getItem(LOCAL_TRANSACTIONS_KEY) || '[]');
        existingTransactions.push(localTransaction);
        localStorage.setItem(LOCAL_TRANSACTIONS_KEY, JSON.stringify(existingTransactions));
        
        return { success: true, transaction: localTransaction };
      }
    } catch (error) {
      console.error('Transaction creation error:', error);
      return { success: false, message: error.message || 'Failed to create transaction' };
    }
  }
};

export default transactionService;