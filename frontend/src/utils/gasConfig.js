// Gas configuration constants for Aptos transactions
// This file centralizes gas settings to prevent MAX_GAS_UNITS_BELOW_MIN_TRANSACTION_GAS_UNITS errors

export const GAS_CONSTANTS = {
  // Standard gas settings for different networks
  TESTNET: {
    MAX_GAS_AMOUNT: 20000,        // Higher for complex transactions
    GAS_UNIT_PRICE: 100,          // Standard testnet price
    EXPIRATION_SECONDS: 30,       // Transaction timeout
  },
  MAINNET: {
    MAX_GAS_AMOUNT: 15000,        // Slightly lower for mainnet
    GAS_UNIT_PRICE: 100,          // Standard mainnet price  
    EXPIRATION_SECONDS: 30,       // Transaction timeout
  },
  DEVNET: {
    MAX_GAS_AMOUNT: 25000,        // Highest for development
    GAS_UNIT_PRICE: 100,          // Standard devnet price
    EXPIRATION_SECONDS: 30,       // Transaction timeout
  }
};

// Transaction type specific gas settings
export const TRANSACTION_GAS = {
  VAULT_CREATION: {
    maxGasAmount: 20000,
    gasUnitPrice: 100,
  },
  VAULT_OPERATIONS: {
    maxGasAmount: 15000,
    gasUnitPrice: 100,
  },
  SIMPLE_TRANSACTIONS: {
    maxGasAmount: 10000,
    gasUnitPrice: 100,
  },
  COMPLEX_TRADING: {
    maxGasAmount: 25000,
    gasUnitPrice: 100,
  }
};

/**
 * Get gas configuration based on current network
 * @param {string} network - Network name (testnet, mainnet, devnet)
 * @returns {object} Gas configuration object
 */
export const getGasConfig = (network = 'testnet') => {
  const networkUpper = network.toUpperCase();
  return GAS_CONSTANTS[networkUpper] || GAS_CONSTANTS.TESTNET;
};

/**
 * Create transaction options with proper gas configuration
 * @param {string} transactionType - Type of transaction
 * @param {string} network - Network name
 * @returns {object} Transaction options with gas settings
 */
export const createTransactionOptions = (transactionType = 'VAULT_OPERATIONS', network = 'testnet') => {
  const gasConfig = TRANSACTION_GAS[transactionType] || TRANSACTION_GAS.VAULT_OPERATIONS;
  const networkConfig = getGasConfig(network);
  
  return {
    maxGasAmount: gasConfig.maxGasAmount,
    gasUnitPrice: gasConfig.gasUnitPrice,
    expireTimestamp: Math.floor(Date.now() / 1000) + networkConfig.EXPIRATION_SECONDS,
  };
};

/**
 * Get gas settings for specific vault operations
 * @param {string} operation - Operation type (create, join, leave, deposit, withdraw)
 * @returns {object} Gas configuration
 */
export const getVaultOperationGas = (operation) => {
  const gasMap = {
    create: TRANSACTION_GAS.VAULT_CREATION,
    join: TRANSACTION_GAS.VAULT_OPERATIONS,
    leave: TRANSACTION_GAS.VAULT_OPERATIONS,
    deposit: TRANSACTION_GAS.VAULT_OPERATIONS,
    withdraw: TRANSACTION_GAS.VAULT_OPERATIONS,
    trade: TRANSACTION_GAS.COMPLEX_TRADING,
    pause: TRANSACTION_GAS.SIMPLE_TRANSACTIONS,
    resume: TRANSACTION_GAS.SIMPLE_TRANSACTIONS,
  };
  
  return gasMap[operation] || TRANSACTION_GAS.VAULT_OPERATIONS;
};

/**
 * Validate gas settings to prevent common errors
 * @param {object} gasOptions - Gas options to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateGasSettings = (gasOptions) => {
  const { maxGasAmount, gasUnitPrice } = gasOptions;
  
  // Minimum gas requirements for Aptos
  const MIN_GAS_AMOUNT = 1000;
  const MIN_GAS_PRICE = 1;
  
  if (!maxGasAmount || maxGasAmount < MIN_GAS_AMOUNT) {
    console.warn(`Gas amount ${maxGasAmount} is below minimum ${MIN_GAS_AMOUNT}`);
    return false;
  }
  
  if (!gasUnitPrice || gasUnitPrice < MIN_GAS_PRICE) {
    console.warn(`Gas price ${gasUnitPrice} is below minimum ${MIN_GAS_PRICE}`);
    return false;
  }
  
  return true;
};

/**
 * Create a complete transaction configuration with gas settings
 * @param {string} functionName - Smart contract function to call
 * @param {array} functionArguments - Function arguments
 * @param {string} operation - Operation type for gas calculation
 * @param {string} network - Network name
 * @returns {object} Complete transaction configuration
 */
export const createTransaction = (functionName, functionArguments = [], operation = 'create', network = 'testnet') => {
  const gasOptions = createTransactionOptions(operation.toUpperCase(), network);
  
  // Validate gas settings
  if (!validateGasSettings(gasOptions)) {
    console.warn('Gas settings validation failed, using safe defaults');
    gasOptions.maxGasAmount = 20000;
    gasOptions.gasUnitPrice = 100;
  }
  
  return {
    data: {
      function: functionName,
      functionArguments: functionArguments,
    },
    options: gasOptions,
  };
};

export default {
  GAS_CONSTANTS,
  TRANSACTION_GAS,
  getGasConfig,
  createTransactionOptions,
  getVaultOperationGas,
  validateGasSettings,
  createTransaction,
};