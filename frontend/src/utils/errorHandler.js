// Error handling utilities for the Aptos dApp

// Contract error codes mapping
export const ERROR_CODES = {
  1001: "Vault not found",
  1002: "Insufficient balance",
  1003: "Not authorized to perform this action",
  1004: "Invalid amount (must be greater than 0)",
  1005: "Vault is currently paused",
  1006: "User is not a subscriber of this vault",
  1007: "User is already a subscriber of this vault",
  1008: "Vault already exists for this address"
};

// Parse error messages from transaction failures
export const parseTransactionError = (error) => {
  if (!error) return "Unknown error occurred";
  
  const errorMessage = error.message || error.toString();
  
  // Check for specific error codes
  for (const [code, message] of Object.entries(ERROR_CODES)) {
    if (errorMessage.includes(code)) {
      return message;
    }
  }
  
  // Check for common transaction errors
  if (errorMessage.includes("insufficient")) {
    return "Insufficient balance for transaction fees";
  }
  
  if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
    return "Transaction timed out. Please try again.";
  }
  
  if (errorMessage.includes("rejected") || errorMessage.includes("denied")) {
    return "Transaction was rejected by user";
  }
  
  if (errorMessage.includes("network")) {
    return "Network error. Please check your connection.";
  }
  
  if (errorMessage.includes("gas")) {
    return "Transaction failed due to gas issues";
  }
  
  // Return the original message if no specific match found
  return errorMessage.length > 100 ? 
    errorMessage.substring(0, 100) + "..." : 
    errorMessage;
};

// Validate Aptos address format
export const isValidAddress = (address) => {
  if (!address) return false;
  
  // Remove 0x prefix if present
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  
  // Check if it's a valid hex string of correct length
  return /^[a-fA-F0-9]{64}$/.test(cleanAddress) || /^[a-fA-F0-9]{40}$/.test(cleanAddress);
};

// Format address for display
export const formatAddress = (address, length = 4) => {
  if (!address) return "";
  if (address.length <= length * 2 + 2) return address;
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
};

// Validate amount input
export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && isFinite(num);
};

// Convert amount to appropriate unit
export const formatAmount = (amount, decimals = 8) => {
  if (!amount) return "0";
  const num = parseFloat(amount);
  return num.toFixed(decimals).replace(/\.?0+$/, "");
};

// Transaction status checker
export const getTransactionStatus = (error) => {
  if (!error) return "success";
  
  const errorMessage = error.message || error.toString();
  
  if (errorMessage.includes("pending")) return "pending";
  if (errorMessage.includes("timeout")) return "timeout";
  if (errorMessage.includes("rejected")) return "rejected";
  
  return "failed";
};

// Retry mechanism for failed transactions
export const retryTransaction = async (transactionFunction, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await transactionFunction();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Don't retry user rejections
      if (error.message && error.message.includes("rejected")) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

// Contract configuration
export const CONTRACT_CONFIG = {
  MODULE_ADDRESS: "0xf02e42e167e86430855e112267405f0bb4bb6a8fed16cd7e4e4a339ec7341f73",
  MODULE_NAME: "VaultFactory",
  NETWORK: "testnet" // Change to "mainnet" for production
};

// Get full function name for transactions
export const getFunctionName = (functionName) => {
  return `${CONTRACT_CONFIG.MODULE_ADDRESS}::${CONTRACT_CONFIG.MODULE_NAME}::${functionName}`;
};

// Loading states for UI components
export const LOADING_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error"
};

// Common transaction options
export const DEFAULT_TRANSACTION_OPTIONS = {
  max_gas_amount: "100000",
  gas_unit_price: "100",
};

// Debounce function for input validation
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Local storage helpers for persisting user preferences
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn("Failed to read from localStorage:", error);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Failed to remove from localStorage:", error);
    }
  }
};

export default {
  ERROR_CODES,
  parseTransactionError,
  isValidAddress,
  formatAddress,
  validateAmount,
  formatAmount,
  getTransactionStatus,
  retryTransaction,
  CONTRACT_CONFIG,
  getFunctionName,
  LOADING_STATES,
  DEFAULT_TRANSACTION_OPTIONS,
  debounce,
  storage
};