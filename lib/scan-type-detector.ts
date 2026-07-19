/**
 * Scan Type Detection Utility
 * Automatically detects whether input is an IP address, domain, or hash
 */

export type ScanType = "ip" | "domain" | "hash" | "keyword"

export function detectScanType(input: string): ScanType {
  const cleanInput = input.trim().toLowerCase()

  // Check if it's a valid IP address (IPv4)
  if (isValidIPAddress(cleanInput)) {
    return "ip"
  }

  // Check if it's a hash (MD5, SHA1, SHA256)
  if (isValidHash(cleanInput)) {
    return "hash"
  }

  // Check if it's a domain
  if (isValidDomain(cleanInput)) {
    return "domain"
  }

  // Default to keyword for any other input
  return "keyword"
}

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

export function isValidDomain(input: string): boolean {
  const cleanInput = input.trim().toLowerCase()

  // Remove protocol if present
  const urlWithoutProtocol = cleanInput.replace(/^https?:\/\//, "").replace(/\/$/, "")

  // Domain regex pattern
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i

  return domainRegex.test(urlWithoutProtocol) && !urlWithoutProtocol.includes(" ")
}

export function isValidHash(input: string): boolean {
  const cleanInput = input.trim().toLowerCase()

  // Check for common hash formats
  // MD5: 32 hex characters
  if (/^[a-f0-9]{32}$/i.test(cleanInput)) {
    return true
  }

  // SHA1: 40 hex characters
  if (/^[a-f0-9]{40}$/i.test(cleanInput)) {
    return true
  }

  // SHA256: 64 hex characters
  if (/^[a-f0-9]{64}$/i.test(cleanInput)) {
    return true
  }

  // SHA512: 128 hex characters
  if (/^[a-f0-9]{128}$/i.test(cleanInput)) {
    return true
  }

  return false
}
