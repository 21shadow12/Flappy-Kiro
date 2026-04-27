# Implementation Plan: Flappy Kiro Game

## Overview

This implementation plan breaks down the Flappy Kiro game into discrete coding tasks. The game will be built as a Vue 3 Single File Component using the Composition API with HTML5 Canvas rendering. The approach prioritizes getting core gameplay working first, then adding polish and responsive features. Each task builds incrementally, with checkpoints to validate progress.

## Tasks

- [x] 1. Set up Vue component structure and canvas initialization
  - Create a Vue 3 SFC with Composition API (`<script setup>`)
  - Add canvas element with template ref
  - Initialize canvas 2D context in onMounted
  - Set up basic component structure with reactive state (gameState, score)
  - Add error handling for canvas context initialization
  - _Requirements: 2.1, 2.2, 2.3, 3.1_

- [x] 1.1 Write unit tests for component initialization
  - Test that component initializes in START_SCREEN state
  - Test that score initializes to 0
  - Test that canvas ref is properly bound
  - _Requirements: 1.2, 2.5_

- [x] 2. Implement game state management and UI overlays
  - [x] 2.1 Create game state enum and reactive state variables
    - Define GameState constants (START_SCREEN, PLAYING, GAME_OVER)
    - Create reactive refs for gameState and score
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [x] 2.2 Implement UI overlay components in template
    - Add Start Screen overlay with Start button
    - Add Playing overlay with score display
    - Add Game Over overlay with final score and Play Again button
    - Use v-if directives to conditionally render based on gameState
    - _Requirements: 8.1, 8.2, 8.3, 8.5_
  
  - [x] 2.3 Add CSS styling for overlays
    - Style overlays with absolute positioning over canvas
    - Add responsive text and button sizing
    - Center overlays on canvas
    - _Requirements: 8.4, 13.6_
  
  - [x] 2.4 Write property test for valid game states
    - **Property 1: Valid Game States**
    - **Validates: Requirements 1.1**
  
  - [x] 2.5 Write property test for UI overlays matching game state
    - **Property 4: UI Overlays Match Game State**
    - **Validates: Requirements 2.4**

- [ ] 3. Implement ghost character and physics
  - [x] 3.1 Create ghost entity object
    - Define non-reactive ghost object with x, y, width, height, velocity, gravity, jumpForce
    - Initialize ghost at starting position
    - _Requirements: 4.1_
  
  - [x] 3.2 Implement gravity and velocity physics
    - Write updateGhostPhysics function to apply gravity and update position
    - Ensure velocity increases by gravity each frame
    - Ensure position updates by velocity each frame
    - _Requirements: 4.2, 4.4_
  
  - [-] 3.3 Implement jump mechanic
    - Write handleJump function to set velocity to jumpForce
    - Only apply jump when gameState is PLAYING
    - _Requirements: 4.3, 11.3_
  
  - [~] 3.4 Implement ghost rendering
    - Write renderGhost function using fillRect for placeholder
    - Add TODO comment for sprite integration
    - _Requirements: 4.5, 4.6, 10.2, 10.3_
  
  - [~] 3.5 Write property test for gravity acceleration
    - **Property 6: Gravity Acceleration**
    - **Validates: Requirements 4.2**
  
  - [~] 3.6 Write property test for jump velocity
    - **Property 7: Jump Applies Upward Velocity**
    - **Validates: Requirements 4.3**
  
  - [~] 3.7 Write property test for position updates
    - **Property 8: Position Updates by Velocity**
    - **Validates: Requirements 4.4**
  
  - [~] 3.8 Write property test for jump ignored when not playing
    - **Property 17: Jump Ignored When Not Playing**
    - **Validates: Requirements 11.3**

- [~] 4. Checkpoint - Verify ghost physics and rendering
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement pipe generation and movement
  - [~] 5.1 Create pipe entity structure
    - Define pipe object structure with x, width, gapY, gapHeight, passed
    - Create pipes array to hold active pipes
    - _Requirements: 5.6_
  
  - [~] 5.2 Implement pipe generation logic
    - Write generatePipe function with random gap positioning
    - Ensure gap position is within valid bounds
    - Add frame counter for interval-based generation
    - _Requirements: 5.3, 5.5_
  
  - [~] 5.3 Implement pipe movement and cleanup
    - Write updatePipes function to move pipes left
    - Remove pipes that exit the left edge
    - Call generatePipe at regular intervals
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [~] 5.4 Implement pipe rendering
    - Write renderPipes function to draw top and bottom pipe segments
    - Use fillRect for placeholder rendering
    - Add TODO comments for sprite integration
    - _Requirements: 5.7, 5.8, 10.2, 10.3_
  
  - [~] 5.5 Write property test for pipes moving left
    - **Property 9: Pipes Move Left**
    - **Validates: Requirements 5.1**
  
  - [~] 5.6 Write property test for pipe removal at boundary
    - **Property 10: Pipe Removal at Boundary**
    - **Validates: Requirements 5.2**
  
  - [~] 5.7 Write property test for pipe generation interval
    - **Property 11: Pipe Generation Interval**
    - **Validates: Requirements 5.3**
  
  - [~] 5.8 Write property test for gap position bounds
    - **Property 12: Gap Position Bounds**
    - **Validates: Requirements 5.5**

- [ ] 6. Implement collision detection system
  - [~] 6.1 Implement AABB collision detection
    - Write checkCollisions function with AABB algorithm
    - Check ghost vs pipes collision
    - Check ghost vs ceiling collision
    - Check ghost vs floor collision
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [~] 6.2 Implement game over logic
    - Write endGame function to transition to GAME_OVER state
    - Call endGame when any collision is detected
    - _Requirements: 1.4, 6.5_
  
  - [~] 6.3 Write property test for AABB collision detection
    - **Property 13: AABB Collision Detection**
    - **Validates: Requirements 6.1**
  
  - [~] 6.4 Write property test for collision causes game over
    - **Property 3: Collision Causes Game Over**
    - **Validates: Requirements 1.4, 6.2, 6.3, 6.4**

- [ ] 7. Implement score tracking
  - [~] 7.1 Implement score increment logic
    - Write updateScore function to check if ghost passed pipes
    - Increment score when ghost.x > pipe.x + pipe.width
    - Mark pipes as passed to prevent double counting
    - _Requirements: 7.2_
  
  - [~] 7.2 Implement score reset on game restart
    - Reset score to 0 when transitioning to START_SCREEN
    - _Requirements: 7.4_
  
  - [~] 7.3 Write property test for score increment on pass
    - **Property 14: Score Increment on Pass**
    - **Validates: Requirements 7.2**
  
  - [~] 7.4 Write property test for score reset on restart
    - **Property 15: Score Reset on Restart**
    - **Validates: Requirements 7.4**

- [ ] 8. Implement game loop and state transitions
  - [~] 8.1 Create game loop with requestAnimationFrame
    - Write gameLoop function with RAF
    - Add frame counter and timestamp tracking
    - Call update functions before render functions
    - Only run loop when gameState is PLAYING
    - _Requirements: 3.2, 3.4, 12.4_
  
  - [~] 8.2 Implement canvas clearing and render order
    - Write clearCanvas function with background color
    - Call render functions in correct order (pipes, ghost)
    - _Requirements: 12.3_
  
  - [~] 8.3 Implement start game function
    - Write handleStart function to initialize game state
    - Reset ghost position and velocity
    - Clear pipes array
    - Reset score
    - Transition to PLAYING state
    - Start game loop
    - _Requirements: 1.3, 12.2_
  
  - [~] 8.4 Implement game loop cleanup
    - Cancel animation frame when game stops
    - Store animation frame ID for cleanup
    - _Requirements: 12.1, 12.5_
  
  - [~] 8.5 Write property test for start transition
    - **Property 2: Start Transition**
    - **Validates: Requirements 1.3**
  
  - [~] 8.6 Write property test for game loop pauses in non-playing states
    - **Property 5: Game Loop Pauses in Non-Playing States**
    - **Validates: Requirements 3.5, 12.1**

- [~] 9. Checkpoint - Verify complete game loop
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement input handling
  - [~] 10.1 Add keyboard event listeners
    - Listen for Spacebar keydown event
    - Call handleJump on Spacebar press
    - Prevent default browser behavior for Spacebar
    - _Requirements: 11.1, 11.4_
  
  - [~] 10.2 Add mouse and touch event listeners
    - Listen for click event on canvas
    - Listen for touchstart event on canvas
    - Call handleJump for both events
    - Prevent default for touch events
    - _Requirements: 11.2, 13.8_
  
  - [~] 10.3 Add event listener cleanup
    - Remove all event listeners in onUnmounted hook
    - _Requirements: 11.5_
  
  - [~] 10.4 Write unit tests for input handling
    - Test Spacebar triggers jump
    - Test click triggers jump
    - Test preventDefault is called
    - _Requirements: 11.1, 11.2, 11.4_

- [ ] 11. Implement configuration system
  - [~] 11.1 Create config object
    - Define non-reactive config object with gravity, jumpForce, pipeSpeed, pipeGap, pipeInterval
    - Add baseWidth, baseHeight, scaleFactor for responsive design
    - _Requirements: 9.1, 9.2_
  
  - [~] 11.2 Use config values in game logic
    - Reference config values in all physics and gameplay calculations
    - _Requirements: 9.3, 9.5_
  
  - [~] 11.3 Write property test for config affects behavior
    - **Property 16: Config Affects Behavior**
    - **Validates: Requirements 9.5**
  
  - [~] 11.4 Write unit tests for config structure
    - Test config object has all required properties
    - Test config values are modifiable
    - _Requirements: 9.1, 9.2, 9.4, 9.5_

- [ ] 12. Implement responsive design and scaling
  - [~] 12.1 Implement viewport detection and canvas sizing
    - Write handleResize function to detect viewport dimensions
    - Calculate canvas dimensions maintaining aspect ratio
    - Optimize for portrait vs landscape orientation
    - Apply minimum canvas dimensions
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [~] 12.2 Implement entity scaling
    - Calculate scale factor based on canvas width
    - Scale ghost dimensions based on scale factor
    - Scale pipe dimensions based on scale factor
    - _Requirements: 13.5_
  
  - [~] 12.3 Add window resize listener
    - Listen for window resize events
    - Call handleResize on resize
    - Update config object with new scale factor
    - _Requirements: 13.7_
  
  - [~] 12.4 Write property test for canvas maintains aspect ratio
    - **Property 18: Canvas Maintains Aspect Ratio**
    - **Validates: Requirements 13.2**
  
  - [~] 12.5 Write property test for entity proportional scaling
    - **Property 19: Entity Proportional Scaling**
    - **Validates: Requirements 13.5**
  
  - [~] 12.6 Write property test for UI responsive scaling
    - **Property 20: UI Responsive Scaling**
    - **Validates: Requirements 13.6**

- [ ] 13. Add code documentation and asset integration comments
  - [~] 13.1 Add comments explaining major code sections
    - Document game loop logic
    - Document physics calculations
    - Document collision detection algorithm
    - _Requirements: 10.1, 10.5_
  
  - [~] 13.2 Add TODO comments for asset integration
    - Mark all fillRect calls that should become drawImage
    - Document expected sprite dimensions and formats
    - Add comments for audio integration points
    - _Requirements: 10.2, 10.3, 10.4_

- [~] 14. Final checkpoint - Complete game validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The design uses JavaScript/Vue.js 3, so all implementation will be in JavaScript
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation of core functionality
- Asset integration (sprites, audio) is prepared with TODO comments but not implemented in this phase
