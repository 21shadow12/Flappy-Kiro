# Requirements Document: Flappy Kiro Game

## Introduction

Flappy Kiro is a browser-based 2D endless scroller game inspired by Flappy Bird. The game features a ghost character that the player controls by making it jump to avoid obstacles (pipes). The game is built using Vue.js 3 with Composition API for state management and HTML5 Canvas for high-performance rendering. The architecture separates reactive UI state from non-reactive game logic to ensure smooth 60 FPS performance.

## Glossary

- **Game_System**: The complete Flappy Kiro game application
- **Ghost**: The player-controlled character that moves through the game world
- **Pipe**: An obstacle consisting of top and bottom segments with a gap between them
- **Canvas**: The HTML5 Canvas element used for rendering game graphics
- **Game_Loop**: The requestAnimationFrame-based loop that updates and renders the game at 60 FPS
- **Vue_State**: Reactive Vue.js state variables (refs) for UI management
- **Game_State**: Non-reactive JavaScript objects managing game entities and physics
- **AABB**: Axis-Aligned Bounding Box collision detection algorithm
- **Config_Object**: Non-reactive configuration object containing game parameters

## Requirements

### Requirement 1: Game State Management

**User Story:** As a player, I want the game to have clear states (start, playing, game over), so that I understand what actions are available at each point.

#### Acceptance Criteria

1. THE Game_System SHALL maintain three distinct game states: START_SCREEN, PLAYING, and GAME_OVER
2. WHEN the game initializes, THE Game_System SHALL set the state to START_SCREEN
3. WHEN the player starts the game, THE Game_System SHALL transition from START_SCREEN to PLAYING
4. WHEN a collision occurs, THE Game_System SHALL transition from PLAYING to GAME_OVER
5. THE Game_System SHALL use Vue refs for game state to enable reactive UI updates

### Requirement 2: Vue Component Architecture

**User Story:** As a developer, I want a Single File Component structure, so that the game is easy to understand and modify.

#### Acceptance Criteria

1. THE Game_System SHALL be implemented as a Vue 3 Single File Component using Composition API with script setup syntax
2. THE Game_System SHALL include a canvas element with a template ref named "gameCanvas"
3. THE Game_System SHALL use Vue's onMounted lifecycle hook to initialize the Game_Loop
4. THE Game_System SHALL use v-if or v-show directives to conditionally render UI overlays based on game state
5. THE Game_System SHALL maintain a reactive score variable using Vue refs

### Requirement 3: High-Performance Rendering

**User Story:** As a player, I want smooth gameplay at 60 FPS, so that the game feels responsive and professional.

#### Acceptance Criteria

1. THE Game_System SHALL use HTML5 Canvas for all game entity rendering
2. THE Game_System SHALL implement the Game_Loop using requestAnimationFrame
3. THE Game_System SHALL maintain game entities and physics logic outside of Vue's reactive system
4. WHEN the game state is PLAYING, THE Game_Loop SHALL execute at approximately 60 frames per second
5. WHEN the game state is GAME_OVER or START_SCREEN, THE Game_Loop SHALL pause or stop

### Requirement 4: Ghost Character Physics

**User Story:** As a player, I want to control a ghost character that responds to gravity and my input, so that I can navigate through obstacles.

#### Acceptance Criteria

1. THE Ghost SHALL have properties for x position, y position, width, height, velocity, and gravity
2. WHILE the game state is PLAYING, THE Ghost SHALL experience constant downward acceleration due to gravity
3. WHEN the player presses the Spacebar or clicks the Canvas, THE Ghost SHALL apply an upward velocity (jump)
4. THE Ghost SHALL update its y position based on its current velocity each frame
5. THE Ghost SHALL be rendered as a solid color rectangle with dimensions defined in its properties
6. THE Ghost SHALL include placeholder comments indicating where sprite images should be integrated

### Requirement 5: Infinite Pipe Generation

**User Story:** As a player, I want continuously generated obstacles, so that the game provides an endless challenge.

#### Acceptance Criteria

1. THE Game_System SHALL generate Pipe pairs that move from right to left across the Canvas
2. WHEN a Pipe exits the left edge of the Canvas, THE Game_System SHALL remove it from memory
3. THE Game_System SHALL generate new Pipe pairs at regular intervals to maintain continuous obstacles
4. THE Pipe SHALL consist of a top segment and bottom segment with a vertical gap between them
5. THE Pipe gap position SHALL be randomly determined within valid bounds for each generated pair
6. THE Pipe SHALL have properties for x position, width, gap position, and gap height
7. THE Pipe SHALL be rendered as solid color rectangles with dimensions defined in its properties
8. THE Pipe SHALL include placeholder comments indicating where sprite images should be integrated

### Requirement 6: Collision Detection System

**User Story:** As a player, I want the game to detect when I hit obstacles or boundaries, so that the game ends fairly.

#### Acceptance Criteria

1. THE Game_System SHALL implement AABB collision detection between the Ghost and all Pipes
2. WHEN the Ghost collides with any Pipe, THE Game_System SHALL transition to GAME_OVER state
3. WHEN the Ghost collides with the Canvas ceiling (y <= 0), THE Game_System SHALL transition to GAME_OVER state
4. WHEN the Ghost collides with the Canvas floor (y + height >= canvas.height), THE Game_System SHALL transition to GAME_OVER state
5. THE Game_System SHALL check for collisions every frame during the PLAYING state

### Requirement 7: Score Tracking

**User Story:** As a player, I want to see my score increase as I pass obstacles, so that I can track my progress and compete with myself.

#### Acceptance Criteria

1. THE Game_System SHALL maintain a reactive score variable initialized to zero
2. WHEN the Ghost successfully passes a Pipe pair, THE Game_System SHALL increment the score by one
3. THE Game_System SHALL display the current score as a UI overlay on top of the Canvas
4. WHEN the game transitions to START_SCREEN, THE Game_System SHALL reset the score to zero
5. WHEN the game transitions to GAME_OVER, THE Game_System SHALL display the final score

### Requirement 8: User Interface Overlays

**User Story:** As a player, I want clear visual feedback for game states and controls, so that I know how to interact with the game.

#### Acceptance Criteria

1. WHEN the game state is START_SCREEN, THE Game_System SHALL display a Start button overlay
2. WHEN the game state is PLAYING, THE Game_System SHALL display only the score overlay
3. WHEN the game state is GAME_OVER, THE Game_System SHALL display a Game Over screen with the final score
4. THE Game_System SHALL use CSS3 for styling and absolute positioning of UI overlays
5. THE Game_System SHALL layer UI overlays on top of the Canvas element

### Requirement 9: Configuration System

**User Story:** As a developer, I want easily adjustable game parameters, so that I can quickly tune gameplay during the hackathon.

#### Acceptance Criteria

1. THE Game_System SHALL define a non-reactive Config_Object outside of Vue_State
2. THE Config_Object SHALL include parameters for gravity, jumpForce, pipeSpeed, and pipeGap
3. THE Game_System SHALL reference Config_Object values for all physics and gameplay calculations
4. THE Config_Object SHALL be defined with const to prevent reassignment
5. THE Config_Object properties SHALL be modifiable for gameplay tuning

### Requirement 10: Code Documentation and Asset Integration

**User Story:** As a developer, I want well-documented code with clear asset integration points, so that I can quickly add sprites and sounds.

#### Acceptance Criteria

1. THE Game_System SHALL include comments explaining each major section of code
2. THE Game_System SHALL include TODO comments at every location where fillRect should be replaced with drawImage
3. THE Game_System SHALL include comments indicating the expected dimensions and format for sprite assets
4. THE Game_System SHALL structure rendering code to easily swap between placeholder rectangles and image assets
5. THE Game_System SHALL include comments explaining the physics calculations and collision detection logic

### Requirement 11: Input Handling

**User Story:** As a player, I want multiple ways to make the ghost jump, so that I can use my preferred input method.

#### Acceptance Criteria

1. WHEN the player presses the Spacebar, THE Game_System SHALL trigger the Ghost jump method
2. WHEN the player clicks on the Canvas, THE Game_System SHALL trigger the Ghost jump method
3. WHEN the game state is not PLAYING, THE Game_System SHALL ignore jump input
4. THE Game_System SHALL prevent default browser behavior for the Spacebar key
5. THE Game_System SHALL add event listeners for keyboard and mouse input in the onMounted hook

### Requirement 12: Game Loop Control

**User Story:** As a developer, I want proper game loop lifecycle management, so that the game doesn't consume resources when not playing.

#### Acceptance Criteria

1. WHEN the game state transitions to GAME_OVER, THE Game_Loop SHALL stop calling requestAnimationFrame
2. WHEN the player starts a new game, THE Game_System SHALL reinitialize the Game_Loop
3. THE Game_System SHALL clear the Canvas before rendering each frame
4. THE Game_System SHALL update all entity positions before rendering each frame
5. THE Game_System SHALL maintain a reference to the animation frame ID for cleanup

### Requirement 13: Responsive Design and Cross-Platform Compatibility

**User Story:** As a player, I want to play the game on both mobile devices and desktop computers, so that I can enjoy the game on my preferred device.

#### Acceptance Criteria

1. THE Game_System SHALL detect the viewport dimensions on initialization and window resize events
2. THE Canvas SHALL scale its dimensions to fit the available viewport while maintaining a consistent aspect ratio
3. WHEN the viewport width is less than the viewport height, THE Game_System SHALL optimize the layout for portrait orientation
4. WHEN the viewport width is greater than or equal to the viewport height, THE Game_System SHALL optimize the layout for landscape orientation
5. THE Game_System SHALL adjust game entity sizes and positions proportionally based on Canvas dimensions
6. THE UI_Overlays SHALL scale text and button sizes responsively using viewport-relative units or dynamic calculations
7. WHEN the window is resized, THE Game_System SHALL recalculate Canvas dimensions and update the Config_Object accordingly
8. THE Game_System SHALL maintain playability with touch input on mobile devices and mouse/keyboard input on desktop devices

