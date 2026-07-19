'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Shield, Upload, AlertTriangle, CheckCircle2, Home, BarChart3, Eye, Zap, Network, Lock, FileText, Shield as SafeIcon, AlertCircle, Clock, Hash, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AnalysisResult {
  filename: string
  filesize: string
  filetype: string
  hash: string
  threatScore: number
  verdict: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS'
  analysis: {
    staticAnalysis: {
      suspiciousAPIs: string[]
      suspiciousStrings: string[]
      packer: string
      signatureValid: boolean
    }
    dynamicAnalysis: {
      processes: string[]
      networkConnections: string[]
      registryModifications: string[]
      fileSystemChanges: string[]
    }
    threatIntelligence: {
      knownMalware: boolean
      c2Detected: boolean
      exploitDetected: boolean
      attackTechniques: string[]
    }
    mitreMappings: {
      tactic: string
      technique: string
    }[]
  }
  timestamp: string
}

const mockAnalysis = (filename: string): AnalysisResult => {
  const isMalicious = filename.toLowerCase().includes('malware') || filename.toLowerCase().includes('trojan')
  const isSuspicious = filename.toLowerCase().includes('suspicious') || filename.toLowerCase().includes('test')

  return {
    filename,
    filesize: `${Math.floor(Math.random() * 5000) + 100} KB`,
    filetype: filename.split('.').pop()?.toUpperCase() || 'UNKNOWN',
    hash: `${Math.random().toString(16).substring(2, 10).toUpperCase()}${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
    threatScore: isMalicious ? Math.floor(Math.random() * 40) + 80 : isSuspicious ? Math.floor(Math.random() * 30) + 40 : Math.floor(Math.random() * 20),
    verdict: isMalicious ? 'MALICIOUS' : isSuspicious ? 'SUSPICIOUS' : 'SAFE',
    analysis: {
      staticAnalysis: {
        suspiciousAPIs: isMalicious
          ? ['WinExec', 'CreateRemoteThread', 'VirtualAllocEx', 'WriteProcessMemory']
          : isSuspicious
          ? ['CreateProcess', 'SetWindowsHookEx']
          : [],
        suspiciousStrings: isMalicious
          ? ['cmd.exe /c', 'C:\\Windows\\System32', 'GetProcAddress', 'LoadLibrary']
          : isSuspicious
          ? ['localhost', '127.0.0.1', 'http://']
          : [],
        packer: isMalicious ? 'UPX' : 'None',
        signatureValid: !isMalicious
      },
      dynamicAnalysis: {
        processes: isMalicious
          ? ['svchost.exe', 'explorer.exe', 'conhost.exe']
          : isSuspicious
          ? ['notepad.exe']
          : [],
        networkConnections: isMalicious
          ? ['192.168.1.100:443', '10.0.0.1:8080', 'attacker.com:443']
          : isSuspicious
          ? ['169.254.1.1:53']
          : [],
        registryModifications: isMalicious
          ? ['HKLM\\Software\\Microsoft\\Windows\\Run', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run']
          : [],
        fileSystemChanges: isMalicious
          ? ['C:\\Windows\\System32\\drivers\\etc\\hosts', 'C:\\ProgramData\\malicious.exe']
          : []
      },
      threatIntelligence: {
        knownMalware: isMalicious,
        c2Detected: isMalicious,
        exploitDetected: isMalicious,
        attackTechniques: isMalicious
          ? ['T1547.001', 'T1059.003', 'T1204.002']
          : isSuspicious
          ? ['T1566.001']
          : []
      },
      mitreMappings: isMalicious
        ? [
            { tactic: 'Persistence', technique: 'T1547.001 - Boot or Logon Autostart Execution' },
            { tactic: 'Execution', technique: 'T1059.003 - Windows Command Shell' },
            { tactic: 'Defense Evasion', technique: 'T1027 - Obfuscated Files' }
          ]
        : isSuspicious
        ? [
            { tactic: 'Initial Access', technique: 'T1566.001 - Phishing: Spearphishing Attachment' }
          ]
        : []
    },
    timestamp: new Date().toISOString()
  }
}

export default function SandboxAnalysisPage() {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    setUploading(true)
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const analysis = mockAnalysis(file.name)
    setResults(analysis)
    setUploading(false)
  }

  if (results) {
    const verdictColor = results.verdict === 'MALICIOUS' ? 'from-red-600 to-red-500' : 
                         results.verdict === 'SUSPICIOUS' ? 'from-orange-600 to-orange-500' : 
                         'from-green-600 to-green-500'
    const verdictBgColor = results.verdict === 'MALICIOUS' ? 'bg-red-500/20 border-red-500/40' :
                           results.verdict === 'SUSPICIOUS' ? 'bg-orange-500/20 border-orange-500/40' :
                           'bg-green-500/20 border-green-500/40'
    const verdictTextColor = results.verdict === 'MALICIOUS' ? 'text-red-400' :
                             results.verdict === 'SUSPICIOUS' ? 'text-orange-400' :
                             'text-green-400'

    return (
      <div className="min-h-screen bg-background pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link href="/sandbox-analysis" onClick={() => setResults(null)} className="text-primary/60 hover:text-primary text-sm font-bold mb-4 inline-flex items-center gap-1">
              <Home className="w-4 h-4" />
              New Analysis
            </Link>
            <h1 className="text-3xl font-bold text-primary mb-2">Analysis Results</h1>
            <p className="text-primary/70">{results.filename}</p>
          </div>

          {/* Verdict Banner */}
          <div className={`cyber-card p-8 rounded-lg border mb-8 bg-gradient-to-br ${verdictColor}`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 uppercase">{results.verdict}</h2>
                <p className="text-white/80">Threat Score: <span className="text-2xl font-bold">{results.threatScore}/100</span></p>
              </div>
              <div className="p-4 bg-white/10 rounded-lg backdrop-blur">
                {results.verdict === 'SAFE' && <CheckCircle2 className="w-16 h-16 text-green-400" />}
                {results.verdict === 'SUSPICIOUS' && <AlertCircle className="w-16 h-16 text-orange-400" />}
                {results.verdict === 'MALICIOUS' && <AlertTriangle className="w-16 h-16 text-red-400" />}
              </div>
            </div>
          </div>

          {/* File Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="cyber-card p-4 rounded-lg border border-primary/30">
              <p className="text-xs text-primary/60 font-bold mb-1 uppercase">Filename</p>
              <p className="text-sm font-bold text-primary truncate">{results.filename}</p>
            </div>
            <div className="cyber-card p-4 rounded-lg border border-primary/30">
              <p className="text-xs text-primary/60 font-bold mb-1 uppercase">File Type</p>
              <p className="text-sm font-bold text-primary">{results.filetype}</p>
            </div>
            <div className="cyber-card p-4 rounded-lg border border-primary/30">
              <p className="text-xs text-primary/60 font-bold mb-1 uppercase">File Size</p>
              <p className="text-sm font-bold text-primary">{results.filesize}</p>
            </div>
            <div className="cyber-card p-4 rounded-lg border border-primary/30">
              <p className="text-xs text-primary/60 font-bold mb-1 uppercase">Hash (MD5)</p>
              <p className="text-xs font-mono text-primary truncate">{results.hash}</p>
            </div>
          </div>

          {/* Analysis Tabs */}
          <div className="space-y-6">
            {/* Static Analysis */}
            <div className="cyber-card p-6 rounded-lg border border-primary/40">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Static Analysis
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-primary/80 mb-2">Signature Valid</p>
                  <div className="flex items-center gap-2">
                    {results.analysis.staticAnalysis.signatureValid ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-sm text-primary/70">File signature is valid</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="text-sm text-primary/70">File signature is invalid or missing</span>
                      </>
                    )}
                  </div>
                </div>

                {results.analysis.staticAnalysis.packer && (
                  <div>
                    <p className="text-sm font-bold text-primary/80 mb-2">Packer Detected</p>
                    <p className="text-sm text-orange-400">{results.analysis.staticAnalysis.packer}</p>
                  </div>
                )}

                {results.analysis.staticAnalysis.suspiciousAPIs.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-primary/80 mb-2">Suspicious APIs</p>
                    <div className="flex flex-wrap gap-2">
                      {results.analysis.staticAnalysis.suspiciousAPIs.map((api, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded font-mono border border-red-500/30">
                          {api}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {results.analysis.staticAnalysis.suspiciousStrings.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-primary/80 mb-2">Suspicious Strings</p>
                    <div className="flex flex-wrap gap-2">
                      {results.analysis.staticAnalysis.suspiciousStrings.map((str, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded font-mono border border-orange-500/30">
                          {str}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {results.analysis.staticAnalysis.suspiciousAPIs.length === 0 && results.analysis.staticAnalysis.suspiciousStrings.length === 0 && (
                  <p className="text-sm text-primary/70">✓ No suspicious APIs or strings detected</p>
                )}
              </div>
            </div>

            {/* Dynamic Analysis */}
            <div className="cyber-card p-6 rounded-lg border border-primary/40">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Dynamic Behavior Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.analysis.dynamicAnalysis.processes.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-primary/80 mb-2">Spawned Processes</p>
                    <div className="space-y-1">
                      {results.analysis.dynamicAnalysis.processes.map((proc, i) => (
                        <p key={i} className="text-xs text-orange-400 font-mono">{proc}</p>
                      ))}
                    </div>
                  </div>
                )}

                {results.analysis.dynamicAnalysis.networkConnections.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-primary/80 mb-2">Network Connections</p>
                    <div className="space-y-1">
                      {results.analysis.dynamicAnalysis.networkConnections.map((conn, i) => (
                        <p key={i} className="text-xs text-red-400 font-mono">{conn}</p>
                      ))}
                    </div>
                  </div>
                )}

                {results.analysis.dynamicAnalysis.registryModifications.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-primary/80 mb-2">Registry Modifications</p>
                    <div className="space-y-1">
                      {results.analysis.dynamicAnalysis.registryModifications.map((reg, i) => (
                        <p key={i} className="text-xs text-orange-400 font-mono">{reg}</p>
                      ))}
                    </div>
                  </div>
                )}

                {results.analysis.dynamicAnalysis.fileSystemChanges.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-primary/80 mb-2">File System Changes</p>
                    <div className="space-y-1">
                      {results.analysis.dynamicAnalysis.fileSystemChanges.map((fs, i) => (
                        <p key={i} className="text-xs text-red-400 font-mono">{fs}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {results.analysis.dynamicAnalysis.processes.length === 0 &&
               results.analysis.dynamicAnalysis.networkConnections.length === 0 &&
               results.analysis.dynamicAnalysis.registryModifications.length === 0 &&
               results.analysis.dynamicAnalysis.fileSystemChanges.length === 0 && (
                <p className="text-sm text-primary/70">✓ No suspicious behavioral activity detected</p>
              )}
            </div>

            {/* Threat Intelligence */}
            {(results.analysis.threatIntelligence.knownMalware || results.analysis.threatIntelligence.c2Detected) && (
              <div className="cyber-card p-6 rounded-lg border border-red-500/40 bg-red-500/5">
                <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Threat Intelligence Alerts
                </h3>

                <div className="space-y-3">
                  {results.analysis.threatIntelligence.knownMalware && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded border border-red-500/30">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <span className="text-sm text-red-400">File matches known malware signatures</span>
                    </div>
                  )}
                  {results.analysis.threatIntelligence.c2Detected && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded border border-red-500/30">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <span className="text-sm text-red-400">Command & Control (C2) communication detected</span>
                    </div>
                  )}
                  {results.analysis.threatIntelligence.exploitDetected && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded border border-red-500/30">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <span className="text-sm text-red-400">Exploit code patterns detected</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MITRE ATT&CK Mapping */}
            {results.analysis.mitreMappings.length > 0 && (
              <div className="cyber-card p-6 rounded-lg border border-primary/40">
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  MITRE ATT&CK Techniques
                </h3>

                <div className="space-y-3">
                  {results.analysis.mitreMappings.map((mapping, i) => (
                    <div key={i} className="p-3 bg-primary/10 rounded border border-primary/30">
                      <p className="text-xs font-bold text-primary/60 uppercase mb-1">{mapping.tactic}</p>
                      <p className="text-sm text-primary">{mapping.technique}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className={`cyber-card p-6 rounded-lg border ${verdictBgColor}`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${verdictTextColor}`}>
                {results.verdict === 'SAFE' && <CheckCircle2 className="w-5 h-5" />}
                {results.verdict === 'SUSPICIOUS' && <AlertCircle className="w-5 h-5" />}
                {results.verdict === 'MALICIOUS' && <AlertTriangle className="w-5 h-5" />}
                Recommendation
              </h3>

              <p className="text-primary/80 mb-4">
                {results.verdict === 'SAFE' && 'This file appears to be safe. No malicious indicators or suspicious behavior patterns were detected during analysis.'}
                {results.verdict === 'SUSPICIOUS' && 'This file exhibits some suspicious characteristics. Quarantine and further investigation is recommended before deployment.'}
                {results.verdict === 'MALICIOUS' && 'This file is identified as malicious. DO NOT EXECUTE. Immediate isolation and removal is required. Contact your security team.'}
              </p>

              <div className="text-xs text-primary/70 font-mono">
                Analysis completed: {new Date(results.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            <Button
              onClick={() => setResults(null)}
              className="flex-1 bg-primary/20 hover:bg-primary/40 text-primary font-bold border border-primary/40"
            >
              Analyze Another File
            </Button>
            <Button
              onClick={() => window.print()}
              className="flex-1 bg-primary/20 hover:bg-primary/40 text-primary font-bold border border-primary/40"
            >
              Generate Report
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-primary/60 hover:text-primary text-sm font-bold mb-4 inline-flex items-center gap-1">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <h1 className="text-4xl font-bold text-primary mb-4 tracking-wide">Sandbox Analysis</h1>
          <p className="text-primary/70 max-w-2xl">
            Upload files for deep security analysis. Analyze static code, dynamic behavior, network activity, and detect 
            potential threats. Understand process execution, system modifications, and classify files as safe or unsafe.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`cyber-card p-12 rounded-lg border-2 border-dashed transition-all duration-300 mb-8 cursor-pointer ${
            dragActive
              ? 'border-primary bg-primary/10'
              : 'border-primary/40 hover:border-primary/60 bg-primary/5 hover:bg-primary/10'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleChange}
            className="hidden"
          />

          <div className="text-center">
            <div className="mb-4 inline-block p-4 bg-primary/20 rounded-lg">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">
              {uploading ? 'Analyzing File...' : 'Drop File Here or Click to Upload'}
            </h3>
            <p className="text-primary/70 mb-4">
              {uploading
                ? 'Running static and dynamic analysis...'
                : 'Upload any file (exe, dll, pdf, doc, zip, etc) for deep security analysis'}
            </p>
            {!uploading && (
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary/20 hover:bg-primary/40 text-primary font-bold border border-primary/40"
              >
                Choose File
              </Button>
            )}
            {uploading && (
              <div className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                <span className="text-sm text-primary/70">Processing analysis...</span>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="cyber-card p-6 rounded-lg border border-primary/30">
            <div className="mb-4 p-3 bg-primary/20 rounded-lg w-fit">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-primary mb-2">Static Analysis</h3>
            <p className="text-xs text-primary/70">Analyze file structure, APIs, strings, and signatures without execution</p>
          </div>

          <div className="cyber-card p-6 rounded-lg border border-primary/30">
            <div className="mb-4 p-3 bg-primary/20 rounded-lg w-fit">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-primary mb-2">Dynamic Behavior</h3>
            <p className="text-xs text-primary/70">Monitor processes, network connections, and system modifications</p>
          </div>

          <div className="cyber-card p-6 rounded-lg border border-primary/30">
            <div className="mb-4 p-3 bg-primary/20 rounded-lg w-fit">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-primary mb-2">Threat Intelligence</h3>
            <p className="text-xs text-primary/70">Cross-reference with known malware databases and C2 infrastructure</p>
          </div>
        </div>
      </div>
    </div>
  )
}
