'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Play, ChevronRight, AlertTriangle, Zap, Mail, Network, Lock, Activity, BarChart3, Clock, Users, Cpu, Home, Target, BookOpen, Eye, TrendingUp, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Scenario {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert'
  duration: string
  alerts: number
  type: 'Phishing' | 'Malware' | 'DDoS' | 'Intrusion' | 'Data Exfiltration' | 'Lateral Movement' | 'Brute Force'
  objectives: string[]
  icon: React.ReactNode
  color: string
  nist: string[]
  iso27001: string[]
  incidentPhases: {
    phase: string
    steps: string[]
    tools: string[]
    evidence: string[]
  }[]
}

const scenarios: Scenario[] = [
  {
    id: 'phishing-campaign',
    title: 'Phishing Campaign Response',
    description: 'Investigate and respond to a phishing campaign targeting employees. Analyze suspicious emails, identify indicators of compromise, and contain the threat.',
    difficulty: 'Easy',
    duration: '15-20 min',
    alerts: 23,
    type: 'Phishing',
    nist: ['DE.AE-1', 'RS.RP-1', 'RS.IR-4'],
    iso27001: ['A.12.4.1', 'A.16.1'],
    objectives: [
      'Identify phishing emails in alert queue',
      'Extract IoCs (URLs, domains, sender IPs)',
      'Determine affected users',
      'Block malicious domains',
      'Generate incident report'
    ],
    icon: <Mail className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
    incidentPhases: [
      {
        phase: 'DETECTION & ANALYSIS',
        steps: ['Review email headers and metadata', 'Analyze attachment hashes', 'Check URL reputation', 'Identify sender spoofing'],
        tools: ['Email Gateway Logs', 'SIEM', 'VirusTotal', 'URLhaus'],
        evidence: ['Email headers', 'Attachment hash', 'URL patterns', 'Sender reputation score']
      },
      {
        phase: 'CONTAINMENT',
        steps: ['Quarantine malicious emails', 'Block sender domain', 'Revoke user sessions', 'Add indicators to blocklist'],
        tools: ['Email Security', 'Firewall', 'Identity Management', 'Threat Intelligence'],
        evidence: ['Quarantine logs', 'Firewall rules', 'Session termination logs', 'Updated IOC list']
      },
      {
        phase: 'INVESTIGATION',
        steps: ['Count affected users', 'Check user actions', 'Review email client logs', 'Track credential usage'],
        tools: ['Email Audit Logs', 'EDR', 'Authentication Logs', 'Threat Feed'],
        evidence: ['User list', 'Email read receipts', 'Credential access logs', 'Clicked link confirmations']
      },
      {
        phase: 'REMEDIATION',
        steps: ['Force password reset', 'Enable MFA', 'Update email filters', 'User awareness training'],
        tools: ['Identity Management', 'Email Gateway', 'Training Platform'],
        evidence: ['Password reset logs', 'MFA enablement list', 'Filter update logs', 'Training completion']
      }
    ]
  },
  {
    id: 'malware-outbreak',
    title: 'Malware Outbreak Containment',
    description: 'Respond to a malware detection across multiple endpoints. Analyze infection patterns, identify patient zero, and contain the outbreak.',
    difficulty: 'Medium',
    duration: '20-30 min',
    alerts: 47,
    type: 'Malware',
    nist: ['DE.CM-1', 'RS.MI-1', 'RS.MI-2'],
    iso27001: ['A.12.2.1', 'A.12.3.1', 'A.16.1.5'],
    objectives: [
      'Correlate malware alerts across endpoints',
      'Identify initial compromise vector',
      'Track lateral movement',
      'Isolate infected systems',
      'Extract malware hash and submit to threat intelligence'
    ],
    icon: <Zap className="w-6 h-6" />,
    color: 'from-red-500 to-orange-500',
    incidentPhases: [
      {
        phase: 'DETECTION & ANALYSIS',
        steps: ['Collect file hashes', 'Check YARA rules', 'Analyze behavioral indicators', 'Review infected file types'],
        tools: ['EDR', 'Hash lookups', 'Sandbox', 'YARA scanner'],
        evidence: ['File hashes', 'Malware family classification', 'Behavioral report', 'Hash reputation']
      },
      {
        phase: 'CONTAINMENT',
        steps: ['Isolate infected endpoints', 'Kill malicious processes', 'Block malicious IPs', 'Quarantine files'],
        tools: ['EDR', 'Network Isolation', 'Firewall', 'Endpoint Protection'],
        evidence: ['Network isolation logs', 'Process kill logs', 'Firewall blocks', 'File quarantine list']
      },
      {
        phase: 'INVESTIGATION',
        steps: ['Find patient zero', 'Trace infection vector', 'Check for lateral movement', 'Identify C2 communications'],
        tools: ['EDR Timeline', 'Network Traffic Analysis', 'File integrity Monitoring', 'DNS logs'],
        evidence: ['Infection timeline', 'User login history', 'Network connections', 'DNS queries', 'File access logs']
      },
      {
        phase: 'REMEDIATION',
        steps: ['Remove malware from all systems', 'Patch vulnerability', 'Update signatures', 'Monitor for reinfection'],
        tools: ['Antivirus', 'Patch Management', 'Security Updates', 'EDR monitoring'],
        evidence: ['Remediation logs', 'Patch deployment logs', 'Signature update logs', '30-day monitoring data']
      }
    ]
  },
  {
    id: 'ddos-attack',
    title: 'DDoS Attack Mitigation',
    description: 'Detect and mitigate a DDoS attack targeting production infrastructure. Analyze traffic patterns and implement defensive measures.',
    difficulty: 'Medium',
    duration: '15-25 min',
    alerts: 156,
    type: 'DDoS',
    nist: ['DE.AE-2', 'RS.MI-1'],
    iso27001: ['A.13.1.1', 'A.13.1.3'],
    objectives: [
      'Identify attack sources and patterns',
      'Determine attack vector (SYN flood, UDP, HTTP)',
      'Calculate attack volume and impact',
      'Implement rate limiting rules',
      'Document attack timeline'
    ],
    icon: <Network className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500',
    incidentPhases: [
      {
        phase: 'DETECTION & ANALYSIS',
        steps: ['Analyze traffic spike patterns', 'Identify source IP ranges', 'Determine attack vector', 'Calculate attack bandwidth'],
        tools: ['NetFlow', 'DDoS Detection', 'GeoIP Analysis', 'Traffic Analysis'],
        evidence: ['Traffic baseline comparison', 'Source IP geographic data', 'Attack type signature', 'Packet analysis']
      },
      {
        phase: 'CONTAINMENT',
        steps: ['Activate DDoS mitigation', 'Implement rate limiting', 'Filter traffic', 'Increase bandwidth'],
        tools: ['DDoS Mitigation Service', 'WAF', 'Firewall', 'CDN'],
        evidence: ['Mitigation activation logs', 'Rule deployment logs', 'Traffic filter logs', 'Capacity increase logs']
      },
      {
        phase: 'INVESTIGATION',
        steps: ['Trace attacker infrastructure', 'Check for insider involvement', 'Review historical attacks', 'Identify attack botnet'],
        tools: ['Threat Intelligence', 'OSINT', 'Historical logs', 'Botnet tracking'],
        evidence: ['Attack attribution', 'Botnet identification', 'Historical pattern match', 'Attacker infrastructure details']
      },
      {
        phase: 'REMEDIATION',
        steps: ['Fine-tune rate limits', 'Update WAF rules', 'Strengthen infrastructure', 'Plan capacity'],
        tools: ['WAF', 'Load Balancer', 'Network Planning', 'Security hardening'],
        evidence: ['Updated WAF rules', 'Load balancer config', 'Capacity plan', 'Hardening checklist']
      }
    ]
  },
  {
    id: 'network-intrusion',
    title: 'Network Intrusion Detection',
    description: 'Investigate suspicious network activity indicating a potential intrusion. Track attacker movements and implement containment.',
    difficulty: 'Hard',
    duration: '30-45 min',
    alerts: 89,
    type: 'Intrusion',
    nist: ['DE.CM-7', 'RS.AN-1', 'RS.MI-2'],
    iso27001: ['A.12.4.5', 'A.14.2.1'],
    objectives: [
      'Analyze network flow data',
      'Identify compromised accounts',
      'Trace attacker command and control',
      'Discover persistence mechanisms',
      'Develop incident timeline'
    ],
    icon: <Lock className="w-6 h-6" />,
    color: 'from-amber-500 to-red-500',
    incidentPhases: [
      {
        phase: 'DETECTION & ANALYSIS',
        steps: ['Analyze NetFlow data', 'Identify anomalous connections', 'Check for known C2 patterns', 'Review IDS/IPS alerts'],
        tools: ['NetFlow analyzer', 'SIEM', 'Threat Intelligence', 'IDS/IPS'],
        evidence: ['Network flow data', 'Anomalous connection patterns', 'C2 signature match', 'IPS alert logs']
      },
      {
        phase: 'CONTAINMENT',
        steps: ['Block C2 infrastructure', 'Isolate compromised hosts', 'Terminate attacker sessions', 'Disable compromised accounts'],
        tools: ['Firewall', 'Network Segmentation', 'Identity Management', 'Session Management'],
        evidence: ['Firewall rules', 'Network isolation logs', 'Session termination logs', 'Account disable logs']
      },
      {
        phase: 'INVESTIGATION',
        steps: ['Trace attack timeline', 'Identify entry point', 'Map privilege escalation', 'Find persistence mechanisms'],
        tools: ['Endpoint Forensics', 'Log analysis', 'Process analysis', 'Registry analysis'],
        evidence: ['Attack timeline', 'Initial access vector', 'Privilege escalation methods', 'Persistence indicators']
      },
      {
        phase: 'REMEDIATION',
        steps: ['Patch entry point vulnerability', 'Remove persistence mechanisms', 'Reset all credentials', 'Deploy monitoring'],
        tools: ['Patch management', 'Security hardening', 'Credential management', 'EDR deployment'],
        evidence: ['Patch logs', 'Hardening checklist', 'Credential reset logs', 'Monitoring deployment logs']
      }
    ]
  },
  {
    id: 'data-exfiltration',
    title: 'Data Exfiltration Investigation',
    description: 'Investigate suspicious data movement indicating potential data exfiltration. Identify what was stolen and who took it.',
    difficulty: 'Hard',
    duration: '40-60 min',
    alerts: 134,
    type: 'Data Exfiltration',
    nist: ['RS.AN-3', 'RS.MI-1', 'RC.RP-1'],
    iso27001: ['A.12.4.1', 'A.13.1.1', 'A.14.1.2'],
    objectives: [
      'Identify unusual data access patterns',
      'Track data movement across network',
      'Determine exfiltration destinations',
      'Quantify data loss',
      'Identify compromised accounts and credentials'
    ],
    icon: <Activity className="w-6 h-6" />,
    color: 'from-red-600 to-pink-600',
    incidentPhases: [
      {
        phase: 'DETECTION & ANALYSIS',
        steps: ['Identify unusual file access', 'Check data transfer logs', 'Analyze destination IPs', 'Review file modification times'],
        tools: ['DLP', 'File Integrity Monitoring', 'NetFlow', 'SIEM'],
        evidence: ['Data access patterns', 'File transfer logs', 'Destination IP geoloation', 'Modification timestamps']
      },
      {
        phase: 'CONTAINMENT',
        steps: ['Block exfiltration destinations', 'Revoke compromised credentials', 'Isolate affected systems', 'Quarantine sensitive data'],
        tools: ['Firewall', 'DLP', 'Identity Management', 'Data Classification'],
        evidence: ['Firewall rules', 'Credential revocation logs', 'System isolation logs', 'Data quarantine list']
      },
      {
        phase: 'INVESTIGATION',
        steps: ['Identify accessed data', 'Determine exposure scope', 'Trace lateral movement for data', 'Check for data staging'],
        tools: ['File Audit Logs', 'Database Activity Monitoring', 'Forensics', 'Data Discovery'],
        evidence: ['Accessed file list', 'Data sensitivity classification', 'Lateral movement path', 'Data staging locations']
      },
      {
        phase: 'REMEDIATION',
        steps: ['Notify affected parties', 'Monitor for data abuse', 'Implement data loss prevention', 'Enhance access controls'],
        tools: ['Notification System', 'Dark web monitoring', 'DLP enhancement', 'Access control framework'],
        evidence: ['Notification logs', 'Monitoring alerts', 'DLP rule updates', 'Access control audit']
      }
    ]
  },
  {
    id: 'lateral-movement',
    title: 'Lateral Movement Analysis',
    description: 'Hunt for signs of lateral movement within the network. Identify how attackers are moving between systems.',
    difficulty: 'Expert',
    duration: '45-60 min',
    alerts: 201,
    type: 'Lateral Movement',
    nist: ['DE.CM-1', 'RS.AN-1', 'RS.AN-2'],
    iso27001: ['A.12.4.5', 'A.14.2.1', 'A.14.3.1'],
    objectives: [
      'Map attacker movement path',
      'Identify privilege escalation attempts',
      'Discover tool installations on systems',
      'Determine credential harvesting methods',
      'Correlate with external threat intelligence'
    ],
    icon: <Cpu className="w-6 h-6" />,
    color: 'from-indigo-600 to-purple-600',
    incidentPhases: [
      {
        phase: 'DETECTION & ANALYSIS',
        steps: ['Analyze process chains', 'Check Kerberos tickets', 'Review authentication logs', 'Identify privilege escalation'],
        tools: ['EDR', 'Authentication logs', 'Process analysis', 'Privilege escalation detection'],
        evidence: ['Process timeline', 'Kerberos ticket analysis', 'Auth log patterns', 'Privilege escalation indicators']
      },
      {
        phase: 'CONTAINMENT',
        steps: ['Reset all credentials', 'Remove attacker tools', 'Isolate compromised network segment', 'Revoke sessions'],
        tools: ['Credential management', 'Endpoint cleaning', 'Network segmentation', 'Session management'],
        evidence: ['Credential reset logs', 'Tool removal logs', 'Network isolation logs', 'Session termination logs']
      },
      {
        phase: 'INVESTIGATION',
        steps: ['Map complete attack path', 'Identify all compromised systems', 'Find attacker toolkit', 'Determine persistence'],
        tools: ['Threat hunting tools', 'Forensics', 'MITRE ATT&CK mapping', 'Threat Intelligence'],
        evidence: ['Attack path map', 'Compromised host list', 'Attacker toolkit inventory', 'Persistence mechanism list']
      },
      {
        phase: 'REMEDIATION',
        steps: ['Implement detection rules', 'Network segmentation', 'Privilege access management', 'Continuous monitoring'],
        tools: ['SIEM', 'Network architect', 'PAM solution', 'EDR'],
        evidence: ['Detection rules', 'Network segmentation design', 'PAM deployment', 'Monitoring baselines']
      }
    ]
  },
  {
    id: 'supply-chain-attack',
    title: 'Supply Chain Attack Investigation',
    description: 'Respond to a compromised vendor software update. Trace the attack origin, identify affected systems, and implement containment across the supply chain.',
    difficulty: 'Expert',
    duration: '50-75 min',
    alerts: 267,
    type: 'Intrusion',
    nist: ['DE.CM-1', 'RS.AN-1', 'RS.MI-1', 'RC.CO-1'],
    iso27001: ['A.14.2.5', 'A.15.1.1', 'A.15.2.1'],
    objectives: [
      'Identify compromised vendor software',
      'Trace affected systems and users',
      'Analyze malicious code payload',
      'Implement vendor communication protocol',
      'Develop remediation timeline across organization'
    ],
    icon: <Network className="w-6 h-6" />,
    color: 'from-rose-500 to-pink-500',
    incidentPhases: [
      {
        phase: 'DETECTION & ANALYSIS',
        steps: ['Analyze software signatures', 'Check vendor announcements', 'Compare version hashes', 'Review deployment logs', 'Identify installation timestamps'],
        tools: ['Software inventory', 'Threat Intelligence', 'Hash analysis', 'Deployment tracking', 'EDR'],
        evidence: ['Software versions', 'Vendor advisories', 'Hash mismatch logs', 'Installation timeline', 'Affected host list']
      },
      {
        phase: 'CONTAINMENT',
        steps: ['Isolate affected systems', 'Block vendor communication', 'Quarantine software packages', 'Stop automatic updates', 'Prepare clean versions'],
        tools: ['Network isolation', 'Firewall', 'Patch management', 'Software repository', 'EDR'],
        evidence: ['Isolation logs', 'Firewall rules', 'Quarantine manifest', 'Update halt logs', 'Clean package inventory']
      },
      {
        phase: 'INVESTIGATION',
        steps: ['Analyze malicious code', 'Track C2 communications', 'Identify attacker infrastructure', 'Determine attack objectives', 'Map lateral movement'],
        tools: ['Malware analysis', 'Network forensics', 'OSINT', 'Threat Intelligence', 'Process tracking'],
        evidence: ['Malware analysis report', 'Network connections', 'C2 infrastructure', 'Attack objectives', 'Lateral movement map']
      },
      {
        phase: 'REMEDIATION',
        steps: ['Deploy clean software', 'Reset affected credentials', 'Remove persistence mechanisms', 'Engage vendor support', 'Implement code signing verification'],
        tools: ['Patch management', 'Credential management', 'Software verification', 'Vendor coordination', 'Security scanning'],
        evidence: ['Deployment logs', 'Credential reset records', 'Cleanup verification', 'Vendor communications', 'Code signing policies']
      }
    ]
  },
  {
    id: 'insider-threat',
    title: 'Insider Threat Detection',
    description: 'Investigate suspicious behavior indicating potential insider threat. Analyze user activities, data access patterns, and communications to identify malicious insiders.',
    difficulty: 'Hard',
    duration: '35-55 min',
    alerts: 156,
    type: 'Data Exfiltration',
    nist: ['DE.CM-3', 'DE.AE-4', 'RS.AN-2'],
    iso27001: ['A.9.1.1', 'A.9.2.1', 'A.9.4.3'],
    objectives: [
      'Identify suspicious user behavior patterns',
      'Analyze data access and copying activities',
      'Review communication channels for data sharing',
      'Document timeline of suspicious activities',
      'Implement user and entity behavior analytics (UEBA)'
    ],
    icon: <Users className="w-6 h-6" />,
    color: 'from-violet-500 to-purple-500',
    incidentPhases: [
      {
        phase: 'DETECTION & ANALYSIS',
        steps: ['Analyze user login patterns', 'Check unusual file access', 'Review data copy operations', 'Monitor email attachments', 'Analyze USB/removable media usage'],
        tools: ['UEBA', 'DLP', 'File Audit Logs', 'Email Gateway', 'Endpoint Protection'],
        evidence: ['Behavior anomalies', 'File access logs', 'Copy operations', 'Email patterns', 'Removable media logs']
      },
      {
        phase: 'CONTAINMENT',
        steps: ['Disable compromised account', 'Revoke access credentials', 'Monitor future activity', 'Preserve evidence', 'Notify management'],
        tools: ['Identity Management', 'Access Control', 'Monitoring', 'Forensics', 'Communication'],
        evidence: ['Account disable logs', 'Credential revocation logs', 'Monitoring baselines', 'Evidence preservation', 'Notification records']
      },
      {
        phase: 'INVESTIGATION',
        steps: ['Interview user and supervisors', 'Analyze motivation factors', 'Determine data exposure scope', 'Check accomplices', 'Review previous suspicious activities'],
        tools: ['Interview logs', 'Historical data analysis', 'Data classification', 'User relationship analysis', 'Background investigation'],
        evidence: ['Interview notes', 'Historical patterns', 'Data sensitivity', 'Relationship maps', 'Background findings']
      },
      {
        phase: 'REMEDIATION',
        steps: ['Revoke all access permanently', 'Monitor for follow-on attacks', 'Improve monitoring controls', 'Enhance DLP policies', 'Conduct awareness training'],
        tools: ['Access management', 'UEBA enhancement', 'DLP policies', 'Training platform', 'Policy documentation'],
        evidence: ['Access revocation', 'Monitoring improvements', 'Policy updates', 'DLP rule enhancements', 'Training completion']
      }
    ]
  },
  {
    id: 'ransomware-outbreak',
    title: 'Ransomware Outbreak Response',
    description: 'Respond to ransomware spreading across the network. Contain the infection, preserve evidence, and develop recovery strategy while maintaining business continuity.',
    difficulty: 'Expert',
    duration: '60-90 min',
    alerts: 312,
    type: 'Malware',
    nist: ['DE.CM-1', 'RS.MI-1', 'RS.MI-2', 'RC.RP-1'],
    iso27001: ['A.12.3.1', 'A.17.1.1', 'A.17.1.2'],
    objectives: [
      'Identify ransomware strain and variant',
      'Trace initial infection vector',
      'Isolate affected systems and networks',
      'Preserve forensic evidence for law enforcement',
      'Develop recovery and business continuity plan'
    ],
    icon: <AlertTriangle className="w-6 h-6" />,
    color: 'from-red-600 to-orange-600',
    incidentPhases: [
      {
        phase: 'DETECTION & ANALYSIS',
        steps: ['Identify encrypted files and extensions', 'Collect ransom notes', 'Extract ransomware sample', 'Analyze encryption method', 'Check for known variants'],
        tools: ['File monitoring', 'Malware analysis', 'Threat Intelligence', 'Hash lookups', 'Sandbox'],
        evidence: ['Encrypted file list', 'Ransom note text', 'Malware sample', 'Encryption analysis', 'Variant identification']
      },
      {
        phase: 'CONTAINMENT',
        steps: ['Isolate all infected systems immediately', 'Disconnect backups from network', 'Block known C2 addresses', 'Preserve network evidence', 'Notify law enforcement'],
        tools: ['Network isolation', 'Firewall', 'Backup management', 'Forensic collection', 'Incident reporting'],
        evidence: ['Isolation logs', 'Backup protection logs', 'Firewall blocks', 'Network captures', 'Law enforcement report']
      },
      {
        phase: 'INVESTIGATION',
        steps: ['Analyze infection timeline', 'Identify initial breach point', 'Check for data exfiltration', 'Determine dwell time', 'Assess lateral movement'],
        tools: ['Forensics', 'Event correlation', 'Network analysis', 'Threat intelligence', 'Timeline analysis'],
        evidence: ['Attack timeline', 'Initial vector', 'Data exfiltration evidence', 'Dwell time calculation', 'Lateral movement map']
      },
      {
        phase: 'REMEDIATION',
        steps: ['Eradicate ransomware completely', 'Rebuild systems from clean backups', 'Restore critical services', 'Restore user data progressively', 'Implement preventive controls'],
        tools: ['Malware removal', 'Backup recovery', 'System rebuild', 'Recovery orchestration', 'Security hardening'],
        evidence: ['Eradication verification', 'Rebuild logs', 'Service restoration timeline', 'Recovery completion', 'Control implementation']
      }
    ]
  },
  {
    id: 'ssh-brute-force',
    title: 'SSH Brute-Force Attack Response',
    description: 'Detect and respond to SSH brute-force attacks targeting Linux servers. Analyze authentication logs, implement rate limiting, and secure SSH access.',
    difficulty: 'Hard',
    duration: '30-45 min',
    alerts: 189,
    type: 'Intrusion',
    nist: ['DE.CM-3', 'DE.AE-2', 'RS.MI-1'],
    iso27001: ['A.9.2.1', 'A.9.4.2', 'A.13.1.1'],
    objectives: [
      'Correlate failed SSH authentication attempts',
      'Identify brute-force attack patterns using log analysis',
      'Determine source IP addresses (TECHNICAL SKILL: Log parsing with grep/awk)',
      'Analyze attack timing and intensity patterns',
      'Implement SSH hardening and access controls'
    ],
    icon: <Lock className="w-6 h-6" />,
    color: 'from-purple-500 to-blue-500',
    incidentPhases: [
      {
        phase: 'DETECTION & ANALYSIS',
        steps: [
          'Extract authentication logs from /var/log/auth.log',
          'Parse failed SSH login attempts (TECHNICAL: grep "Failed password" /var/log/auth.log)',
          'Identify unique source IPs attempting access',
          'Calculate authentication attempt frequency',
          'Correlate with threat intelligence for known attack sources'
        ],
        tools: ['SSH Logs', 'SIEM', 'Grep/Awk', 'Fail2Ban', 'Threat Intelligence'],
        evidence: ['Failed authentication counts per IP', 'Timeline of attacks', 'Source IP geolocation', 'Password patterns attempted']
      },
      {
        phase: 'CONTAINMENT',
        steps: [
          'Block source IPs at firewall level (TECHNICAL: Configure firewall rules)',
          'Enable SSH rate limiting on target servers',
          'Rotate SSH keys on affected systems',
          'Enable SSH port knocking for additional security',
          'Implement fail2ban with aggressive blocking'
        ],
        tools: ['Firewall', 'Fail2Ban', 'Key management', 'SSH configuration', 'Rate limiter'],
        evidence: ['Firewall block logs', 'Fail2ban config changes', 'Key rotation logs', 'Port knock setup logs', 'Rate limiting verification']
      },
      {
        phase: 'INVESTIGATION',
        steps: [
          'Determine if any brute-force attempts succeeded',
          'Check for privilege escalation post-access',
          'Review command history on servers (TECHNICAL: Review ~/.bash_history for persistence)',
          'Identify lateral movement attempts',
          'Check for installed backdoors or rootkits'
        ],
        tools: ['Authentication logs', 'EDR', 'Command history', 'Rootkit scanner', 'Network forensics'],
        evidence: ['Successful login confirmation', 'Privilege escalation logs', 'Command history analysis', 'Lateral movement trace', 'Backdoor detection results']
      },
      {
        phase: 'REMEDIATION',
        steps: [
          'Disable password authentication, enable key-based SSH only (TECHNICAL: Edit /etc/ssh/sshd_config)',
          'Change default SSH port from 22 to non-standard port',
          'Implement SSH certificate-based authentication',
          'Deploy SSH access logs to SIEM for continuous monitoring',
          'Conduct security hardening audit on all SSH servers'
        ],
        tools: ['SSH Configuration', 'PAM modules', 'Certificate authority', 'SIEM', 'Audit tools'],
        evidence: ['SSH config changes', 'Port migration logs', 'Certificate deployment logs', 'SIEM monitoring setup', 'Hardening audit report']
      }
    ]
  },
  {
    id: 'rdp-brute-force',
    title: 'RDP Brute-Force Attack Response',
    description: 'Respond to RDP brute-force attacks targeting Windows servers. Analyze authentication logs, implement network access controls, and strengthen RDP security.',
    difficulty: 'Hard',
    duration: '30-45 min',
    alerts: 156,
    type: 'Intrusion',
    nist: ['DE.CM-3', 'RS.MI-1', 'RS.RC-1'],
    iso27001: ['A.9.2.1', 'A.13.1.1', 'A.14.2.1'],
    objectives: [
      'Identify RDP authentication failures from Event Viewer',
      'Analyze failed login attempts by source IP (TECHNICAL SKILL: Windows event log parsing)',
      'Determine attack origin and intensity',
      'Implement RDP access restrictions and MFA',
      'Secure RDP with network-level authentication'
    ],
    icon: <Cpu className="w-6 h-6" />,
    color: 'from-indigo-500 to-purple-500',
    incidentPhases: [
      {
        phase: 'DETECTION & ANALYSIS',
        steps: [
          'Query Windows Event ID 4625 for failed login attempts (TECHNICAL: Powershell Get-EventLog command)',
          'Extract source IP addresses from security event logs',
          'Correlate failed attempts by source and timestamp',
          'Identify patterns and attack intensity',
          'Cross-reference with threat intelligence databases'
        ],
        tools: ['Event Viewer', 'Powershell', 'SIEM', 'Event log parser', 'Threat Intelligence'],
        evidence: ['Event log export', 'Failed login counts', 'Source IP analysis', 'Attack timeline', 'Geographic origin']
      },
      {
        phase: 'CONTAINMENT',
        steps: [
          'Implement network firewall rules to block source IPs',
          'Configure Windows Firewall to restrict RDP access by IP',
          'Enable account lockout policies (TECHNICAL: Set lockout threshold and duration)',
          'Implement conditional access policies for RDP',
          'Deploy VPN gateway as RDP access requirement'
        ],
        tools: ['Windows Firewall', 'Group Policy', 'Conditional Access', 'VPN gateway', 'Account lockout'],
        evidence: ['Firewall rule logs', 'Windows Firewall config', 'Group Policy updates', 'Access policy logs', 'VPN connection logs']
      },
      {
        phase: 'INVESTIGATION',
        steps: [
          'Check for successful RDP logons (Event ID 4624)',
          'Review user account activity post-compromise (TECHNICAL: Query Event ID 4648 for alternate credentials usage)',
          'Analyze process execution logs for lateral movement',
          'Check for file modifications and data exfiltration',
          'Review network connections from compromised hosts'
        ],
        tools: ['Event Viewer', 'Powershell', 'Process Monitor', 'Network forensics', 'EDR'],
        evidence: ['Successful logon evidence', 'Process execution timeline', 'File modification logs', 'Network connection logs', 'Lateral movement indicators']
      },
      {
        phase: 'REMEDIATION',
        steps: [
          'Disable RDP on unnecessary systems (TECHNICAL: Disable RDP service via regedit or Group Policy)',
          'Move RDP to non-standard port and implement Network Level Authentication',
          'Require MFA for all RDP access',
          'Deploy Privileged Access Workstation (PAW) for administrative access',
          'Implement RDP session logging and monitoring'
        ],
        tools: ['Group Policy', 'Registry editor', 'MFA solution', 'PAW infrastructure', 'Session monitoring'],
        evidence: ['Service disable logs', 'Port configuration changes', 'MFA enforcement logs', 'PAW deployment confirmation', 'Monitoring setup logs']
      }
    ]
  },
  {
    id: 'ftp-sftp-brute-force',
    title: 'FTP/SFTP Brute-Force Attack Response',
    description: 'Respond to FTP and SFTP brute-force attacks targeting file transfer services. Secure file transfer protocols and implement proper access controls.',
    difficulty: 'Medium',
    duration: '25-35 min',
    alerts: 134,
    type: 'Intrusion',
    nist: ['DE.CM-3', 'DE.AE-2', 'RS.MI-1'],
    iso27001: ['A.9.2.1', 'A.13.1.1', 'A.14.3.1'],
    objectives: [
      'Identify FTP/SFTP authentication failures in server logs',
      'Analyze attack patterns and source IPs (TECHNICAL SKILL: FTP/SFTP log parsing)',
      'Determine compromised accounts and systems',
      'Implement SFTP-only access, disable legacy FTP',
      'Secure credentials and implement access controls'
    ],
    icon: <Network className="w-6 h-6" />,
    color: 'from-green-500 to-teal-500',
    incidentPhases: [
      {
        phase: 'DETECTION & ANALYSIS',
        steps: [
          'Extract FTP logs from /var/log/vsftpd.log or similar (TECHNICAL: Parse FTP login failures with grep and awk)',
          'Identify failed SFTP authentication from SSH logs (Event ID matching SSH SFTP subsystem)',
          'Correlate failed login attempts by source IP',
          'Analyze login attempt patterns and frequency',
          'Cross-reference with known credential lists'
        ],
        tools: ['FTP Server logs', 'SSH logs', 'Log parser', 'SIEM', 'Credential intelligence'],
        evidence: ['Failed login logs', 'Source IP counts', 'Attack timeline', 'Attempted usernames', 'Attack origin analysis']
      },
      {
        phase: 'CONTAINMENT',
        steps: [
          'Disable FTP service completely (TECHNICAL: Disable FTP daemon and remove from startup)',
          'Configure firewall to block FTP ports (21) globally',
          'Restrict SFTP access to specific IP ranges only',
          'Implement fail2ban rules for SFTP (TECHNICAL: Create jail rules for repeated SFTP failures)',
          'Force IP-based rate limiting on SFTP service'
        ],
        tools: ['Service management', 'Firewall', 'Fail2ban', 'SFTP server config', 'Rate limiter'],
        evidence: ['FTP service disabled logs', 'Firewall rules', 'Fail2ban rules', 'SFTP config changes', 'Rate limit setup logs']
      },
      {
        phase: 'INVESTIGATION',
        steps: [
          'Check for successful FTP/SFTP logons in audit logs',
          'Review file transfer history for unauthorized access (TECHNICAL: Analyze SFTP session logs for file operations)',
          'Determine what files were accessed or exfiltrated',
          'Check for privilege escalation attempts',
          'Analyze lateral movement from FTP/SFTP access'
        ],
        tools: ['FTP audit logs', 'SFTP session logs', 'File access logs', 'SIEM', 'Forensic analysis'],
        evidence: ['Successful login evidence', 'File transfer logs', 'Data exfiltration confirmation', 'Privilege escalation attempts', 'Lateral movement trace']
      },
      {
        phase: 'REMEDIATION',
        steps: [
          'Migrate all file transfers to SFTP with key-based authentication',
          'Implement SFTP chroot jail for user isolation (TECHNICAL: Configure sftp subsystem with ChrootDirectory)',
          'Require certificate-based authentication for SFTP',
          'Deploy SFTP gateway with session recording',
          'Establish baseline for legitimate file transfer patterns'
        ],
        tools: ['SFTP server', 'SSH configuration', 'Certificate authority', 'Session recording', 'Baseline tools'],
        evidence: ['FTP disable confirmation', 'SFTP migration logs', 'Chroot config', 'Certificate deployment', 'Recording setup logs']
      }
    ]
  },
  {
    id: 'web-app-brute-force',
    title: 'Web Application Brute-Force Attack Response',
    description: 'Respond to brute-force attacks against web application login pages. Analyze access logs, implement account lockout, and deploy web application protections.',
    difficulty: 'Medium',
    duration: '25-35 min',
    alerts: 112,
    type: 'Intrusion',
    nist: ['DE.CM-3', 'DE.AE-2', 'RS.MI-1'],
    iso27001: ['A.9.4.2', 'A.13.1.3', 'A.14.3.1'],
    objectives: [
      'Identify login attempt patterns from web server logs',
      'Extract source IPs and target usernames (TECHNICAL SKILL: HTTP log analysis and WAF log parsing)',
      'Determine if any accounts were compromised',
      'Implement web application firewall rules and rate limiting',
      'Strengthen authentication mechanisms'
    ],
    icon: <Eye className="w-6 h-6" />,
    color: 'from-amber-500 to-orange-500',
    incidentPhases: [
      {
        phase: 'DETECTION & ANALYSIS',
        steps: [
          'Extract web server logs from nginx/Apache (TECHNICAL: Parse HTTP 401/403 responses using ELK or Splunk)',
          'Identify repeated POST requests to /login endpoint',
          'Correlate failed login attempts by source IP and target username',
          'Analyze request rate and attempt frequency',
          'Check WAF logs for blocked brute-force patterns'
        ],
        tools: ['Web server logs', 'WAF logs', 'Log parser', 'SIEM', 'ELK stack'],
        evidence: ['Failed login counts per IP', 'Attempted usernames', 'Attack timeline', 'Request rate analysis', 'WAF blocks']
      },
      {
        phase: 'CONTAINMENT',
        steps: [
          'Configure WAF rules to block IPs with excessive login failures',
          'Implement rate limiting at web application level (TECHNICAL: Configure throttling in application code or reverse proxy)',
          'Deploy CAPTCHA challenges after N failed attempts',
          'Implement progressive delays between login attempts (exponential backoff)',
          'Enable IP-based geofencing for login access'
        ],
        tools: ['WAF', 'Reverse proxy', 'Rate limiter', 'CAPTCHA service', 'Geofencing'],
        evidence: ['WAF rule deployment logs', 'Rate limit config', 'CAPTCHA activation logs', 'Delay implementation', 'Geofencing rules']
      },
      {
        phase: 'INVESTIGATION',
        steps: [
          'Check application logs for successful logins from attack sources',
          'Review user account activity post-compromise (TECHNICAL: Query application audit logs for data access and modifications)',
          'Analyze session activity and API calls from compromised accounts',
          'Check for lateral movement through connected systems',
          'Review data access patterns for exfiltration indicators'
        ],
        tools: ['Application logs', 'Session logs', 'API audit logs', 'Data access logs', 'EDR'],
        evidence: ['Successful login confirmation', 'User activity logs', 'API call logs', 'Data access timeline', 'Lateral movement indicators']
      },
      {
        phase: 'REMEDIATION',
        steps: [
          'Force password reset for all user accounts (TECHNICAL: Implement password reset requirement via application logic)',
          'Deploy MFA on web application (TOTP, SMS, or push notifications)',
          'Implement account lockout policy with admin override',
          'Deploy passwordless authentication (biometric, security keys)',
          'Establish continuous authentication monitoring with behavioral analysis'
        ],
        tools: ['MFA platform', 'Application framework', 'Account lockout service', 'Passwordless auth', 'Behavioral analytics'],
        evidence: ['Password reset logs', 'MFA deployment logs', 'Account lockout config', 'Passwordless auth setup', 'Monitoring logs']
      }
    ]
  }
]

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    'Easy': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Hard': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Expert': 'bg-red-500/20 text-red-400 border-red-500/30'
  }
  return (
    <span className={`px-3 py-1 rounded text-xs font-bold border ${colors[difficulty] || colors['Medium']}`}>
      {difficulty}
    </span>
  )
}

export default function SOCSimulatorPage() {
  const router = useRouter()
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationProgress, setSimulationProgress] = useState(0)

  const startSimulation = async (scenario: Scenario) => {
    setSelectedScenario(scenario)
    setIsSimulating(true)
    setSimulationProgress(0)

    // Simulate loading progress
    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 30
      })
    }, 500)
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Animated background grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(16, 255, 0, 0.05) 25%, rgba(16, 255, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(16, 255, 0, 0.05) 75%, rgba(16, 255, 0, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(16, 255, 0, 0.05) 25%, rgba(16, 255, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(16, 255, 0, 0.05) 75%, rgba(16, 255, 0, 0.05) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/98 backdrop-blur-md border-b border-primary/40 px-6 py-4 z-50 shadow-lg shadow-primary/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative w-10 h-10 rounded-sm border-2 border-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/50">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary tracking-[0.15em] cyber-glow">SOC SIMULATOR</h1>
                <p className="text-xs text-primary/60 tracking-wider">▸ ATTACK SIMULATION ▸ TRAINING ▸</p>
              </div>
            </button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 text-xs font-bold">
              <Home className="w-4 h-4 mr-1" />
              MAIN
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-20 mt-20 relative z-10">
        {!selectedScenario ? (
          <>
            {/* Title Section */}
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-bold text-primary mb-4 tracking-widest">REAL-WORLD ATTACK SCENARIOS</h2>
              <p className="text-primary/70 max-w-2xl mx-auto mb-4">
                Experience realistic SOC incident response scenarios. Analyze alerts, investigate threats, and practice your incident response skills in a safe training environment.
              </p>
              <div className="flex gap-6 justify-center text-xs text-primary/60">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {scenarios.length} Scenarios
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Progressive Difficulty
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  15-60 Minutes
                </div>
              </div>
            </div>

            {/* Scenarios Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="group cyber-card p-6 rounded-lg border border-primary/30 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 backdrop-blur-sm flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${scenario.color} rounded-lg opacity-20 group-hover:opacity-30 transition-opacity`}>
                      {scenario.icon}
                    </div>
                    <DifficultyBadge difficulty={scenario.difficulty} />
                  </div>

                  <h3 className="text-lg font-bold text-primary mb-2 tracking-wide">{scenario.title}</h3>
                  <p className="text-xs text-primary/70 mb-4 leading-relaxed">{scenario.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-primary/20">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{scenario.alerts}</p>
                      <p className="text-xs text-primary/60">Alerts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary/80">{scenario.duration}</p>
                      <p className="text-xs text-primary/60">Duration</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-primary/80">{scenario.type}</p>
                      <p className="text-xs text-primary/60">Type</p>
                    </div>
                  </div>

                  {/* Frameworks */}
                  <div className="mb-4 p-3 bg-primary/5 rounded border border-primary/20">
                    <p className="text-xs font-bold text-primary mb-2">FRAMEWORKS</p>
                    <div className="flex gap-2 flex-wrap">
                      {scenario.nist.map((control, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded font-bold border border-blue-500/30">
                          {control}
                        </span>
                      ))}
                      {scenario.iso27001.map((control, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded font-bold border border-purple-500/30">
                          {control}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Objectives */}
                  <div className="mb-4 flex-grow">
                    <p className="text-xs font-bold text-primary/80 mb-2">KEY OBJECTIVES</p>
                    <ul className="text-xs text-primary/60 space-y-1">
                      {scenario.objectives.slice(0, 2).map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 text-primary/40 flex-shrink-0 mt-1" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => startSimulation(scenario)}
                    className="w-full bg-primary/20 hover:bg-primary/40 text-primary font-bold text-xs py-2 border border-primary/40 hover:border-primary/60 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    START SIMULATION
                  </Button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Simulation View */}
            <div className="mb-8">
              <button
                onClick={() => {
                  setSelectedScenario(null)
                  setIsSimulating(false)
                  setSimulationProgress(0)
                }}
                className="flex items-center gap-2 text-primary/70 hover:text-primary mb-6 transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to Scenarios
              </button>
            </div>

            {isSimulating && simulationProgress < 100 ? (
              <div className="cyber-card p-12 rounded-lg border border-primary/40 text-center">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-primary/20"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${simulationProgress * 2.83} 283`}
                        className="text-primary transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">{Math.round(simulationProgress)}%</p>
                        <p className="text-xs text-primary/60">Loading Scenario</p>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-primary mb-4 tracking-wide">{selectedScenario.title}</h3>
                <p className="text-primary/70 mb-6">Initializing attack simulation environment...</p>
                <div className="space-y-2 text-left max-w-md mx-auto">
                  <p className="text-xs text-primary/60 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Generating alerts and events
                  </p>
                  <p className="text-xs text-primary/60 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary/60"></span>
                    Building network topology
                  </p>
                  <p className="text-xs text-primary/60 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary/40"></span>
                    Initializing SIEM dashboard
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Scenario Header */}
                <div className="cyber-card p-8 rounded-lg border border-primary/40">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-primary mb-2 tracking-wide">{selectedScenario.title}</h2>
                      <p className="text-primary/70">{selectedScenario.description}</p>
                    </div>
                    <div className="text-right">
                      <DifficultyBadge difficulty={selectedScenario.difficulty} />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                      <p className="text-3xl font-bold text-primary">{selectedScenario.alerts}</p>
                      <p className="text-xs text-primary/60 mt-1">Total Alerts</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                      <p className="text-lg font-bold text-primary">{selectedScenario.duration}</p>
                      <p className="text-xs text-primary/60 mt-1">Est. Duration</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                      <p className="text-lg font-bold text-primary">{selectedScenario.type}</p>
                      <p className="text-xs text-primary/60 mt-1">Attack Type</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                      <p className="text-lg font-bold text-primary">Simulation Ready</p>
                      <p className="text-xs text-primary/60 mt-1">Status</p>
                    </div>
                  </div>
                </div>

                {/* Objectives Panel */}
                <div className="cyber-card p-8 rounded-lg border border-primary/40">
                  <h3 className="text-lg font-bold text-primary mb-6 tracking-wide flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    SCENARIO OBJECTIVES
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedScenario.objectives.map((obj, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-primary/80">{obj}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* NIST Framework Mapping */}
                <div className="cyber-card p-8 rounded-lg border border-blue-500/40 bg-blue-500/5">
                  <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    NIST CSF Functions
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {selectedScenario.nist.map((control, i) => (
                      <div key={i} className="bg-blue-500/10 border border-blue-500/30 p-4 rounded text-center">
                        <p className="font-bold text-blue-400">{control}</p>
                        <p className="text-xs text-primary/60 mt-1">NIST Control</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-primary/60">
                    This scenario helps align your incident response procedures with NIST Cybersecurity Framework functions for comprehensive security management.
                  </p>
                </div>

                {/* ISO 27001 Controls */}
                <div className="cyber-card p-8 rounded-lg border border-purple-500/40 bg-purple-500/5">
                  <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    ISO 27001 Controls
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {selectedScenario.iso27001.map((control, i) => (
                      <div key={i} className="bg-purple-500/10 border border-purple-500/30 p-4 rounded text-center">
                        <p className="font-bold text-purple-400">{control}</p>
                        <p className="text-xs text-primary/60 mt-1">ISO Control</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-primary/60">
                    Meet international information security compliance standards through proper incident response procedures aligned with ISO/IEC 27001.
                  </p>
                </div>

                {/* Incident Response Phases */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Incident Response Workflow
                  </h3>
                  {selectedScenario.incidentPhases.map((phase, phaseIdx) => (
                    <div key={phaseIdx} className="cyber-card p-6 rounded-lg border border-primary/40">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-sm font-bold text-primary">
                          {phaseIdx + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-primary mb-3">{phase.phase}</h4>
                          
                          {/* Investigation Steps */}
                          <div className="mb-4">
                            <p className="text-xs font-bold text-primary/70 mb-2 uppercase">Investigation Steps</p>
                            <ul className="space-y-1">
                              {phase.steps.map((step, i) => (
                                <li key={i} className="text-xs text-primary/80 flex items-start gap-2">
                                  <CheckCircle2 className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Tools & Resources */}
                          <div className="mb-4">
                            <p className="text-xs font-bold text-primary/70 mb-2 uppercase">Tools & Resources</p>
                            <div className="flex flex-wrap gap-2">
                              {phase.tools.map((tool, i) => (
                                <span key={i} className="text-[10px] px-2 py-1 bg-primary/20 text-primary rounded border border-primary/30 font-bold">
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Evidence Collection */}
                          <div>
                            <p className="text-xs font-bold text-primary/70 mb-2 uppercase">Evidence Collection</p>
                            <ul className="space-y-1">
                              {phase.evidence.map((evidence, i) => (
                                <li key={i} className="text-xs text-primary/60 flex items-start gap-2">
                                  <Eye className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                                  {evidence}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ready to Start */}
                <div className="text-center">
                  <p className="text-primary/70 mb-6">Simulation environment loaded and ready for analysis</p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => {
                        setSelectedScenario(null)
                        setIsSimulating(false)
                        setSimulationProgress(0)
                      }}
                      variant="outline"
                      className="border border-primary/70 text-primary hover:bg-primary/10"
                    >
                      Back to Scenarios
                    </Button>
                    <Button
                      onClick={() => router.push('/soc-simulator/dashboard')}
                      className="bg-primary/20 hover:bg-primary/40 text-primary font-bold border border-primary/40 hover:border-primary/60 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      LAUNCH SOC DASHBOARD
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
