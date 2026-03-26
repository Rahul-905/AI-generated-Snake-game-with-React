import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 60;

type Point = { x: number; y: number };
type Trail = { x: number; y: number; alpha: number };

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
  isPlayingMusic: boolean;
}

export default function SnakeGame({ onScoreChange, isPlayingMusic }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // React state for rendering UI
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);

  // Mutable refs for game loop to avoid stale closures and React batching issues
  const snakeRef = useRef<Point[]>(INITIAL_SNAKE);
  const directionRef = useRef<Point>(INITIAL_DIRECTION);
  const foodRef = useRef<Point>({ x: 5, y: 5 });
  const scoreRef = useRef(0);
  const isGameOverRef = useRef(false);
  const isPausedRef = useRef(true);
  const trailRef = useRef<Trail[]>([]);
  
  const lastUpdateRef = useRef(0);
  const requestRef = useRef<number>();

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
      };
      const isOnSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const setGameOver = (over: boolean) => {
    isGameOverRef.current = over;
    setIsGameOver(over);
  };

  const setPaused = (paused: boolean) => {
    isPausedRef.current = paused;
    setIsPaused(paused);
  };

  const updateScore = (newScore: number) => {
    scoreRef.current = newScore;
    setScore(newScore);
    onScoreChange(newScore);
  };

  const resetGame = () => {
    snakeRef.current = INITIAL_SNAKE;
    directionRef.current = INITIAL_DIRECTION;
    foodRef.current = generateFood(INITIAL_SNAKE);
    trailRef.current = [];
    setGameOver(false);
    setPaused(false);
    updateScore(0);
  };

  const startGame = () => {
    if (isGameOverRef.current) {
      resetGame();
    } else {
      setPaused(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && !isGameOverRef.current) {
        setPaused(!isPausedRef.current);
        return;
      }

      if (isPausedRef.current || isGameOverRef.current) return;

      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (currentDir.y !== 1) directionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
          if (currentDir.y !== -1) directionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
          if (currentDir.x !== 1) directionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
          if (currentDir.x !== -1) directionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid lines
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    const food = foodRef.current;
    const snake = snakeRef.current;

    // Draw food (Magenta)
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

    // Draw glowing trail
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    trailRef.current.forEach((t) => {
      ctx.fillStyle = `rgba(0, 255, 255, ${t.alpha})`;
      ctx.fillRect(t.x * GRID_SIZE, t.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      if (!isPausedRef.current && !isGameOverRef.current) {
        t.alpha -= 0.02;
      }
    });
    ctx.shadowBlur = 0;
    trailRef.current = trailRef.current.filter((t) => t.alpha > 0);

    // Draw snake (Cyan)
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#ffffff' : '#00ffff';
      ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      
      // Glitch effect on snake body occasionally
      if (Math.random() > 0.95) {
        ctx.fillStyle = Math.random() > 0.5 ? '#ff00ff' : '#00ffff';
        ctx.fillRect(
          segment.x * GRID_SIZE + (Math.random() * 4 - 2), 
          segment.y * GRID_SIZE + (Math.random() * 4 - 2), 
          GRID_SIZE, 
          GRID_SIZE
        );
      }
    });
  }, []);

  const updateGame = useCallback(
    (time: number) => {
      if (isPausedRef.current || isGameOverRef.current) {
        drawGame();
        requestRef.current = requestAnimationFrame(updateGame);
        return;
      }

      const currentSpeed = Math.max(25, INITIAL_SPEED - scoreRef.current * 2);

      if (time - lastUpdateRef.current > currentSpeed) {
        const snake = snakeRef.current;
        if (snake.length > 0) {
          const newHead = {
            x: snake[0].x + directionRef.current.x,
            y: snake[0].y + directionRef.current.y,
          };

          // Check wall collision
          if (
            newHead.x < 0 ||
            newHead.x >= CANVAS_SIZE / GRID_SIZE ||
            newHead.y < 0 ||
            newHead.y >= CANVAS_SIZE / GRID_SIZE
          ) {
            setGameOver(true);
          } else if (snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
            // Check self collision
            setGameOver(true);
          } else {
            const newSnake = [newHead, ...snake];
            const food = foodRef.current;

            if (newHead.x === food.x && newHead.y === food.y) {
              updateScore(scoreRef.current + 10);
              foodRef.current = generateFood(newSnake);
            } else {
              const popped = newSnake.pop();
              if (popped) {
                trailRef.current.push({ x: popped.x, y: popped.y, alpha: 0.8 });
              }
            }

            snakeRef.current = newSnake;
          }
        }
        lastUpdateRef.current = time;
      }

      drawGame();
      requestRef.current = requestAnimationFrame(updateGame);
    },
    [drawGame, generateFood]
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [updateGame]);

  return (
    <div className="relative flex flex-col items-center justify-center font-mono">
      <div className={`relative overflow-hidden border-4 border-[#00ffff] bg-black p-1 transition-all duration-75 ${isPlayingMusic ? 'shadow-[8px_8px_0px_#ff00ff]' : 'shadow-[4px_4px_0px_#ff00ff]'}`}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="bg-black"
        />
        
        {(isPaused || isGameOver) && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
            {isGameOver ? (
              <div className="text-center">
                <div className="glitch-wrapper mb-4">
                  <h2 
                    className="text-2xl md:text-3xl font-bold text-[#ff00ff] glitch-text"
                    data-text="FATAL_ERROR"
                  >
                    FATAL_ERROR
                  </h2>
                </div>
                <p className="text-[#00ffff] mb-8 text-lg">MEM_DUMP: 0x{score.toString(16).padStart(4, '0').toUpperCase()}</p>
                <button
                  onClick={resetGame}
                  className="flex items-center gap-2 px-6 py-3 bg-black text-[#00ffff] border-2 border-[#00ffff] transition-all duration-75 hover:bg-[#00ffff] hover:text-black hover:shadow-[4px_4px_0px_#ff00ff] cursor-pointer"
                >
                  <RotateCcw size={20} />
                  REBOOT_SYS
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="glitch-wrapper mb-8">
                  <h2 
                    className="text-3xl md:text-4xl font-bold text-[#00ffff] glitch-text"
                    data-text="SNAKE.EXE"
                  >
                    SNAKE.EXE
                  </h2>
                </div>
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-8 py-4 bg-black text-[#ff00ff] border-2 border-[#ff00ff] transition-all duration-75 hover:bg-[#ff00ff] hover:text-black hover:shadow-[4px_4px_0px_#00ffff] cursor-pointer mx-auto"
                >
                  <Play size={24} className="fill-current" />
                  INITIATE
                </button>
                <div className="mt-8 border border-gray-800 p-4 bg-black/50">
                  <p className="text-gray-400 text-xs mb-2">&gt; INPUT_REQ: [W,A,S,D] OR [ARROWS]</p>
                  <p className="text-gray-500 text-xs">&gt; INTERRUPT: [SPACE]</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
