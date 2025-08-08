<template>
  <div class="home-container">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Monopoly Blockchain Game</h1>
        <p class="hero-subtitle">Experience the classic board game with blockchain technology</p>
      </div>
    </div>

    <div class="content-section">
      <div class="container">
        <div class="game-setup">
          <div class="setup-card">
            <h2 class="card-title">Game Setup</h2>
            
            <div class="player-input-section">
              <h3 class="section-title">Add Players</h3>
              <div class="input-group">
                <input 
                  type="text" 
                  v-model="name" 
                  placeholder="Enter player name"
                  class="player-input"
                  @keyup.enter="addPlayer"
                />
                <button @click="addPlayer" class="add-btn" :disabled="!name.trim()">
                  Add Player
                </button>
              </div>
            </div>

            <div class="players-list" v-if="playersToAdd.length > 0">
              <h3 class="section-title">Players ({{ playersToAdd.length }}/8)</h3>
              <div class="players-grid">
                <div 
                  v-for="player in playersToAdd" 
                  :key="player._id"
                  class="player-card"
                >
                  <div class="player-avatar" :style="{ backgroundColor: player.colorToken }">
                    {{ player.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="player-info">
                    <span class="player-name">{{ player.name }}</span>
                    <span class="player-balance">${{ player.balance.toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="action-buttons">
              <div class="fee-info" v-if="playersToAdd.length >= 2">
                <p class="fee-text">Game Fee: {{ gameFee }} MONAD</p>
                <p class="fee-description">(Single entry fee for game creation)</p>
              </div>
              <button 
                @click="startGame" 
                class="start-btn"
                :disabled="playersToAdd.length < 2"
              >
                Start New Game
              </button>
            </div>
          </div>
        </div>

        <div class="existing-games" v-if="boards.length > 0">
          <div class="setup-card">
            <h2 class="card-title">Continue Game</h2>
            <div class="games-grid">
              <div 
                v-for="board in boards" 
                :key="board._id"
                class="game-card"
                @click="goToBoard(board._id)"
              >
                <div class="game-info">
                  <h3 class="game-id">Game {{ board._id }}</h3>
                  <p class="game-players">{{ board.players.length }} players</p>
                </div>
                <div class="game-status">
                  <span class="status-badge">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { utilService } from '../services/util.service'
import { ensureNoBlockchainTransactions } from '../services/wallet.service'
import { startNewGame, getGameFee, setContractAddress } from '../services/monopoly.service'
export default {
  name: 'home-view',
  data() {
    return {
      name: '',
      playersToAdd: [],
      contractFeePerPlayer: '0.05', // Default fallback
    }
  },
  computed: {
    boards() {
      return this.$store.getters.boards
    },
    gameFee() {
      if (this.playersToAdd.length < 2) return '0.00';
      // For the existing contract, it's just the single entry fee
      return this.feePerPlayer;
    },
    feePerPlayer() {
      return this.contractFeePerPlayer || '0.05';
    },
  },
  async created() {
    await this.$store.dispatch({
      type: 'getBoards',
    })
    console.log(this.boards)
    
    // Initialize contract address
    try {
      const addressResponse = await fetch('/src/contract_data/Monopoly-address.json');
      const addressData = await addressResponse.json();
      await setContractAddress(addressData.address);
      console.log('Monopoly contract address set:', addressData.address);
      
      // Load contract fee
      await this.loadContractFee();
    } catch (error) {
      console.error('Failed to load contract address:', error);
    }
  },
  methods: {
    addPlayer() {
      if (this.playersToAdd.length >= 8 || !this.name.trim()) return
      this.playersToAdd.push({
        _id: utilService.makeId(),
        name: this.name.trim() || 'Player ' + (this.playersToAdd.length + 1),
        position: 0,
        propertyCards: [],
        railroadsCards: [],
        utilitiesCards: [],
        communityChestCards: [],
        chanceCards: [],
        isInJail: 0,
        balance: 2000,
        colorToken: utilService.getRandomColor(),
      })
      this.name = ''
    },
    goToBoard(boardId) {
      this.$router.push('/board/' + boardId)
    },
    async startGame() {
      if (!this.playersToAdd || this.playersToAdd.length < 2) return
      
      try {
        // Calculate fee for the number of players
        const playerCount = this.playersToAdd.length
        const feePerPlayer = 0.05 // 0.05 MONAD per player
        const totalFee = feePerPlayer * playerCount
        
        console.log(`Starting new game with ${playerCount} players. Fee: ${totalFee} MONAD`)
        
        // Call the blockchain transaction
        const result = await startNewGame(playerCount)
        
        console.log('Blockchain transaction successful:', result)
        
        // If blockchain transaction is successful, proceed with local game creation
        this.getNewBoard()
        
      } catch (error) {
        console.error('Error starting game:', error)
        alert(`Failed to start game: ${error.message}`)
      }
    },
    async getNewBoard() {
      const board = await this.$store.dispatch({
        type: 'getNewBoard',
        players: JSON.parse(JSON.stringify(this.playersToAdd)),
      })
      this.$router.push('/board/' + board._id)
    },
    async loadContractFee() {
      try {
        const { getGameFee } = await import('../services/monopoly.service');
        const fee = await getGameFee(1); // Get fee for 1 player to get per-player fee
        this.contractFeePerPlayer = fee;
        console.log('Contract fee per player loaded:', fee);
      } catch (error) {
        console.error('Failed to load contract fee, using default:', error);
        this.contractFeePerPlayer = '0.05';
      }
    },
  },
  components: {},
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-image: url('../styles/images/t-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
}

.home-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.hero-section {
  padding: 4rem 0;
  text-align: center;
  color: white;
  position: relative;
  z-index: 2;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  font-weight: 400;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.content-section {
  background: rgba(248, 250, 252, 0.95);
  padding: 4rem 0;
  position: relative;
  z-index: 2;
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 300px);
}

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

.game-setup {
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;
}

.setup-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 500px;
}

.card-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
  text-align: center;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.player-input-section {
  margin-bottom: 2rem;
}

.input-group {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.player-input {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.player-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.add-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.add-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.add-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.players-list {
  margin-bottom: 2rem;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.player-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.player-name {
  font-weight: 600;
  color: #1e293b;
}

.player-balance {
  font-size: 0.875rem;
  color: #6b7280;
}

.action-buttons {
  text-align: center;
  width: 100%;
}

.fee-info {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  color: #0369a1;
}

.fee-text {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.fee-description {
  font-size: 0.875rem;
  opacity: 0.8;
  margin: 0;
}

.start-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 1.125rem 2.5rem;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 300px;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.start-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.existing-games {
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;
}

.games-grid {
  display: grid;
  gap: 1rem;
  width: 100%;
}

.game-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.game-card:hover {
  background: #f1f5f9;
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.game-id {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.game-players {
  font-size: 0.875rem;
  color: #6b7280;
}

.status-badge {
  background: #10b981;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
    gap: 2rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .setup-card {
    padding: 2rem;
    margin: 0 1rem;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .players-grid {
    grid-template-columns: 1fr;
  }
  
  .start-btn {
    max-width: 100%;
  }
}
</style>
