'use client'

import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Globe } from 'lucide-react'

interface ThreatMapProps {
  scanHistory: Array<{
    query: string
    country?: string
    threatLevel: string
    threatScore: number
    timestamp: number
  }>
}

export function ThreatMap({ scanHistory }: ThreatMapProps) {
  // Calculate threats by region
  const threatsByRegion = {
    'ASIA-PACIFIC': 0,
    'EUROPE': 0,
    'AMERICAS': 0,
    'MIDDLE_EAST': 0,
    'AFRICA': 0,
  }

  const threatTypes: Record<string, number> = {
    'Phishing': 0,
    'Malware': 0,
    'DDoS': 0,
    'Data Breach': 0,
  }

  const countryMap: Record<string, number> = {}

  // Process scan history to populate threat data
  scanHistory.forEach(scan => {
    const country = scan.country || 'Unknown'
    countryMap[country] = (countryMap[country] || 0) + 1

    // Map country to region
    const regionMap: Record<string, string> = {
      'United States': 'AMERICAS',
      'Canada': 'AMERICAS',
      'Mexico': 'AMERICAS',
      'Brazil': 'AMERICAS',
      'United Kingdom': 'EUROPE',
      'Germany': 'EUROPE',
      'France': 'EUROPE',
      'Russia': 'EUROPE',
      'China': 'ASIA-PACIFIC',
      'Japan': 'ASIA-PACIFIC',
      'India': 'ASIA-PACIFIC',
      'Australia': 'ASIA-PACIFIC',
      'Saudi Arabia': 'MIDDLE_EAST',
      'United Arab Emirates': 'MIDDLE_EAST',
      'Egypt': 'AFRICA',
      'South Africa': 'AFRICA',
    }

    const region = regionMap[country] || 'AMERICAS'
    threatsByRegion[region as keyof typeof threatsByRegion]++

    // Map threat level to threat type
    switch (scan.threatLevel) {
      case 'critical':
      case 'high':
        threatTypes['Malware']++
        break
      case 'medium':
        threatTypes['Phishing']++
        break
      case 'low':
        threatTypes['DDoS']++
        break
      default:
        threatTypes['Data Breach']++
    }
  })

  // Prepare chart data
  const regionChartData = Object.entries(threatsByRegion).map(([region, count]) => ({
    name: region,
    threats: count,
    critical: Math.floor(count * 0.3),
  }))

  const threatDistributionData = [
    { name: 'Phishing', value: threatTypes['Phishing'], color: '#FFA500' },
    { name: 'Malware', value: threatTypes['Malware'], color: '#00FF00' },
    { name: 'DDoS', value: threatTypes['DDoS'], color: '#FF0000' },
    { name: 'Data Breach', value: threatTypes['Data Breach'], color: '#00FFFF' },
  ].filter(item => item.value > 0)

  // Get top 3 threat sources
  const topSources = Object.entries(countryMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  const totalScans = scanHistory.length
  const lastUpdated = new Date().toLocaleTimeString()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold text-primary cyber-glow" style={{ letterSpacing: '0.2em' }}>GLOBAL THREAT MAP</h2>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Data Source: Advanced OSINT Scanner History</p>
          <p>Updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threats by Region */}
        <div className="cyber-card p-6 rounded-lg border border-primary/30">
          <h3 className="text-xl font-bold text-primary mb-4">Threats by Region</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00FF00" opacity={0.2} />
              <XAxis dataKey="name" stroke="#00FF00" fontSize={12} />
              <YAxis stroke="#00FF00" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #00FF00' }}
                labelStyle={{ color: '#00FF00' }}
              />
              <Legend />
              <Bar dataKey="threats" fill="#00FF00" />
              <Bar dataKey="critical" fill="#FF0000" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Threat Distribution */}
        <div className="cyber-card p-6 rounded-lg border border-primary/30">
          <h3 className="text-xl font-bold text-primary mb-4">Threat Distribution</h3>
          {threatDistributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={threatDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {threatDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #00FF00' }}
                  labelStyle={{ color: '#00FF00' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No threat data available
            </div>
          )}
          {threatDistributionData.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {threatDistributionData.map((item) => {
                const total = threatDistributionData.reduce((sum, t) => sum + t.value, 0)
                const percentage = Math.round((item.value / total) * 100)
                return (
                  <div key={item.name} className="text-sm" style={{ color: item.color }}>
                    {item.name}: {percentage}%
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Threat Sources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topSources.length > 0 ? (
          topSources.map((source, index) => (
            <div
              key={source[0]}
              className={`p-4 rounded-lg border ${
                index === 0
                  ? 'border-red-500/50 bg-red-500/5'
                  : index === 1
                    ? 'border-yellow-500/50 bg-yellow-500/5'
                    : 'border-red-500/50 bg-red-500/5'
              }`}
            >
              <p className={`text-xs font-bold mb-2 ${
                index === 0
                  ? 'text-red-400'
                  : index === 1
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }`}>
                {index === 0 ? 'HIGHEST THREAT SOURCE' : index === 1 ? 'SECOND THREAT SOURCE' : 'THIRD THREAT SOURCE'}
              </p>
              <p className={`text-lg font-bold mb-2 ${
                index === 0
                  ? 'text-red-400'
                  : index === 1
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }`}>
                {source[0]}
              </p>
              <p className="text-sm text-muted-foreground">{source[1]} incidents detected</p>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-muted-foreground py-4">
            No threat source data available
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="text-sm text-muted-foreground border-t border-border/30 pt-4">
        <p>Total Scans Analyzed: <span className="text-primary font-bold">{totalScans}</span> | Last Updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}
