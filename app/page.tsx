import * as motion from 'motion/react-client';
import Link from 'next/link';

export default function Home() {
  return (
    <motion.div className="h-dvh z-20 w-full items-center justify-center flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.5 }}>
      <Link href='/login' className=" inline-block px-2 py-4 bg-white hover:bg-slate-100 text-red-500 shadow-[0px_2px_2px_rgba(0,0,0,0.29)] border-b-4 border-b-red-600 rounded-sm font-bold [text-shadow:_1px_1px_1px_rgba(255,255,255,0.5)] active:translate-y-1 active:[box-shadow:_0px_0px_1px_rgba(0,0,0,0.2)] active:border-b-0">Welcome to Humor Podium</Link>
    </motion.div>
  );
}
