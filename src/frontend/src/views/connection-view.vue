<template>
  <div class="connection-container">
    <div class="connection-card">
      <div class="card-header">
        <img src="../styles/icon/Monopoly-Logo.svg" alt="Monopoly Logo" class="logo" />
        <h1 class="title">Monopoly Blockchain</h1>
        <p class="subtitle">Connect your wallet to start playing</p>
      </div>

      <div class="connection-status">
        <div v-if="isConnecting" class="status-section loading">
          <div class="spinner"></div>
          <h3>Connecting to wallet...</h3>
          <p>Please wait while we establish a secure connection</p>
        </div>

        <div v-else-if="connectionError" class="status-section error">
          <div class="status-icon">⚠</div>
          <h3>Connection Error</h3>
          <p>{{ connectionError }}</p>
          <button @click="retryConnection" class="action-btn retry">Try Again</button>
        </div>

        <div v-else-if="!isMetaMaskAvailable" class="status-section metamask">
          <div class="status-icon">🦊</div>
          <h3>MetaMask Required</h3>
          <p>Please install MetaMask to play this game</p>
          <a href="https://metamask.io/download/" target="_blank" class="action-btn install">
            Install MetaMask
          </a>
        </div>

        <div v-else-if="!isCorrectNetwork" class="status-section network">
          <div class="status-icon">🌐</div>
          <h3>Network Configuration</h3>
          <p>Please switch to Monad Testnet to continue</p>
          <button @click="switchToMonad" class="action-btn switch">Switch to Monad</button>
        </div>

        <div v-else-if="!account" class="status-section connect">
          <div class="status-icon">💼</div>
          <h3>Connect Wallet</h3>
          <p>Connect your MetaMask wallet to start playing</p>
          <button @click="connectWallet" class="action-btn connect">Connect MetaMask</button>
        </div>

        <div v-else class="status-section success">
          <div class="status-icon">✓</div>
          <h3>Connected Successfully</h3>
          <div class="connection-details">
            <div class="detail-item">
              <span class="label">Account:</span>
              <span class="value">{{ shortAccount }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Network:</span>
              <span class="value">Monad Testnet</span>
            </div>
          </div>
          <button @click="goToHome" class="action-btn start">Start Playing</button>
        </div>
      </div>

      <div class="info-section">
        <h4>About This Game</h4>
        <ul class="features-list">
          <li>Classic Monopoly gameplay with blockchain integration</li>
          <li>Secure transactions on Monad Testnet</li>
          <li>Real-time multiplayer experience</li>
          <li>Free to play with test tokens</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  connectWallet, 
  getCurrentAccount, 
  isMetaMaskAvailable, 
  ensureMonadNetwork,
  onAccountsChanged,
  onChainChanged
} from '../services/wallet.service'

export default {
  name: 'connection-view',
  data() {
    return {
      account: null,
      isConnecting: false,
      connectionError: null,
      isMetaMaskAvailable: false,
      isCorrectNetwork: false,
      removeAccountListener: null,
      removeChainListener: null
    }
  },
  computed: {
    shortAccount() {
      if (!this.account) return ''
      return this.account.slice(0, 6) + '...' + this.account.slice(-4)
    }
  },
  async created() {
    await this.checkConnectionStatus()
    this.setupListeners()
  },
  methods: {
    async checkConnectionStatus() {
      try {
        this.isMetaMaskAvailable = await isMetaMaskAvailable()
        
        if (!this.isMetaMaskAvailable) {
          return
        }

        const currentAccount = await getCurrentAccount()
        this.account = currentAccount
        await this.checkNetwork()
      } catch (error) {
        console.error('Error checking connection status:', error)
        this.connectionError = 'Failed to check connection status'
      }
    },

    async checkNetwork() {
      try {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
        this.isCorrectNetwork = currentChainId?.toLowerCase() === '0x279f'
      } catch (error) {
        console.error('Error checking network:', error)
        this.isCorrectNetwork = false
      }
    },

    setupListeners() {
      if (typeof window !== 'undefined' && window.ethereum) {
        this.removeAccountListener = onAccountsChanged((accounts) => {
          this.account = accounts?.[0] || null
          this.connectionError = null
        })

        this.removeChainListener = onChainChanged(() => {
          this.checkNetwork()
        })
      }
    },

    async connectWallet() {
      this.isConnecting = true
      this.connectionError = null

      try {
        const account = await connectWallet()
        this.account = account
        await this.checkNetwork()
      } catch (error) {
        console.error('Connection error:', error)
        this.connectionError = error.message || 'Failed to connect wallet'
      } finally {
        this.isConnecting = false
      }
    },

    async switchToMonad() {
      this.isConnecting = true
      this.connectionError = null

      try {
        await ensureMonadNetwork()
        await this.checkNetwork()
      } catch (error) {
        console.error('Network switch error:', error)
        this.connectionError = 'Failed to switch to Monad network'
      } finally {
        this.isConnecting = false
      }
    },

    retryConnection() {
      this.connectionError = null
      this.checkConnectionStatus()
    },

    goToHome() {
      this.$router.push('/')
    }
  },
  unmounted() {
    if (this.removeAccountListener) this.removeAccountListener()
    if (this.removeChainListener) this.removeChainListener()
  }
}
</script>

<style scoped>
.connection-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.connection-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
}

.card-header {
  text-align: center;
  margin-bottom: 3rem;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 1.125rem;
}

.connection-status {
  margin-bottom: 3rem;
}

.status-section {
  text-align: center;
  padding: 2rem;
  border-radius: 12px;
  border: 2px solid;
}

.status-section.loading {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.status-section.error {
  background: #fef2f2;
  border-color: #fecaca;
}

.status-section.metamask {
  background: #fffbeb;
  border-color: #fed7aa;
}

.status-section.network {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.status-section.connect {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.status-section.success {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.status-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-section h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.status-section p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.action-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  min-width: 150px;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.action-btn.retry {
  background: #ef4444;
}

.action-btn.retry:hover {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.action-btn.install {
  background: #f59e0b;
}

.action-btn.install:hover {
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.action-btn.switch {
  background: #10b981;
}

.action-btn.switch:hover {
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.action-btn.connect {
  background: #8b5cf6;
}

.action-btn.connect:hover {
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.action-btn.start {
  background: #059669;
}

.action-btn.start:hover {
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.connection-details {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 600;
  color: #374151;
}

.value {
  font-family: 'Monaco', 'Menlo', monospace;
  color: #6b7280;
}

.info-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.info-section h4 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.features-list {
  list-style: none;
  padding: 0;
}

.features-list li {
  color: #64748b;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.features-list li::before {
  content: '•';
  color: #3b82f6;
  font-weight: bold;
  position: absolute;
  left: 0;
}

@media (max-width: 768px) {
  .connection-card {
    padding: 2rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .action-btn {
    min-width: 120px;
    padding: 0.625rem 1.25rem;
  }
}
</style> 