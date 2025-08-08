<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <img src="./styles/icon/Monopoly-Logo.svg" alt="Monopoly" class="nav-logo" />
          <span class="nav-title">Monopoly</span>
        </div>
        
        <div class="nav-links">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/about" class="nav-link">About</router-link>
          <router-link to="/connect" class="nav-link">Connect</router-link>
        </div>
        
        <div class="nav-wallet">
          <button v-if="!account" @click="goToConnect" class="wallet-btn">
            Connect Wallet
          </button>
          <div v-else class="wallet-status">
            <span class="wallet-address">{{ shortAccount }}</span>
            <div class="wallet-indicator"></div>
          </div>
        </div>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import { connectWallet, getCurrentAccount, onAccountsChanged } from './services/wallet.service'
export default {
  name: 'App',
  created() {
    this.initWallet()
  },
  computed: {
    board() {
      return this.$store.getters.board
    },
    shortAccount() {
      if (!this.account) return ''
      return this.account.slice(0, 6) + '...' + this.account.slice(-4)
    },
  },
  methods: {
    clear() {
      console.log('clearing')
      localStorage.clear()
    },
    async initWallet() {
      try {
        const acc = await getCurrentAccount()
        this.account = acc
        this.removeAccountListener = onAccountsChanged((accounts) => {
          this.account = accounts?.[0] || null
        })
      } catch (err) {
        console.error('Wallet init failed:', err)
      }
    },
    async connect() {
      try {
        const acc = await connectWallet()
        this.account = acc
      } catch (err) {
        alert(err.message || 'Failed to connect wallet')
      }
    },
    goToConnect() {
      this.$router.push('/connect')
    }
  },
  data() {
    return { account: null, removeAccountListener: null }
  },
  unmounted() {
    if (this.removeAccountListener) this.removeAccountListener()
  },
  components: {},
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc;
  color: #1e293b;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-logo {
  width: 32px;
  height: 32px;
}

.nav-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: #1e293b;
  border-bottom-color: #3b82f6;
}

.nav-link.router-link-active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.nav-wallet {
  display: flex;
  align-items: center;
}

.wallet-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.wallet-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.wallet-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f1f5f9;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.wallet-address {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
}

.wallet-indicator {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .nav-title {
    font-size: 1.25rem;
  }
}
</style>
