<template>
  <div class="game-container">
    <canvas ref="gameCanvas"></canvas>
    
    <!-- Start Screen Overlay -->
    <div v-if="gameState === 'START_SCREEN'" class="overlay start-screen">
      <h1>Flappy Kiro</h1>
      <button class="game-button" @click="handleStart">Start Game</button>
    </div>
    
    <!-- Playing Overlay - Score Display -->
    <div v-if="gameState === 'PLAYING'" class="overlay score-display">
      <div class="score">{{ score }}</div>
    </div>
    
    <!-- Game Over Overlay -->
    <div v-if="gameState === 'GAME_OVER'" class="overlay game-over">
      <h2>Game Over</h2>
      <p class="final-score">Final Score: {{ score }}</p>
      <button class="game-button" @click="handleStart">Play Again</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// ============================================================================
// GAME STATE ENUM
// ============================================================================

// Define game state constants
const GameState = {
  START_SCREEN: 'START_SCREEN',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER'
}

// ============================================================================
// REACTIVE STATE (Vue refs for UI updates)
// ============================================================================

// Game state: START_SCREEN, PLAYING, or GAME_OVER
const gameState = ref(GameState.START_SCREEN)

// Current score
const score = ref(0)

// Canvas template ref
const gameCanvas = ref(null)

// ============================================================================
// NON-REACTIVE STATE (High-performance game entities)
// ============================================================================

// Canvas context (initialized in onMounted)
let ctx = null

// Ghost entity - player-controlled character
// Non-reactive for high-performance physics calculations
let ghost = {
  x: 100,              // Fixed horizontal position
  y: 300,              // Vertical position (updated each frame)
  width: 40,           // Collision box width
  height: 40,          // Collision box height
  velocity: 0,         // Current vertical velocity (pixels per frame)
  gravity: 0.5,        // Downward acceleration per frame
  jumpForce: -10       // Upward velocity applied on jump (negative = upward)
}

// ============================================================================
// GAME FUNCTIONS
// ============================================================================

/**
 * Update ghost physics - apply gravity and update position
 * This function is called every frame during the game loop
 * 
 * Physics calculations:
 * 1. Apply gravity: velocity increases by gravity value (downward acceleration)
 * 2. Update position: y position changes by velocity value
 */
function updateGhostPhysics() {
  // Apply gravity to velocity (downward acceleration)
  ghost.velocity += ghost.gravity
  
  // Update y position based on velocity
  ghost.y += ghost.velocity
}

/**
 * Handle jump input
 * Applies upward velocity to ghost when game is in PLAYING state
 * 
 * Jump mechanics:
 * - Only applies when gameState is PLAYING (ignores input in other states)
 * - Sets velocity to jumpForce (negative value = upward movement)
 */
function handleJump() {
  // Only apply jump when game is actively playing
  if (gameState.value !== GameState.PLAYING) {
    return
  }
  
  // Apply jump force (negative = upward velocity)
  ghost.velocity = ghost.jumpForce
}

/**
 * Handle start/restart game
 * Transitions from START_SCREEN or GAME_OVER to PLAYING state
 */
function handleStart() {
  // Reset score
  score.value = 0
  
  // Transition to PLAYING state
  gameState.value = GameState.PLAYING
  
  console.log('Flappy Kiro: Game started')
}

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

onMounted(() => {
  try {
    // Get canvas element from template ref
    const canvas = gameCanvas.value
    
    if (!canvas) {
      throw new Error('Canvas element not found')
    }
    
    // Initialize 2D rendering context
    ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Canvas 2D context not supported by this browser')
    }
    
    // Set initial canvas dimensions
    canvas.width = 800
    canvas.height = 600
    
    // Clear canvas with background color
    ctx.fillStyle = '#87CEEB' // Sky blue
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    console.log('Flappy Kiro: Canvas initialized successfully')
  } catch (error) {
    console.error('Flappy Kiro: Failed to initialize canvas:', error.message)
    alert(`Failed to initialize game: ${error.message}`)
  }
})

onUnmounted(() => {
  // Cleanup will be added in later tasks
  console.log('Flappy Kiro: Component unmounted')
})
</script>

<style scoped>
.game-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background-color: #1a1a1a;
  position: relative;
}

canvas {
  border: 2px solid #333;
  display: block;
}

/* Overlay base styles */
.overlay {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

/* Allow buttons to be clickable */
.overlay button {
  pointer-events: auto;
}

/* Start Screen Overlay */
.start-screen {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.start-screen h1 {
  font-size: 3rem;
  color: #ffffff;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* Playing Overlay - Score Display */
.score-display {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.score {
  font-size: 3rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

/* Game Over Overlay */
.game-over {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 2rem 3rem;
  border-radius: 10px;
}

.game-over h2 {
  font-size: 2.5rem;
  color: #ff4444;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.final-score {
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 2rem;
}

/* Game Button Styles */
.game-button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffffff;
  background-color: #4CAF50;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.game-button:hover {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.4);
}

.game-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Responsive text sizing */
@media (max-width: 768px) {
  .start-screen h1 {
    font-size: 2rem;
  }
  
  .score {
    font-size: 2rem;
  }
  
  .game-over h2 {
    font-size: 1.8rem;
  }
  
  .final-score {
    font-size: 1.2rem;
  }
  
  .game-button {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .start-screen h1 {
    font-size: 1.5rem;
  }
  
  .score {
    font-size: 1.5rem;
  }
  
  .game-over h2 {
    font-size: 1.5rem;
  }
  
  .final-score {
    font-size: 1rem;
  }
  
  .game-button {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
  
  .game-over {
    padding: 1.5rem 2rem;
  }
}
</style>
