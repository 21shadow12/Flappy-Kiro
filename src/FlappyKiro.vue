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
  velocity: 0          // Current vertical velocity (pixels per frame)
}

// Pipe entities - obstacles that move from right to left
// Non-reactive array for high-performance game loop
// Each pipe object structure:
// {
//   x: number,              // Horizontal position (moves left each frame)
//   width: number,          // Pipe width for collision detection
//   gapY: number,           // Y position of gap center
//   gapHeight: number,      // Height of passable gap between top and bottom pipes
//   passed: boolean         // Flag to track if ghost has passed (for score tracking)
// }
let pipes = []

// Frame counter for pipe generation timing
let frameCounter = 0

// Configuration object for game parameters
// Non-reactive for high-performance game loop
// All game logic should reference these config values
const config = {
  // Physics parameters
  gravity: 0.5,           // Downward acceleration per frame
  jumpForce: -10,         // Upward velocity applied on jump (negative = upward)
  
  // Pipe parameters
  pipeSpeed: 3,           // Pixels per frame that pipes move left
  pipeGap: 150,           // Height of the gap between top and bottom pipes
  pipeInterval: 120,      // Frames between pipe generation (2 seconds at 60 FPS)
  pipeWidth: 60,          // Width of pipes
  
  // Responsive design parameters
  baseWidth: 800,         // Base canvas width for scaling calculations
  baseHeight: 600,        // Base canvas height for scaling calculations
  scaleFactor: 1          // Current scale factor (updated on resize)
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
  ghost.velocity += config.gravity
  
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
  ghost.velocity = config.jumpForce
}

/**
 * Render the ghost character
 * Uses fillRect as a placeholder for sprite rendering
 * 
 * Rendering:
 * - Draws a white rectangle at ghost's current position
 * - Uses ghost's width and height for dimensions
 * 
 * TODO: Replace fillRect with sprite image rendering
 * - Load ghost sprite from assets/ghosty.png (40x40 base dimensions)
 * - Use ctx.drawImage(ghostSprite, ghost.x, ghost.y, ghost.width, ghost.height)
 * - Ensure sprite scales with canvas dimensions using ghost.width and ghost.height
 */
function renderGhost() {
  // Placeholder rendering with solid color
  ctx.fillStyle = '#FFFFFF' // White ghost
  ctx.fillRect(ghost.x, ghost.y, ghost.width, ghost.height)
  
  // TODO: Replace with sprite image when assets are integrated
  // ctx.drawImage(ghostSprite, ghost.x, ghost.y, ghost.width, ghost.height)
}

/**
 * Generate a new pipe pair with random gap positioning
 * Creates a pipe object with top and bottom segments and a gap between them
 * 
 * Gap positioning:
 * - Gap center (gapY) is randomly positioned within valid bounds
 * - Minimum clearance from top and bottom ensures gap is always passable
 * - Gap height is defined by config.pipeGap
 * 
 * Pipe properties:
 * - x: Starts at right edge of canvas
 * - width: Defined by config.pipeWidth
 * - gapY: Random Y position of gap center
 * - gapHeight: Height of passable gap
 * - passed: Initially false, set to true when ghost passes for score tracking
 */
function generatePipe() {
  // Get canvas dimensions
  const canvas = gameCanvas.value
  if (!canvas) return
  
  // Calculate valid bounds for gap position
  // Ensure minimum clearance from top and bottom (50 pixels + half gap height)
  const minGapY = config.pipeGap / 2 + 50
  const maxGapY = canvas.height - config.pipeGap / 2 - 50
  
  // Generate random gap position within valid bounds
  const gapY = Math.random() * (maxGapY - minGapY) + minGapY
  
  // Create new pipe object
  const pipe = {
    x: canvas.width,              // Start at right edge
    width: config.pipeWidth,      // Pipe width
    gapY: gapY,                   // Gap center Y position
    gapHeight: config.pipeGap,    // Gap height
    passed: false                 // Not yet passed by ghost
  }
  
  // Add pipe to pipes array
  pipes.push(pipe)
}

/**
 * Update pipes - move left and cleanup off-screen pipes
 * Called every frame during the game loop
 * 
 * Movement:
 * - All pipes move left by config.pipeSpeed pixels per frame
 * 
 * Cleanup:
 * - Remove pipes that have exited the left edge of the canvas
 * - Prevents memory growth from accumulating off-screen pipes
 * 
 * Generation:
 * - Generate new pipes at regular intervals (config.pipeInterval frames)
 * - Uses frameCounter to track timing
 */
function updatePipes() {
  // Move all pipes left
  pipes.forEach(pipe => {
    pipe.x -= config.pipeSpeed
  })
  
  // Remove pipes that have exited the left edge
  // A pipe is off-screen when its right edge (x + width) is less than 0
  pipes = pipes.filter(pipe => pipe.x + pipe.width > 0)
  
  // Generate new pipes at regular intervals
  if (frameCounter % config.pipeInterval === 0) {
    generatePipe()
  }
}

/**
 * Render all pipes
 * Draws top and bottom pipe segments with gap between them
 * Uses fillRect as placeholder for sprite rendering
 * 
 * Rendering:
 * - Top pipe: From canvas top to gap top edge
 * - Bottom pipe: From gap bottom edge to canvas bottom
 * - Gap: Empty space between top and bottom pipes
 * 
 * TODO: Replace fillRect with sprite image rendering
 * - Load pipe sprites (top and bottom segments)
 * - Use ctx.drawImage() for each pipe segment
 * - Ensure sprites scale with canvas dimensions
 */
function renderPipes() {
  // Check if canvas is available
  const canvas = gameCanvas.value
  if (!canvas || !ctx) return
  
  // Set pipe color (green)
  ctx.fillStyle = '#228B22'
  
  // Render each pipe
  pipes.forEach(pipe => {
    // Calculate top pipe dimensions
    // Top pipe extends from canvas top (y=0) to gap top edge
    const topPipeHeight = pipe.gapY - pipe.gapHeight / 2
    
    // Draw top pipe segment
    ctx.fillRect(pipe.x, 0, pipe.width, topPipeHeight)
    
    // Calculate bottom pipe dimensions
    // Bottom pipe starts at gap bottom edge and extends to canvas bottom
    const bottomPipeY = pipe.gapY + pipe.gapHeight / 2
    const bottomPipeHeight = canvas.height - bottomPipeY
    
    // Draw bottom pipe segment
    ctx.fillRect(pipe.x, bottomPipeY, pipe.width, bottomPipeHeight)
    
    // TODO: Replace with sprite images when assets are integrated
    // ctx.drawImage(pipeTopSprite, pipe.x, 0, pipe.width, topPipeHeight)
    // ctx.drawImage(pipeBottomSprite, pipe.x, bottomPipeY, pipe.width, bottomPipeHeight)
  })
}

/**
 * Check for collisions using AABB (Axis-Aligned Bounding Box) algorithm
 * Detects collisions between ghost and pipes, ceiling, and floor
 * 
 * Collision types:
 * 1. Ceiling collision: ghost.y <= 0
 * 2. Floor collision: ghost.y + ghost.height >= canvas.height
 * 3. Pipe collision: AABB overlap between ghost and pipe segments
 * 
 * AABB Collision Detection:
 * Two rectangles overlap if:
 * - rect1.x < rect2.x + rect2.width (rect1 left edge is left of rect2 right edge)
 * - rect1.x + rect1.width > rect2.x (rect1 right edge is right of rect2 left edge)
 * - rect1.y < rect2.y + rect2.height (rect1 top edge is above rect2 bottom edge)
 * - rect1.y + rect1.height > rect2.y (rect1 bottom edge is below rect2 top edge)
 */
function checkCollisions() {
  const canvas = gameCanvas.value
  if (!canvas) return
  
  // Check ceiling collision
  if (ghost.y <= 0) {
    endGame()
    return
  }
  
  // Check floor collision
  if (ghost.y + ghost.height >= canvas.height) {
    endGame()
    return
  }
  
  // Check pipe collisions
  for (const pipe of pipes) {
    // Only check pipes that overlap horizontally with ghost (optimization)
    if (ghost.x + ghost.width > pipe.x && ghost.x < pipe.x + pipe.width) {
      // Calculate top and bottom pipe boundaries
      const topPipeBottom = pipe.gapY - pipe.gapHeight / 2
      const bottomPipeTop = pipe.gapY + pipe.gapHeight / 2
      
      // Check if ghost is NOT in the gap (collision with top or bottom pipe)
      // Collision occurs if ghost is above the gap (hits top pipe) or below the gap (hits bottom pipe)
      if (ghost.y < topPipeBottom || ghost.y + ghost.height > bottomPipeTop) {
        endGame()
        return
      }
    }
  }
}

/**
 * End the game and transition to GAME_OVER state
 * Called when any collision is detected
 * 
 * Game over actions:
 * - Transition gameState to GAME_OVER
 * - Game loop will automatically stop on next iteration
 * - Final score is displayed in Game Over overlay
 */
function endGame() {
  gameState.value = GameState.GAME_OVER
  console.log('Flappy Kiro: Game over - Final score:', score.value)
}

/**
 * Update score tracking
 * Increments score when ghost successfully passes a pipe
 * 
 * Score logic:
 * - Check each pipe to see if ghost has passed it
 * - A pipe is "passed" when ghost.x > pipe.x + pipe.width
 * - Use pipe.passed flag to prevent double counting
 */
function updateScore() {
  pipes.forEach(pipe => {
    // Check if ghost has passed this pipe (and hasn't been counted yet)
    if (!pipe.passed && ghost.x > pipe.x + pipe.width) {
      pipe.passed = true
      score.value++
    }
  })
}

/**
 * Handle start/restart game
 * Transitions from START_SCREEN or GAME_OVER to PLAYING state
 */
function handleStart() {
  // Reset score
  score.value = 0
  
  // Reset ghost position and velocity
  ghost.y = 300
  ghost.velocity = 0
  
  // Clear pipes array
  pipes = []
  
  // Reset frame counter
  frameCounter = 0
  
  // Transition to PLAYING state
  gameState.value = GameState.PLAYING
  
  // Start game loop
  gameLoop()
  
  console.log('Flappy Kiro: Game started')
}

// ============================================================================
// GAME LOOP
// ============================================================================

// Animation frame ID for cleanup
let animationFrameId = null

/**
 * Main game loop
 * Runs at ~60 FPS using requestAnimationFrame
 * 
 * Loop structure:
 * 1. Check if game is still in PLAYING state
 * 2. Update game entities (physics, pipes)
 * 3. Check collisions
 * 4. Update score
 * 5. Render all entities to canvas
 * 6. Increment frame counter
 * 7. Request next frame
 */
function gameLoop() {
  // Stop loop if not in PLAYING state
  if (gameState.value !== GameState.PLAYING) {
    animationFrameId = null
    return
  }
  
  // Update phase
  updateGhostPhysics()
  updatePipes()
  checkCollisions()
  updateScore()
  
  // Render phase
  clearCanvas()
  renderPipes()
  renderGhost()
  
  // Increment frame counter
  frameCounter++
  
  // Continue loop
  animationFrameId = requestAnimationFrame(gameLoop)
}

/**
 * Clear canvas with background color
 * Called before rendering each frame
 */
function clearCanvas() {
  const canvas = gameCanvas.value
  if (!canvas || !ctx) return
  
  // Fill with sky blue background
  ctx.fillStyle = '#87CEEB'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

// Event handler references for cleanup
let keydownHandler = null
let clickHandler = null
let touchstartHandler = null

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
    
    // Create event handler for keyboard input (Spacebar)
    keydownHandler = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handleJump()
      }
    }
    
    // Create event handler for mouse click
    clickHandler = handleJump
    
    // Create event handler for touch input
    touchstartHandler = (e) => {
      e.preventDefault()
      handleJump()
    }
    
    // Add keyboard event listener for jump (Spacebar)
    window.addEventListener('keydown', keydownHandler)
    
    // Add mouse click event listener for jump
    canvas.addEventListener('click', clickHandler)
    
    // Add touch event listener for mobile support
    canvas.addEventListener('touchstart', touchstartHandler)
    
    console.log('Flappy Kiro: Canvas initialized successfully')
  } catch (error) {
    console.error('Flappy Kiro: Failed to initialize canvas:', error.message)
    alert(`Failed to initialize game: ${error.message}`)
  }
})

onUnmounted(() => {
  // Cancel animation frame if running
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  
  // Remove event listeners to prevent memory leaks
  const canvas = gameCanvas.value
  
  if (keydownHandler) {
    window.removeEventListener('keydown', keydownHandler)
  }
  
  if (canvas && clickHandler) {
    canvas.removeEventListener('click', clickHandler)
  }
  
  if (canvas && touchstartHandler) {
    canvas.removeEventListener('touchstart', touchstartHandler)
  }
  
  console.log('Flappy Kiro: Component unmounted, event listeners cleaned up')
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
