# aptos-vault-hackathon

Copy trading vaults on Aptos—Move smart contracts, React dashboard, social trading!

## ✅ Fixed Merkle Integration Issues

### What Was Fixed:
1. **Complete Merkle SDK Integration**: Added proper import and initialization of `@merkletrade/ts-sdk`
2. **Production/Demo Toggle**: Added safe production mode with environment variable validation
3. **Real API Integration**: Implemented actual Merkle SDK calls for production mode
4. **Environment Configuration**: Added `.env.example` with proper API key setup
5. **Error Handling**: Enhanced error messages for missing API keys and SDK failures
6. **Live Trading Safety**: Added clear visual indicators and warnings for production mode

### New Features:
- ✅ **Production Mode Toggle**: Switch between demo and live trading
- ✅ **Real Merkle SDK Calls**: Actual `createOrder()` and `submitOrder()` integration
- ✅ **Environment Variables**: Proper API key configuration
- ✅ **Enhanced UI**: Clear mode indicators and status messages
- ✅ **Safety Checks**: Prevents accidental live trading without API keys

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Merkle API
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Merkle Trade API key
REACT_APP_MERKLE_API_KEY=your_actual_api_key_here
```

### 3. Get Merkle API Key
1. Visit [Merkle Trade Developer Portal](https://docs.merkletrade.com)
2. Create an account and generate API key
3. Add the key to your `.env` file

### 4. Run the Application
```bash
npm start
```

## Trading Modes

### Demo Mode (Default)
- ✅ Safe for testing and development
- ✅ Generates mock trade payloads
- ✅ No real money involved
- ✅ Shows exact data that would be sent to Merkle

### Production Mode
- ⚠️ **LIVE TRADING ENABLED**
- ⚠️ Requires valid Merkle API key
- ⚠️ Uses real money - be careful!
- ✅ Full integration with Merkle DEX
- ✅ Real order creation and submission

## Multi-Signer Limitation (Unchanged)

**Update Leader Function**: VaultFactory's update_leader entry function requires two signers (the old leader and the new leader) for vault ownership transfer.

**Current Limitation**: Aptos wallets and Web3 wallet adapters (Petra, Martian, etc.) only support single-wallet transactions in browser interfaces.

**For Demo/Testing**: All other vault features (create, join, leave, deposit, withdraw, publish, pause, resume) work via the frontend and can be fully demoed!

**Future Solution**: Multi-signer UX will be possible when wallet adapters support this feature. Our contract is ready for it.

## Security Features

- 🔒 **API Key Protection**: Environment variables prevent key exposure
- 🔒 **Mode Validation**: Cannot enable production without proper configuration
- 🔒 **Clear Warnings**: Visual indicators for live trading mode
- 🔒 **Demo Default**: Starts in safe demo mode by default

## About

This dApp demonstrates copy trading vaults on Aptos with full Merkle Trade integration. The implementation is production-ready and includes comprehensive safety features for development and testing.

### Architecture
- **Frontend**: React with Aptos wallet integration
- **Smart Contracts**: Move language on Aptos blockchain
- **Trading**: Merkle Trade SDK for DEX integration
- **Safety**: Dual-mode operation (demo/production)

## Resources

- [Aptos Documentation](https://aptos.dev)
- [Merkle Trade Documentation](https://docs.merkletrade.com)
- [Move Language Guide](https://move-language.github.io/move/)

## Languages

- JavaScript 76.1%
- Move 20.0%
- HTML 2.5%
- CSS 1.4%