"use client"

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center overflow-hidden relative">
      {/* Animated grid background for hacking aesthetic */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, 0.1) 25%, rgba(0, 255, 0, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, 0.1) 75%, rgba(0, 255, 0, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, 0.1) 25%, rgba(0, 255, 0, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, 0.1) 75%, rgba(0, 255, 0, 0.1) 76%, transparent 77%, transparent)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="w-full max-w-4xl px-4 relative z-10">
        <div className="relative w-64 h-64 mx-auto mb-8">
          {/* Radar circles */}
          <div className="absolute inset-0 border-2 border-green-500/20 rounded-full" />
          <div className="absolute inset-8 border-2 border-green-500/20 rounded-full" />
          <div className="absolute inset-16 border-2 border-green-500/20 rounded-full" />
          <div className="absolute inset-24 border-2 border-green-500/20 rounded-full" />

          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute inset-0 border border-green-500/30 rounded-full"
              style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
            />
            <div
              className="absolute inset-4 border border-red-500/20 rounded-full"
              style={{ borderRadius: "40% 60% 70% 30% / 40% 70% 30% 60%" }}
            />
          </div>

          {/* Center dot with glow */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 -mt-1.5 -ml-1.5 bg-green-500 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.8)]" />

          {/* Rotating radar line */}
          <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
            <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left bg-gradient-to-r from-green-500 to-transparent shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          </div>

          {/* Scanning wave effect */}
          <div className="absolute inset-0 animate-[ping_2s_ease-out_infinite]">
            <div className="absolute inset-0 border-2 border-green-500/40 rounded-full" />
          </div>

          {/* Threat blips */}
          <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          <div
            className="absolute top-2/3 right-1/4 w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.8)]"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"
            style={{ animationDelay: "1s" }}
          />

          {/* Grid lines */}
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-green-500/10" />
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-green-500/10" />

          {/* Horizontal scanline */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              animation: "scanline 4s linear infinite",
            }}
          >
            <div
              className="absolute w-full h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"
              style={{ top: "30%" }}
            />
          </div>
        </div>

        <div className="text-center mt-8">
          <p
            className="text-green-500 text-2xl font-bold tracking-[0.3em] mb-4"
            style={{
              textShadow: "0 0 10px rgba(34, 197, 94, 0.5)",
              animation: "flicker 2s infinite",
            }}
          >
            SCANNING TARGET
          </p>

          <div className="space-y-2 text-sm text-green-500/70">
            <div className="flex items-center justify-center gap-2 animate-pulse">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
              <span>Analyzing threat intelligence databases...</span>
            </div>
            <div className="flex items-center justify-center gap-2 animate-pulse" style={{ animationDelay: "0.3s" }}>
              <span className="inline-block w-2 h-2 bg-cyan-500 rounded-full" />
              <span>Retrieving geolocation data...</span>
            </div>
            <div className="flex items-center justify-center gap-2 animate-pulse" style={{ animationDelay: "0.6s" }}>
              <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full" />
              <span>Discovering network information...</span>
            </div>
            <div className="flex items-center justify-center gap-2 animate-pulse" style={{ animationDelay: "0.9s" }}>
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
              <span>Scanning for vulnerabilities...</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes flicker {
          0%, 18%, 22%, 25%, 53%, 57%, 100% {
            text-shadow: 0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.5);
          }
          20%, 24%, 55% {
            text-shadow: 0 0 5px rgba(34, 197, 94, 0.3);
          }
        }
        
        @keyframes scanline {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
      `}</style>
    </div>
  )
}
