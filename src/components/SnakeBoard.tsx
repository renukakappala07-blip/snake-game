import { useRef, useEffect, useState, useCallback } from 'react';
import { INITIAL_SNAKE, INITIAL_DIRECTION, generateFood } from '../lib/snakeUtils';

export function SnakeBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAwaitingInput, setIsAwaitingInput] = useState(true);

  const gameState = useRef({
    snake: [...INITIAL_SNAKE],
    direction: INITIAL_DIRECTION,
    nextDirection: INITIAL_DIRECTION,
    food: generateFood(INITIAL_SNAKE),
    score: 0,
    gameOver: false,
    playing: false,
    awaitingInput: true
  });

  const juice = useRef({
    shakeUntil: 0,
    glitchUntil: 0,
  });

  const resetGame = useCallback(() => {
    gameState.current = {
      snake: [...INITIAL_SNAKE],
      direction: INITIAL_DIRECTION,
      nextDirection: INITIAL_DIRECTION,
      food: generateFood(INITIAL_SNAKE),
      score: 0,
      gameOver: false,
      playing: true,
      awaitingInput: false
    };
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
    setIsAwaitingInput(false);
  }, []);

  const togglePause = useCallback(() => {
    if (gameState.current.gameOver) return;
    gameState.current.playing = !gameState.current.playing;
    setIsPlaying(gameState.current.playing);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key.toLowerCase()) || e.key.startsWith('Arrow')) {
        e.preventDefault();
        if (gameState.current.gameOver) {
          resetGame();
          return;
        }
        if (!gameState.current.playing) {
          gameState.current.playing = true;
          setIsPlaying(true);
          gameState.current.awaitingInput = false;
          setIsAwaitingInput(false);
        }
      }

      const key = e.key.toLowerCase();
      if ((key === 'w' || e.key === 'ArrowUp') && gameState.current.direction !== 'DOWN') gameState.current.nextDirection = 'UP';
      else if ((key === 's' || e.key === 'ArrowDown') && gameState.current.direction !== 'UP') gameState.current.nextDirection = 'DOWN';
      else if ((key === 'a' || e.key === 'ArrowLeft') && gameState.current.direction !== 'RIGHT') gameState.current.nextDirection = 'LEFT';
      else if ((key === 'd' || e.key === 'ArrowRight') && gameState.current.direction !== 'LEFT') gameState.current.nextDirection = 'RIGHT';
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lastTick = performance.now();
    const TICK_RATE = 100;

    const render = (time: number) => {
      animationId = requestAnimationFrame(render);
      const state = gameState.current;

      if (state.playing && !state.gameOver) {
        if (time - lastTick > TICK_RATE) {
          state.direction = state.nextDirection;
          const head = { ...state.snake[0] };
          
          switch (state.direction) {
            case 'UP': head.y -= 1; break;
            case 'DOWN': head.y += 1; break;
            case 'LEFT': head.x -= 1; break;
            case 'RIGHT': head.x += 1; break;
          }

          if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || state.snake.some(s => s.x === head.x && s.y === head.y)) {
            state.gameOver = true;
            state.playing = false;
            setIsGameOver(true);
            setIsPlaying(false);
            juice.current.glitchUntil = time + 1000;
            juice.current.shakeUntil = time + 500;
          } else {
            state.snake.unshift(head);
            if (head.x === state.food.x && head.y === state.food.y) {
              state.score += 10;
              setScore(state.score);
              state.food = generateFood(state.snake);
              juice.current.shakeUntil = time + 150;
              juice.current.glitchUntil = time + 100; 
            } else {
              state.snake.pop();
            }
          }
          lastTick = time;
        }
      }

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      
      const isGlitching = time < juice.current.glitchUntil;
      if (time < juice.current.shakeUntil) {
        const dx = (Math.random() - 0.5) * 10;
        const dy = (Math.random() - 0.5) * 10;
        ctx.translate(dx, dy);
      }

      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 20; i++) {
         ctx.beginPath(); ctx.moveTo(i * 20, 0); ctx.lineTo(i * 20, 400); ctx.stroke();
         ctx.beginPath(); ctx.moveTo(0, i * 20); ctx.lineTo(400, i * 20); ctx.stroke();
      }

      const xOffset = isGlitching ? (Math.random() - 0.5) * 10 : 0;

      ctx.fillStyle = '#FF00FF';
      ctx.shadowColor = '#FF00FF';
      ctx.shadowBlur = 15;
      ctx.fillRect(state.food.x * 20 + 2 + xOffset, state.food.y * 20 + 2, 16, 16);
      ctx.shadowBlur = 0;

      state.snake.forEach((segment, i) => {
        const isHead = i === 0;
        ctx.fillStyle = isHead ? '#FFFFFF' : '#00FFFF';
        if (isHead) {
           ctx.shadowColor = '#00FFFF';
           ctx.shadowBlur = 10;
        } else {
           ctx.shadowBlur = 0;
        }
        const segOffset = (isGlitching && Math.random() > 0.5) ? (Math.random() - 0.5) * 20 : 0;
        ctx.fillRect(segment.x * 20 + 1 + xOffset + segOffset, segment.y * 20 + 1, 18, 18);
      });
      ctx.restore();
      
      ctx.fillStyle = `rgba(0, 255, 255, 0.05)`;
      const scanY = (time / 10) % canvas.height;
      ctx.fillRect(0, scanY, canvas.width, 10);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="flex flex-col w-full h-full gap-4 relative z-10 font-mono bg-black border-2 border-[#00FFFF] p-2 md:p-4 shadow-[4px_4px_0_0_#FF00FF]">
      <div className="flex items-center justify-between px-2 pb-2 border-b-2 border-dashed border-[#FF00FF]">
        <div className="flex gap-6">
           <div className="flex flex-col">
             <span className="text-sm text-[#00FFFF] uppercase tracking-widest font-bold">DATA_BLOCKS</span>
             <span className="text-3xl font-black text-[#FF00FF] tabular-nums glitch-text" data-text={score.toString().padStart(4, '0')}>
               {score.toString().padStart(4, '0')}
             </span>
           </div>
        </div>
        <div className="flex gap-4 text-right">
           <button onClick={resetGame} className="px-4 py-2 bg-black border-2 border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black transition-none uppercase font-bold tracking-widest tear focus:outline-none">Reboot</button>
           <button onClick={togglePause} disabled={isGameOver} className="px-4 py-2 bg-black border-2 border-[#FF00FF] text-[#FF00FF] hover:bg-[#FF00FF] hover:text-black transition-none disabled:opacity-30 disabled:hover:bg-black disabled:hover:text-[#FF00FF] uppercase font-bold tracking-widest focus:outline-none">
             {isPlaying ? 'Halt' : 'Execute'}
           </button>
        </div>
      </div>
      
      <div className="flex-1 w-full bg-black relative flex items-center justify-center overflow-hidden min-h-[350px]">
        <div className="relative aspect-square w-full max-w-[500px] border-4 border-[#00FFFF] bg-[#00FFFF]/10 mx-8 z-10 shadow-[-4px_4px_0_0_#FF00FF] p-[2px]">
           <canvas
             ref={canvasRef}
             width={400}
             height={400}
             className="w-full h-full object-contain bg-black glitch-canvas"
           />
        </div>

        <div className="absolute top-2 left-2 text-[12px] bg-[#FF00FF] text-black font-bold px-2 py-1 uppercase hidden md:block animate-pulse">
          SYS.ENG: RUNNING_STABLE
        </div>
        <div className="absolute bottom-2 right-2 gap-2 hidden md:flex z-20">
           <div className="px-2 py-1 border border-[#00FFFF] text-[#00FFFF] text-xs font-bold uppercase bg-black">
             W/A/S/D :: VECTOR_CTRL
           </div>
        </div>

        {isGameOver && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-black border-4 border-[#FF00FF] px-12 py-8 z-30 shadow-[6px_6px_0_0_#00FFFF]">
            <h2 
              className="mb-6 text-4xl font-black tracking-widest text-[#00FFFF] uppercase whitespace-nowrap glitch-text"
              data-text="FATAL_ERROR"
            >
              FATAL_ERROR
            </h2>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-black border-2 border-[#00FFFF] text-lg tracking-widest text-[#00FFFF] font-bold hover:bg-[#00FFFF] hover:text-black transition-none uppercase focus:outline-none"
            >
              INITIALIZE_OVERRIDE
            </button>
          </div>
        )}
        {isAwaitingInput && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-black border-4 border-[#00FFFF] px-12 py-8 z-30 shadow-[6px_6px_0_0_#FF00FF] text-center min-w-[300px]">
            <h2 
              className="mb-4 text-2xl md:text-3xl font-black tracking-widest text-[#FF00FF] uppercase glitch-text"
              data-text="AWAITING_INPUT"
            >
              AWAITING_INPUT
            </h2>
            <p className="text-sm text-black bg-[#00FFFF] font-bold uppercase tracking-widest px-3 py-1">
              [DIR_KEY] TO INJECT
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
