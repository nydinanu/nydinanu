'use client'

import Link from "next/link"
import { Shield, Zap, Eye, Activity, Database, Target, BookOpen, FileText, Linkedin, AlertTriangle, Lock, Cpu, Network, Mail, Bug, Search, Globe, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Animated background grid effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(16, 255, 0, 0.05) 25%, rgba(16, 255, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(16, 255, 0, 0.05) 75%, rgba(16, 255, 0, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(16, 255, 0, 0.05) 25%, rgba(16, 255, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(16, 255, 0, 0.05) 75%, rgba(16, 255, 0, 0.05) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      {/* Fixed Header with Glassmorphism */}
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-xl border-b border-primary/30 px-4 md:px-6 py-3 md:py-4 z-50 shadow-2xl shadow-primary/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo and Branding */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-lg border-2 border-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/40 hover:shadow-primary/70 transition-all duration-300 group cursor-pointer">
              <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary relative z-10" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xs md:text-sm lg:text-lg font-bold text-primary tracking-[0.1em] md:tracking-[0.15em] cyber-glow whitespace-nowrap">OSINT PLATFORM</h1>
              <p className="text-[10px] md:text-xs text-primary/50 tracking-widest">AI-POWERED INTELLIGENCE</p>
            </div>
          </div>

          {/* Primary Navigation Buttons - Responsive Grid */}
          <nav className="hidden lg:flex gap-2 flex-wrap justify-center">
            <Link href="/soc-simulator">
              <Button variant="outline" size="sm" className="nav-btn border border-green-500/70 text-green-400 bg-transparent hover:bg-green-500/10 text-[11px] lg:text-xs h-8 md:h-9 px-3 md:px-4">
                <Cpu className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
                <span className="hidden md:inline">SOC</span> SIM
              </Button>
            </Link>
            <Link href="/threat-feed">
              <Button variant="outline" size="sm" className="nav-btn border border-green-500/70 text-green-400 bg-transparent hover:bg-green-500/10 text-[11px] lg:text-xs h-8 md:h-9 px-3 md:px-4">
                <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
                <span className="hidden md:inline">THREAT</span> FEED
              </Button>
            </Link>
            <Link href="/incidents">
              <Button variant="outline" size="sm" className="nav-btn border border-green-500/70 text-green-400 bg-transparent hover:bg-green-500/10 text-[11px] lg:text-xs h-8 md:h-9 px-3 md:px-4">
                <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
                <span className="hidden md:inline">INC</span>
              </Button>
            </Link>
            <Link href="/scanner">
              <Button variant="outline" size="sm" className="nav-btn border border-green-500/70 text-green-400 bg-transparent hover:bg-green-500/10 text-[11px] lg:text-xs h-8 md:h-9 px-3 md:px-4">
                <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
                <span className="hidden md:inline">SCAN</span>
              </Button>
            </Link>
            <Link href="/waf-analysis">
              <Button variant="outline" size="sm" className="nav-btn border border-green-500/70 text-green-400 bg-transparent hover:bg-green-500/10 text-[11px] lg:text-xs h-8 md:h-9 px-3 md:px-4">
                <Lock className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
                <span className="hidden md:inline">WAF</span>
              </Button>
            </Link>
            <Link href="/ddos-analysis">
              <Button variant="outline" size="sm" className="nav-btn border border-green-500/70 text-green-400 bg-transparent hover:bg-green-500/10 text-[11px] lg:text-xs h-8 md:h-9 px-3 md:px-4">
                <Network className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
                <span className="hidden md:inline">PCAP</span>
              </Button>
            </Link>
            <Link href="/email-analysis">
              <Button variant="outline" size="sm" className="nav-btn border border-green-500/70 text-green-400 bg-transparent hover:bg-green-500/10 text-[11px] lg:text-xs h-8 md:h-9 px-3 md:px-4">
                <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
                <span className="hidden md:inline">EMAIL</span>
              </Button>
            </Link>
            <Link href="/sandbox-analysis">
              <Button variant="outline" size="sm" className="nav-btn border border-green-500/70 text-green-400 bg-transparent hover:bg-green-500/10 text-[11px] lg:text-xs h-8 md:h-9 px-3 md:px-4">
                <Upload className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
                <span className="hidden md:inline">SANDBOX</span>
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button variant="outline" size="sm" className="nav-btn border border-green-500/70 text-green-400 bg-transparent hover:bg-green-500/10 h-8 px-2 text-xs">
              <Shield className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>



      {/* Main Content - Add margin-top to account for fixed header */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 mt-20 md:mt-24 relative z-10">
        {/* Feature Cards - 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Row 1 */}
          <div className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 backdrop-blur-sm">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-blue-500/20 rounded-sm border border-blue-500/40 group-hover:border-blue-500/80 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">THREAT DETECTION</h3>
            <p className="text-xs text-primary/70 text-center leading-relaxed">
              Advanced malware and phishing detection using multiple security databases
            </p>
          </div>

          <div className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-yellow-500/60 hover:shadow-2xl hover:shadow-yellow-500/30 transition-all duration-300 backdrop-blur-sm">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-yellow-500/20 rounded-sm border border-yellow-500/40 group-hover:border-yellow-500/80 group-hover:shadow-lg group-hover:shadow-yellow-500/50 transition-all">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">REAL-TIME ANALYSIS</h3>
            <p className="text-xs text-primary/70 text-center leading-relaxed">
              Lightning-fast domain scanning with comprehensive security reports
            </p>
          </div>

          <div className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-cyan-500/60 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 backdrop-blur-sm">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-cyan-500/20 rounded-sm border border-cyan-500/40 group-hover:border-cyan-500/80 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                <Eye className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">DEEP INSPECTION</h3>
            <p className="text-xs text-primary/70 text-center leading-relaxed">
              SSL certificates, DNS records, and geolocation analysis
            </p>
          </div>

          {/* Row 2 */}
          <div className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-red-500/60 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 backdrop-blur-sm">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-red-500/20 rounded-sm border border-red-500/40 group-hover:border-red-500/80 group-hover:shadow-lg group-hover:shadow-red-500/50 transition-all">
                <Bug className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">MALWARE ANALYSIS</h3>
            <p className="text-xs text-primary/70 text-center leading-relaxed">
              Cloud sandbox behavioral analysis with MITRE ATT&CK mapping
            </p>
          </div>

          <div className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-purple-500/60 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 backdrop-blur-sm">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-purple-500/20 rounded-sm border border-purple-500/40 group-hover:border-purple-500/80 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
                <Database className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">THREAT INTELLIGENCE</h3>
            <p className="text-xs text-primary/70 text-center leading-relaxed">
              Access to global threat feeds and vulnerability intelligence databases
            </p>
          </div>

          <div className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-orange-500/60 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 backdrop-blur-sm">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-orange-500/20 rounded-sm border border-orange-500/40 group-hover:border-orange-500/80 group-hover:shadow-lg group-hover:shadow-orange-500/50 transition-all">
                <Target className="w-8 h-8 text-orange-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">INCIDENT RESPONSE</h3>
            <p className="text-xs text-primary/70 text-center leading-relaxed">
              SOC automation tools and detailed incident investigation workflows
            </p>
          </div>
        </div>

        {/* ACCESS SCANNER Button */}
        <div className="flex justify-center mb-20">
          <Link href="/scanner">
            <Button
              size="lg"
              className="border-2 border-primary bg-transparent hover:bg-primary/15 text-primary font-bold text-base px-16 py-7 tracking-widest rounded-sm shadow-lg shadow-primary/30 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
            >
              <Shield className="w-5 h-5 mr-3" />
              ACCESS SCANNER
            </Button>
          </Link>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="cyber-card p-6 rounded-sm border border-primary/30 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 transition-all backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/70" />
              <div>
                <p className="text-xs text-primary font-bold tracking-widest">SECURITY</p>
                <p className="text-xs text-primary/70 tracking-wide">MAXIMUM</p>
              </div>
            </div>
          </div>

          <div className="cyber-card p-6 rounded-sm border border-primary/30 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 transition-all backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/70" />
              <div>
                <p className="text-xs text-primary font-bold tracking-widest">NETWORK</p>
                <p className="text-xs text-primary/70 tracking-wide">ENCRYPTED</p>
              </div>
            </div>
          </div>

          <div className="cyber-card p-6 rounded-sm border border-primary/30 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 transition-all backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/70" />
              <div>
                <p className="text-xs text-primary font-bold tracking-widest">MONITORING</p>
                <p className="text-xs text-primary/70 tracking-wide">ACTIVE</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Resources Section */}
      <section className="border-t border-primary/30 bg-secondary/10 px-6 py-16 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-primary text-center mb-12 tracking-widest">RESOURCES & REFERENCES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a
              href="https://reansecurity.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-blue-500/20 rounded-sm border border-blue-500/40 group-hover:border-blue-500/80 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
                  <BookOpen className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">DEFENCE GUIDE</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Comprehensive cyber defense strategies and best practices for protecting your infrastructure
              </p>
            </a>

            <a
              href="https://cyberdefencekit.github.io/documentation/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-green-500/60 hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-green-500/20 rounded-sm border border-green-500/40 group-hover:border-green-500/80 group-hover:shadow-lg group-hover:shadow-green-500/50 transition-all">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">DEFENCE KIT</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Complete toolkit documentation and resources for defensive security operations
              </p>
            </a>

            <a
              href="https://linuxdfir.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-orange-500/60 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-orange-500/20 rounded-sm border border-orange-500/40 group-hover:border-orange-500/80 group-hover:shadow-lg group-hover:shadow-orange-500/50 transition-all">
                  <FileText className="w-8 h-8 text-orange-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">LINUX DFIR</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Digital forensics and incident response guides specific to Linux environments
              </p>
            </a>

            <a
              href="https://www.hackthelogs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-yellow-500/60 hover:shadow-2xl hover:shadow-yellow-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-yellow-500/20 rounded-sm border border-yellow-500/40 group-hover:border-yellow-500/80 group-hover:shadow-lg group-hover:shadow-yellow-500/50 transition-all">
                  <FileText className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">HACK THE LOGS</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Foundation of cybersecurity concepts and comprehensive log analysis techniques
              </p>
            </a>

            <a
              href="https://wazuh-documentation-49-master.readthedocs.io/en/latest/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-cyan-500/60 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-cyan-500/20 rounded-sm border border-cyan-500/40 group-hover:border-cyan-500/80 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                  <Shield className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">WAZUH MASTER</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Official Wazuh documentation and comprehensive security monitoring platform guide
              </p>
            </a>

            <a
              href="https://github.com/cyb3rxp/awesome-soc/tree/main"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-purple-500/60 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-purple-500/20 rounded-sm border border-purple-500/40 group-hover:border-purple-500/80 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
                  <Database className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">AWESOME SOC</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Curated collection of SOC tools, resources, and best practices from the community
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* Cybersecurity Tools for Email & Malware Analysis Section */}
      <section className="border-t border-primary/30 bg-secondary/10 px-6 py-16 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-primary text-center mb-12 tracking-widest">CYBERSECURITY TOOLS • EMAIL & MALWARE ANALYSIS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a
              href="https://www.virustotal.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-red-500/60 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-red-500/20 rounded-sm border border-red-500/40 group-hover:border-red-500/80 group-hover:shadow-lg group-hover:shadow-red-500/50 transition-all">
                  <FileText className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">VIRUSTOTAL</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Malware and phishing detection through file, URL, and IP analysis
              </p>
            </a>

            <a
              href="https://any.run/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-orange-500/60 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-orange-500/20 rounded-sm border border-orange-500/40 group-hover:border-orange-500/80 group-hover:shadow-lg group-hover:shadow-orange-500/50 transition-all">
                  <Bug className="w-8 h-8 text-orange-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">ANY.RUN</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Interactive malware sandbox with behavioral analysis and execution tracking
              </p>
            </a>

            <a
              href="https://urlscan.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-cyan-500/60 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-cyan-500/20 rounded-sm border border-cyan-500/40 group-hover:border-cyan-500/80 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                  <Globe className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">URLSCAN.IO</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Automated web URL scanning and security analysis with visual reporting
              </p>
            </a>

            <a
              href="https://mxtoolbox.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-blue-500/20 rounded-sm border border-blue-500/40 group-hover:border-blue-500/80 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
                  <Mail className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">MXTOOLBOX</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Email header analysis and DNS/MX record verification tools
              </p>
            </a>

            <a
              href="https://www.phishtank.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-yellow-500/60 hover:shadow-2xl hover:shadow-yellow-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-yellow-500/20 rounded-sm border border-yellow-500/40 group-hover:border-yellow-500/80 group-hover:shadow-lg group-hover:shadow-yellow-500/50 transition-all">
                  <AlertTriangle className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">PHISHTANK</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Community-driven phishing database and threat intelligence platform
              </p>
            </a>

            <a
              href="https://www.abuseipdb.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-pink-500/60 hover:shadow-2xl hover:shadow-pink-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-pink-500/20 rounded-sm border border-pink-500/40 group-hover:border-pink-500/80 group-hover:shadow-lg group-hover:shadow-pink-500/50 transition-all">
                  <Network className="w-8 h-8 text-pink-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">ABUSEIPDB</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                IP reputation database and abuse reporting for threat investigation
              </p>
            </a>

            {/* Google MessageHeader */}
            <a
              href="https://toolbox.googleapps.com/apps/checkmx/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-400/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-blue-400/20 rounded-sm border border-blue-400/40 group-hover:border-blue-400/80 group-hover:shadow-lg group-hover:shadow-blue-400/50 transition-all">
                  <Mail className="w-8 h-8 text-blue-300" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">GOOGLE MESSAGEHEADER</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Analyze email headers and trace message routing through Google's tools
              </p>
            </a>

            {/* MailHeader */}
            <a
              href="https://mailheader.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-green-500/60 hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-green-500/20 rounded-sm border border-green-500/40 group-hover:border-green-500/80 group-hover:shadow-lg group-hover:shadow-green-500/50 transition-all">
                  <Mail className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">MAILHEADER</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Decode and analyze email headers for authentication and routing information
              </p>
            </a>

            {/* Talos Intelligence */}
            <a
              href="https://talosintelligence.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-purple-500/60 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-purple-500/20 rounded-sm border border-purple-500/40 group-hover:border-purple-500/80 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
                  <Network className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">TALOS INTELLIGENCE</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Cisco's threat intelligence platform for IP and domain reputation
              </p>
            </a>

            {/* WebCheck */}
            <a
              href="https://web-check.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-indigo-500/60 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-indigo-500/20 rounded-sm border border-indigo-500/40 group-hover:border-indigo-500/80 group-hover:shadow-lg group-hover:shadow-indigo-500/50 transition-all">
                  <Globe className="w-8 h-8 text-indigo-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">WEBCHECK</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Comprehensive website security analysis and data extraction tool
              </p>
            </a>

            {/* CyberGordon */}
            <a
              href="https://cybergordon.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-rose-500/60 hover:shadow-2xl hover:shadow-rose-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-rose-500/20 rounded-sm border border-rose-500/40 group-hover:border-rose-500/80 group-hover:shadow-lg group-hover:shadow-rose-500/50 transition-all">
                  <AlertTriangle className="w-8 h-8 text-rose-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">CYBERGORDON</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Unified threat intelligence lookup for URLs, IPs, and domains
              </p>
            </a>

            {/* IPinfo */}
            <a
              href="https://ipinfo.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-teal-500/60 hover:shadow-2xl hover:shadow-teal-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-teal-500/20 rounded-sm border border-teal-500/40 group-hover:border-teal-500/80 group-hover:shadow-lg group-hover:shadow-teal-500/50 transition-all">
                  <Network className="w-8 h-8 text-teal-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">IPINFO</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                IP address geolocation and intelligence database lookup
              </p>
            </a>

            {/* URL2PNG */}
            <a
              href="https://www.url2png.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-amber-500/20 rounded-sm border border-amber-500/40 group-hover:border-amber-500/80 group-hover:shadow-lg group-hover:shadow-amber-500/50 transition-all">
                  <Globe className="w-8 h-8 text-amber-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">URL2PNG</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Capture website screenshots without visiting the site safely
              </p>
            </a>

            {/* CheckPhish */}
            <a
              href="https://checkphish.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-red-500/60 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-red-500/20 rounded-sm border border-red-500/40 group-hover:border-red-500/80 group-hover:shadow-lg group-hover:shadow-red-500/50 transition-all">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">CHECKPHISH</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                AI-powered phishing URL detection and analysis platform
              </p>
            </a>

            {/* Hybrid-Analysis */}
            <a
              href="https://www.hybrid-analysis.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-orange-500/60 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-orange-500/20 rounded-sm border border-orange-500/40 group-hover:border-orange-500/80 group-hover:shadow-lg group-hover:shadow-orange-500/50 transition-all">
                  <Bug className="w-8 h-8 text-orange-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">HYBRID-ANALYSIS</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Falcon Sandbox for malware analysis with detailed behavioral reports
              </p>
            </a>

            {/* Joesandbox */}
            <a
              href="https://www.joesandbox.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-yellow-500/60 hover:shadow-2xl hover:shadow-yellow-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-yellow-500/20 rounded-sm border border-yellow-500/40 group-hover:border-yellow-500/80 group-hover:shadow-lg group-hover:shadow-yellow-500/50 transition-all">
                  <Bug className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">JOESANDBOX</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Advanced malware analysis sandbox with comprehensive reporting
              </p>
            </a>

            {/* Cuckoo Sandbox */}
            <a
              href="https://cuckoo.cert.ee/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-lime-500/60 hover:shadow-2xl hover:shadow-lime-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-lime-500/20 rounded-sm border border-lime-500/40 group-hover:border-lime-500/80 group-hover:shadow-lg group-hover:shadow-lime-500/50 transition-all">
                  <Bug className="w-8 h-8 text-lime-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">CUCKOO SANDBOX</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Open-source automated malware analysis system
              </p>
            </a>

            {/* Triage */}
            <a
              href="https://tria.ge/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-primary hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-primary/10 rounded-sm border border-primary/30 group-hover:border-primary/60 group-hover:shadow-lg group-hover:shadow-primary/50 transition-all">
                  <Bug className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">TRIAGE</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Commercial malware analysis platform with advanced features
              </p>
            </a>

            {/* Reverse Lookup */}
            <a
              href="https://www.reversevip.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-lime-500/60 hover:shadow-2xl hover:shadow-lime-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-lime-500/20 rounded-sm border border-lime-500/40 group-hover:border-lime-500/80 group-hover:shadow-lg group-hover:shadow-lime-500/50 transition-all">
                  <Search className="w-8 h-8 text-lime-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">REVERSE LOOKUP</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Find domains hosted on specific IP addresses
              </p>
            </a>

            {/* DomainTools */}
            <a
              href="https://www.domaintools.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-sky-500/60 hover:shadow-2xl hover:shadow-sky-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-sky-500/20 rounded-sm border border-sky-500/40 group-hover:border-sky-500/80 group-hover:shadow-lg group-hover:shadow-sky-500/50 transition-all">
                  <Search className="w-8 h-8 text-sky-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">DOMAINTOOLS</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Professional domain research and threat intelligence service
              </p>
            </a>

            {/* Whois */}
            <a
              href="https://www.whois.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-violet-500/60 hover:shadow-2xl hover:shadow-violet-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-violet-500/20 rounded-sm border border-violet-500/40 group-hover:border-violet-500/80 group-hover:shadow-lg group-hover:shadow-violet-500/50 transition-all">
                  <Search className="w-8 h-8 text-violet-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">WHOIS</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Domain registration and ownership information lookup
              </p>
            </a>

            {/* CyberChef */}
            <a
              href="https://cyberchef.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-red-600/60 hover:shadow-2xl hover:shadow-red-600/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-red-600/20 rounded-sm border border-red-600/40 group-hover:border-red-600/80 group-hover:shadow-lg group-hover:shadow-red-600/50 transition-all">
                  <FileText className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">CYBERCHEF</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Data transformation and analysis tool for security professionals
              </p>
            </a>

            {/* Thunderbird */}
            <a
              href="https://www.thunderbird.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-blue-600/60 hover:shadow-2xl hover:shadow-blue-600/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-blue-600/20 rounded-sm border border-blue-600/40 group-hover:border-blue-600/80 group-hover:shadow-lg group-hover:shadow-blue-600/50 transition-all">
                  <Mail className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">THUNDERBIRD</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Free, open-source email client for secure email analysis
              </p>
            </a>

            {/* PhishCheck */}
            <a
              href="https://phishcheck.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-red-500/60 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-red-500/20 rounded-sm border border-red-500/40 group-hover:border-red-500/80 group-hover:shadow-lg group-hover:shadow-red-500/50 transition-all">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">PHISHCHECK</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Real-time phishing URL detection and reporting service
              </p>
            </a>

            {/* OpenPhish */}
            <a
              href="https://openphish.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-orange-500/60 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-orange-500/20 rounded-sm border border-orange-500/40 group-hover:border-orange-500/80 group-hover:shadow-lg group-hover:shadow-orange-500/50 transition-all">
                  <AlertTriangle className="w-8 h-8 text-orange-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">OPENPHISH</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Automated phishing detection and intelligence platform
              </p>
            </a>

            {/* Phishunt */}
            <a
              href="https://phishunt.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-red-600/60 hover:shadow-2xl hover:shadow-red-600/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-red-600/20 rounded-sm border border-red-600/40 group-hover:border-red-600/80 group-hover:shadow-lg group-hover:shadow-red-600/50 transition-all">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">PHISHUNT</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Community-driven phishing reporting and takedown platform
              </p>
            </a>

            {/* PhishingArmy */}
            <a
              href="https://phishing.army/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-amber-600/60 hover:shadow-2xl hover:shadow-amber-600/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-amber-600/20 rounded-sm border border-amber-600/40 group-hover:border-amber-600/80 group-hover:shadow-lg group-hover:shadow-amber-600/50 transition-all">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">PHISHING ARMY</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Free phishing URL blocklist for security professionals
              </p>
            </a>

            {/* HaveIBeenPwned */}
            <a
              href="https://haveibeenpwned.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-red-700/60 hover:shadow-2xl hover:shadow-red-700/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-red-700/20 rounded-sm border border-red-700/40 group-hover:border-red-700/80 group-hover:shadow-lg group-hover:shadow-red-700/50 transition-all">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">HAVEIBEENPWNED</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Search for compromised accounts in data breaches
              </p>
            </a>

            {/* HaveIBeenSquatted */}
            <a
              href="https://www.haveibeensquatted.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-fuchsia-500/60 hover:shadow-2xl hover:shadow-fuchsia-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-fuchsia-500/20 rounded-sm border border-fuchsia-500/40 group-hover:border-fuchsia-500/80 group-hover:shadow-lg group-hover:shadow-fuchsia-500/50 transition-all">
                  <Search className="w-8 h-8 text-fuchsia-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">HAVEIBEENSQUATTED</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Detect domain squatting and phishing domains
              </p>
            </a>

            {/* ExpandURL */}
            <a
              href="https://www.expandurl.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="group cyber-card p-8 rounded-sm border border-primary/40 hover:border-slate-500/60 hover:shadow-2xl hover:shadow-slate-500/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-slate-500/20 rounded-sm border border-slate-500/40 group-hover:border-slate-500/80 group-hover:shadow-lg group-hover:shadow-slate-500/50 transition-all">
                  <Globe className="w-8 h-8 text-slate-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary text-center mb-3 tracking-widest">EXPANDURL</h3>
              <p className="text-xs text-primary/70 text-center leading-relaxed">
                Expand shortened URLs to reveal actual destinations
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* Security Warning Footer */}
      <footer className="border-t border-destructive/50 bg-destructive/8 px-6 py-10 mt-16 backdrop-blur-sm shadow-2xl shadow-destructive/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-destructive text-3xl animate-pulse">⚠</span>
            <h3 className="text-destructive font-bold text-xl tracking-widest">SECURITY WARNING</h3>
            <span className="text-destructive text-3xl animate-pulse">⚠</span>
          </div>
          <div className="space-y-3 text-sm">
            <p className="text-chart-2 font-bold tracking-wider text-base">⚠ UNAUTHORIZED ACCESS ATTEMPTS ARE MONITORED AND LOGGED ⚠</p>
            <p className="text-primary/60 text-xs tracking-wide">
              This system is protected by advanced intrusion detection. All activities are tracked and reported to authorities.
            </p>
            <p className="text-primary/60 text-xs tracking-wide">
              Malicious activities will result in immediate IP blocking and legal prosecution.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-primary/20">
            <p className="text-xs text-primary/60 tracking-wide">
              © 2025 Advanced OSINT Platform v5.0.0 — Cyber Intelligence Hub
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 mb-4">
              <p className="text-xs text-primary/60 tracking-wider">Platform developed by</p>
              <a
                href="https://www.linkedin.com/in/nydina"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:text-primary/80 hover:shadow-lg hover:shadow-primary/30 transition-all px-2 py-1 rounded-sm border border-primary/30"
              >
                <Linkedin className="w-4 h-4" />
                <span className="text-xs font-bold tracking-wider">NYDINA</span>
              </a>
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-primary tracking-widest font-bold">
              <span>▸ SECURE ▸</span>
              <span>ENCRYPTED</span>
              <span>▸ MONITORED ▸</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
