import { Shield, Cpu } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-2 border-primary/30 rounded-lg animate-spin"></div>
          <div className="absolute inset-2 border-2 border-transparent border-t-primary rounded-lg animate-spin" style={{animationDirection: 'reverse'}}></div>
          <Cpu className="w-8 h-8 text-primary absolute inset-4" />
        </div>
        
        <div>
          <p className="text-lg font-bold text-primary tracking-widest cyber-glow">INITIALIZING SOC DASHBOARD</p>
          <p className="text-sm text-primary/60 mt-2">Loading real-time threat intelligence data...</p>
        </div>

        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    </div>
  )
}
