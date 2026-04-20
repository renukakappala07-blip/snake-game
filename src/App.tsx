import { SnakeBoard } from './components/SnakeBoard';
import { MusicPlayer } from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] flex items-center justify-center font-mono relative overflow-hidden crt-flicker">
      <div className="absolute inset-0 scanlines pointer-events-none z-50"></div>
      <div className="absolute inset-0 static-noise pointer-events-none z-40 mix-blend-screen opacity-50"></div>

      <div className="w-full max-w-[1024px] h-[100vh] max-h-[800px] grid grid-cols-12 grid-rows-[auto,1fr,auto] gap-6 p-4 md:p-6 relative z-10 tear">
         <header className="col-span-12 flex justify-between items-end pb-4 border-b-4 border-[#00FFFF]">
            <div>
               <h1 
                 className="text-3xl md:text-5xl font-black text-[#FF00FF] uppercase tracking-widest leading-none glitch-text" 
                 data-text="SYS.BOOT_SEQUENCE"
               >
                 SYS.BOOT_SEQUENCE
               </h1>
               <p className="text-xs md:text-sm text-black bg-[#00FFFF] font-bold uppercase tracking-widest mt-2 inline-block px-2 py-1">
                 :: OPERATION // GLITCH_SNAKE // ACTIVE
               </p>
            </div>
            <div className="text-right hidden sm:block border-l-4 border-[#FF00FF] pl-4">
               <span className="text-xs text-[#00FFFF] uppercase tracking-widest font-bold">CORE_TEMP</span>
               <p className="text-lg font-mono text-[#FF00FF] leading-none mt-1 animate-pulse font-bold tracking-widest">98.6°C // CRITICAL</p>
            </div>
         </header>

         <main className="col-span-12 row-span-1 w-full max-w-4xl mx-auto flex">
            <SnakeBoard />
         </main>

         <footer className="col-span-12 pt-2">
            <MusicPlayer />
         </footer>
      </div>
    </div>
  );
}
