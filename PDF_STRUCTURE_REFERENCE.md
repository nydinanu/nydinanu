# PDF Report Structure Reference Guide

## Report Layout Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│  OSINT REPORT STRUCTURE - COMPLETE LAYOUT                       │
└─────────────────────────────────────────────────────────────────┘

PAGE 1: TITLE & INTRODUCTION
┌─────────────────────────────────────────────────────────────────┐
│ [DARK BACKGROUND - Professional Header]                         │
│                                                                 │
│        ADVANCED OSINT PLATFORM                                 │
│        Professional Threat Intelligence Report                 │
│                                                                 │
│  Generated: 2024-12-20 2:45 PM | Target: example.com | DOMAIN │
├─────────────────────────────────────────────────────────────────┤
│ [THREAT LEVEL BADGE - Color Coded]                             │
│ CRITICAL | HIGH | MEDIUM | LOW | CLEAN                         │
│                                                                 │
│ SCAN SUMMARY                                                   │
│                                                                 │
│ • Target: example.com                                          │
│ • Type: DOMAIN                                                 │
│ • Timestamp: [current date/time]                              │
│ • Databases Checked: 12                                        │
└─────────────────────────────────────────────────────────────────┘

PAGE 2-4: TECHNICAL FINDINGS
┌─────────────────────────────────────────────────────────────────┐
│ THREAT INTELLIGENCE                                             │
├─────────────────────────────────────────────────────────────────┤
│ ⚠ Malware Detected                                             │
│   Description of threat...                                     │
│                                                                 │
│ ✓ Phishing Check                                               │
│   No phishing detected...                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ NETWORK INFORMATION (SHODAN)                                    │
├─────────────────────────────────────────────────────────────────┤
│ Operating System: Windows Server 2019                           │
│ Open Ports: 80, 443, 3389, 25, 587                             │
│                                                                 │
│ Detected Services:                                             │
│ • nginx/1.19.0                                                 │
│ • Microsoft-IIS/10.0                                           │
│ • OpenSSH/7.4                                                  │
│                                                                 │
│ Infrastructure Tags: web, hosting, mail                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ GEOLOCATION DATA                                                │
├─────────────────────────────────────────────────────────────────┤
│ Country: United States                                         │
│ City: Los Angeles, California                                  │
│ ISP: CloudFlare Inc.                                           │
│ ASN: AS13335                                                   │
│ Organization: Cloudflare                                       │
│ Coordinates: 34.0522°N, 118.2437°W                             │
│ Timezone: America/Los_Angeles                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ DNS RECORDS                                                     │
├─────────────────────────────────────────────────────────────────┤
│ A RECORD: 104.21.45.45, 172.67.142.45                         │
│ AAAA RECORD: 2606:4700:3031::ac43:8e2d                        │
│ MX RECORD: aspmx.l.google.com (priority 5)                    │
│ NS RECORD: ns1.example.com, ns2.example.com                   │
│ TXT RECORD: v=spf1 include:_spf.google.com ~all                │
│ CNAME RECORD: www.example.com -> example.com                   │
└─────────────────────────────────────────────────────────────────┘

PAGE 4-6: SECURITY & CERTIFICATES
┌─────────────────────────────────────────────────────────────────┐
│ EMAIL SECURITY (SPF/DMARC/DKIM)                                │
├─────────────────────────────────────────────────────────────────┤
│ SPF: Configured                                                │
│       v=spf1 include:_spf.google.com ~all                     │
│                                                                 │
│ DMARC: Configured (Policy: quarantine)                         │
│        p=quarantine; rua=mailto:dmarc@example.com             │
│                                                                 │
│ DKIM: 2 selector(s) configured                                │
│       google._domainkey.example.com                            │
│       selector1._domainkey.example.com                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SSL CERTIFICATE                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Issuer: DigiCert Global G2 TLS RSA SHA256 2021 CA1            │
│ Valid From: 2023-06-15                                         │
│ Valid Until: 2024-06-14                                        │
│ Algorithm: RSA-2048                                            │
│ Fingerprint: AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ VULNERABILITIES (7 CVEs)                                        │
├─────────────────────────────────────────────────────────────────┤
│ CVE-2023-12345 [CRITICAL]                                      │
│ CVE-2023-12346 [HIGH]                                          │
│ CVE-2023-12347 [HIGH]                                          │
│ CVE-2023-12348 [MEDIUM]                                        │
│ CVE-2023-12349 [MEDIUM]                                        │
│ CVE-2023-12350 [MEDIUM]                                        │
│ CVE-2023-12351 [LOW]                                           │
└─────────────────────────────────────────────────────────────────┘

PAGE 6-8: DATA INTELLIGENCE
┌─────────────────────────────────────────────────────────────────┐
│ EMAIL LEAKED CREDENTIALS                                       │
├─────────────────────────────────────────────────────────────────┤
│ • LinkedIn Data Breach                                         │
│   Affected: 500,000,000 | Date: 2021-04-22                   │
│   Data: Email addresses, passwords, phone numbers             │
│                                                                 │
│ • Equifax Data Breach                                          │
│   Affected: 147,000,000 | Date: 2017-09-07                   │
│   Data: SSNs, names, addresses                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ASSET EXPOSURE DISCOVERY                                        │
├─────────────────────────────────────────────────────────────────┤
│ Total Exposed Assets: 24                                        │
│                                                                 │
│ Discovered Subdomains: 8                                        │
│ • api.example.com                                              │
│ • admin.example.com                                            │
│ • dev.example.com                                              │
│ • staging.example.com                                          │
│ [+ 4 more]                                                     │
│                                                                 │
│ SSL Certificates: 12                                           │
│ • example.com (2024-06-14)                                     │
│ • api.example.com (2024-08-20)                                │
│ [+ 10 more]                                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ DARK WEB MONITORING (NEW)                                       │
├─────────────────────────────────────────────────────────────────┤
│ Data Breaches: 2 detected                                       │
│ Credential Leaks: 5 found                                       │
│ Malware Mentions: 1 detected                                    │
│ Marketplace Listings: 0                                         │
│ Forum Discussions: 0                                            │
│                                                                 │
│ [Details of specific breaches/leaks with dates]               │
└─────────────────────────────────────────────────────────────────┘

PAGE 8: RISK ASSESSMENT & RECOMMENDATIONS
┌─────────────────────────────────────────────────────────────────┐
│ RISK ASSESSMENT & RECOMMENDATIONS (NEW)                         │
├─────────────────────────────────────────────────────────────────┤
│ Critical Findings: 7                                            │
│                                                                 │
│ 1. IMMEDIATE: Review 2 detected threat(s). Isolate            │
│    affected systems if active compromise is confirmed.        │
│                                                                 │
│ 2. URGENT: Apply patches for 3 critical CVE(s). These         │
│    require immediate remediation.                             │
│                                                                 │
│ 3. HIGH: 2 email breach(es) detected. Update passwords         │
│    and enable MFA.                                             │
│                                                                 │
│ 4. MEDIUM: Review 8 open ports. Disable unnecessary            │
│    services and restrict access.                               │
│                                                                 │
│ 5. CRITICAL: Domain/emails found on dark web. Monitor          │
│    for credential abuse and implement threat hunting.          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TECHNICAL SUMMARY (NEW)                                         │
├─────────────────────────────────────────────────────────────────┤
│ Database Sources Checked: 12                                    │
│ Total Findings: 7                                               │
│ Threat Level: CRITICAL                                          │
│ Scan Duration: 12.5 seconds                                     │
│ Report Generated: 2024-12-20 2:45 PM                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ DISCLAIMER & NEXT STEPS (NEW)                                   │
├─────────────────────────────────────────────────────────────────┤
│ This report is generated by the Advanced OSINT Platform using   │
│ publicly available threat intelligence data. Findings are       │
│ based on multiple databases and may vary based on data         │
│ freshness. This report should not be considered exhaustive     │
│ and should be validated with additional security               │
│ assessments. For critical findings, immediate investigation    │
│ and remediation is recommended. This report is confidential     │
│ and intended for authorized recipients only.                   │
└─────────────────────────────────────────────────────────────────┘

PAGE 9: EXECUTIVE SUMMARY (NEW FINAL PAGE)
┌─────────────────────────────────────────────────────────────────┐
│ [DARK BACKGROUND - Professional Summary Header]                │
│                                                                 │
│           REPORT SUMMARY                                       │
│                                                                 │
│  Generated on 2024-12-20 2:45 PM                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ KEY METRICS                                                     │
├─────────────────────────────────────────────────────────────────┤
│ Target: example.com                                             │
│ Scan Type: DOMAIN                                               │
│ Threat Level: CRITICAL                                          │
│ Total Issues Found: 7                                           │
│ Databases Checked: 12                                           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ ACTION ITEMS                                                    │
├─────────────────────────────────────────────────────────────────┤
│ • Review 2 active threat(s) immediately                         │
│ • Apply patches for 3 CVE(s)                                    │
│ • Investigate 2 credential leak(s)                              │
│ • Follow 5 prioritized recommendations in report               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ NEXT STEPS                                                      │
├─────────────────────────────────────────────────────────────────┤
│ 1. Review all findings in detail                                │
│ 2. Prioritize remediation based on threat level                │
│ 3. Implement recommended security controls                      │
│ 4. Schedule follow-up scan in 30 days                           │
│ 5. Document changes and maintain audit trail                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Advanced OSINT Platform | Confidential Report | Page 9 of 9    │
│ Report ID: 1734756345000 | Data Retention: 90 days            │
└─────────────────────────────────────────────────────────────────┘

FOOTER (ON EVERY PAGE)
┌─────────────────────────────────────────────────────────────────┐
│ Advanced OSINT Platform | Confidential Report | Page X of Y    │
│ Report ID: 1734756345000 | Data Retention: 90 days            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Section Content Map

### What Gets Included Based on Scan Type

#### Domain Scan Report
```
Pages 1-9:
  Page 1: Title Page
  Page 2: Threat Intelligence
  Page 3: Geolocation Data
  Page 4: DNS Records
  Page 5: Email Security + SSL Certificate
  Page 6: Vulnerabilities
  Page 7: Email Leaked Credentials + Asset Exposure
  Page 8: Dark Web Monitoring + Risk Assessment
  Page 9: Executive Summary
```

#### IP Address Scan Report
```
Pages 1-8:
  Page 1: Title Page
  Page 2: Threat Intelligence
  Page 3: Network Information (Shodan)
  Page 4: Geolocation Data
  Page 5: Vulnerabilities
  Page 6: Email Leaked Credentials
  Page 7: Dark Web Monitoring + Risk Assessment
  Page 8: Executive Summary
```

#### Hash Analysis Report
```
Pages 1-5:
  Page 1: Title Page
  Page 2: Threat Intelligence
  Page 3: Hash Analysis
  Page 4: Dark Web Monitoring + Risk Assessment
  Page 5: Executive Summary
```

---

## Color Coding Reference

### Section Header Colors
| Section | RGB | Usage |
|---------|-----|-------|
| Default | (0, 150, 75) | Green sections |
| Threats | (220, 38, 38) | Red - critical alerts |
| Network | (100, 150, 200) | Blue - network info |
| Geolocation | (59, 130, 246) | Blue - location |
| DNS | (0, 200, 100) | Green - records |
| Email Security | (200, 150, 0) | Gold - email |
| SSL | (100, 200, 100) | Light green - certs |
| Vulnerabilities | (220, 38, 38) | Red - CVEs |
| Risk Assessment | (220, 100, 100) | Red - risks |

---

## Threat Level Badges

### Display on Title Page
```
┌─────────────────────────────┐
│        CRITICAL             │  Red background (220, 38, 38)
└─────────────────────────────┘

┌─────────────────────────────┐
│           HIGH              │  Orange background (245, 85, 20)
└─────────────────────────────┘

┌─────────────────────────────┐
│          MEDIUM             │  Yellow background (245, 164, 0)
└─────────────────────────────┘

┌─────────────────────────────┐
│           LOW               │  Green background (34, 197, 94)
└─────────────────────────────┘

┌─────────────────────────────┐
│          CLEAN              │  Green background (34, 197, 94)
└─────────────────────────────┘
```

---

## Recommendation Priority Levels

### Visual Representation in Report

**CRITICAL** (🔴 Red)
- Active malware detected
- Critical CVEs found
- Dark web compromises
- Action: Immediate (within hours)

**URGENT** (🟠 Orange)
- Critical vulnerabilities
- Email leaks detected
- Security misconfigurations
- Action: 7 days

**HIGH** (🟡 Yellow)
- Email security gaps
- Moderate vulnerabilities
- Weak SSL configs
- Action: 30 days

**MEDIUM** (🟢 Green)
- Open ports to review
- Service hardening
- Configuration optimization
- Action: 60 days

---

## Data Density Examples

### Small Report (IP with few findings)
```
Typical Length: 3-4 pages
Content:
  - Threat Intelligence (1-2 threats)
  - Network Information (limited services)
  - Geolocation
  - Risk Assessment (1-2 recommendations)
  - Executive Summary
File Size: ~800KB
```

### Medium Report (Domain with standard findings)
```
Typical Length: 5-6 pages
Content:
  - All major sections
  - Multiple threats detected
  - Several vulnerabilities
  - Email breaches found
  - Dark web mentions
File Size: ~1.2MB
```

### Large Report (Domain with many findings)
```
Typical Length: 7-8 pages
Content:
  - All sections with full data
  - 20+ vulnerabilities
  - Multiple email breaches
  - Dark web threats
  - Extensive recommendations
File Size: ~1.8MB
```

---

## Page Break Triggers

The PDF engine automatically inserts page breaks when:
1. Section requires > 20mm remaining space
2. Content would exceed page height
3. New major section begins
4. Recommendations list is long
5. Executive summary page added at end

---

## File Naming & Metadata

### Filename Format
```
osint-report-[TARGET]-[DATE].pdf

Examples:
- osint-report-8.8.8.8-2024-12-20.pdf
- osint-report-google.com-2024-12-20.pdf
- osint-report-abc123def-2024-12-20.pdf
```

### Report Metadata (Embedded)
```
Report ID: [Unix Timestamp]
  Example: 1734756345000

Data Retention: 90 days
  Auto-expires from history

Timestamp: Full date/time of generation
  Format: YYYY-MM-DD HH:MM AM/PM

Confidentiality: Marked on every page
  "Advanced OSINT Platform | Confidential Report"
```

---

## Summary

This reference guide shows the complete structure of enhanced PDF reports, including all sections, layout, and formatting. The report is designed to be:
- ✅ Professional and comprehensive
- ✅ Easy to navigate with clear sections
- ✅ Actionable with prioritized recommendations
- ✅ Suitable for executive and technical audiences
- ✅ Complete with 100% of scan data included
