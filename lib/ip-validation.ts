/**
 * IP Address Validation Utility
 * Validates and classifies IP addresses
 */

export function isValidIPAddress(ip: string): boolean {
  const cleanIP = ip.trim()
  // IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (!ipv4Regex.test(cleanIP)) {
    return false
  }

  // Check each octet is 0-255
  const octets = cleanIP.split(".")
  return octets.every((octet) => {
    const num = parseInt(octet, 10)
    return num >= 0 && num <= 255
  })
}

export function isPrivateIP(ip: string): boolean {
  const cleanIP = ip.trim()
  if (!isValidIPAddress(cleanIP)) {
    return false
  }

  const octets = cleanIP.split(".").map((o) => parseInt(o, 10))
  const [first, second] = octets

  // Private IP ranges:
  // 10.0.0.0 - 10.255.255.255
  if (first === 10) return true

  // 172.16.0.0 - 172.31.255.255
  if (first === 172 && second >= 16 && second <= 31) return true

  // 192.168.0.0 - 192.168.255.255
  if (first === 192 && second === 168) return true

  // 127.0.0.0 - 127.255.255.255 (loopback)
  if (first === 127) return true

  // 169.254.0.0 - 169.254.255.255 (link-local)
  if (first === 169 && second === 254) return true

  // 0.0.0.0 - 0.255.255.255 (this network)
  if (first === 0) return true

  // 224.0.0.0 - 255.255.255.255 (multicast and reserved)
  if (first >= 224) return true

  return false
}

export function validateIPForScan(ip: string): { valid: boolean; error?: string } {
  const cleanIP = ip.trim()

  if (!cleanIP) {
    return { valid: false, error: "IP address is required" }
  }

  if (!isValidIPAddress(cleanIP)) {
    return { valid: false, error: `Invalid IP address format: ${cleanIP}` }
  }

  if (isPrivateIP(cleanIP)) {
    return {
      valid: false,
      error: `Private IP address detected (${cleanIP}). Shodan and other threat intelligence databases only contain data on public IP addresses. Please provide a public IP address for scanning.`,
    }
  }

  return { valid: true }
}

export function getIPType(ip: string): "public" | "private" | "invalid" {
  if (!isValidIPAddress(ip)) return "invalid"
  if (isPrivateIP(ip)) return "private"
  return "public"
}
