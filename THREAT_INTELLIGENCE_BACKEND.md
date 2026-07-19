# Threat Intelligence Backend - OSINT Platform

## Overview

This Advanced OSINT Platform simulates real-world threat intelligence capabilities similar to industry-leading tools like Shodan, VirusTotal, and AbuseIPDB. The current implementation uses sophisticated mock data generation, but can be integrated with real threat intelligence APIs.

## Current Implementation

### Mock Data Generation
The platform currently uses **intelligent mock data generation** that produces varied, realistic results based on input characteristics:

#### IP Address Analysis
- **Pattern Recognition**: Analyzes IP octets to categorize (private, cloud provider, suspicious ranges)
- **Geolocation**: Maps IPs to realistic countries, cities, ISPs, and ASN data
- **Reputation Scoring**: Dynamic scoring based on IP characteristics (0-100 scale)
- **Port Scanning**: Simulates open ports and service banners
- **Threat Detection**: Identifies malware C&C, botnets, spam sources, and CVE vulnerabilities

#### Domain Analysis
- **Keyword Detection**: Flags suspicious terms (phishing, malware, hack, crack)
- **Pattern Analysis**: Detects typosquatting, excessive dashes, suspicious TLDs
- **DNS Records**: Generates realistic A, AAAA, MX, NS, and TXT records
- **SSL/TLS Analysis**: Certificate validation, issuer information, key strength
- **WHOIS Data**: Registration dates, registrar info, expiration dates
- **Technology Stack**: Web server, frameworks, and analytics detection

#### Hash Analysis
- **Signature Matching**: Simulates VirusTotal-style multi-engine scanning
- **Malware Family Classification**: Identifies known malware families (Emotet, TrickBot, Ryuk, etc.)
- **Behavioral Analysis**: Detects suspicious behaviors (registry modification, process injection)
- **IOC Extraction**: Generates Indicators of Compromise (domains, IPs, URLs, mutexes, registry keys)
- **Threat Actor Attribution**: Links to APT groups (APT28, APT29, Lazarus, FIN7)

## Real Threat Intelligence Integration Options

### Recommended APIs for Production

#### 1. **VirusTotal API** (File & URL Scanning)
- **Purpose**: Malware detection, hash analysis, URL/domain reputation
- **Capabilities**: 70+ antivirus engines, behavioral analysis, community comments
- **Pricing**: Free tier (4 requests/min), Premium ($$$)
- **Integration**: `https://www.virustotal.com/api/v3/`

\`\`\`typescript
// Example integration
const response = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
  headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY }
})
\`\`\`

#### 2. **AbuseIPDB** (IP Reputation)
- **Purpose**: IP abuse reports, blacklist checking, threat scoring
- **Capabilities**: Community-driven abuse reports, confidence scores, ISP data
- **Pricing**: Free tier (1,000 checks/day), Premium ($$$)
- **Integration**: `https://api.abuseipdb.com/api/v2/check`

\`\`\`typescript
const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}`, {
  headers: { 'Key': process.env.ABUSEIPDB_API_KEY }
})
\`\`\`

#### 3. **Shodan API** (Internet-Wide Scanning)
- **Purpose**: Port scanning, service detection, banner grabbing
- **Capabilities**: Real-time internet device data, vulnerability detection
- **Pricing**: Free tier (limited), Membership ($59/month), Enterprise ($$$)
- **Integration**: `https://api.shodan.io/shodan/host/${ip}`

\`\`\`typescript
const response = await fetch(`https://api.shodan.io/shodan/host/${ip}?key=${process.env.SHODAN_API_KEY}`)
\`\`\`

#### 4. **URLScan.io** (URL/Domain Analysis)
- **Purpose**: Website scanning, screenshot capture, DOM analysis
- **Capabilities**: Automated browser scanning, threat detection, visual analysis
- **Pricing**: Free tier, Pro ($$$)
- **Integration**: `https://urlscan.io/api/v1/scan/`

#### 5. **AlienVault OTX** (Open Threat Exchange)
- **Purpose**: Community threat intelligence, IOC sharing
- **Capabilities**: Pulse feeds, indicator lookup, threat actor tracking
- **Pricing**: Free (community-driven)
- **Integration**: `https://otx.alienvault.com/api/v1/indicators/`

#### 6. **IPinfo.io** (IP Geolocation)
- **Purpose**: Accurate IP geolocation, ASN data, company information
- **Capabilities**: City-level accuracy, carrier detection, privacy detection
- **Pricing**: Free tier (50k/month), Paid plans ($$$)
- **Integration**: `https://ipinfo.io/${ip}/json`

#### 7. **SecurityTrails** (DNS & Domain Intelligence)
- **Purpose**: Historical DNS records, WHOIS data, subdomain discovery
- **Capabilities**: DNS history, SSL certificate tracking, domain monitoring
- **Pricing**: Free tier (limited), Paid plans ($$$)
- **Integration**: `https://api.securitytrails.com/v1/domain/${domain}`

#### 8. **GreyNoise** (Internet Scanner Detection)
- **Purpose**: Distinguish malicious IPs from benign scanners
- **Capabilities**: Internet noise filtering, scanner classification
- **Pricing**: Free tier, Enterprise ($$$)
- **Integration**: `https://api.greynoise.io/v3/community/${ip}`

## Integration Architecture

### Recommended Approach

\`\`\`typescript
// app/api/scan/route.ts
import { NextRequest, NextResponse } from "next/server"

async function scanIP(ip: string) {
  // Parallel API calls for comprehensive data
  const [abuseData, shodanData, geoData, greynoiseData] = await Promise.all([
    fetchAbuseIPDB(ip),
    fetchShodan(ip),
    fetchIPInfo(ip),
    fetchGreyNoise(ip)
  ])

  // Aggregate and normalize data
  return {
    threatLevel: calculateThreatLevel(abuseData, greynoiseData),
    geolocation: geoData,
    network: shodanData,
    reputation: abuseData,
    // ... more fields
  }
}

async function scanDomain(domain: string) {
  const [virusTotalData, urlscanData, securityTrailsData] = await Promise.all([
    fetchVirusTotal(domain),
    fetchURLScan(domain),
    fetchSecurityTrails(domain)
  ])

  return {
    threatLevel: virusTotalData.malicious ? "high" : "low",
    dns: securityTrailsData.dns,
    ssl: urlscanData.certificates,
    // ... more fields
  }
}

async function scanHash(hash: string) {
  const vtData = await fetchVirusTotal(hash)
  
  return {
    threatLevel: vtData.stats.malicious > 5 ? "high" : "low",
    hashAnalysis: {
      malicious: vtData.stats.malicious > 0,
      engines: `${vtData.stats.malicious}/${vtData.stats.total}`,
      signatures: vtData.results.map(r => r.result)
    },
    // ... more fields
  }
}
\`\`\`

### Rate Limiting & Caching

\`\`\`typescript
// Implement caching to reduce API costs
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN
})

async function getCachedOrFetch(key: string, fetchFn: () => Promise<any>, ttl = 3600) {
  const cached = await redis.get(key)
  if (cached) return cached

  const data = await fetchFn()
  await redis.setex(key, ttl, JSON.stringify(data))
  return data
}
\`\`\`

## AI-Powered Enhancements

### Using Vercel AI SDK for Threat Analysis

\`\`\`typescript
import { generateText } from 'ai'

async function analyzeWithAI(scanData: any) {
  const { text } = await generateText({
    model: 'openai/gpt-4.1',
    prompt: `Analyze this threat intelligence data and provide a security assessment:
    
    ${JSON.stringify(scanData, null, 2)}
    
    Provide:
    1. Overall threat level (low/medium/high/critical)
    2. Key security concerns
    3. Recommended actions
    4. Risk score (0-100)
    `
  })

  return text
}
\`\`\`

## Cost Considerations

| Service | Free Tier | Paid Tier | Best For |
|---------|-----------|-----------|----------|
| VirusTotal | 4 req/min | $$$$ | Hash/URL scanning |
| AbuseIPDB | 1k/day | $20-200/mo | IP reputation |
| Shodan | Limited | $59/mo | Port scanning |
| URLScan.io | 100/day | $150/mo | Domain analysis |
| IPinfo.io | 50k/mo | $249/mo | Geolocation |
| AlienVault OTX | Unlimited | Free | Community intel |
| GreyNoise | 50/day | $$$$ | Noise filtering |

## Security Best Practices

1. **API Key Management**: Store all API keys in environment variables
2. **Rate Limiting**: Implement request throttling to avoid API bans
3. **Caching**: Cache results for 1-24 hours to reduce costs
4. **Error Handling**: Gracefully handle API failures with fallbacks
5. **Data Validation**: Sanitize all user inputs before API calls
6. **Logging**: Track API usage and costs for monitoring

## Current vs Production Comparison

| Feature | Current (Mock) | Production (Real APIs) |
|---------|----------------|------------------------|
| Data Accuracy | Simulated | Real-time, verified |
| Update Frequency | Static | Live updates |
| Coverage | Pattern-based | Global internet scan |
| Cost | Free | $500-5000/month |
| Rate Limits | None | API-dependent |
| Historical Data | No | Yes (with premium) |

## Next Steps for Production

1. **Choose API Providers**: Select based on budget and requirements
2. **Implement Caching**: Use Redis/Upstash to reduce API costs
3. **Add Authentication**: Protect your platform with user accounts
4. **Rate Limiting**: Prevent abuse with request throttling
5. **Monitoring**: Track API usage, costs, and performance
6. **AI Integration**: Add GPT-4 for intelligent threat analysis
7. **Database**: Store scan history and user queries

## Conclusion

The current implementation provides a **realistic simulation** of OSINT capabilities. For production use, integrate real threat intelligence APIs based on your budget and requirements. The modular architecture makes it easy to swap mock data with real API calls.
\`\`\`

\`\`\`tsx file="" isHidden
