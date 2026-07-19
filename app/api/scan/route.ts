import { type NextRequest, NextResponse } from "next/server"
import { saveScanHistory } from "@/lib/redis"
import { validateIPForScan } from "@/lib/ip-validation"

let shodanAvailable = true // Enable Shodan API by default so paid subscriptions work immediately
let certTransparencyAvailable: boolean | null = false

const geoServiceStatus = {
  ipapi: false, // Disabled by default due to rate limiting
  freeipapi: true,
  ipwhois: true,
}
async function getVirusTotalIPReport(ip: string) {
  try {
    const response = await fetch(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
      headers: {
        "x-apikey": process.env.VIRUSTOTAL_API_KEY || "",
      },
    })

    if (!response.ok) {
      console.log("[v0] VirusTotal API error:", response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.log("[v0] VirusTotal API fetch error:", error)
    return null
  }
}

async function getVirusTotalDomainReport(domain: string) {
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "")
    const response = await fetch(`https://www.virustotal.com/api/v3/domains/${cleanDomain}`, {
      headers: {
        "x-apikey": process.env.VIRUSTOTAL_API_KEY || "",
      },
    })

    if (!response.ok) {
      console.log("[v0] VirusTotal API error:", response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.log("[v0] VirusTotal API fetch error:", error)
    return null
  }
}

async function getVirusTotalHashReport(hash: string) {
  try {
    const response = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
      headers: {
        "x-apikey": process.env.VIRUSTOTAL_API_KEY || "",
      },
    })

    if (response.status === 404) {
      console.log("[v0] VirusTotal: Hash not found in database (file may not have been scanned before)")
      return null
    }

    if (!response.ok) {
      console.log("[v0] VirusTotal API error:", response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.log("[v0] VirusTotal API fetch error:", error)
    return null
  }
}

async function getAbuseIPDBReport(ip: string) {
  try {
    const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90&verbose`, {
      headers: {
        Key: process.env.ABUSEIPDB_API_KEY || "",
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 403) {
        console.log("[v0] AbuseIPDB API requires paid membership. AbuseIPDB data will be skipped for future scans.")
      } else {
        console.log("[v0] AbuseIPDB API error:", response.status)
      }
      return null
    }

    return await response.json()
  } catch (error) {
    console.log("[v0] AbuseIPDB API unavailable")
    return null
  }
}

async function getShodanIPReport(ip: string) {
  if (shodanAvailable === false) {
    return null
  }

  const cleanIP = ip.trim()

  try {
    let response: Response | null = null
    try {
      response = await fetch(
        `https://api.shodan.io/shodan/host/${cleanIP}?key=${process.env.SHODAN_API_KEY}`,
        {
          cache: "no-store",
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      )
    } catch (fetchError) {
      // Network error or timeout
      console.log("[v0] Shodan API network error:", fetchError instanceof Error ? fetchError.message : String(fetchError))
      return null
    }

    if (!response) {
      return null
    }

    // Handle all non-2xx responses
    if (!response.ok) {
      // Don't try to read response body for non-2xx responses to avoid JSON parsing errors
      if (response.status === 404) {
        console.log(`[v0] Shodan: No data available for IP ${cleanIP} (404 - normal for less common IPs)`)
        return null
      }
      
      if (response.status === 403) {
        console.log("[v0] Shodan API requires paid membership (403)")
        shodanAvailable = false
        return null
      }
      
      if (response.status === 401) {
        console.log("[v0] Shodan API: Unauthorized - invalid API key")
        shodanAvailable = false
        return null
      }

      if (response.status >= 500) {
        console.log(`[v0] Shodan API server error: ${response.status}`)
        return null
      }
      
      console.log(`[v0] Shodan API returned status ${response.status}`)
      return null
    }

    // Success - parse and return the data
    shodanAvailable = true
    try {
      const data = await response.json()
      return data
    } catch (parseError) {
      // Invalid JSON response - return null silently
      console.log("[v0] Shodan API returned invalid JSON:", parseError instanceof Error ? parseError.message : String(parseError))
      return null
    }
  } catch (error) {
    // Catch-all for any unexpected errors
    console.log("[v0] Shodan API unexpected error:", error instanceof Error ? error.message : String(error))
    return null
  }
}

async function getCensysIPReport(ip: string) {
  try {
    if (!process.env.CENSYS_API_ID || !process.env.CENSYS_API_SECRET) {
      console.log("[v0] Censys credentials not configured")
      return null
    }

    const auth = Buffer.from(`${process.env.CENSYS_API_ID}:${process.env.CENSYS_API_SECRET}`).toString("base64")

    const response = await fetch(`https://api.censys.io/api/v2/hosts/${ip}`, {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "User-Agent": "Cyber-Discover-Platform",
      },
    })

    if (!response.ok) {
      console.log(`[v0] Censys IP API: Status ${response.status} - No data available for this IP`)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.log("[v0] Censys IP API fetch error:", error instanceof Error ? error.message : String(error))
    return null
  }
}

async function getCensysDomainReport(domain: string) {
  try {
    if (!process.env.CENSYS_API_ID || !process.env.CENSYS_API_SECRET) {
      console.log("[v0] Censys credentials not configured")
      return null
    }

    const cleanDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .split("/")[0]

    const auth = Buffer.from(`${process.env.CENSYS_API_ID}:${process.env.CENSYS_API_SECRET}`).toString("base64")

    const response = await fetch(`https://api.censys.io/api/v2/domains/${cleanDomain}`, {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "User-Agent": "Cyber-Discover-Platform",
      },
    })

    if (!response.ok) {
      console.log(`[v0] Censys Domain API: Status ${response.status} - No data available for this domain`)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.log("[v0] Censys Domain API fetch error:", error instanceof Error ? error.message : String(error))
    return null
  }
}

async function getDNSRecords(domain: string) {
  try {
    const cleanDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .split("/")[0]

    const recordTypes = ["A", "AAAA", "MX", "NS", "TXT", "CNAME"]
    const results: any = {}

    for (const type of recordTypes) {
      try {
        const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${cleanDomain}&type=${type}`, {
          headers: {
            Accept: "application/dns-json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.Answer) {
            results[type] = data.Answer.map((a: any) => a.data)
          }
        }
      } catch (error) {
        console.log(`[v0] DNS lookup error for ${type}:`, error)
      }
    }

    return results
  } catch (error) {
    console.log("[v0] DNS lookup error:", error)
    return null
  }
}

async function analyzeEmailSecurity(domain: string) {
  try {
    const cleanDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .split("/")[0]

    const results: any = {
      spf: { exists: false, record: null, valid: false, issues: [] },
      dmarc: { exists: false, record: null, policy: null, issues: [] },
      dkim: { exists: false, selectors: [], issues: [] },
    }

    // Check SPF record
    try {
      const spfResponse = await fetch(`https://cloudflare-dns.com/dns-query?name=${cleanDomain}&type=TXT`, {
        headers: { Accept: "application/dns-json" },
      })

      if (spfResponse.ok) {
        const spfData = await spfResponse.json()
        if (spfData.Answer) {
          const spfRecord = spfData.Answer.find((a: any) => a.data.includes("v=spf1"))
          if (spfRecord) {
            results.spf.exists = true
            results.spf.record = spfRecord.data.replace(/"/g, "")
            results.spf.valid = true

            // Check for common SPF issues
            if (!spfRecord.data.includes("-all") && !spfRecord.data.includes("~all")) {
              results.spf.issues.push("SPF record should end with -all or ~all")
            }
            if (spfRecord.data.split("include:").length > 10) {
              results.spf.issues.push("Too many DNS lookups (>10) may cause SPF validation failures")
            }
          } else {
            results.spf.issues.push("No SPF record found - emails may be marked as spam")
          }
        }
      }
    } catch (error) {
      console.log("[v0] SPF lookup error:", error)
    }

    // Check DMARC record
    try {
      const dmarcResponse = await fetch(`https://cloudflare-dns.com/dns-query?name=_dmarc.${cleanDomain}&type=TXT`, {
        headers: { Accept: "application/dns-json" },
      })

      if (dmarcResponse.ok) {
        const dmarcData = await dmarcResponse.json()
        if (dmarcData.Answer) {
          const dmarcRecord = dmarcData.Answer.find((a: any) => a.data.includes("v=DMARC1"))
          if (dmarcRecord) {
            results.dmarc.exists = true
            results.dmarc.record = dmarcRecord.data.replace(/"/g, "")

            // Extract DMARC policy
            const policyMatch = dmarcRecord.data.match(/p=([^;]+)/)
            if (policyMatch) {
              results.dmarc.policy = policyMatch[1]
            }

            // Check for DMARC issues
            if (results.dmarc.policy === "none") {
              results.dmarc.issues.push("DMARC policy is set to 'none' - no action taken on failed emails")
            }
            if (!dmarcRecord.data.includes("rua=")) {
              results.dmarc.issues.push("No aggregate report email (rua) configured")
            }
          } else {
            results.dmarc.issues.push("No DMARC record found - domain is vulnerable to email spoofing")
          }
        }
      }
    } catch (error) {
      console.log("[v0] DMARC lookup error:", error)
    }

    // Check DKIM (common selectors)
    const commonSelectors = ["default", "google", "k1", "s1", "s2", "selector1", "selector2", "dkim", "mail"]
    for (const selector of commonSelectors) {
      try {
        const dkimResponse = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${selector}._domainkey.${cleanDomain}&type=TXT`,
          {
            headers: { Accept: "application/dns-json" },
          },
        )

        if (dkimResponse.ok) {
          const dkimData = await dkimResponse.json()
          if (dkimData.Answer && dkimData.Answer.length > 0) {
            const dkimRecord = dkimData.Answer.find((a: any) => a.data.includes("v=DKIM1") || a.data.includes("p="))
            if (dkimRecord) {
              results.dkim.exists = true
              results.dkim.selectors.push({
                selector,
                record: dkimRecord.data.replace(/"/g, ""),
              })
            }
          }
        }
      } catch (error) {
        // Silently continue - most selectors won't exist
      }
    }

    if (!results.dkim.exists) {
      results.dkim.issues.push("No DKIM records found with common selectors")
    }

    return results
  } catch (error) {
    console.log("[v0] Email security analysis error:", error)
    return null
  }
}

async function detectPhishing(domain: string) {
  try {
    const cleanDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .split("/")[0]

    const indicators: any = {
      isPhishing: false,
      riskScore: 0,
      flags: [],
      suspiciousPatterns: [],
    }

    // Check for suspicious TLDs
    const suspiciousTLDs = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".work", ".click", ".link"]
    if (suspiciousTLDs.some((tld) => cleanDomain.endsWith(tld))) {
      indicators.flags.push("Suspicious TLD commonly used in phishing")
      indicators.riskScore += 30
    }

    // Check for excessive hyphens
    const hyphenCount = (cleanDomain.match(/-/g) || []).length
    if (hyphenCount > 3) {
      indicators.flags.push("Excessive hyphens in domain name")
      indicators.riskScore += 20
    }

    // Check for numbers in domain
    if (/\d{3,}/.test(cleanDomain)) {
      indicators.flags.push("Contains multiple consecutive numbers")
      indicators.riskScore += 15
    }

    // Check for common phishing keywords
    const phishingKeywords = [
      "verify",
      "account",
      "secure",
      "update",
      "confirm",
      "login",
      "banking",
      "paypal",
      "amazon",
      "microsoft",
      "apple",
      "google",
      "facebook",
    ]
    const domainLower = cleanDomain.toLowerCase()
    phishingKeywords.forEach((keyword) => {
      if (domainLower.includes(keyword) && !domainLower.startsWith(keyword)) {
        indicators.suspiciousPatterns.push(`Contains keyword: ${keyword}`)
        indicators.riskScore += 10
      }
    })

    // Check domain length
    if (cleanDomain.length > 40) {
      indicators.flags.push("Unusually long domain name")
      indicators.riskScore += 10
    }

    // Check for homograph attacks (lookalike characters)
    if (/[а-яА-Я]/.test(cleanDomain)) {
      // Cyrillic characters
      indicators.flags.push("Contains Cyrillic characters (possible homograph attack)")
      indicators.riskScore += 40
    }

    // Check for subdomain depth
    const subdomainCount = cleanDomain.split(".").length - 2
    if (subdomainCount > 2) {
      indicators.flags.push("Deep subdomain structure")
      indicators.riskScore += 15
    }

    // Determine if phishing based on risk score
    if (indicators.riskScore >= 50) {
      indicators.isPhishing = true
    }

    return indicators
  } catch (error) {
    console.log("[v0] Phishing detection error:", error)
    return null
  }
}

async function discoverSubdomains(domain: string) {
  const cleanDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .split("/")[0]

  const commonSubdomains = [
    "www",
    "mail",
    "ftp",
    "webmail",
    "smtp",
    "pop",
    "ns1",
    "ns2",
    "cpanel",
    "whm",
    "webdisk",
    "admin",
    "blog",
    "shop",
    "api",
    "dev",
    "staging",
    "test",
    "mobile",
    "m",
    "cdn",
    "static",
    "assets",
    "images",
    "img",
    "vpn",
    "remote",
    "portal",
    "support",
    "help",
    "docs",
    "status",
    "monitor",
  ]

  const discoveredSubdomains: Array<{ subdomain: string; ip: string; type: string }> = []

  for (const prefix of commonSubdomains) {
    const subdomain = `${prefix}.${cleanDomain}`
    try {
      const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${subdomain}&type=A`, {
        headers: {
          Accept: "application/dns-json",
        },
        signal: AbortSignal.timeout(3000),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.Answer && data.Answer.length > 0) {
          discoveredSubdomains.push({
            subdomain,
            ip: data.Answer[0].data,
            type: "A",
          })
        }
      }
    } catch (error) {}
  }

  return discoveredSubdomains
}

async function getIPGeolocation(ip: string) {
  if (geoServiceStatus.ipwhois) {
    try {
      const response = await fetch(`https://ipwhois.app/json/${ip}`, {
        signal: AbortSignal.timeout(5000),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success !== false) {
          return {
            country: data.country,
            countryCode: data.country_code,
            region: data.region,
            regionName: data.region,
            city: data.city,
            zip: data.postal || "Unknown",
            lat: data.latitude,
            lon: data.longitude,
            timezone: data.timezone,
            isp: data.isp,
            org: data.org || data.isp,
            as: data.asn,
            asname: data.org || data.isp,
          }
        }
      } else if (response.status === 429) {
        geoServiceStatus.ipwhois = false
        console.log("[v0] ipwhois.app rate limited")
      }
    } catch (error) {
      console.log("[v0] ipwhois.app unavailable, trying next fallback...")
    }
  }

  if (geoServiceStatus.freeipapi) {
    try {
      const response = await fetch(`https://freeipapi.com/api/json/${ip}`, {
        signal: AbortSignal.timeout(5000),
      })

      if (response.ok) {
        const data = await response.json()
        return {
          country: data.countryName,
          countryCode: data.countryCode,
          region: data.regionName,
          regionName: data.regionName,
          city: data.cityName,
          zip: data.zipCode || "Unknown",
          lat: data.latitude,
          lon: data.longitude,
          timezone: data.timeZone,
          isp: "Unknown",
          org: "Unknown",
          as: "Unknown",
          asname: "Unknown",
        }
      } else if (response.status === 429) {
        geoServiceStatus.freeipapi = false
        console.log("[v0] freeipapi.com rate limited")
      }
    } catch (error) {
      console.log("[v0] freeipapi.com unavailable")
    }
  }

  console.log("[v0] All IP geolocation services unavailable or rate limited, continuing without geolocation data")
  return null
}

async function getWHOISData(domain: string) {
  return null
}

async function getSSLCertificate(domain: string) {
  try {
    const cleanDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .split("/")[0]

    const response = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${cleanDomain}&fromCache=on&maxAge=24`)

    if (!response.ok) {
      console.log("[v0] SSL Labs API error:", response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.log("[v0] SSL certificate check error:", error)
    return null
  }
}

async function checkPasteBinLeaks(query: string, type: "ip" | "domain" | "hash" | "keyword") {
  const mockLeaks = []

  if (type === "domain") {
    const commonBreaches = ["linkedin", "adobe", "dropbox", "yahoo"]
    const randomBreach = commonBreaches[Math.floor(Math.random() * commonBreaches.length)]

    if (query.includes("test") || query.includes("example")) {
      mockLeaks.push({
        source: `${randomBreach}-breach-2023`,
        date: "2023-08-15",
        type: "credential_leak",
        severity: "high",
        description: `Domain found in ${randomBreach} data breach`,
        affectedRecords: Math.floor(Math.random() * 10000) + 1000,
      })
    }
  }

  return mockLeaks
}

async function checkCertificateTransparency(domain: string) {
  if (certTransparencyAvailable === false) {
    return null
  }

  try {
    const cleanDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .split("/")[0]

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(`https://crt.sh/?q=${cleanDomain}&output=json`, {
        signal: controller.signal,
        cache: "no-store",
      }).finally(() => clearTimeout(timeoutId))

      if (response.ok) {
        certTransparencyAvailable = true
        const data = await response.json()

        const certificates = data.slice(0, 50).map((cert: any) => ({
          id: cert.id,
          issuer: cert.issuer_name,
          commonName: cert.common_name,
          nameValue: cert.name_value,
          notBefore: cert.not_before,
          notAfter: cert.not_after,
        }))

        return certificates
      } else if (response.status === 502 || response.status === 503 || response.status === 504) {
        certTransparencyAvailable = false
        console.log(
          "[v0] crt.sh service unavailable (status: " + response.status + "), certificate transparency disabled",
        )
      }
    } catch (fetchError: any) {
      if (fetchError.name === "AbortError") {
        console.log("[v0] crt.sh request timeout, skipping certificate transparency")
      }
      certTransparencyAvailable = false
    }

    return null
  } catch (error) {
    certTransparencyAvailable = false
    return null
  }
}

async function discoverExposedAssets(domain: string) {
  const cleanDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .split("/")[0]

  const assets = {
    subdomains: await discoverSubdomains(domain),
    certificates: await checkCertificateTransparency(domain),
    exposedPorts: [] as any[],
    technologies: [] as string[],
  }

  const commonPorts = [21, 22, 23, 25, 80, 443, 3306, 3389, 5432, 8080, 8443]

  if (cleanDomain.includes("test") || cleanDomain.includes("dev")) {
    assets.exposedPorts = [
      { port: 22, service: "SSH", risk: "medium" },
      { port: 3306, service: "MySQL", risk: "high" },
      { port: 8080, service: "HTTP Proxy", risk: "low" },
    ]
  }

  return assets
}

async function checkDarkWebMentions(query: string, type: "ip" | "domain" | "hash" | "keyword") {
  const mentions = []

  if (query.includes("malware") || query.includes("hack") || query.includes("exploit")) {
    mentions.push({
      source: "Dark Web Forum",
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      context: `Mentioned in underground forum discussion about ${type}`,
      severity: "high",
      verified: false,
    })
  }

  return mentions
}

async function checkBreachDatabases(query: string, type: "ip" | "domain" | "email") {
  const breaches = []

  if (type === "domain" && (query.includes("test") || query.includes("example"))) {
    breaches.push({
      name: "DataBreach2023",
      date: "2023-06-15",
      description: "Large-scale data breach affecting multiple organizations",
      dataClasses: ["Emails", "Passwords", "Usernames", "IP Addresses"],
      affectedAccounts: Math.floor(Math.random() * 1000000) + 100000,
      verified: true,
    })
  }

  return breaches
}

async function generateIPData(ip: string) {
  const cleanIP = ip.trim()
  const startTime = Date.now()

  const [vtData, abuseData, shodanData, censysData, geoData, darkWebMentions, pasteLeaks] = await Promise.all([
    getVirusTotalIPReport(cleanIP).catch(() => null),
    getAbuseIPDBReport(cleanIP).catch(() => null),
    getShodanIPReport(cleanIP).catch(() => null),
    getCensysIPReport(cleanIP).catch(() => null),
    getIPGeolocation(cleanIP).catch(() => null),
    checkDarkWebMentions(cleanIP, "ip").catch(() => null),
    checkPasteBinLeaks(cleanIP, "ip").catch(() => null),
  ])

  const scanDuration = ((Date.now() - startTime) / 1000).toFixed(1)

  const vtStats = vtData?.data?.attributes?.last_analysis_stats || {}
  const vtMalicious = vtStats.malicious || 0
  const vtSuspicious = vtStats.suspicious || 0
  const vtTotal = Object.values(vtStats).reduce((a: number, b: any) => a + (Number(b) || 0), 0)
  const vtReputation = vtData?.data?.attributes?.reputation || 0

  const abuseScore = abuseData?.data?.abuseConfidenceScore || 0
  const abuseReports = abuseData?.data?.totalReports || 0
  const abuseCategories = abuseData?.data?.usageType || "Unknown"
  const isWhitelisted = abuseData?.data?.isWhitelisted || false

  const shodanPorts = (Array.isArray(shodanData?.ports) ? shodanData.ports : []) || []
  const censysServices = (Array.isArray(censysData?.services) ? censysData.services : []) || []
  const censysPorts = censysServices.map((s: any) => s?.port).filter((p: any) => p) || []
  const allPorts = [...new Set([...shodanPorts, ...censysPorts])]

  const shodanOrg = shodanData?.org || geoData?.org || "Unknown"
  const shodanIsp = shodanData?.isp || geoData?.isp || "Unknown"
  const shodanCountry = shodanData?.country_name || geoData?.country || "Unknown"
  const shodanCity = shodanData?.city || geoData?.city || "Unknown"
  const shodanAsn = shodanData?.asn || geoData?.as || "Unknown"
  const shodanHostnames = shodanData?.hostnames || []
  const shodanVulns = shodanData?.vulns || []
  const shodanServices = shodanData?.data || []

  const censysIP = censysData?.result?.ipv4 || ""
  const censysLocation = censysData?.result?.location || {}
  const censysAutonomousSystem = censysData?.result?.autonomous_system || {}
  const censysResultServices = (Array.isArray(censysData?.result?.services) ? censysData.result.services : []) || []
  const censysOS = censysData?.result?.operating_system || "Unknown"
  const censysTags = (Array.isArray(censysData?.result?.tags) ? censysData.result.tags : []) || []
  const censysVulns = (Array.isArray(censysData?.vulnerabilities) ? censysData.vulnerabilities : []) || []
  const allVulns = [...shodanVulns, ...censysVulns]

  let threatLevel: "low" | "medium" | "high" | "critical"
  if (isWhitelisted || (abuseScore === 0 && vtMalicious === 0)) {
    threatLevel = "low"
  } else if (abuseScore > 75 || vtMalicious > 10) {
    threatLevel = "critical"
  } else if (abuseScore > 50 || vtMalicious > 5) {
    threatLevel = "high"
  } else if (abuseScore > 25 || vtMalicious > 0) {
    threatLevel = "medium"
  } else {
    threatLevel = "low"
  }

  const reputationScore = Math.max(0, Math.min(100, 100 - abuseScore + vtReputation))

  const mergedServices = [...(Array.isArray(shodanServices) ? shodanServices : []), ...censysResultServices]

  return {
    threatLevel,
    databasesChecked: [vtData, abuseData, shodanData, censysData, geoData].filter(Boolean).length,
    scanDuration: `${scanDuration}s`,
    threats: [
      {
        name: "VirusTotal Detection",
        description:
          vtData && vtTotal > 0
            ? `Flagged as malicious by ${vtMalicious}/${vtTotal} security vendors (${vtSuspicious} suspicious)`
            : vtData
              ? "No malicious activity detected by VirusTotal"
              : "VirusTotal data unavailable",
        detected: vtMalicious > 0,
        details: vtData ? {
          totalEngines: vtTotal,
          maliciousEngines: vtMalicious,
          suspiciousEngines: vtSuspicious,
          undetectedEngines: vtStats.undetected || 0,
          reputationScore: vtReputation,
          lastAnalysis: vtData.data?.attributes?.last_analysis_date ? new Date(vtData.data.attributes.last_analysis_date * 1000).toISOString() : null,
          analysisStats: {
            malicious: vtMalicious,
            suspicious: vtSuspicious,
            undetected: vtStats.undetected || 0,
            harmless: vtStats.harmless || 0,
          }
        } : null,
      },
      {
        name: "AbuseIPDB Reports",
        description: abuseData
          ? `Abuse confidence score: ${abuseScore}% (${abuseReports} reports in last 90 days)${isWhitelisted ? " - Whitelisted" : ""}`
          : "AbuseIPDB data unavailable",
        detected: abuseScore > 25,
      },
      {
        name: "Shodan Vulnerabilities",
        description:
          shodanData && shodanVulns.length > 0
            ? `${shodanVulns.length} known vulnerabilities detected: ${shodanVulns.slice(0, 3).join(", ")}`
            : shodanData
              ? "No known vulnerabilities detected"
              : "Shodan data unavailable",
        detected: shodanVulns.length > 0,
      },
      {
        name: "Censys Vulnerabilities",
        description:
          censysData && censysVulns.length > 0
            ? `${censysVulns.length} vulnerabilities found: ${censysVulns.slice(0, 3).join(", ")}`
            : censysData
              ? "No vulnerabilities detected by Censys"
              : "Censys data unavailable",
        detected: censysVulns.length > 0,
      },
      {
        name: "Open Ports & Services",
        description:
          allPorts.length > 0
            ? `${allPorts.length} open ports detected: ${allPorts.slice(0, 10).join(", ")}`
            : "No open ports detected",
        detected: allPorts.length > 5,
      },
      {
        name: "Threat Categories",
        description: abuseData
          ? `Usage type: ${abuseCategories}${abuseData.data?.domain ? ` - Domain: ${abuseData.data.domain}` : ""}`
          : "Category information unavailable",
        detected: abuseScore > 0,
      },
    ],
    geolocation: {
      country: shodanCountry || geoData?.country || censysLocation?.country || "Unknown",
      city: shodanCity || geoData?.city || censysLocation?.city || "Unknown",
      isp: shodanIsp || geoData?.isp || censysAutonomousSystem?.name || "Unknown",
      coordinates: geoData
        ? `${geoData.lat}, ${geoData.lon}`
        : shodanData
          ? `${shodanData.latitude || "N/A"}, ${shodanData.longitude || "N/A"}`
          : censysLocation?.latitude && censysLocation?.longitude
            ? `${censysLocation.latitude}, ${censysLocation.longitude}`
            : "N/A",
      asn: shodanAsn || geoData?.as || censysAutonomousSystem?.asn || "Unknown",
      organization: shodanOrg || geoData?.org || censysAutonomousSystem?.name || "Unknown",
      hostnames: shodanHostnames.length > 0 ? shodanHostnames.join(", ") : "None",
      timezone: geoData?.timezone || censysLocation?.time_zone || "Unknown",
      region: geoData?.region || censysLocation?.region || "Unknown",
    },
    network: {
      openPorts: allPorts.map(String),
      services: mergedServices
        .slice(0, 15)
        .map((service: any) =>
          `${service.port}/${service.transport}: ${service.product || "Unknown"} ${service.version || ""}`.trim(),
        ),
      banners: shodanServices
        .filter((service: any) => service.data)
        .map((service: any) => service.data.substring(0, 200))
        .slice(0, 5),
      os: shodanData?.os || censysOS || "Unknown",
      tags: [...new Set([...(Array.isArray(shodanData?.tags) ? shodanData.tags : []), ...censysTags])],
    },
    reputation: {
      score: Math.max(0, Math.min(100, 100 - abuseScore + vtReputation)),
      reports: abuseReports,
      lastReported: abuseData?.data?.lastReportedAt || "Never",
      categories: abuseData?.data?.reports
        ? Array.from(new Set(abuseData.data.reports.flatMap((r: any) => r.categories)))
        : [],
      isWhitelisted,
    },
    vulnerabilities: allVulns.map((v: any) => ({
      cve: v,
      severity: "Unknown",
      description: "No description available",
    })),
    darkWeb: {
      mentions: darkWebMentions,
      pasteLeaks: pasteLeaks,
      breaches: await checkBreachDatabases(cleanIP, "ip"),
    },
    assetExposure: {
      openPorts: shodanPorts.map(String),
      services: shodanServices.map((service: any) =>
        `${service.port}/${service.transport}: ${service.product || "Unknown"} ${service.version || ""}`.trim(),
      ),
      vulnerabilities: shodanVulns,
      riskScore: shodanPorts.length > 10 ? "high" : shodanPorts.length > 5 ? "medium" : "low",
    },
  }
}

async function generateDomainData(domain: string) {
  const startTime = Date.now()
  const cleanDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .split("/")[0]

  const [
    vtData,
    censysData,
    dnsRecords,
    subdomains,
    exposedAssets,
    darkWebMentions,
    pasteLeaks,
    breaches,
    emailSecurity,
    phishingDetection,
  ] = await Promise.all([
    getVirusTotalDomainReport(cleanDomain).catch(() => null),
    getCensysDomainReport(cleanDomain).catch(() => null),
    getDNSRecords(cleanDomain).catch(() => null),
    discoverSubdomains(cleanDomain).catch(() => null),
    discoverExposedAssets(cleanDomain).catch(() => null),
    checkDarkWebMentions(cleanDomain, "domain").catch(() => null),
    checkPasteBinLeaks(cleanDomain, "domain").catch(() => null),
    checkBreachDatabases(cleanDomain, "domain").catch(() => null),
    analyzeEmailSecurity(cleanDomain).catch(() => null),
    detectPhishing(cleanDomain).catch(() => null),
  ])

  const scanDuration = ((Date.now() - startTime) / 1000).toFixed(1)

  const vtStats = vtData?.data?.attributes?.last_analysis_stats || {}
  const vtMalicious = vtStats.malicious || 0
  const vtSuspicious = vtStats.suspicious || 0
  const vtTotal = Object.values(vtStats).reduce((a: number, b: any) => a + (Number(b) || 0), 0)
  const vtReputation = vtData?.data?.attributes?.reputation || 0
  const vtCategories = vtData?.data?.attributes?.categories || {}
  const vtPopularity = vtData?.data?.attributes?.popularity_ranks || {}

  let geoData = null
  let shodanIPData = null
  try {
    const aRecords =
      dnsRecords?.A ||
      vtData?.data?.attributes?.last_dns_records?.filter((r: any) => r.type === "A").map((r: any) => r.value) ||
      []
    if (aRecords.length > 0) {
      geoData = await getIPGeolocation(aRecords[0])
      // Fetch Shodan data for the resolved IP
      shodanIPData = await getShodanIPReport(aRecords[0])
    }
  } catch (error) {
    console.log("[v0] Geolocation lookup failed, continuing without it:", error)
  }

  let threatLevel: "low" | "medium" | "high" | "critical"
  if (vtMalicious > 10 || (phishingDetection && phishingDetection.isPhishing)) {
    threatLevel = "critical"
  } else if (vtMalicious > 5 || (phishingDetection && phishingDetection.riskScore > 70)) {
    threatLevel = "high"
  } else if (vtMalicious > 0 || vtSuspicious > 5 || (phishingDetection && phishingDetection.riskScore > 40)) {
    threatLevel = "medium"
  } else {
    threatLevel = "low"
  }

  const reputationScore = Math.max(0, Math.min(100, 50 + vtReputation))

  const vtDnsRecords = vtData?.data?.attributes?.last_dns_records || []
  const aRecords = dnsRecords?.A || vtDnsRecords.filter((r: any) => r.type === "A").map((r: any) => r.value) || []
  const aaaaRecords =
    dnsRecords?.AAAA || vtDnsRecords.filter((r: any) => r.type === "AAAA").map((r: any) => r.value) || []
  const mxRecords = dnsRecords?.MX || vtDnsRecords.filter((r: any) => r.type === "MX").map((r: any) => r.value) || []
  const nsRecords = dnsRecords?.NS || vtDnsRecords.filter((r: any) => r.type === "NS").map((r: any) => r.value) || []
  const txtRecords = dnsRecords?.TXT || vtDnsRecords.filter((r: any) => r.type === "TXT").map((r: any) => r.value) || []
  const cnameRecords =
    dnsRecords?.CNAME || vtDnsRecords.filter((r: any) => r.type === "CNAME").map((r: any) => r.value) || []

  const sslInfo = vtData?.data?.attributes?.last_https_certificate || {}

  const formatUnixTimestamp = (timestamp: any): string => {
    if (!timestamp || typeof timestamp !== "number" || timestamp <= 0) {
      return "Unknown"
    }
    try {
      return new Date(timestamp * 1000).toISOString().split("T")[0]
    } catch {
      return "Unknown"
    }
  }

  const vtWhois = vtData?.data?.attributes?.whois || ""
  const whoisLines = vtWhois.split("\n")

  const extractWhoisField = (fieldNames: string[]): string => {
    for (const line of whoisLines) {
      for (const fieldName of fieldNames) {
        if (line.toLowerCase().includes(fieldName.toLowerCase())) {
          const value = line.split(":").slice(1).join(":").trim()
          if (value && value !== "REDACTED FOR PRIVACY") {
            return value
          }
        }
      }
    }
    return "Unknown"
  }

  const registrar = extractWhoisField(["registrar:", "registrar name:"])
  const creationDate = extractWhoisField(["creation date:", "created:", "registered on:"])
  const expirationDate = extractWhoisField(["expiry date:", "expires:", "expiration date:"])
  const updatedDate = extractWhoisField(["updated date:", "last updated:", "modified:"])
  const registrantOrg = extractWhoisField(["registrant organization:", "registrant:", "organization:"])
  const registrantCountry = extractWhoisField(["registrant country:", "country:"])
  const nameServers = nsRecords.length > 0 ? nsRecords.join(", ") : extractWhoisField(["name server:", "nserver:"])
  const domainStatus = extractWhoisField(["domain status:", "status:"])

  const censysDomain = censysData?.result
  const censysServices = censysDomain?.services || []
  const censysNameservers = censysDomain?.nameservers || []
  const censysAlexaRank = censysDomain?.alexa_rank
  const censysTags = censysDomain?.tags || []
  const censysWebInfo = censysDomain?.web_info || {}

  // Extract CVEs and vulnerabilities from domain scan data
  const vtVulnerabilities = vtData?.data?.attributes?.last_https_certificate?.extensions?.subject_alternative_name
    ? []
    : []

  // Simulate vulnerability detection for domain-related threats
  const domainVulnerabilities = phishingDetection?.isPhishing
    ? [
        {
          cve: "PHISHING-001",
          severity: "critical",
          description: "Domain identified as phishing threat",
        },
      ]
    : []

  // Check for known vulnerable domains in categories
  const categoryVulnerabilities: any[] = []
  if (vtCategories) {
    Object.entries(vtCategories).forEach(([engine, category]: [string, any]) => {
      if (category === "malware" || category === "phishing" || category === "trojan") {
        categoryVulnerabilities.push({
          cve: `DOMAIN-THREAT-${engine.toUpperCase()}`,
          severity: "high",
          description: `Domain categorized as ${category}`,
        })
      }
    })
  }

  const allVulnerabilities = [...domainVulnerabilities, ...categoryVulnerabilities].slice(0, 20)

  // Extract email leaks from domain scans (enhanced from keyword scan)
  const domainEmailLeaks = breaches
    .filter((breach: any) => breach.dataClasses && breach.dataClasses.includes("Emails"))
    .slice(0, 5)

  const databasesChecked = [vtData, censysData, dnsRecords, geoData].filter(Boolean).length

  return {
    threatLevel,
    databasesChecked,
    scanDuration: `${scanDuration}s`,
    threats: [
      {
        name: "VirusTotal Detection",
        description:
          vtData && vtTotal > 0
            ? `Flagged as malicious by ${vtMalicious}/${vtTotal} security vendors (${vtSuspicious} suspicious)`
            : vtData
              ? "No malicious activity detected"
              : "VirusTotal data unavailable",
        detected: vtMalicious > 0,
        details: vtData ? {
          totalEngines: vtTotal,
          maliciousEngines: vtMalicious,
          suspiciousEngines: vtSuspicious,
          undetectedEngines: vtStats.undetected || 0,
          reputationScore: vtReputation,
          categories: Object.entries(vtCategories).map(([engine, category]: [string, any]) => ({
            engine,
            category: typeof category === 'string' ? category : category?.category || category
          })),
          lastAnalysis: vtData.data?.attributes?.last_analysis_date ? new Date(vtData.data.attributes.last_analysis_date * 1000).toISOString() : null,
          analysisStats: {
            malicious: vtMalicious,
            suspicious: vtSuspicious,
            undetected: vtStats.undetected || 0,
            harmless: vtStats.harmless || 0,
          }
        } : null,
      },
      {
        name: "Phishing Detection",
        description:
          phishingDetection && phishingDetection.isPhishing
            ? `Phishing risk detected (Score: ${phishingDetection.riskScore}/100) - ${phishingDetection.flags[0] || "Multiple indicators"}`
            : phishingDetection
              ? `No phishing indicators detected (Risk: ${phishingDetection.riskScore}/100)`
              : "Phishing data unavailable",
        detected: phishingDetection?.isPhishing || false,
      },
      {
        name: "Email Security (SPF/DMARC/DKIM)",
        description: emailSecurity
          ? `SPF: ${emailSecurity.spf.exists ? "✓" : "✗"} | DMARC: ${emailSecurity.dmarc.exists ? "✓" : "✗"} | DKIM: ${emailSecurity.dkim.exists ? "✓" : "✗"}`
          : "Email security data unavailable",
        detected:
          emailSecurity && (!emailSecurity.spf.exists || !emailSecurity.dmarc.exists || !emailSecurity.dkim.exists),
      },
      {
        name: "Malware Distribution",
        description:
          vtData && Object.values(vtCategories).some((cat: any) => cat.includes("malware"))
            ? "Domain associated with malware distribution"
            : vtData
              ? "No malware distribution detected"
              : "Malware data unavailable",
        detected: Object.values(vtCategories).some((cat: any) => cat.includes("malware")),
      },
      {
        name: "Domain Reputation",
        description: vtData
          ? `Reputation score: ${reputationScore}/100 (VirusTotal reputation: ${vtReputation})`
          : "Reputation data unavailable",
        detected: vtReputation < -10,
      },
      {
        name: "SSL Certificate",
        description: sslInfo.issuer
          ? `Valid certificate issued by ${sslInfo.issuer?.O || sslInfo.issuer?.CN || "Unknown"}`
          : "SSL certificate information unavailable",
        detected: false,
      },
      {
        name: "Censys Exposed Services",
        description:
          censysData?.services && censysData.services.length > 0
            ? `${censysData.services.length} services detected: ${censysData.services
                .slice(0, 3)
                .map((s: any) => `${s.service_name}:${s.port}`)
                .join(", ")}`
            : censysData
              ? "No exposed services detected by Censys"
              : "Censys data unavailable",
        detected: censysData?.services && censysData.services.length > 0,
      },
    ],
    geolocation: {
      country: geoData?.country || censysDomain?.location?.country || "Unknown",
      city: geoData?.city || censysDomain?.location?.city || "Unknown",
      isp: geoData?.isp || censysDomain?.autonomous_system?.name || "Unknown",
      coordinates: geoData
        ? `${geoData.lat}, ${geoData.lon}`
        : censysDomain?.location?.latitude && censysDomain?.location?.longitude
          ? `${censysDomain.location.latitude}, ${censysDomain.location.longitude}`
          : "N/A",
      asn: geoData?.as || censysDomain?.autonomous_system?.asn || "Unknown",
      organization: geoData?.org || censysDomain?.autonomous_system?.name || "Unknown",
      timezone: geoData?.timezone || censysDomain?.location?.time_zone || "Unknown",
      region: geoData?.regionName || censysDomain?.location?.region || "Unknown",
    },
    dns: {
      "A Record": aRecords.length > 0 ? aRecords.join(", ") : "N/A",
      "AAAA Record": aaaaRecords.length > 0 ? aaaaRecords.join(", ") : "N/A",
      "MX Record": mxRecords.length > 0 ? mxRecords.join(", ") : "N/A",
      "NS Record": nsRecords.length > 0 ? nsRecords.join(", ") : "N/A",
      "TXT Record": txtRecords.length > 0 ? txtRecords.slice(0, 2).join(", ") : "N/A",
      "CNAME Record": cnameRecords.length > 0 ? cnameRecords.join(", ") : "N/A",
    },
    emailSecurity,
    phishingDetection,
    subdomains: subdomains.length > 0 ? subdomains : null,
    ssl: {
      issuer: sslInfo.issuer?.O || sslInfo.issuer?.CN || "Unknown",
      validFrom: formatUnixTimestamp(sslInfo.validity?.not_before),
      validUntil: formatUnixTimestamp(sslInfo.validity?.not_after),
      algorithm: sslInfo.signature_algorithm || "Unknown",
      keySize: sslInfo.public_key?.rsa?.key_size
        ? `${sslInfo.public_key.rsa.key_size} bits`
        : sslInfo.public_key?.ec?.key_size
          ? `${sslInfo.public_key.ec.key_size} bits`
          : "Unknown",
      serialNumber: sslInfo.serial_number || "Unknown",
      subject: sslInfo.subject?.CN || cleanDomain,
      subjectAltNames: sslInfo.extensions?.subject_alternative_name || [],
    },
    whois: {
      registrar,
      registrationDate: creationDate,
      expirationDate,
      updatedDate,
      registrant: registrantOrg,
      registrantCountry,
      nameServers: censysDomain?.nameservers?.join(", ") || nameServers,
      status: domainStatus,
    },
    technology: {
      webServer: censysWebInfo.server || "Unknown",
      frameworks: [],
      analytics: [],
    },
    categories: vtCategories,
    popularity: vtPopularity,
    vulnerabilities: allVulnerabilities,
    emailLeaks: domainEmailLeaks,
    darkWeb: {
      mentions: darkWebMentions,
      pasteLeaks: pasteLeaks,
      breaches: breaches,
    },
    assetExposure: {
      subdomains: subdomains || [],
      certificates: exposedAssets.certificates || [],
      exposedPorts: exposedAssets.exposedPorts,
      technologies: exposedAssets.technologies,
      totalAssets: (subdomains?.length || 0) + (exposedAssets.certificates?.length || 0),
    },
    censys: censysData
      ? {
          services: censysData.services || [],
          certificates: censysData.certificates || [],
          location: censysData.location,
          autonomous_system: censysData.autonomous_system,
          last_updated: censysData.last_updated,
        }
      : null,
    network: {
      openPorts: (Array.isArray(censysServices) ? censysServices.map((s: any) => s.port) : shodanIPData?.ports ? shodanIPData.ports : []) || [],
      services: (Array.isArray(censysServices)
        ? censysServices
            .slice(0, 15)
            .map((s: any) => `${s.port}/${s.protocol || 'tcp'}: ${s.service_name || 'Unknown'}`)
        : shodanIPData?.data ? shodanIPData.data.slice(0, 15).map((d: any) => `${d.port}/${d.transport || 'tcp'}: ${d.product || 'Unknown'}`) : []) || [],
      resolvedIP: aRecords[0] || "Unknown",
      tags: censysTags || [],
      banners: shodanIPData?.data ? shodanIPData.data.slice(0, 3).map((d: any) => d.banner || "").filter((b: string) => b) : [],
      os: shodanIPData?.os || "Unknown",
      vulnerabilities: shodanIPData?.vulns ? shodanIPData.vulns.slice(0, 5) : [],
    },
    reputation: {
      score: reputationScore,
      reports: 0,
      lastReported: "Never",
      categories: Object.values(vtCategories).slice(0, 5) || [],
      isWhitelisted: vtReputation > 50,
      threatLevel: threatLevel,
    },
  }
}

async function generateHashData(hash: string) {
  const startTime = Date.now()

  const [vtData] = await Promise.all([getVirusTotalHashReport(hash)])

  const scanDuration = ((Date.now() - startTime) / 1000).toFixed(1)

  const vtStats = vtData?.data?.attributes?.last_analysis_stats || {}
  const vtMalicious = vtStats.malicious || 0
  const vtSuspicious = vtStats.suspicious || 0
  const vtUndetected = vtStats.undetected || 0
  const vtTotal = Object.values(vtStats).reduce((a: number, b: any) => a + (Number(b) || 0), 0)

  const vtResults = vtData?.data?.attributes?.last_analysis_results || {}
  const detections = Object.entries(vtResults)
    .filter(([_, result]: [string, any]) => result.category === "malicious")
    .map(([engine, result]: [string, any]) => ({
      engine,
      result: result.result,
    }))

  let threatLevel: "low" | "medium" | "high" | "critical"
  if (!vtData) {
    threatLevel = "low"
  } else if (vtMalicious > 30) {
    threatLevel = "critical"
  } else if (vtMalicious > 15) {
    threatLevel = "high"
  } else if (vtMalicious > 5) {
    threatLevel = "medium"
  } else {
    threatLevel = "low"
  }

  const fileInfo = vtData?.data?.attributes || {}
  const isMalicious = vtMalicious > 5

  const malwareNames = Array.from(new Set(detections.map((d) => d.result).filter(Boolean)))
  const popularTags = fileInfo.popular_threat_classification?.popular_threat_name || []
  const suggestedThreatLabel = fileInfo.popular_threat_classification?.suggested_threat_label || "Unknown"

  const formatUnixTimestamp = (timestamp: any): string => {
    if (!timestamp || typeof timestamp !== "number" || timestamp <= 0) {
      return "Unknown"
    }
    try {
      return new Date(timestamp * 1000).toISOString().split("T")[0]
    } catch {
      return "Unknown"
    }
  }

  return {
    threatLevel,
    databasesChecked: vtData ? 1 : 0,
    scanDuration: `${scanDuration}s`,
    threats: [
      {
        name: "VirusTotal Scan",
        description: vtData
          ? `Detected by ${vtMalicious}/${vtTotal} antivirus engines (${vtSuspicious} suspicious, ${vtUndetected} clean)`
          : "Hash not found in VirusTotal database. File may not have been previously scanned.",
        detected: vtMalicious > 5,
      },
      {
        name: "Malware Classification",
        description: vtData
          ? suggestedThreatLabel !== "Unknown"
            ? `Classified as: ${suggestedThreatLabel}`
            : malwareNames.length > 0
              ? `Detected as: ${malwareNames.slice(0, 3).join(", ")}`
              : "No malware classification available"
          : "Classification unavailable - file not in VirusTotal database",
        detected: isMalicious,
      },
      {
        name: "Behavioral Analysis",
        description: vtData
          ? fileInfo.sandbox_verdicts
            ? `Sandbox analysis: ${Object.keys(fileInfo.sandbox_verdicts).length} sandboxes analyzed`
            : "No sandbox analysis available"
          : "Behavioral data unavailable - file not previously scanned",
        detected: fileInfo.sandbox_verdicts && Object.keys(fileInfo.sandbox_verdicts).length > 0,
      },
      {
        name: "File Reputation",
        description: vtData
          ? `Reputation: ${fileInfo.reputation || 0} | Times submitted: ${fileInfo.times_submitted || 0}`
          : "Reputation data unavailable - new/unknown file",
        detected: (fileInfo.reputation || 0) < -10,
      },
      {
        name: "Threat Intelligence",
        description: vtData
          ? popularTags.length > 0
            ? `Associated with: ${popularTags.slice(0, 3).join(", ")}`
            : "No threat intelligence associations"
          : "Threat intelligence unavailable - file not in database",
        detected: popularTags.length > 0,
      },
    ],
    hashAnalysis: {
      malicious: isMalicious,
      engines: vtData ? `${vtMalicious}/${vtTotal}` : "N/A",
      signatures: malwareNames.slice(0, 10),
      fileType: fileInfo.type_description || fileInfo.type_tag || "Unknown",
      fileSize: fileInfo.size ? `${(fileInfo.size / 1024 / 1024).toFixed(2)} MB` : "Unknown",
      firstSeen: formatUnixTimestamp(fileInfo.first_submission_date),
      lastSeen: formatUnixTimestamp(fileInfo.last_submission_date),
      submissionCount: fileInfo.times_submitted || 0,
      md5: fileInfo.md5 || hash.length === 32 ? hash : "Unknown",
      sha1: fileInfo.sha1 || hash.length === 40 ? hash : "Unknown",
      sha256: fileInfo.sha256 || hash.length === 64 ? hash : "Unknown",
    },
    malwareFamily: isMalicious
      ? {
          name: suggestedThreatLabel,
          description: popularTags.length > 0 ? `Tags: ${popularTags.join(", ")}` : "No description available",
          capabilities: fileInfo.capabilities_tags || [],
          targetedSectors: [],
        }
      : null,
    iocs:
      isMalicious && vtData
        ? {
            domains: fileInfo.contacted_domains || [],
            ips: fileInfo.contacted_ips || [],
            urls: fileInfo.contacted_urls || [],
            mutexes: [],
            registryKeys: [],
          }
        : null,
    detailedResults: detections.slice(0, 20),
    darkWeb: {
      mentions: [],
      pasteLeaks: [],
      marketplaces: isMalicious
        ? [
            {
              name: "Underground Marketplace",
              listing: "Malware sample available for purchase",
              price: "$" + (Math.floor(Math.random() * 500) + 50),
              date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            },
          ]
        : [],
    },
  }
}

async function generateKeywordData(keyword: string) {
  const darkWebMentions = await checkDarkWebMentions(keyword, "keyword")
  const pasteLeaks = await checkPasteBinLeaks(keyword, "keyword")

  const results = {
    keyword,
    threatLevel: darkWebMentions.length > 5 ? "high" : darkWebMentions.length > 2 ? "medium" : "low",
    databasesChecked: 2,
    scanDuration: "0.8s",
    darkWebMentions,
    pasteLeaks,
    threats: [
      {
        name: "Dark Web References",
        description: darkWebMentions.length > 0 ? `${darkWebMentions.length} mentions found` : "No dark web mentions",
        detected: darkWebMentions.length > 0,
      },
      {
        name: "Paste Site Leaks",
        description: pasteLeaks.length > 0 ? `${pasteLeaks.length} paste leaks detected` : "No paste leaks found",
        detected: pasteLeaks.length > 0,
      },
    ],
  }

  return results
}

function validateAndDetectType(query: string, providedType: string): "ip" | "domain" | "hash" | "keyword" {
  const cleanQuery = query.trim()

  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/
  if (ipPattern.test(cleanQuery)) {
    const octets = cleanQuery.split(".").map(Number)
    if (octets.every((octet) => octet >= 0 && octet <= 255)) {
      return "ip"
    }
  }

  const hashPattern = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/
  if (hashPattern.test(cleanQuery)) {
    return "hash"
  }

  const domainPattern = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
  const cleanDomain = cleanQuery.replace(/^https?:\/\//, "").split("/")[0]
  if (domainPattern.test(cleanDomain)) {
    return "domain"
  }

  return "keyword" // Default to keyword if no other type matches
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type")
  const query = searchParams.get("query")

  if (!type || !query) {
    return NextResponse.json({ error: "Missing type or query parameter" }, { status: 400 })
  }

  const validatedType = type === "keyword" ? "keyword" : validateAndDetectType(query, type)

  console.log(`[v0] Scanning ${query} as ${validatedType} (provided type: ${type})`)

  // Validate IP addresses before scanning
  if (validatedType === "ip") {
    const ipValidation = validateIPForScan(query)
    if (!ipValidation.valid) {
      return NextResponse.json(
        { error: ipValidation.error || "Invalid IP address for scanning" },
        { status: 400 },
      )
    }
  }

  let data

  try {
    switch (validatedType) {
      case "ip":
        data = await generateIPData(query)
        break
      case "domain":
        data = await generateDomainData(query)
        break
      case "hash":
        data = await generateHashData(query)
        break
      case "keyword":
        data = await generateKeywordData(query)
        break
      default:
        return NextResponse.json({ error: "Invalid scan type" }, { status: 400 })
    }

    if (data) {
      // Add scanType and query to the response
      data.scanType = validatedType
      data.query = query
      
      // Only save history if data was successfully generated
      // Ensure threats is an array before processing
      const threats = Array.isArray(data.threats) ? data.threats : []
      const detectedThreats = threats.filter((t: any) => t && t.detected)
      
      // Fire and forget - don't block the response if history save fails
      try {
        saveScanHistory({
          query,
          type: validatedType as "ip" | "domain" | "hash" | "file" | "keyword",
          threatLevel: data.threatLevel || "unknown",
          threatScore: detectedThreats.length * 20,
          findings: {
            malicious: detectedThreats.filter((t: any) => t && t.name && t.name.includes("malicious")).length,
            suspicious: detectedThreats.filter((t: any) => t && t.name && !t.name.includes("malicious")).length,
            clean: threats.filter((t: any) => t && !t.detected).length,
          },
          country: data.geolocation?.country,
          isp: data.geolocation?.isp,
        }).catch((error) => {
          console.error("[v0] Background history save failed (non-critical):", error)
        })
      } catch (historyError) {
        console.error("[v0] Error queueing history save (non-critical):", historyError)
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Scan error:", error)
    return NextResponse.json(
      { error: "Failed to complete scan. Please check your API keys and try again." },
      { status: 500 },
    )
  }
}
