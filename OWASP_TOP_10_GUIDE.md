# OWASP Top 10 (2021) - Complete Guide & WAF Analysis Methodology

## Overview

The OWASP Top 10 is a standard awareness document for web application developers and security professionals. It represents a broad consensus about the most critical security risks to web applications.

---

## OWASP Top 10 Categories Explained

### **A01:2021 – Broken Access Control**

**What It Is:**
Access control enforces policy such that users cannot act outside of their intended permissions. Broken access control allows attackers to bypass authorization and access resources they shouldn't have access to.

**Real-World Examples:**
- Accessing another user's account by changing user ID in URL
- Accessing admin panel without being an admin
- Modifying URLs to bypass authentication checks
- Accessing files not meant for public access

**How WAF Detects It:**
- Checks for missing `X-Frame-Options` header (prevents clickjacking attacks on form hijacking)
- Verifies presence of `X-Content-Type-Options: nosniff` (prevents MIME sniffing attacks)
- Analyzes HTTP methods allowed on endpoints

**Prevention Techniques:**
- Implement role-based access control (RBAC)
- Deny access by default, only allow what's explicitly permitted
- Log and monitor access control failures
- Implement centralized access control library

---

### **A02:2021 – Cryptographic Failures**

**What It Is:**
Failure to protect sensitive data using encryption, both in transit and at rest. This includes weak encryption algorithms, missing HTTPS, or hardcoded encryption keys.

**Real-World Examples:**
- Transmitting passwords over HTTP instead of HTTPS
- Using outdated encryption algorithms (MD5, SHA1)
- Storing passwords in plain text
- Sending sensitive data through unencrypted email

**How WAF Detects It:**
- Checks if HTTPS is enforced (checks for `Strict-Transport-Security` header)
- Verifies modern TLS versions are used
- Checks for `X-Content-Type-Options`, `Content-Security-Policy` headers
- Detects HTTP protocol usage instead of HTTPS

**Prevention Techniques:**
- Always use HTTPS with TLS 1.2 or higher
- Use strong encryption algorithms: AES-256 for symmetric, RSA-2048+ for asymmetric
- Hash passwords with bcrypt, scrypt, or Argon2
- Implement secure key management (never hardcode secrets)
- Encrypt sensitive data at rest

---

### **A03:2021 – Injection**

**What It Is:**
When untrusted data is sent to an interpreter as part of a command or query. An attacker can trick the interpreter into executing unintended commands.

**Real-World Examples:**
- **SQL Injection**: `' OR '1'='1` in login forms to bypass authentication
- **Cross-Site Scripting (XSS)**: `<script>alert('XSS')</script>` in search boxes
- **Command Injection**: Using `; rm -rf /` in file upload names
- **LDAP Injection**: Manipulating LDAP directory queries

**How WAF Detects It:**
- Checks for `Content-Security-Policy` header (prevents XSS)
- Verifies `X-XSS-Protection` header is set
- Analyzes input validation patterns in responses
- Checks for proper output encoding

**Prevention Techniques:**
- Use parameterized queries/prepared statements
- Input validation: whitelist acceptable characters
- Output encoding: escape special characters before displaying
- Use ORM frameworks that handle SQL safely
- Implement WAF rules to block injection patterns
- Set Content-Security-Policy headers to restrict script execution

---

### **A04:2021 – Insecure Design**

**What It Is:**
Missing or ineffective control design spanning the entire SDLC. It's about the fundamental way an application is designed without security considerations.

**Real-World Examples:**
- No multi-factor authentication option
- Weak password recovery mechanisms
- No rate limiting on login attempts (allows brute force)
- Predictable password reset tokens

**How WAF Detects It:**
- Checks for API versioning support
- Verifies presence of Rate-Limit headers
- Checks for secure password policy headers
- Analyzes endpoint availability patterns

**Prevention Techniques:**
- Threat modeling during design phase
- Define security requirements before development
- Use secure design patterns and frameworks
- Implement rate limiting and account lockout
- Implement multi-factor authentication (MFA)
- Add CAPTCHA on sensitive endpoints

---

### **A05:2021 – Security Misconfiguration**

**What It Is:**
Insecure default configurations, incomplete setups, open cloud storage, misconfigured HTTP headers, unnecessary services enabled, or outdated software.

**Real-World Examples:**
- Admin interfaces accessible with default credentials
- Directory listing enabled showing sensitive files
- Old versions of software running with known vulnerabilities
- Unnecessary services running (like debug mode in production)
- Missing security headers

**How WAF Detects It:**
- Checks for presence of security headers:
  - `Strict-Transport-Security`: Enforces HTTPS
  - `Content-Security-Policy`: Restricts content sources
  - `X-Frame-Options`: Prevents clickjacking
  - `X-Content-Type-Options`: Prevents MIME sniffing
  - `Referrer-Policy`: Controls referrer information
- Detects exposed server information
- Checks for outdated HTTP protocols

**Prevention Techniques:**
- Remove unnecessary software and features
- Keep all systems patched and updated
- Configure security headers properly
- Use security headers like HSTS, CSP, X-Frame-Options
- Disable unnecessary HTTP methods (PUT, DELETE, TRACE)
- Use automated scanning to detect misconfigurations
- Implement regular security audits

---

### **A06:2021 – Vulnerable and Outdated Components**

**What It Is:**
Using libraries, frameworks, or modules with known vulnerabilities. Most applications today include numerous third-party components.

**Real-World Examples:**
- Using old version of jQuery with known XSS vulnerabilities
- Running an outdated CMS with published exploits
- Using dependencies with known CVEs
- Not updating npm/pip packages

**How WAF Detects It:**
- Analyzes server/framework information from headers
- Checks for known vulnerable version patterns
- Examines technology stack disclosure
- Verifies dependency update frequency

**Prevention Techniques:**
- Maintain inventory of all components and dependencies
- Monitor for security advisories in your dependencies
- Keep all libraries and frameworks updated
- Use tools like OWASP Dependency-Check
- Remove unused dependencies
- Implement automated dependency scanning in CI/CD
- Subscribe to security mailing lists

---

### **A07:2021 – Identification and Authentication Failures**

**What It Is:**
Compromised user accounts, weak credential management, weak session management, or missing multi-factor authentication.

**Real-World Examples:**
- Weak passwords like "admin123"
- Sessions that don't expire
- Credentials exposed in URLs
- Missing multi-factor authentication
- Plaintext passwords in logs

**How WAF Detects It:**
- Checks for `WWW-Authenticate` header
- Analyzes cookie security (Secure, HttpOnly flags)
- Verifies authentication method headers
- Checks for session management headers

**Prevention Techniques:**
- Enforce strong password policies
- Implement multi-factor authentication (MFA)
- Use secure session management with short timeouts
- Never store passwords in plaintext (always hash)
- Implement account lockout after failed attempts
- Log authentication failures for monitoring
- Never expose credentials in URLs or logs

---

### **A08:2021 – Software and Data Integrity Failures**

**What It Is:**
Assuming that software updates, critical data patches, or CI/CD pipelines are from trusted sources without verification. Also includes poor cryptographic integrity checks.

**Real-World Examples:**
- Downloading software without verifying signatures
- Updating plugins from untrusted sources
- No integrity check on API responses
- Using unencrypted connections for updates
- Missing ETags for cache validation

**How WAF Detects It:**
- Checks for `ETag` headers for cache validation
- Verifies digital signature support
- Checks for `Cache-Control` headers
- Analyzes integrity check mechanisms

**Prevention Techniques:**
- Verify digital signatures on updates
- Use secure, encrypted channels for updates
- Implement checksum verification
- Use ETags for cache validation
- Implement code signing for deployments
- Use checksums and cryptographic hashes

---

### **A09:2021 – Logging and Monitoring Failures**

**What It Is:**
Insufficient logging, detection, monitoring, and active response to security incidents. Attackers often rely on lack of monitoring to avoid detection.

**Real-World Examples:**
- No logs for login attempts
- Logs that can be easily deleted by attackers
- No alerts for repeated failed authentication
- Missing debug information
- No centralized log management

**How WAF Detects It:**
- Checks for audit logging capabilities
- Verifies monitoring headers
- Analyzes event tracking mechanisms
- Checks for centralized logging support

**Prevention Techniques:**
- Log all security-relevant events (login attempts, access control failures)
- Protect logs from tampering and unauthorized access
- Ensure logs include sufficient detail for forensic analysis
- Implement centralized log management
- Set up alerts for suspicious patterns
- Monitor for failed login attempts
- Retain logs for required period (usually 6-12 months)

---

### **A10:2021 – Server-Side Request Forgery (SSRF)**

**What It Is:**
When a web application fetches a remote resource without properly validating the user-supplied URL. Attackers can force the server to make requests to internal resources or arbitrary external systems.

**Real-World Examples:**
- Requesting internal IP addresses (192.168.1.1)
- Accessing internal AWS metadata service (169.254.169.254)
- Making requests to localhost services
- Bypassing firewalls using the server as a proxy

**How WAF Detects It:**
- Checks for URL validation patterns
- Analyzes redirect handling
- Verifies outbound request restrictions
- Checks for internal IP access prevention

**Prevention Techniques:**
- Validate and sanitize all user-supplied URLs
- Use allowlists for permitted domains
- Block access to private IP ranges (10.0.0.0/8, 192.168.0.0/16, etc.)
- Disable HTTP redirects or validate redirect targets
- Implement network segmentation
- Use firewalls to restrict outbound connections

---

## WAF Analysis Methodology

### How the Security Awareness Platform Analyzes These Threats

#### **1. HTTP Header Analysis**
The WAF engine examines all HTTP response headers to detect:
- Missing security headers that should be present
- Misconfigured security headers
- Information disclosure through headers
- SSL/TLS configuration issues

#### **2. Real-Time Detection Process**

```
INPUT: Target URL
  ↓
URL Validation
  ↓
Attempt HTTPS Connection
  ↓
Send HEAD Request (non-intrusive)
  ↓
Extract Response Headers
  ↓
Analyze Each Header Against OWASP Top 10
  ↓
Calculate Risk Score (0-100)
  ↓
Generate Findings & Recommendations
  ↓
OUTPUT: Comprehensive Report
```

#### **3. Security Header Checks**

**Critical Headers Analyzed:**
- `Strict-Transport-Security`: Enforces HTTPS only
- `Content-Security-Policy`: Restricts resource loading
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `Referrer-Policy`: Controls referrer exposure
- `Permissions-Policy`: Restricts browser features
- `X-XSS-Protection`: Legacy XSS protection

#### **4. Risk Scoring Algorithm**

```
CRITICAL Vulnerability = 25 points
HIGH Vulnerability = 15 points
MEDIUM Vulnerability = 8 points
LOW Vulnerability = 2 points

Final Score = Sum of all vulnerability scores (capped at 100)
```

**Risk Levels:**
- **0-30**: Secure (Green)
- **31-60**: Warning (Yellow)
- **61-100**: Vulnerable (Red)

#### **5. Vulnerability Detection Examples**

**Missing HSTS Header:**
- **Severity**: HIGH
- **Finding**: Site vulnerable to SSL stripping attacks
- **Recommendation**: Add `Strict-Transport-Security: max-age=31536000; includeSubDomains`

**Server Information Disclosure:**
- **Severity**: MEDIUM
- **Finding**: Server version exposed: "Apache/2.4.41"
- **Recommendation**: Remove server header or set to generic value

**Missing Content-Security-Policy:**
- **Severity**: HIGH
- **Finding**: No CSP prevents XSS attack mitigation
- **Recommendation**: Implement CSP header with strict policies

---

## Real-World Testing Scenarios

### Example 1: Well-Secured Website
**Headers Found:**
- ✅ Strict-Transport-Security
- ✅ Content-Security-Policy
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ No server version exposure

**Result**: Risk Score 15 (Secure)

### Example 2: Poorly Configured Website
**Headers Found:**
- ❌ No Strict-Transport-Security
- ❌ No Content-Security-Policy
- ✅ X-Frame-Options present
- ❌ No X-Content-Type-Options
- ❌ Exposes: "Apache/2.4.41 (Ubuntu)"

**Result**: Risk Score 78 (Vulnerable)

---

## Best Practices Summary

1. **Always use HTTPS** with TLS 1.2 or higher
2. **Implement all security headers** recommended for your application
3. **Keep dependencies updated** and monitor for vulnerabilities
4. **Use strong authentication** including MFA
5. **Validate and sanitize** all user inputs
6. **Log and monitor** security events
7. **Run regular security audits** and penetration tests
8. **Follow principle of least privilege** in access control
9. **Encrypt sensitive data** both in transit and at rest
10. **Have incident response plan** ready

---

## Resources

- [OWASP Top 10 Official](https://owasp.org/www-project-top-ten/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
