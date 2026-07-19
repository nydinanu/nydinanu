// SOC Training Platform Data Structure
export type SkillLevel = 'L1' | 'L2' | 'L3'
export type ModuleStatus = 'locked' | 'available' | 'in-progress' | 'completed'

export interface Lesson {
  id: string
  title: string
  description: string
  duration: number // in minutes
  content: string
  videoUrl?: string
  resources?: { title: string; url: string }[]
  completed: boolean
}

export interface Module {
  id: string
  title: string
  description: string
  level: SkillLevel
  lessons: Lesson[]
  quiz?: {
    id: string
    questions: number
    passingScore: number
  }
  labEnvironment?: {
    id: string
    title: string
    description: string
    difficulty: 'easy' | 'medium' | 'hard'
  }
  status: ModuleStatus
  progress: number // 0-100
  prerequisites?: string[]
}

export interface LearningPath {
  id: string
  title: string
  description: string
  level: SkillLevel
  icon: string
  modules: Module[]
  totalDuration: number
  progress: number
  completed: boolean
}

export const SOC_L1_PATHS: LearningPath[] = [
  {
    id: 'l1-incident-basics',
    title: 'Incident Response Fundamentals',
    description: 'Learn the basics of incident handling, detection, and initial response procedures',
    level: 'L1',
    icon: '🚨',
    progress: 45,
    completed: false,
    totalDuration: 360,
    modules: [
      {
        id: 'module-1-1',
        title: 'Introduction to Incidents',
        description: 'Understanding incident types, categories, and severity levels',
        level: 'L1',
        status: 'completed',
        progress: 100,
        lessons: [
          {
            id: 'lesson-1-1-1',
            title: 'Incident Classifications',
            description: 'Learn how incidents are classified and categorized in SOC operations',
            duration: 15,
            content: `## Incident Classification Framework

### Incident Categories
- **Malware**: Suspicious executable, virus, or worm detection
- **Phishing**: Suspicious email with malicious links or attachments
- **Intrusion**: Unauthorized access or lateral movement attempts
- **Data Exfiltration**: Suspicious data transfer activities
- **Policy Violation**: Non-compliance with security policies
- **Availability**: System downtime or performance degradation

### Severity Levels
- **Critical**: Active compromise, data loss, or system down
- **High**: Confirmed threat with significant impact potential
- **Medium**: Suspicious activity requiring investigation
- **Low**: Policy violations or informational findings

### Response Time SLAs
- Critical: 15 minutes
- High: 1 hour
- Medium: 4 hours
- Low: 24 hours

### Key Responsibilities
1. Review alert details completely
2. Check asset criticality
3. Assess user role and context
4. Determine proper classification
5. Escalate appropriately based on SLA`,
            completed: true,
            resources: [
              { title: 'NIST Incident Handling Guide', url: '#' },
              { title: 'ISO/IEC 27035 Standards', url: '#' },
              { title: 'SANS Incident Handler Handbook', url: '#' }
            ]
          },
          {
            id: 'lesson-1-1-2',
            title: 'SOC Workflows',
            description: 'Understanding the incident triage and escalation workflows',
            duration: 20,
            content: `## SOC Standard Workflows

### Detection Phase
1. Security tool triggers alert
2. Automated parsing and enrichment
3. Correlation with threat intelligence
4. Initial severity assignment
5. Alert routed to SOC queue

### Triage Phase (L1 Responsibility)
1. Alert review by L1 analyst
2. Automated context gathering from SIEM
3. Preliminary assessment of threat
4. Decision: Close, Investigate, or Escalate
5. Document findings in case management system

### Investigation Phase (L2/L3)
1. Deep forensic analysis of artifacts
2. Threat actor identification
3. Impact assessment and scope
4. Containment strategy development
5. Root cause analysis

### Response Phase
1. Containment - Stop active threats
2. Eradication - Remove malicious code
3. Recovery - Restore systems
4. Post-incident review and documentation

### Critical Escalation Indicators
- Multiple hosts affected
- Credentials compromised
- Data access confirmed
- External communication detected`,
            completed: true,
            resources: [
              { title: 'NIST Cybersecurity Framework', url: '#' },
              { title: 'CIS Controls Guide', url: '#' }
            ]
          }
        ],
        quiz: {
          id: 'quiz-1-1',
          questions: 10,
          passingScore: 80
        }
      },
      {
        id: 'module-1-2',
        title: 'Alert Triage Essentials',
        description: 'Master the art of quickly and accurately triaging alerts',
        level: 'L1',
        status: 'in-progress',
        progress: 60,
        lessons: [
          {
            id: 'lesson-1-2-1',
            title: 'Alert Context Analysis',
            description: 'Gathering and analyzing context for alerts',
            duration: 25,
            content: `## Alert Context Analysis Techniques

### Information to Gather
1. **Source Context**
   - User account details and permissions
   - Host/asset information and criticality
   - Geolocation and access patterns
   - Historical behavior baseline

2. **Alert Context**
   - Related alerts from same source
   - Previous alerts from this user/asset
   - Temporal patterns and anomalies
   - Correlation with threat intelligence

3. **Environmental Context**
   - Scheduled maintenance windows
   - Legitimate business activities
   - Infrastructure changes
   - Known false positive sources

### Decision Framework
- Is this consistent with normal behavior?
- Does the alert match known attack patterns?
- Is the user/asset high-value?
- Are there corroborating signals?
- What is the potential impact if true?

### Tools and Resources
- SIEM dashboards for historical data
- Asset management database
- Threat intelligence feeds
- User behavior baseline reports`,
            completed: true,
            resources: [
              { title: 'SIEM Best Practices', url: '#' },
              { title: 'Alert Tuning Guide', url: '#' }
            ]
          },
          {
            id: 'lesson-1-2-2',
            title: 'False Positive Reduction',
            description: 'Techniques to identify and reduce false positives',
            duration: 30,
            content: `## False Positive Identification & Reduction

### Common False Positive Sources
1. **Legitimate Applications**
   - Backup jobs with large data transfers
   - Database maintenance activities
   - Patch management systems
   - Security scanning tools

2. **Misconfigured Systems**
   - Overly sensitive alerting rules
   - Improperly tuned baselines
   - Incorrect threshold settings
   - Duplicate rule triggers

3. **User Behavior**
   - After-hours work (authorized)
   - Remote access from new locations
   - Bulk file operations
   - Permission testing

### Reduction Strategies
1. Whitelist known legitimate activities
2. Correlate multiple signals before escalating
3. Check asset criticality levels
4. Review business justification for activity
5. Verify user authentication status

### Documentation
- Track false positive patterns
- Document legitimate baseline activities
- Maintain exception lists
- Share findings with detection team for tuning

### Key Metrics
- False positive ratio
- Mean time to triage (MTTT)
- Investigation time per alert
- Escalation accuracy rate`,
            completed: false,
            resources: [
              { title: 'Alert Tuning Playbook', url: '#' },
              { title: 'Detection Engineering Guide', url: '#' }
            ]
          }
        ],
        quiz: {
          id: 'quiz-1-2',
          questions: 15,
          passingScore: 75
        },
        labEnvironment: {
          id: 'lab-1-2',
          title: 'Alert Triage Sandbox',
          description: 'Practice triaging 50 real-world alerts with feedback',
          difficulty: 'easy'
        }
      },
      {
        id: 'module-1-3',
        title: 'Playbook Execution Basics',
        description: 'Learning to execute incident response playbooks',
        level: 'L1',
        status: 'available',
        progress: 0,
        lessons: [
          {
            id: 'lesson-1-3-1',
            title: 'Understanding Playbook Structure',
            description: 'How incident playbooks are organized and executed',
            duration: 20,
            content: `## Incident Response Playbook Structure

### Playbook Components
1. **Detection Signature**
   - Alert name and ID
   - MITRE ATT&CK mapping
   - Severity and category
   - Alert threshold

2. **Initial Analysis**
   - Questions to ask about the alert
   - Context to gather
   - Related data sources
   - Risk indicators

3. **Triage Decision Tree**
   - Close conditions (high confidence false positive)
   - Investigation conditions (needs deeper analysis)
   - Escalation conditions (confirmed threat)

4. **Investigation Steps**
   - Commands to run
   - Data to collect
   - Artifacts to preserve
   - Timeline to establish

5. **Containment Actions**
   - Immediate isolation steps
   - Communication procedures
   - Evidence preservation
   - Escalation checklist

### Common Playbook Templates
- Malware Detection
- Phishing Email Analysis
- Unauthorized Access Attempts
- Data Exfiltration
- Policy Violation`,
            completed: false
          },
          {
            id: 'lesson-1-3-2',
            title: 'Executing Your First Playbook',
            description: 'Step-by-step guidance for first-time execution',
            duration: 25,
            content: `## First Playbook Execution Guide

### Pre-Execution Checklist
- [ ] Read entire playbook before starting
- [ ] Gather all required access credentials
- [ ] Prepare evidence collection tools
- [ ] Alert supervisor if escalation likely
- [ ] Understand normal baseline for asset

### Execution Steps
1. **Review Alert Details**
   - Note alert ID and timestamp
   - Record all visible metadata
   - Screenshot initial state

2. **Gather Context**
   - Check asset history in SIEM
   - Review user account activity
   - Look for related alerts
   - Check threat intelligence

3. **Follow Decision Tree**
   - Answer each question honestly
   - Don't skip steps
   - Document reasoning
   - Flag uncertainties

4. **Take Recommended Actions**
   - Isolate systems if needed
   - Preserve logs and artifacts
   - Update case status
   - Communicate findings

### Documentation
- Record all findings in case management
- Include screenshots and log excerpts
- Note any deviations from playbook
- Identify areas for improvement

### When to Escalate
- Unusual findings not covered in playbook
- Multiple systems affected
- Confirmed malicious activity
- Uncertainty about next steps`,
            completed: false
          }
        ],
        quiz: {
          id: 'quiz-1-3',
          questions: 12,
          passingScore: 80
        }
      }
    ]
  },
  {
    id: 'l1-threat-analysis',
    title: 'Threat Analysis Basics',
    description: 'Introduction to threat landscapes, TTPs, and indicator analysis',
    level: 'L1',
    icon: '🎯',
    progress: 20,
    completed: false,
    totalDuration: 300,
    modules: [
      {
        id: 'module-2-1',
        title: 'Threat Actors & TTPs',
        description: 'Understanding threat actors and their tactics, techniques, and procedures',
        level: 'L1',
        status: 'available',
        progress: 0,
        lessons: [
          {
            id: 'lesson-2-1-1',
            title: 'Threat Actor Profiles',
            description: 'Common threat actor types and motivations',
            duration: 20,
            content: `## Threat Actor Profiles

### Classification by Motivation
1. **Nation-State Actors**
   - Objective: Espionage, disruption, political advantage
   - Target: Government, critical infrastructure, sensitive industries
   - Capability: Very high (advanced tools and techniques)
   - Persistence: Years-long campaigns
   - Examples: Lazarus Group, APT28, Cozy Bear

2. **Cybercriminals**
   - Objective: Financial gain, credential theft, extortion
   - Target: Financial institutions, e-commerce, healthcare
   - Capability: Medium to high
   - Persistence: Until monetization complete
   - Examples: FIN7, Scattered Spider, Lapsus$

3. **Hacktivists**
   - Objective: Political statement, social cause
   - Target: Government, corporations, organizations
   - Capability: Low to medium
   - Persistence: Campaign-based
   - Examples: Anonymous, LulzSec

4. **Insiders**
   - Objective: Financial gain, revenge, ideology
   - Target: Any organization
   - Capability: High (internal access)
   - Persistence: Until caught or displaced
   - Examples: Edward Snowden, Reality Winner

### Key Indicators
- Sophistication of tools used
- Operational security practices
- Selection of targets
- Time between attacks
- Communication patterns`,
            completed: false,
            resources: [
              { title: 'MITRE Adversary Groups', url: '#' },
              { title: 'Threat Actor Tracking Guide', url: '#' }
            ]
          },
          {
            id: 'lesson-2-1-2',
            title: 'MITRE ATT&CK Framework',
            description: 'Learning the MITRE ATT&CK taxonomy of techniques',
            duration: 25,
            content: `## MITRE ATT&CK Framework

### Framework Structure
- **Tactics**: What adversaries try to accomplish (14 main tactics)
- **Techniques**: How they accomplish objectives
- **Sub-techniques**: Specific variations of techniques
- **Procedures**: Specific implementations by actors

### The 14 Tactics (Kill Chain)
1. **Reconnaissance**: Gather information about target
2. **Resource Development**: Setup infrastructure
3. **Initial Access**: Entry point into target
4. **Execution**: Running malicious code
5. **Persistence**: Maintain access long-term
6. **Privilege Escalation**: Gain higher permissions
7. **Defense Evasion**: Avoid detection
8. **Credential Access**: Steal credentials
9. **Discovery**: Learn target environment
10. **Lateral Movement**: Move through network
11. **Collection**: Gather target data
12. **Command & Control**: Remote command execution
13. **Exfiltration**: Data theft
14. **Impact**: Damage or destruction

### Why It Matters for SOC
- Maps alerts to threat techniques
- Tracks campaign progression
- Identifies defense gaps
- Enables threat intelligence correlation

### Practical Application
- Identify techniques in incidents
- Map detection rules to techniques
- Track threat actor TTP preferences
- Communicate findings to leadership`,
            completed: false,
            resources: [
              { title: 'MITRE ATT&CK Website', url: '#' },
              { title: 'Tactic Reference Guide', url: '#' }
            ]
          }
        ],
        quiz: {
          id: 'quiz-2-1',
          questions: 14,
          passingScore: 80
        }
      },
      {
        id: 'module-2-2',
        title: 'Indicators of Compromise (IOCs)',
        description: 'Understanding and analyzing indicators of compromise',
        level: 'L1',
        status: 'available',
        progress: 0,
        lessons: [
          {
            id: 'lesson-2-2-1',
            title: 'IOC Types and Detection',
            description: 'Different types of indicators and how to detect them',
            duration: 20,
            content: `## Indicators of Compromise (IOCs)

### IOC Categories
1. **File-Based IOCs**
   - Hash values (MD5, SHA1, SHA256)
   - File names and paths
   - File size anomalies
   - Embedded resources

2. **Network IOCs**
   - Domain names (command & control)
   - IP addresses (infrastructure)
   - Ports and protocols
   - DNS requests

3. **Behavioral IOCs**
   - Process creation patterns
   - File system modifications
   - Registry changes
   - Network connections

4. **Email IOCs**
   - Sender addresses
   - Subject line patterns
   - Attachment hashes
   - URL redirects

### Detection Methods
- Hash-based detection (blacklisting)
- Yara rules for malware hunting
- SIEM correlation rules
- Endpoint Detection and Response (EDR)
- Threat intelligence feeds

### Confidence Levels
- High Confidence: Multiple sources, well-known actors
- Medium Confidence: Single source, verified
- Low Confidence: Unverified, single report`,
            completed: false
          },
          {
            id: 'lesson-2-2-2',
            title: 'Using Threat Intel Feeds',
            description: 'Leveraging threat intelligence for SOC operations',
            duration: 25,
            content: `## Threat Intelligence Feeds

### Feed Types
1. **Commercial Feeds**
   - Premium threat intelligence services
   - Proprietary research and analysis
   - Real-time updates and notifications

2. **Open Source Feeds**
   - Public repositories (AlienVault OTX)
   - Community projects
   - Academic research

3. **Information Sharing**
   - ISAC members
   - Government agencies
   - Industry partners

### Practical Usage
1. Enrich alert investigations with IOCs
2. Hunt for known malicious indicators
3. Identify campaign indicators
4. Validate threat actor attribution
5. Update detection rules

### Best Practices
- Use multiple feed sources
- Validate indicators before acting
- Track feed quality metrics
- Prioritize high-confidence IOCs
- Update feeds regularly`,
            completed: false
          }
        ],
        quiz: {
          id: 'quiz-2-2',
          questions: 12,
          passingScore: 75
        }
      }
    ]
  },
  {
    id: 'l1-security-tools',
    title: 'SOC Tools Fundamentals',
    description: 'Introduction to common SOC tools and technologies',
    level: 'L1',
    icon: '🔧',
    progress: 0,
    completed: false,
    totalDuration: 240,
    modules: [
      {
        id: 'module-3-1',
        title: 'SIEM Basics',
        description: 'Security Information and Event Management fundamentals',
        level: 'L1',
        status: 'available',
        progress: 0,
        lessons: [
          {
            id: 'lesson-3-1-1',
            title: 'SIEM Architecture & Capabilities',
            description: 'Understanding SIEM structure and core functions',
            duration: 20,
            content: `## SIEM Fundamentals

### What is SIEM?
Security Information and Event Management systems collect, aggregate, and analyze security data from multiple sources to provide real-time threat detection and forensic analysis capabilities.

### Core Components
1. **Data Collection**
   - Log aggregation from firewalls, IDS, servers, applications
   - API integrations with security tools
   - Syslog and API-based ingestion

2. **Data Normalization**
   - Convert logs to common format
   - Extract key fields (source, destination, action)
   - Enrich with additional context

3. **Correlation Engine**
   - Rules-based threat detection
   - Behavioral analysis
   - Anomaly detection
   - Machine learning models

4. **Alerting**
   - Trigger alerts on suspicious activity
   - Severity calculation
   - Escalation workflow
   - Notification to SOC

5. **Investigation Tools**
   - Advanced search and filtering
   - Timeline views
   - Drill-down capabilities
   - Historical data retention

### Common SIEM Platforms
- Splunk Enterprise Security
- IBM QRadar
- Elastic Stack
- ArcSight
- SumoLogic`,
            completed: false
          },
          {
            id: 'lesson-3-1-2',
            title: 'Searching and Querying SIEM',
            description: 'Practical SIEM query techniques for investigations',
            duration: 25,
            content: `## SIEM Search Techniques

### Basic Query Structure
- Boolean operators (AND, OR, NOT)
- Field-based searching
- Wildcard patterns
- Time range selection

### Common Investigation Queries
1. **User Activity**
   - Failed login attempts
   - Privilege escalations
   - Unusual file access
   - Network connections

2. **Host Investigation**
   - Process executions
   - File modifications
   - Registry changes
   - Network communications

3. **Threat Hunting**
   - Search for IOCs
   - Identify lateral movement
   - Find command & control traffic
   - Detect data exfiltration

### Performance Tips
- Use time ranges to limit data scope
- Filter by most relevant fields first
- Use aggregation for large datasets
- Save useful queries for reuse`,
            completed: false
          }
        ],
        quiz: {
          id: 'quiz-3-1',
          questions: 13,
          passingScore: 80
        }
      }
    ]
  }
]

export const SOC_L2_PATHS: LearningPath[] = [
  {
    id: 'l2-deep-investigation',
    title: 'Advanced Investigation Techniques',
    description: 'Deep dive into forensic analysis, log analysis, and threat hunting',
    level: 'L2',
    icon: '🔬',
    progress: 30,
    completed: false,
    totalDuration: 480,
    modules: [
      {
        id: 'module-4-1',
        title: 'Log Analysis Mastery',
        description: 'Advanced techniques for parsing and correlating logs',
        level: 'L2',
        status: 'available',
        progress: 0,
        lessons: [
          {
            id: 'lesson-4-1-1',
            title: 'Advanced Log Parsing',
            description: 'Extracting meaningful data from complex logs',
            duration: 35,
            content: `## Advanced Log Analysis

### Log Types in Enterprise
1. **Windows Event Logs**
   - Security events (4624 logon, 4688 process creation)
   - System events (service starts, crashes)
   - Application events
   - PowerShell execution logs

2. **Linux/Unix Logs**
   - Authentication logs (/var/log/auth.log)
   - System logs (/var/log/syslog)
   - Application logs
   - Firewall logs

3. **Network Logs**
   - Firewall logs (allow/deny rules)
   - Proxy logs (web activity)
   - DNS logs (domain resolution)
   - IDS/IPS alerts

4. **Application Logs**
   - Web server access logs
   - Database logs
   - API logs
   - Custom application logs

### Parsing Techniques
1. Regular expressions for field extraction
2. Log aggregation and correlation
3. Timeline reconstruction
4. Anomaly pattern recognition
5. Statistical analysis

### Tools for Analysis
- grep, awk, sed for command-line
- Python scripts for automation
- SIEM built-in parsers
- Dedicated log analysis tools

### Key Metrics
- Failed login rates
- Privilege escalation patterns
- Unusual process execution
- Large data transfers
- Protocol anomalies`,
            completed: false,
            resources: [
              { title: 'Log Analysis Reference', url: '#' },
              { title: 'Regular Expression Guide', url: '#' }
            ]
          },
          {
            id: 'lesson-4-1-2',
            title: 'Timeline Construction',
            description: 'Building comprehensive attack timelines from logs',
            duration: 30,
            content: `## Incident Timeline Construction

### Timeline Building Process
1. **Identify Start Point**
   - Initial compromise indicator
   - First malicious activity
   - Earliest evidence

2. **Collect Chronological Data**
   - Log entries across all systems
   - File timestamps
   - Event logs
   - Network traffic

3. **Normalize Timestamps**
   - Account for timezone differences
   - Compensate for clock skew
   - Establish common reference time

4. **Create Visual Timeline**
   - Sequence events chronologically
   - Mark key milestones
   - Identify gaps in logs
   - Cross-reference between sources

### Critical Timeline Elements
- Attacker access times
- Reconnaissance activities
- Lateral movement
- Data exfiltration
- Cleanup attempts

### Timeline Uses
- Determine scope and impact
- Identify response gaps
- Plan remediation
- Legal/forensic documentation
- Improve detection

### Common Challenges
- Log gaps from disabled logging
- Clock synchronization issues
- Timezone conversion errors
- Log rotation and archival`,
            completed: false
          }
        ],
        quiz: {
          id: 'quiz-4-1',
          questions: 16,
          passingScore: 80
        },
        labEnvironment: {
          id: 'lab-4-1',
          title: 'Log Analysis Challenge Lab',
          description: 'Analyze real-world compromised system logs',
          difficulty: 'medium'
        }
      },
      {
        id: 'module-4-2',
        title: 'Threat Hunting Fundamentals',
        description: 'Proactive hunting for advanced threats',
        level: 'L2',
        status: 'available',
        progress: 0,
        lessons: [
          {
            id: 'lesson-4-2-1',
            title: 'Hunting Methodology',
            description: 'Structured approaches to proactive threat hunting',
            duration: 30,
            content: `## Threat Hunting Methodology

### Hunting vs. Detection
- Detection: Reactive to alerts
- Hunting: Proactive search for threats
- Goal: Find threats before alerts trigger

### Hunting Process
1. **Hypothesis Formation**
   - Based on threat intelligence
   - Industry threat trends
   - Known actor TTPs
   - Security gaps

2. **Data Collection**
   - Identify relevant data sources
   - Set appropriate time ranges
   - Prepare analysis tools
   - Document baseline

3. **Analysis**
   - Execute searches and queries
   - Identify anomalies
   - Correlate findings
   - Establish confidence level

4. **Investigation**
   - Deep dive on findings
   - Gather additional context
   - Interview system owners
   - Determine if malicious

5. **Documentation**
   - Record methodology
   - Document findings
   - Create detection rules
   - Share with team

### Hunting Hypotheses Examples
- Lateral movement via SMB
- Data exfiltration patterns
- C2 communication signatures
- Persistence mechanisms
- Privilege escalation attempts

### Tools for Hunting
- SIEM query language
- Python/PowerShell scripts
- EDR platforms
- Network analysis tools
- Packet capture analysis`,
            completed: false
          },
          {
            id: 'lesson-4-2-2',
            title: 'Hunting Scenarios & Techniques',
            description: 'Real-world hunting examples and techniques',
            duration: 35,
            content: `## Common Hunting Scenarios

### Scenario 1: Lateral Movement Detection
- Look for authentication patterns across hosts
- Identify unusual source IPs for access
- Track account usage patterns
- Detect credential forwarding (ticket reuse)

### Scenario 2: Data Exfiltration
- Monitor for large data transfers
- Track DNS queries to suspicious domains
- Analyze VPN connection patterns
- Monitor cloud storage usage

### Scenario 3: Persistence Mechanisms
- Find scheduled tasks and cron jobs
- Identify service installations
- Analyze autostart registry keys
- Check browser extensions and plugins

### Scenario 4: C2 Communication
- Analyze DNS query patterns
- Monitor for beaconing behavior
- Track unusual port usage
- Identify encrypted tunnel traffic

### Technique: Baseline Deviation
1. Establish normal behavior baseline
2. Identify statistical outliers
3. Investigate abnormal cases
4. Determine if malicious or benign

### Technique: Known Bad Hunting
1. Use threat intelligence IOCs
2. Search for known patterns
3. Expand to similar variations
4. Build detection rules

### Documentation
- Record all hunts
- Track success/failure rates
- Share findings with team
- Improve over time`,
            completed: false
          }
        ],
        quiz: {
          id: 'quiz-4-2',
          questions: 15,
          passingScore: 80
        }
      },
      {
        id: 'module-4-3',
        title: 'Malware Analysis Basics',
        description: 'Introduction to malware analysis for incident investigation',
        level: 'L2',
        status: 'available',
        progress: 0,
        lessons: [
          {
            id: 'lesson-4-3-1',
            title: 'Static vs Dynamic Analysis',
            description: 'Understanding different approaches to malware analysis',
            duration: 30,
            content: `## Malware Analysis Approaches

### Static Analysis
- Examine malware without execution
- Study file structure and code
- Extract indicators (hashes, strings)
- Identify potential functionality
- Safe to perform on any system

**Static Analysis Tools:**
- IDA Pro (disassembly)
- Ghidra (reverse engineering)
- Yara (pattern matching)
- PE viewers
- String extraction tools

**What to Look For:**
- Suspicious API calls
- Encoded strings
- Packed/obfuscated code
- External dependencies
- Command and control indicators

### Dynamic Analysis
- Execute malware in controlled environment
- Observe actual behavior
- Monitor system/network changes
- Identify capabilities
- Requires isolated sandbox

**Dynamic Analysis Tools:**
- Cuckoo Sandbox
- Yara rules for behavior
- Process monitor
- Network traffic analyzer
- Registry monitor

**What to Observe:**
- Process creation chains
- File system modifications
- Registry changes
- Network connections
- System calls

### Choosing Analysis Type
- Static: Quick assessment, hashing, string analysis
- Dynamic: Behavioral analysis, C2 identification
- Combined: Most thorough approach`,
            completed: false
          },
          {
            id: 'lesson-4-3-2',
            title: 'File Hash Analysis',
            description: 'Using hash values for malware identification',
            duration: 25,
            content: `## Hash-Based Malware Identification

### Hash Algorithms
- **MD5**: Legacy, collisions possible, still widely used
- **SHA1**: More secure than MD5, still used
- **SHA256**: Current standard, cryptographically secure

### Using Hash Values
1. Calculate hash of suspicious file
2. Query threat intelligence databases
3. Compare against known malware
4. Identify specific malware family

### Hash Lookup Resources
- VirusTotal (multi-engine AV)
- Hybrid Analysis
- AlienVault OTX
- Internal malware database
- Commercial threat intelligence

### Hash Analysis Workflow
1. Collect hash from alert or endpoint
2. Query multiple sources
3. Review detection results
4. Assess threat level
5. Take appropriate action

### Limitations of Hash-Based Detection
- New malware not yet known
- Polymorphic malware variations
- Packing/encryption bypasses hashes
- Hash collision issues

### Best Practices
- Always verify with multiple sources
- Check detection date
- Review vendor comments
- Combine with behavioral analysis
- Track false positives`,
            completed: false
          }
        ],
        quiz: {
          id: 'quiz-4-3',
          questions: 14,
          passingScore: 80
        },
        labEnvironment: {
          id: 'lab-4-3',
          title: 'Malware Analysis Sandbox',
          description: 'Analyze samples in safe environment with feedback',
          difficulty: 'hard'
        }
      }
    ]
  },
  {
    id: 'l2-forensics',
    title: 'Digital Forensics & Evidence',
    description: 'Forensic analysis and evidence preservation techniques',
    level: 'L2',
    icon: '🔍',
    progress: 0,
    completed: false,
    totalDuration: 420,
    modules: [
      {
        id: 'module-5-1',
        title: 'Evidence Collection & Preservation',
        description: 'Proper techniques for collecting and preserving evidence',
        level: 'L2',
        status: 'available',
        progress: 0,
        lessons: [
          {
            id: 'lesson-5-1-1',
            title: 'Chain of Custody',
            description: 'Maintaining evidence integrity and chain of custody',
            duration: 25,
            content: `## Chain of Custody

### What is Chain of Custody?
Documentation of who handled evidence, when, and what they did to maintain integrity and admissibility in legal proceedings.

### Key Principles
1. **Integrity**: Evidence unchanged since collection
2. **Accountability**: Track all handling
3. **Admissibility**: Meet legal standards
4. **Completeness**: Document everything

### Chain of Custody Documentation
- Who collected evidence
- When collected (date/time)
- Where collected from
- What evidence (description)
- How collected (method)
- Who transferred evidence
- Signatures and dates

### Evidence Handling Best Practices
1. Minimal handling - collect once correctly
2. Use established procedures
3. Document everything
4. Maintain physical security
5. Verify integrity before use

### Technical Evidence Integrity
- Hash verification (MD5/SHA256)
- Digital signatures
- Sealed containers
- Write-protection devices
- Secure storage

### Legal Considerations
- Compliance with jurisdiction laws
- Federal Rules of Evidence
- State/local regulations
- International treaties
- Industry standards`,
            completed: false
          },
          {
            id: 'lesson-5-1-2',
            title: 'Acquiring Digital Evidence',
            description: 'Techniques for acquiring various types of digital evidence',
            duration: 30,
            content: `## Digital Evidence Acquisition

### Evidence Types
1. **Memory Acquisition**
   - Volatile data (RAM)
   - Running processes
   - Network connections
   - Cached data

2. **Disk Acquisition**
   - Full disk image
   - Partition imaging
   - File-level collection
   - Unallocated space

3. **Network Evidence**
   - Packet captures
   - Network logs
   - Connection records
   - DNS queries

4. **Application Data**
   - Database files
   - Cache files
   - Temporary files
   - Log files

### Acquisition Tools
- dd (disk imaging)
- FTK Imager
- Encase
- X-Ways Forensics
- Volatility (memory)

### Acquisition Process
1. Plan acquisition (identify data to collect)
2. Preserve environment (isolate system)
3. Document baseline
4. Perform acquisition
5. Verify integrity (hash comparison)
6. Maintain chain of custody
7. Store securely

### Prioritization
1. Most volatile first (memory)
2. Then stable data (disk)
3. Network evidence
4. Application logs
5. Archive for future analysis

### Common Mistakes to Avoid
- Plugging in USB without write protection
- Modifying timestamps
- Losing chain of custody
- Incomplete documentation
- Overwriting evidence`,
            completed: false
          }
        ],
        quiz: {
          id: 'quiz-5-1',
          questions: 14,
          passingScore: 80
        }
      }
    ]
  }
]

export const SOC_L3_PATHS: LearningPath[] = [
  {
    id: 'l3-leadership',
    title: 'SOC Leadership & Strategy',
    description: 'Strategic incident response, team management, and threat intelligence operations',
    level: 'L3',
    icon: '👥',
    progress: 10,
    completed: false,
    totalDuration: 600,
    modules: [
      {
        id: 'module-6-1',
        title: 'Incident Command System (ICS)',
        description: 'Managing complex security incidents at scale',
        level: 'L3',
        status: 'available',
        progress: 0,
        lessons: [
          {
            id: 'lesson-6-1-1',
            title: 'ICS Structure and Roles',
            description: 'Understanding ICS organizational structure for incident management',
            duration: 40,
            content: `## Incident Command System (ICS)

### Why ICS for Security?
Standardized management system for coordinating emergency response across organizations and disciplines.

### Core ICS Roles
1. **Incident Commander**
   - Overall authority and responsibility
   - Strategic decisions
   - Resource allocation
   - External communication

2. **Operations Chief**
   - Tactical execution
   - Tactical objectives
   - Direct investigation teams
   - Progress reports

3. **Planning Chief**
   - Situation assessment
   - Resource status
   - Documentation
   - Future projections

4. **Logistics Chief**
   - Support and resources
   - Equipment
   - Staffing
   - Communications

### Incident Levels
- **Level 3**: Single team investigation
- **Level 2**: Multiple teams, multiple systems
- **Level 1**: Widespread, multi-site, executive oversight

### Command Structure
- Clear chain of command
- Unified coordination
- Span of control (5-7 max)
- Section chiefs for major incidents
- Deputy roles for succession

### Communication Protocols
- Briefing schedule (every 2 hours typical)
- Status updates to leadership
- Inter-team coordination
- External stakeholder updates
- Media/public communication`,
            completed: false
          },
          {
            id: 'lesson-6-1-2',
            title: 'Incident Response Playbooks',
            description: 'Developing and executing incident response playbooks',
            duration: 35,
            content: `## Incident Response Playbook Development

### Playbook Components
1. **Incident Classification**
   - Incident type
   - Severity levels
   - Approval authorities

2. **Response Procedures**
   - Roles and responsibilities
   - Contact escalation paths
   - Investigation steps
   - Containment procedures

3. **Decision Trees**
   - Investigation triggers
   - Escalation criteria
   - Notification requirements
   - Next action indicators

4. **Resources**
   - Tool access and credentials
   - Command examples
   - Query templates
   - Reference information

5. **Post-Incident**
   - Lessons learned process
   - Documentation requirements
   - Metrics and reporting
   - Improvement tracking

### Creating Playbooks
1. Document current procedures
2. Identify improvement areas
3. Research industry standards
4. Build decision trees
5. Test with tabletop exercises
6. Refine based on feedback
7. Train team on execution
8. Version control updates

### Playbook Types
- Malware incidents
- Phishing investigations
- Data exfiltration
- Unauthorized access
- Denial of service
- Insider threats
- Third-party compromises

### Team Alignment
- Regular training exercises
- Tabletop simulations
- After-action reviews
- Continuous updates
- Knowledge sharing`,
            completed: false
          }
        ],
        quiz: {
          id: 'quiz-6-1',
          questions: 16,
          passingScore: 80
        }
      },
      {
        id: 'module-6-2',
        title: 'Threat Intelligence Operations',
        description: 'Strategic threat intelligence for decision making',
        level: 'L3',
        status: 'available',
        progress: 0,
        lessons: [
          {
            id: 'lesson-6-2-1',
            title: 'Intelligence Cycle',
            description: 'The intelligence cycle for threat analysis',
            duration: 35,
            content: `## Intelligence Cycle for Cybersecurity

### Phase 1: Planning & Direction
- Identify intelligence requirements
- Define scope and objectives
- Allocate resources
- Establish priorities
- Get stakeholder input

### Phase 2: Collection
- Gather data from sources
- Internal logs and alerts
- External threat feeds
- Open-source intelligence
- Industry information sharing

### Phase 3: Analysis
- Process raw data
- Identify patterns
- Assess credibility
- Draw conclusions
- Create intelligence products

### Phase 4: Production
- Create reports and briefs
- Package intelligence
- Add context and recommendations
- Identify confidence levels
- Prepare for distribution

### Phase 5: Dissemination
- Share with stakeholders
- Targeted distribution
- Regular briefings
- Alert on critical findings
- Integrate into operations

### Phase 6: Feedback
- Assess intelligence impact
- Collect user feedback
- Refine requirements
- Improve processes
- Loop back to Phase 1

### Intelligence Products
- Threat profiles
- Campaign analysis
- Trend reports
- Vulnerability advisories
- Incident reports
- Metrics and KPIs`,
            completed: false
          },
          {
            id: 'lesson-6-2-2',
            title: 'Strategic vs Tactical Intelligence',
            description: 'Understanding different levels of intelligence',
            duration: 30,
            content: `## Intelligence Levels

### Strategic Intelligence
- Long-term threat landscape
- Emerging threats and trends
- Geopolitical factors
- Industry impacts
- 6-12+ month outlook

**Uses:**
- Executive briefings
- Budget planning
- Capability investment
- Policy decisions
- Risk assessment

**Example:** Nation-state threats to your industry sector over next year

### Operational Intelligence
- Specific threat campaigns
- Actor intentions and capabilities
- Attack patterns and timing
- Targeted industries/organizations
- Medium-term outlook

**Uses:**
- Prioritization of defenses
- Incident response planning
- Threat hunting focus
- Detection tuning
- Team training

**Example:** Specific APT group targeting financial institutions

### Tactical Intelligence
- Specific IOCs and signatures
- Attack techniques and tools
- Current active campaigns
- Real-time threat status
- Immediate/short-term

**Uses:**
- Detection rules
- Incident response
- Threat hunting
- Forensics analysis
- Real-time alerts

**Example:** IP addresses and domains from current attack campaign

### Creating Multi-Level Intelligence
1. Start with tactical data
2. Aggregate patterns
3. Correlate campaigns
4. Identify trends
5. Develop strategic view
6. Communicate to appropriate level`,
            completed: false
          }
        ],
        quiz: {
          id: 'quiz-6-2',
          questions: 15,
          passingScore: 80
        }
      },
      {
        id: 'module-6-3',
        title: 'Compliance & Regulations',
        description: 'Understanding compliance requirements and security standards',
        level: 'L3',
        status: 'available',
        progress: 0,
        lessons: [
          {
            id: 'lesson-6-3-1',
            title: 'Key Compliance Frameworks',
            description: 'Overview of major compliance standards',
            duration: 30,
            content: `## Compliance Frameworks

### GDPR (General Data Protection Regulation)
- **Jurisdiction**: European Union
- **Scope**: Any organization processing EU citizens' data
- **Key Requirements**:
  - Data subject rights
  - Incident notification (72 hours)
  - Data Protection Officer
  - Privacy by design
  - Extensive audit trails

### HIPAA (Health Insurance Portability & Accountability Act)
- **Jurisdiction**: United States
- **Scope**: Healthcare providers, insurers, clearinghouses
- **Key Requirements**:
  - Protected Health Information (PHI) protection
  - Access controls
  - Audit logging
  - Incident response plan
  - Workforce security

### PCI-DSS (Payment Card Industry Data Security Standard)
- **Jurisdiction**: Global payment industry
- **Scope**: Any organization processing credit cards
- **Key Requirements**:
  - Network segmentation
  - Strong authentication
  - Encryption
  - Regular vulnerability scanning
  - Incident response

### SOC 2 (Service Organization Control)
- **Jurisdiction**: Primarily United States
- **Scope**: Service providers
- **Key Requirements**:
  - Security controls
  - Availability
  - Processing integrity
  - Confidentiality
  - Privacy

### ISO/IEC 27001
- **Jurisdiction**: Global
- **Scope**: Any organization
- **Key Requirements**:
  - Information security management system
  - Risk assessment
  - Control implementation
  - Regular audits
  - Continuous improvement`,
            completed: false
          },
          {
            id: 'lesson-6-3-2',
            title: 'Incident Response & Legal Obligations',
            description: 'Legal and compliance aspects of incident response',
            duration: 35,
            content: `## Legal Obligations in Incident Response

### Breach Notification Laws
- Timeline requirements (varies by jurisdiction)
- Who must be notified
- What information to disclose
- Documentation requirements
- Notification methods

### Record Keeping Requirements
- Incident documentation
- Investigation records
- Communication logs
- Remediation tracking
- Timeline documentation

### Law Enforcement Coordination
- When to notify authorities
- Evidence preservation
- Investigation support
- Information sharing
- Confidentiality agreements

### Data Privacy Obligations
- Personally identifiable information (PII) handling
- Encryption requirements
- Access controls
- Audit trails
- Data retention policies

### Executive Notification
- Timeline for leadership
- Information to include
- Regulatory notification requirements
- Media/public communication
- Shareholder obligations

### Regulatory Reporting
- Incident classification
- Severity determination
- Notification thresholds
- Reporting timelines
- Required documentation

### Legal Hold
- Preserving evidence for litigation
- Litigation hold notices
- Document retention
- Destruction policies
- Compliance verification`,
            completed: false
          }
        ],
        quiz: {
          id: 'quiz-6-3',
          questions: 16,
          passingScore: 80
        }
      }
    ]
  },
  {
    id: 'l3-advanced-threat-hunting',
    title: 'Advanced Threat Hunting & Adversary Tracking',
    description: 'Strategic threat hunting and adversary intelligence operations',
    level: 'L3',
    icon: '🎯',
    progress: 0,
    completed: false,
    totalDuration: 540,
    modules: [
      {
        id: 'module-7-1',
        title: 'Advanced Hunting Campaigns',
        description: 'Planning and executing multi-week hunting campaigns',
        level: 'L3',
        status: 'available',
        progress: 0,
        lessons: [
          {
            id: 'lesson-7-1-1',
            title: 'Campaign Planning & Execution',
            description: 'Developing multi-week threat hunting campaigns',
            duration: 40,
            content: `## Threat Hunting Campaign Development

### Campaign Planning Process
1. **Define Objectives**
   - Specific threat or TTP to hunt
   - Expected outcomes
   - Success metrics
   - Resource requirements

2. **Hypothesis Development**
   - Based on threat intelligence
   - Industry-specific threats
   - Known actor behaviors
   - Security gaps

3. **Data Source Identification**
   - Relevant logs and events
   - Historical data availability
   - Data quality assessment
   - Query optimization

4. **Search Strategy**
   - Query development
   - Correlation rules
   - Anomaly thresholds
   - Alert tuning

5. **Investigation Plan**
   - Escalation procedures
   - Follow-up investigation steps
   - Artifact collection
   - Timeline development

### Campaign Execution
- Week 1: Search and initial discovery
- Week 2: Validation and context gathering
- Week 3: Deep investigation of findings
- Week 4: Documentation and detection creation

### Campaign Outcomes
- Detection rules created
- Incidents identified
- Threat intel refined
- Processes improved
- Team training conducted

### Campaign Metrics
- Hypotheses tested
- Findings discovered
- Time invested
- Rules created
- Incidents escalated`,
            completed: false
          }
        ],
        quiz: {
          id: 'quiz-7-1',
          questions: 14,
          passingScore: 80
        },
        labEnvironment: {
          id: 'lab-7-1',
          title: 'Advanced Hunting Simulation',
          description: 'Full-scale hunting campaign with realistic data',
          difficulty: 'hard'
        }
      }
    ]
  }
]

export const ALL_LEARNING_PATHS = [...SOC_L1_PATHS, ...SOC_L2_PATHS, ...SOC_L3_PATHS]

export interface UserProgress {
  userId: string
  completedLessons: string[]
  completedModules: string[]
  completedPaths: string[]
  totalPoints: number
  badges: string[]
  currentStreak: number
  lastActivityDate: Date
}

export interface Badge {
  id: string
  title: string
  description: string
  icon: string
}

export const BADGES: Badge[] = [
  { id: 'first-lesson', title: 'First Steps', description: 'Complete your first lesson', icon: '🌟' },
  { id: 'incident-master', title: 'Incident Master', description: 'Complete Incident Response path', icon: '🚨' },
  { id: 'threat-hunter', title: 'Threat Hunter', description: 'Complete Threat Analysis path', icon: '🎯' },
  { id: 'quiz-ace', title: 'Quiz Ace', description: 'Score 100% on 3 quizzes', icon: '🏆' },
  { id: '7-day-streak', title: '7 Day Streak', description: 'Learn for 7 consecutive days', icon: '🔥' },
  { id: 'forensics-expert', title: 'Forensics Expert', description: 'Complete Digital Forensics path', icon: '🔍' },
  { id: 'l3-leader', title: 'SOC Leader', description: 'Complete L3 Leadership path', icon: '👥' }
]
