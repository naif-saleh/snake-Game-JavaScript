import React, { useState, useEffect, useRef, useCallback } from 'react';
import SnakeCanvas from './components/SnakeCanvas';
import GameHUD from './components/GameHUD';
import ControlsOverlay from './components/ControlsOverlay';
import GameOverModal from './components/GameOverModal';
import StartScreenModal from './components/StartScreenModal';
import StageSelectModal from './components/StageSelectModal';
import StageClearModal from './components/StageClearModal';
import SettingsModal from './components/SettingsModal';
import { sound } from './utils/audio';
import { STAGES } from './data/stages';
import { Play } from 'lucide-react';

const GRID_SIZE = 20;

// Re-tuned comfortable speeds (ms per tick)
const DIFFICULTY_MAP = {
  casual: 280,
  normal: 210,
  turbo: 155,
  insane: 110,
};

export default function App() {
  // Mode & Stage State
  const [gameMode, setGameMode] = useState(() => localStorage.getItem('snake_game_mode') || 'stages');
  const [unlockedStage, setUnlockedStage] = useState(() => {
    return parseInt(localStorage.getItem('snake_unlocked_stage') || '1', 10);
  });
  const [currentStageId, setCurrentStageId] = useState(() => {
    return parseInt(localStorage.getItem('snake_current_stage') || '1', 10);
  });
  const [stageProgress, setStageProgress] = useState(0);
  const [stageTimeRemaining, setStageTimeRemaining] = useState(null);
  const [isStageClear, setIsStageClear] = useState(false);
  const [isStageSelectOpen, setIsStageSelectOpen] = useState(false);

  // Active Stage object
  const currentStage = STAGES.find(s => s.id === currentStageId) || STAGES[0];

  // Game Configuration & Customization
  const [skin, setSkin] = useState(() => localStorage.getItem('snake_skin') || 'cyber');
  const [foodTheme, setFoodTheme] = useState(() => localStorage.getItem('snake_food_theme') || 'apple');
  const [cameraMode, setCameraMode] = useState(() => localStorage.getItem('snake_camera') || 'isometric');
  const [difficulty, setDifficulty] = useState(() => localStorage.getItem('snake_difficulty') || 'normal');
  const [wallMode, setWallMode] = useState(() => localStorage.getItem('snake_wall_mode') || 'solid');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // Flow State
  const [hasGameEverStarted, setHasGameEverStarted] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Snake & Items State (Guaranteed safe runway: y=15,16,17 facing UP)
  const initialSnake = [
    [10, 15],
    [10, 16],
    [10, 17],
  ];
  const [snakeBody, setSnakeBody] = useState(initialSnake);
  const [prevSnakeBody, setPrevSnakeBody] = useState(initialSnake);
  const [direction, setDirection] = useState({ x: 0, y: -1 });
  const [food, setFood] = useState({ x: 10, y: 8, type: 'apple' });

  // Score & Metrics
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snake_high_score') || '0', 10);
  });
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [foodEaten, setFoodEaten] = useState(0);
  const [timeSurvivedSec, setTimeSurvivedSec] = useState(0);
  const [eatTrigger, setEatTrigger] = useState(0);
  const [lastTickTimestamp, setLastTickTimestamp] = useState(() => performance.now());

  // References for Loop & Direct Directional Buffering
  const dirRef = useRef(direction);
  const nextDirRef = useRef(direction);
  const snakeRef = useRef(snakeBody);
  const foodRef = useRef(food);
  const lastTickTimeRef = useRef(performance.now());
  const comboTimerRef = useRef(null);
  const movesSinceStartRef = useRef(0);

  // Sync refs
  useEffect(() => { dirRef.current = direction; }, [direction]);
  useEffect(() => { snakeRef.current = snakeBody; }, [snakeBody]);
  useEffect(() => { foodRef.current = food; }, [food]);

  // Audio settings
  useEffect(() => {
    sound.setMuted(isMuted);
    sound.setVolume(volume);
  }, [isMuted, volume]);

  // Save Settings to LocalStorage
  useEffect(() => { localStorage.setItem('snake_game_mode', gameMode); }, [gameMode]);
  useEffect(() => { localStorage.setItem('snake_unlocked_stage', unlockedStage.toString()); }, [unlockedStage]);
  useEffect(() => { localStorage.setItem('snake_current_stage', currentStageId.toString()); }, [currentStageId]);
  useEffect(() => { localStorage.setItem('snake_skin', skin); }, [skin]);
  useEffect(() => { localStorage.setItem('snake_food_theme', foodTheme); }, [foodTheme]);
  useEffect(() => { localStorage.setItem('snake_camera', cameraMode); }, [cameraMode]);
  useEffect(() => { localStorage.setItem('snake_difficulty', difficulty); }, [difficulty]);
  useEffect(() => { localStorage.setItem('snake_wall_mode', wallMode); }, [wallMode]);

  // Get active obstacles for current stage
  const activeObstacles = gameMode === 'stages' ? (currentStage.obstacles || []) : [];

  // Generate Food that doesn't collide with snake or obstacles
  const createFood = useCallback((currentSnake, theme, obstaclesList = []) => {
    let newX, newY;
    let collision = true;
    let attempts = 0;
    while (collision && attempts < 200) {
      attempts++;
      newX = Math.floor(Math.random() * GRID_SIZE);
      newY = Math.floor(Math.random() * GRID_SIZE);

      const onSnake = currentSnake.some(([sx, sy]) => sx === newX && sy === newY);
      const onObstacle = obstaclesList.some(([ox, oy]) => ox === newX && oy === newY);
      collision = onSnake || onObstacle;
    }

    let type = theme;
    if (theme === 'random') {
      const types = ['apple', 'golden', 'virus', 'palestine'];
      const rand = Math.random();
      if (rand < 0.25) type = 'golden';
      else if (rand < 0.5) type = 'virus';
      else if (rand < 0.75) type = 'palestine';
      else type = 'apple';
    } else if (Math.random() < 0.15) {
      type = 'golden';
    }

    return { x: newX, y: newY, type };
  }, []);

  // Initialize/Reset Stage
  const setupStage = useCallback((stId) => {
    const st = STAGES.find(s => s.id === stId) || STAGES[0];
    setCurrentStageId(stId);
    setStageProgress(0);
    setStageTimeRemaining(st.timeLimit);
    setIsStageClear(false);

    // Apply stage theme/skin if in stages mode
    setSkin(st.skin);
    setFoodTheme(st.foodTheme);

    const freshSnake = [
      [10, 15],
      [10, 16],
      [10, 17],
    ];
    setSnakeBody(freshSnake);
    setPrevSnakeBody(freshSnake);
    setDirection({ x: 0, y: -1 });
    dirRef.current = { x: 0, y: -1 };
    nextDirRef.current = { x: 0, y: -1 };

    const newF = createFood(freshSnake, st.foodTheme, st.obstacles || []);
    setFood(newF);
    foodRef.current = newF;

    setTimeSurvivedSec(0);
    setIsGameOver(false);
    setIsPaused(false);
    setIsStarted(false); // Does NOT auto-run: waits for player directional input!
    movesSinceStartRef.current = 0;
    const now = performance.now();
    lastTickTimeRef.current = now;
    setLastTickTimestamp(now);
  }, [createFood]);

  // Start the game
  const startGame = useCallback((initialDir = null) => {
    sound.init();
    if (initialDir) {
      setDirection(initialDir);
      dirRef.current = initialDir;
      nextDirRef.current = initialDir;
    }
    movesSinceStartRef.current = 0;
    setHasGameEverStarted(true);
    setIsStarted(true);
    setIsGameOver(false);
    setIsPaused(false);
    const now = performance.now();
    lastTickTimeRef.current = now;
    setLastTickTimestamp(now);
  }, []);

  // Change Direction
  const changeDirection = useCallback((newDir) => {
    if (isGameOver || isPaused || isStageClear) return;

    if (!isStarted) {
      // First input starts the game in the chosen direction!
      // Prevent reversing into own neck on initial stationary state (facing UP, cannot go DOWN)
      const current = dirRef.current;
      if (newDir.y !== 0 && current.y !== 0 && newDir.y === -current.y) return;

      startGame(newDir);
      sound.playTurn();
      return;
    }

    const current = dirRef.current;
    if (newDir.x !== 0 && current.x !== 0) return;
    if (newDir.y !== 0 && current.y !== 0) return;

    nextDirRef.current = newDir;
    sound.playTurn();
  }, [isStarted, isGameOver, isPaused, isStageClear, startGame]);

  // Handle Game Over
  const triggerGameOver = useCallback(() => {
    setIsGameOver(true);
    sound.playGameOver();
  }, []);

  // Restart Current Game / Stage
  const restartGame = useCallback(() => {
    if (gameMode === 'stages') {
      setupStage(currentStageId);
    } else {
      const freshSnake = [
        [10, 15],
        [10, 16],
        [10, 17],
      ];
      setSnakeBody(freshSnake);
      setPrevSnakeBody(freshSnake);
      setDirection({ x: 0, y: -1 });
      dirRef.current = { x: 0, y: -1 };
      nextDirRef.current = { x: 0, y: -1 };

      const newF = createFood(freshSnake, foodTheme, []);
      setFood(newF);
      foodRef.current = newF;

      setScore(0);
      setCombo(1);
      setMaxCombo(1);
      setFoodEaten(0);
      setTimeSurvivedSec(0);
      setIsGameOver(false);
      setIsPaused(false);
      movesSinceStartRef.current = 0;
      const now = performance.now();
      lastTickTimeRef.current = now;
      setLastTickTimestamp(now);
    }
    setIsStarted(false); // Wait for player input!
  }, [gameMode, currentStageId, setupStage, createFood, foodTheme]);

  // Core Game Tick
  const executeTick = useCallback(() => {
    if (!isStarted || isGameOver || isPaused || isStageClear) return;

    movesSinceStartRef.current += 1;

    const currentSnake = snakeRef.current;
    const currentFood = foodRef.current;
    const newDir = nextDirRef.current;
    setDirection(newDir);
    dirRef.current = newDir;

    const head = currentSnake[0];
    let nextHeadX = head[0] + newDir.x;
    let nextHeadY = head[1] + newDir.y;

    // Wall Handling
    if (wallMode === 'solid') {
      if (nextHeadX < 0 || nextHeadX >= GRID_SIZE || nextHeadY < 0 || nextHeadY >= GRID_SIZE) {
        triggerGameOver();
        return;
      }
    } else {
      nextHeadX = (nextHeadX + GRID_SIZE) % GRID_SIZE;
      nextHeadY = (nextHeadY + GRID_SIZE) % GRID_SIZE;
    }

    // Obstacle Collision Handling (in stages mode) with Spawn Shield
    if (activeObstacles.some(([ox, oy]) => ox === nextHeadX && oy === nextHeadY)) {
      if (movesSinceStartRef.current <= 2) {
        // Safe spawn protection: ignore obstacle collision during first 2 moves
        return;
      }
      triggerGameOver();
      return;
    }

    // Tail Collision
    const hitSelf = currentSnake.slice(0, -1).some(([sx, sy]) => sx === nextHeadX && sy === nextHeadY);
    if (hitSelf) {
      triggerGameOver();
      return;
    }

    // Save previous for 60fps interpolation
    setPrevSnakeBody(currentSnake);
    const tickNow = performance.now();
    lastTickTimeRef.current = tickNow;
    setLastTickTimestamp(tickNow);

    const newHead = [nextHeadX, nextHeadY];
    const ateFood = (nextHeadX === currentFood.x && nextHeadY === currentFood.y);

    if (ateFood) {
      const isGold = currentFood.type === 'golden';
      const pts = (isGold ? 30 : 10) * combo;
      const newScore = score + pts;

      setScore(newScore);
      setFoodEaten(prev => prev + 1);

      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('snake_high_score', newScore.toString());
      }

      // Audio & Particle FX
      if (isGold) sound.playSpecial();
      else sound.playEat(combo);
      setEatTrigger(prev => prev + 1);

      // Check Stage Completion
      if (gameMode === 'stages') {
        const nextProgress = stageProgress + 1;
        setStageProgress(nextProgress);

        if (nextProgress >= currentStage.targetCores) {
          // STAGE CLEAR!
          sound.playLevelComplete();
          setIsStageClear(true);

          const nextUnlock = Math.max(unlockedStage, currentStageId + 1);
          setUnlockedStage(nextUnlock);
          localStorage.setItem('snake_unlocked_stage', nextUnlock.toString());
          return;
        }
      }

      // Combo handling
      setCombo(prev => {
        const nextC = prev + 1;
        if (nextC > maxCombo) setMaxCombo(nextC);
        return nextC;
      });

      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => {
        setCombo(1);
      }, 4500);

      // Grow snake
      const updatedSnake = [newHead, ...currentSnake];
      setSnakeBody(updatedSnake);
      snakeRef.current = updatedSnake;

      // Spawn next food
      const newF = createFood(updatedSnake, foodTheme, activeObstacles);
      setFood(newF);
      foodRef.current = newF;

    } else {
      // Normal move
      const updatedSnake = [newHead, ...currentSnake.slice(0, -1)];
      setSnakeBody(updatedSnake);
      snakeRef.current = updatedSnake;
    }
  }, [
    isStarted,
    isGameOver,
    isPaused,
    isStageClear,
    wallMode,
    activeObstacles,
    gameMode,
    stageProgress,
    currentStage,
    currentStageId,
    unlockedStage,
    combo,
    score,
    highScore,
    maxCombo,
    createFood,
    foodTheme,
    triggerGameOver
  ]);

  // Speed calculation
  const baseInterval = gameMode === 'stages'
    ? (currentStage.speedInterval || 200)
    : (DIFFICULTY_MAP[difficulty] || 210);

  const speedAcceleration = Math.min(foodEaten * 0.75, 30);
  const currentInterval = Math.max(90, baseInterval - speedAcceleration);
  const speedLevel = Math.min(10, Math.floor(foodEaten / 4) + 1);

  // RAF Smooth Motion Loop
  useEffect(() => {
    let animId;
    lastTickTimeRef.current = performance.now();

    const loop = (timestamp) => {
      if (isStarted && !isGameOver && !isPaused && !isStageClear) {
        const elapsed = timestamp - lastTickTimeRef.current;
        if (elapsed >= currentInterval) {
          executeTick();
          lastTickTimeRef.current = timestamp;
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isStarted, executeTick, currentInterval, isGameOver, isPaused, isStageClear]);

  // Stage Countdown Timer & Time Survived Counter
  useEffect(() => {
    if (!isStarted || isGameOver || isPaused || isStageClear) return;

    const interval = setInterval(() => {
      setTimeSurvivedSec(s => s + 1);

      // Countdown for timed stages
      if (gameMode === 'stages' && stageTimeRemaining !== null) {
        setStageTimeRemaining(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            triggerGameOver();
            return 0;
          }
          if (prev <= 6) {
            sound.playWarning();
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isStarted, isGameOver, isPaused, isStageClear, gameMode, stageTimeRemaining, triggerGameOver]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isStarted) {
        if (e.key === ' ' || e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          startGame();
          return;
        }
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPaused(p => !p);
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        restartGame();
        return;
      }
      if (e.key === 'c' || e.key === 'C') {
        cycleCamera();
        return;
      }
      if (e.key === 'm' || e.key === 'M') {
        setIsMuted(m => !m);
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, startGame, changeDirection, restartGame]);

  // Touch Swipe Controls with Haptic Feedback & Scroll Prevention
  const touchStartRef = useRef(null);
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e) => {
    if (e.cancelable) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 25) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(10); } catch (err) {}
      }
      if (!isStarted) {
        startGame();
      }
      if (absX > absY) {
        changeDirection(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
      } else {
        changeDirection(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
      }
    }
    touchStartRef.current = null;
  };

  // Cycle Camera Mode
  const cycleCamera = () => {
    const modes = ['isometric', 'perspective', 'chase', 'topdown'];
    setCameraMode(prev => {
      const idx = modes.indexOf(prev);
      return modes[(idx + 1) % modes.length];
    });
  };

  return (
    <div
      className="game-viewport"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D WebGL Canvas Engine */}
      <SnakeCanvas
        gridSize={GRID_SIZE}
        snakeBody={snakeBody}
        prevSnakeBody={prevSnakeBody}
        lastTickTime={lastTickTimestamp}
        tickInterval={currentInterval}
        direction={direction}
        food={food}
        obstacles={activeObstacles}
        obstacleColor={currentStage.themeColor ? parseInt(currentStage.themeColor.replace('#', '0x')) : 0xff0055}
        cameraMode={cameraMode}
        skin={skin}
        foodTheme={foodTheme}
        isGameOver={isGameOver}
        isPaused={isPaused}
        isStarted={isStarted}
        onEatParticleTrigger={eatTrigger}
      />

      {/* Futuristic Game HUD with Stage Progress & Timer */}
      <GameHUD
        score={score}
        highScore={highScore}
        length={snakeBody.length}
        combo={combo}
        speedLevel={speedLevel}
        isPaused={isPaused}
        isMuted={isMuted}
        cameraMode={cameraMode}
        gameMode={gameMode}
        stage={currentStage}
        stageProgress={stageProgress}
        stageTimeRemaining={stageTimeRemaining}
        onTogglePause={() => setIsPaused(p => !p)}
        onToggleMute={() => setIsMuted(m => !m)}
        onCycleCamera={cycleCamera}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStageSelect={() => setIsStageSelectOpen(true)}
        onRestart={restartGame}
      />

      {/* Mobile Touch D-Pad & Desktop Keyboard Guidance */}
      <ControlsOverlay onDirectionChange={changeDirection} />

      {/* Start Screen Overlay (Initial Visit) */}
      {!hasGameEverStarted && !isGameOver && !isStageClear && (
        <StartScreenModal
          onStart={() => {
            setHasGameEverStarted(true);
            startGame();
          }}
          gameMode={gameMode}
          setGameMode={setGameMode}
          currentStageId={currentStageId}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          onOpenStageSelect={() => setIsStageSelectOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* In-Game Ready & Directional Start Prompt (After restarts, next stage, or stage pick) */}
      {hasGameEverStarted && !isStarted && !isGameOver && !isStageClear && !isStageSelectOpen && !isSettingsOpen && (
        <div className="ready-start-overlay">
          <div className="ready-start-card">
            <div
              className="ready-stage-badge"
              style={{ borderColor: currentStage.themeColor || 'var(--primary-cyan)' }}
            >
              <span className="pulse-dot" />
              <span>{gameMode === 'stages' ? `المرحلة ${currentStage.id}: ${currentStage.titleAr}` : 'الطور المفتوح (ENDLESS)'}</span>
            </div>

            <div className="ready-instruction">
              جاهز؟ اضغط أي اتجاه للتحرك
            </div>

            <button className="ready-action-btn" onClick={() => startGame()}>
              <Play size={18} fill="currentColor" />
              <span>انطلق الآن (START)</span>
            </button>

            <div className="ready-keys-hint">
              <span>🎮 الأسهم / WASD</span>
              <span>•</span>
              <span>📱 اسحب أو أزرار التحكم</span>
            </div>
          </div>
        </div>
      )}

      {/* Stage Clear Modal */}
      {isStageClear && (
        <StageClearModal
          stageId={currentStageId}
          score={score}
          timeSec={timeSurvivedSec}
          onNextStage={() => {
            const nextId = currentStageId + 1;
            setupStage(nextId);
          }}
          onReplay={() => {
            setupStage(currentStageId);
          }}
          onOpenStageSelect={() => {
            setIsStageClear(false);
            setIsStageSelectOpen(true);
          }}
        />
      )}

      {/* Stage Select Modal */}
      <StageSelectModal
        isOpen={isStageSelectOpen}
        onClose={() => setIsStageSelectOpen(false)}
        unlockedStage={unlockedStage}
        currentStageId={currentStageId}
        gameMode={gameMode}
        onSelectStage={(id) => {
          setGameMode('stages');
          setupStage(id);
          setIsStageSelectOpen(false);
        }}
        onSelectEndless={() => {
          setGameMode('endless');
          setIsStageSelectOpen(false);
          restartGame();
        }}
      />

      {/* Game Over Screen */}
      {isGameOver && (
        <GameOverModal
          score={score}
          highScore={highScore}
          isNewHigh={score > 0 && score >= highScore}
          length={snakeBody.length}
          foodEaten={foodEaten}
          maxCombo={maxCombo}
          timeSurvivedSec={timeSurvivedSec}
          onRestart={restartGame}
          onOpenSettings={() => {
            setIsGameOver(false);
            setIsSettingsOpen(true);
          }}
        />
      )}

      {/* Settings & Customization Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        skin={skin}
        setSkin={setSkin}
        foodTheme={foodTheme}
        setFoodTheme={setFoodTheme}
        cameraMode={cameraMode}
        setCameraMode={setCameraMode}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        wallMode={wallMode}
        setWallMode={setWallMode}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        volume={volume}
        setVolume={setVolume}
      />
    </div>
  );
}
