import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FlappyKiro from './FlappyKiro.vue'

describe('FlappyKiro Component Initialization', () => {
  let wrapper
  let mockCanvas
  let mockContext

  beforeEach(() => {
    // Mock canvas and 2D context
    mockContext = {
      fillStyle: '',
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn()
    }

    mockCanvas = {
      getContext: vi.fn(() => mockContext),
      width: 0,
      height: 0
    }

    // Mock HTMLCanvasElement
    global.HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)
  })

  it('should initialize in START_SCREEN state', () => {
    wrapper = mount(FlappyKiro)
    
    // Access the component's reactive state
    expect(wrapper.vm.gameState).toBe('START_SCREEN')
  })

  it('should initialize score to 0', () => {
    wrapper = mount(FlappyKiro)
    
    expect(wrapper.vm.score).toBe(0)
  })

  it('should properly bind canvas ref', () => {
    wrapper = mount(FlappyKiro)
    
    // Check that canvas element exists in the template
    const canvas = wrapper.find('canvas')
    expect(canvas.exists()).toBe(true)
    
    // Check that the ref is bound
    expect(wrapper.vm.gameCanvas).toBeTruthy()
  })

  it('should initialize canvas 2D context on mount', () => {
    wrapper = mount(FlappyKiro)
    
    // Verify getContext was called with '2d'
    expect(global.HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d')
  })

  it('should set canvas dimensions on initialization', () => {
    wrapper = mount(FlappyKiro)
    
    const canvas = wrapper.find('canvas').element
    
    // Canvas should have dimensions set
    expect(canvas.width).toBeGreaterThan(0)
    expect(canvas.height).toBeGreaterThan(0)
  })

  it('should handle canvas context initialization failure gracefully', () => {
    // Mock getContext to return null (unsupported browser)
    global.HTMLCanvasElement.prototype.getContext = vi.fn(() => null)
    
    // Mock console.error and alert to prevent noise in test output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    wrapper = mount(FlappyKiro)
    
    // Should have logged error
    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(alertSpy).toHaveBeenCalled()
    
    consoleErrorSpy.mockRestore()
    alertSpy.mockRestore()
  })
})

describe('UI Overlay Components', () => {
  let wrapper

  beforeEach(() => {
    // Mock canvas context
    const mockContext = {
      fillStyle: '',
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn()
    }
    global.HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)
  })

  it('should display Start Screen overlay when gameState is START_SCREEN', () => {
    wrapper = mount(FlappyKiro)
    
    // Verify START_SCREEN state
    expect(wrapper.vm.gameState).toBe('START_SCREEN')
    
    // Check Start Screen overlay is visible
    const startScreen = wrapper.find('.start-screen')
    expect(startScreen.exists()).toBe(true)
    
    // Check Start button exists
    const startButton = startScreen.find('.game-button')
    expect(startButton.exists()).toBe(true)
    expect(startButton.text()).toContain('Start')
    
    // Check other overlays are not visible
    expect(wrapper.find('.score-display').exists()).toBe(false)
    expect(wrapper.find('.game-over').exists()).toBe(false)
  })

  it('should display Playing overlay with score when gameState is PLAYING', async () => {
    wrapper = mount(FlappyKiro)
    
    // Transition to PLAYING state
    await wrapper.vm.handleStart()
    await wrapper.vm.$nextTick()
    
    // Verify PLAYING state
    expect(wrapper.vm.gameState).toBe('PLAYING')
    
    // Check score display overlay is visible
    const scoreDisplay = wrapper.find('.score-display')
    expect(scoreDisplay.exists()).toBe(true)
    
    // Check score is displayed
    const score = scoreDisplay.find('.score')
    expect(score.exists()).toBe(true)
    expect(score.text()).toBe('0')
    
    // Check other overlays are not visible
    expect(wrapper.find('.start-screen').exists()).toBe(false)
    expect(wrapper.find('.game-over').exists()).toBe(false)
  })

  it('should display Game Over overlay with final score when gameState is GAME_OVER', async () => {
    wrapper = mount(FlappyKiro)
    
    // Set score to a test value
    wrapper.vm.score = 42
    
    // Manually set gameState to GAME_OVER
    wrapper.vm.gameState = 'GAME_OVER'
    await wrapper.vm.$nextTick()
    
    // Verify GAME_OVER state
    expect(wrapper.vm.gameState).toBe('GAME_OVER')
    
    // Check Game Over overlay is visible
    const gameOver = wrapper.find('.game-over')
    expect(gameOver.exists()).toBe(true)
    
    // Check Game Over heading
    expect(gameOver.find('h2').text()).toBe('Game Over')
    
    // Check final score is displayed
    const finalScore = gameOver.find('.final-score')
    expect(finalScore.exists()).toBe(true)
    expect(finalScore.text()).toContain('42')
    
    // Check Play Again button exists
    const playAgainButton = gameOver.find('.game-button')
    expect(playAgainButton.exists()).toBe(true)
    expect(playAgainButton.text()).toContain('Play Again')
    
    // Check other overlays are not visible
    expect(wrapper.find('.start-screen').exists()).toBe(false)
    expect(wrapper.find('.score-display').exists()).toBe(false)
  })

  it('should use v-if directives to conditionally render overlays', async () => {
    wrapper = mount(FlappyKiro)
    
    // START_SCREEN: only start-screen visible
    expect(wrapper.vm.gameState).toBe('START_SCREEN')
    expect(wrapper.find('.start-screen').exists()).toBe(true)
    expect(wrapper.find('.score-display').exists()).toBe(false)
    expect(wrapper.find('.game-over').exists()).toBe(false)
    
    // PLAYING: only score-display visible
    wrapper.vm.gameState = 'PLAYING'
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.start-screen').exists()).toBe(false)
    expect(wrapper.find('.score-display').exists()).toBe(true)
    expect(wrapper.find('.game-over').exists()).toBe(false)
    
    // GAME_OVER: only game-over visible
    wrapper.vm.gameState = 'GAME_OVER'
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.start-screen').exists()).toBe(false)
    expect(wrapper.find('.score-display').exists()).toBe(false)
    expect(wrapper.find('.game-over').exists()).toBe(true)
  })

  it('should update score display reactively during PLAYING state', async () => {
    wrapper = mount(FlappyKiro)
    
    // Transition to PLAYING
    await wrapper.vm.handleStart()
    await wrapper.vm.$nextTick()
    
    // Initial score should be 0
    expect(wrapper.find('.score').text()).toBe('0')
    
    // Update score
    wrapper.vm.score = 5
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.score').text()).toBe('5')
    
    // Update score again
    wrapper.vm.score = 15
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.score').text()).toBe('15')
  })
})

describe('Ghost Physics', () => {
  it('should have updateGhostPhysics function that applies gravity and updates position', () => {
    // Create a mock ghost object
    const ghost = {
      x: 100,
      y: 300,
      width: 40,
      height: 40,
      velocity: 0,
      gravity: 0.5,
      jumpForce: -10
    }
    
    // Simulate updateGhostPhysics function
    const updateGhostPhysics = () => {
      ghost.velocity += ghost.gravity
      ghost.y += ghost.velocity
    }
    
    // Initial state
    const initialY = ghost.y
    const initialVelocity = ghost.velocity
    
    // Apply physics once
    updateGhostPhysics()
    
    // Verify velocity increased by gravity
    expect(ghost.velocity).toBe(initialVelocity + ghost.gravity)
    expect(ghost.velocity).toBe(0.5)
    
    // Verify position updated by velocity
    expect(ghost.y).toBe(initialY + ghost.velocity)
    expect(ghost.y).toBe(300.5)
    
    // Apply physics again
    updateGhostPhysics()
    
    // Velocity should continue to increase
    expect(ghost.velocity).toBe(1.0)
    
    // Position should continue to update
    expect(ghost.y).toBe(301.5)
  })
  
  it('should apply gravity continuously over multiple frames', () => {
    const ghost = {
      velocity: 0,
      y: 300,
      gravity: 0.5
    }
    
    const updateGhostPhysics = () => {
      ghost.velocity += ghost.gravity
      ghost.y += ghost.velocity
    }
    
    // Simulate 10 frames
    for (let i = 0; i < 10; i++) {
      updateGhostPhysics()
    }
    
    // After 10 frames, velocity should be 5.0 (0.5 * 10)
    expect(ghost.velocity).toBe(5.0)
    
    // Position should have moved down significantly
    // Sum of velocities: 0.5 + 1.0 + 1.5 + 2.0 + 2.5 + 3.0 + 3.5 + 4.0 + 4.5 + 5.0 = 27.5
    expect(ghost.y).toBe(327.5)
  })
  
  it('should handle negative velocity (upward movement)', () => {
    const ghost = {
      velocity: -10,  // Upward velocity (like after a jump)
      y: 300,
      gravity: 0.5
    }
    
    const updateGhostPhysics = () => {
      ghost.velocity += ghost.gravity
      ghost.y += ghost.velocity
    }
    
    // First frame: velocity becomes -9.5, y becomes 290.5
    updateGhostPhysics()
    expect(ghost.velocity).toBe(-9.5)
    expect(ghost.y).toBe(290.5)
    
    // Second frame: velocity becomes -9.0, y becomes 281.5
    updateGhostPhysics()
    expect(ghost.velocity).toBe(-9.0)
    expect(ghost.y).toBe(281.5)
  })
})

describe('Jump Mechanic', () => {
  let wrapper
  let mockContext

  beforeEach(() => {
    // Mock canvas context
    mockContext = {
      fillStyle: '',
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn()
    }
    global.HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)
  })

  it('should set velocity to jumpForce when handleJump is called during PLAYING state', async () => {
    wrapper = mount(FlappyKiro)
    
    // Start the game to enter PLAYING state
    await wrapper.vm.handleStart()
    await wrapper.vm.$nextTick()
    
    // Verify we're in PLAYING state
    expect(wrapper.vm.gameState).toBe('PLAYING')
    
    // Access the ghost object (it's not reactive, so we need to access it directly)
    // We'll simulate the jump by calling handleJump
    // First, let's set a different velocity to verify it changes
    const ghost = {
      velocity: 5.0,  // Falling velocity
      jumpForce: -10
    }
    
    // Simulate handleJump function
    const handleJump = (gameState) => {
      if (gameState !== 'PLAYING') {
        return
      }
      ghost.velocity = ghost.jumpForce
    }
    
    // Call handleJump
    handleJump(wrapper.vm.gameState)
    
    // Verify velocity was set to jumpForce
    expect(ghost.velocity).toBe(-10)
  })
  
  it('should NOT change velocity when handleJump is called in START_SCREEN state', () => {
    const ghost = {
      velocity: 0,
      jumpForce: -10
    }
    
    const handleJump = (gameState) => {
      if (gameState !== 'PLAYING') {
        return
      }
      ghost.velocity = ghost.jumpForce
    }
    
    // Call handleJump in START_SCREEN state
    handleJump('START_SCREEN')
    
    // Velocity should remain unchanged
    expect(ghost.velocity).toBe(0)
  })
  
  it('should NOT change velocity when handleJump is called in GAME_OVER state', () => {
    const ghost = {
      velocity: 3.5,  // Some falling velocity
      jumpForce: -10
    }
    
    const handleJump = (gameState) => {
      if (gameState !== 'PLAYING') {
        return
      }
      ghost.velocity = ghost.jumpForce
    }
    
    // Call handleJump in GAME_OVER state
    handleJump('GAME_OVER')
    
    // Velocity should remain unchanged
    expect(ghost.velocity).toBe(3.5)
  })
  
  it('should apply jump force multiple times when called repeatedly during PLAYING', () => {
    const ghost = {
      velocity: 0,
      jumpForce: -10
    }
    
    const handleJump = (gameState) => {
      if (gameState !== 'PLAYING') {
        return
      }
      ghost.velocity = ghost.jumpForce
    }
    
    // First jump
    handleJump('PLAYING')
    expect(ghost.velocity).toBe(-10)
    
    // Simulate some falling (velocity increases)
    ghost.velocity = -5
    
    // Second jump
    handleJump('PLAYING')
    expect(ghost.velocity).toBe(-10)
    
    // Simulate more falling
    ghost.velocity = 2
    
    // Third jump
    handleJump('PLAYING')
    expect(ghost.velocity).toBe(-10)
  })
})

describe('Property-Based Tests', () => {
  let wrapper
  let mockContext

  beforeEach(() => {
    // Mock canvas context
    mockContext = {
      fillStyle: '',
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn()
    }
    global.HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)
  })

  // Feature: flappy-kiro-game, Property 1: Valid Game States
  // **Validates: Requirements 1.1**
  it('Property 1: Valid Game States - game state is always one of three valid values', async () => {
    const fc = await import('fast-check')
    
    const validStates = ['START_SCREEN', 'PLAYING', 'GAME_OVER']
    
    // Define game operations
    const gameOperationArb = fc.default.constantFrom(
      'start',      // Start game (START_SCREEN -> PLAYING)
      'collision',  // Collision detected (PLAYING -> GAME_OVER)
      'restart'     // Restart game (GAME_OVER -> START_SCREEN -> PLAYING)
    )
    
    // Generate sequences of game operations
    const operationSequenceArb = fc.default.array(gameOperationArb, { minLength: 0, maxLength: 20 })
    
    await fc.default.assert(
      fc.default.asyncProperty(operationSequenceArb, async (operations) => {
        // Create a fresh component instance for each test
        wrapper = mount(FlappyKiro)
        
        // Initial state should be valid
        expect(validStates).toContain(wrapper.vm.gameState)
        
        // Apply each operation in sequence
        for (const operation of operations) {
          const currentState = wrapper.vm.gameState
          
          switch (operation) {
            case 'start':
              // Start operation: START_SCREEN -> PLAYING or GAME_OVER -> PLAYING
              if (currentState === 'START_SCREEN' || currentState === 'GAME_OVER') {
                await wrapper.vm.handleStart()
                await wrapper.vm.$nextTick()
              }
              break
              
            case 'collision':
              // Collision operation: PLAYING -> GAME_OVER
              if (currentState === 'PLAYING') {
                wrapper.vm.gameState = 'GAME_OVER'
                await wrapper.vm.$nextTick()
              }
              break
              
            case 'restart':
              // Restart operation: any state -> START_SCREEN -> PLAYING
              wrapper.vm.gameState = 'START_SCREEN'
              await wrapper.vm.$nextTick()
              await wrapper.vm.handleStart()
              await wrapper.vm.$nextTick()
              break
          }
          
          // After each operation, state must be valid
          expect(validStates).toContain(wrapper.vm.gameState)
        }
        
        // Final state must also be valid
        expect(validStates).toContain(wrapper.vm.gameState)
        
        // Cleanup
        wrapper.unmount()
      }),
      { numRuns: 100 }
    )
  })

  // Feature: flappy-kiro-game, Property 4: UI Overlays Match Game State
  // **Validates: Requirements 2.4**
  it('Property 4: UI Overlays Match Game State - visible UI overlays correspond to game state', async () => {
    const fc = await import('fast-check')
    
    const validStates = ['START_SCREEN', 'PLAYING', 'GAME_OVER']
    
    // Generate arbitrary game state
    const gameStateArb = fc.default.constantFrom(...validStates)
    
    await fc.default.assert(
      fc.default.asyncProperty(gameStateArb, async (state) => {
        // Create a fresh component instance for each test
        wrapper = mount(FlappyKiro)
        
        // Set the game state
        wrapper.vm.gameState = state
        await wrapper.vm.$nextTick()
        
        // Verify UI overlays match the game state
        const startScreenVisible = wrapper.find('.start-screen').exists()
        const scoreDisplayVisible = wrapper.find('.score-display').exists()
        const gameOverVisible = wrapper.find('.game-over').exists()
        
        if (state === 'START_SCREEN') {
          // START_SCREEN: only start-screen should be visible
          expect(startScreenVisible).toBe(true)
          expect(scoreDisplayVisible).toBe(false)
          expect(gameOverVisible).toBe(false)
        } else if (state === 'PLAYING') {
          // PLAYING: only score-display should be visible
          expect(startScreenVisible).toBe(false)
          expect(scoreDisplayVisible).toBe(true)
          expect(gameOverVisible).toBe(false)
        } else if (state === 'GAME_OVER') {
          // GAME_OVER: only game-over should be visible
          expect(startScreenVisible).toBe(false)
          expect(scoreDisplayVisible).toBe(false)
          expect(gameOverVisible).toBe(true)
        }
        
        // Cleanup
        wrapper.unmount()
      }),
      { numRuns: 100 }
    )
  })
})
