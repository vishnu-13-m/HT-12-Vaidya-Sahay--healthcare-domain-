import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="z-10 text-center max-w-4xl glass p-12 rounded-3xl shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-500">
        <h1 className="text-6xl md:text-8xl font-extrabold mb-6 tracking-tight">
          Vaidya <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Sahay</span>
        </h1>
        <p className="text-xl md:text-3xl text-slate-300 mb-8 font-light leading-relaxed">
          AI-Powered Remote Healthcare Assistant & Hospital Resource Network
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
          <Link href="/hospital" className="group relative px-8 py-4 bg-primary text-white font-semibold rounded-full overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:shadow-[0_0_60px_rgba(59,130,246,0.8)] transition-all duration-300">
            <span className="relative z-10 flex items-center gap-2">
              Hospital Network
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </Link>
          
          <Link href="/patient" className="group relative px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full backdrop-blur-md border border-white/10 transition-all duration-300">
            <span className="relative flex items-center gap-2">
              Patient Portal
            </span>
          </Link>

          <Link href="/early-diagnosis" className="group relative px-8 py-4 bg-green-600/80 hover:bg-green-600 text-white font-semibold rounded-full backdrop-blur-md border border-green-500/20 transition-all duration-300">
            <span className="relative flex items-center gap-2">
              Early Diagnosis
            </span>
          </Link>

          <Link href="/predictive-risk" className="group relative px-8 py-4 bg-orange-600/80 hover:bg-orange-600 text-white font-semibold rounded-full backdrop-blur-md border border-orange-500/20 transition-all duration-300">
            <span className="relative flex items-center gap-2">
              Predictive Risk
            </span>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
           <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <h3 className="text-xl font-bold mb-2 text-blue-400">Intelligent Routing</h3>
              <p className="text-sm text-slate-400">Instantly locate critical medical resources across hospital sub-branches with AI routing.</p>
           </div>
           <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <h3 className="text-xl font-bold mb-2 text-blue-400">AI Diagnosis</h3>
              <p className="text-sm text-slate-400">Early symptom checking and medical report explanation tailored for accessibility.</p>
           </div>
           <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <h3 className="text-xl font-bold mb-2 text-blue-400">Emergency Priority</h3>
              <p className="text-sm text-slate-400">Prioritize life-saving equipment and blood units when every second counts.</p>
           </div>
        </div>
      </div>
    </main>
  );
}
