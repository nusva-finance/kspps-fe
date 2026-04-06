import api from './api'; // Menggunakan instance API yang memiliki interceptor token

// --- Interfaces ---
export interface SavingsTransaction {
  account_type: string; // Dinamis: pokok, wajib, manasuka, dll
  member_id: string | number;
  member_name: string;
  transaction_type: 'credit' | 'debit';
  amount: number;
  description: string;
  transaction_date: string;
  rekening_id?: number; // ID dari nusva_rekening untuk mencatat ke rekening_transaction
}

export interface SavingType {
  id: number;
  code: string;
  name: string;
  description: string;
  is_required: boolean;
  min_balance: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const savingsService = {
  /**
   * Mendapatkan daftar semua saldo anggota (Pokok, Wajib, Manasuka)
   * Digunakan di halaman utama Savings.tsx
   */
  getMemberBalances: async () => {
    try {
      // Menggunakan api.get agar token terlampir otomatis
      const response = await api.get('/savings/accounts');
      console.log('✅ Member balances loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching all member balances:', error);
      throw error;
    }
  },

  /**
   * Mendapatkan riwayat transaksi dengan filter
   */
  getTransactions: async (params: { 
    member_id?: number | string; 
    account_type?: string; 
    page?: number; 
    limit?: number; 
    search?: string; 
    date_from?: string; 
    date_to?: string 
  } = {}) => {
    try {
      const response = await api.get('/savings/transactions', {
        params: params,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      throw error;
    }
  },

  /**
   * Mendapatkan semua jenis simpanan (dynamic)
   */
  getSavingTypes: async (includeInactive = false) => {
    try {
      const params = includeInactive ? { include_inactive: 'true' } : {};
      const response = await api.get('/savings/types', { params });
      console.log('✅ Saving types loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching saving types:', error);
      throw error;
    }
  },

  /**
   * Mendapatkan jenis simpanan dengan total saldo per jenis
   */
  getSavingTypesWithBalances: async () => {
    try {
      const response = await api.get('/savings/types/balances');
      console.log('✅ Saving types with balances loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching saving types with balances:', error);
      throw error;
    }
  },

  /**
   * Membuat transaksi simpanan baru
   */
  createTransaction: async (data: SavingsTransaction) => {
    try {
      console.log('📤 Creating savings transaction:', data);
      const response = await api.post('/savings/transactions', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      throw error;
    }
  },

  /**
   * Mendapatkan semua transaksi (untuk halaman daftar simpanan)
   */
  getAllTransactions: async (params: { limit?: number; page?: number } = {}) => {
    try {
      const response = await api.get('/savings/transactions/all', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching all transactions:', error);
      throw error;
    }
  },

  /**
   * Update transaksi simpanan
   */
  updateTransaction: async (id: number, data: Partial<SavingsTransaction>) => {
    try {
      console.log('📤 Updating savings transaction:', id, data);
      const response = await api.put(`/savings/transactions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating transaction:', error);
      throw error;
    }
  },

  /**
   * Hapus transaksi simpanan
   */
  deleteTransaction: async (id: number) => {
    try {
      console.log('📤 Deleting savings transaction:', id);
      const response = await api.delete(`/savings/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting transaction:', error);
      throw error;
    }
  },

  /**
   * Mendapatkan detail transaksi berdasarkan ID
   */
  getTransactionById: async (id: number) => {
    try {
      const response = await api.get(`/savings/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching transaction by ID:', error);
      throw error;
    }
  },

  /**
   * Mendapatkan saldo spesifik satu anggota
   */
  getMemberBalanceById: async (memberId: string | number) => {
    try {
      const response = await api.get(`/savings/member/${memberId}/balance`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching specific member balance:', error);
      throw error;
    }
  },

  /**
   * Mendapatkan semua transaksi simpanan (untuk halaman daftar)
   */
  getAllTransactions: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    try {
      const response = await api.get('/savings/transactions/all', { params });
      console.log('✅ All transactions loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching all transactions:', error);
      throw error;
    }
  },

  /**
   * Update transaksi simpanan
   */
  updateTransaction: async (id: number, data: SavingsTransaction) => {
    try {
      console.log('📤 Updating savings transaction:', id, data);
      const response = await api.put(`/savings/transactions/${id}`, data);
      console.log('✅ Transaction updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating transaction:', error);
      throw error;
    }
  },

  /**
   * Hapus transaksi simpanan
   */
  deleteTransaction: async (id: number) => {
    try {
      console.log('🗑️ Deleting savings transaction:', id);
      const response = await api.delete(`/savings/transactions/${id}`);
      console.log('✅ Transaction deleted');
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting transaction:', error);
      throw error;
    }
  }
};

export default savingsService;