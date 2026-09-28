/**
 * Threat Intelligence Seed Data
 * Demo data for threat actors, malware, threat reports, and indicators.
 * All data is clearly marked as demo/fictional.
 */

import { db } from './store';
import {
  ThreatActorClassification,
  MalwareType,
  ThreatSeverity,
  IndicatorType,
} from './threatIntelSchema';

export function seedThreatIntelligence(): void {
  seedThreatActors();
  seedMalware();
  seedIndicators();
  seedThreatReports();
}

function seedThreatActors(): void {
  // Demo Threat Actors
  const actors = [
    {
      name: 'Phantom Bear',
      aliases: ['APT35', 'Cobalt Gypsy', 'TA453'],
      description: 'Iranian state-sponsored threat actor known for espionage operations targeting government, financial, and energy sectors worldwide.',
      classification: ThreatActorClassification.STATE_SPONSORED,
      knownTargets: ['Government', 'Financial Services', 'Energy', 'Telecommunications'],
      geography: ['Iran', 'Middle East', 'Global'],
      techniques: ['Spear Phishing', 'Credential Harvesting', 'Watering Hole', 'Supply Chain Compromise'],
      references: [
        'https://www.cisa.gov/news-events/cybersecurity-advisories/aa22-277a',
        'https://www.mandiant.com/resources/iranian-threat-group-apt35',
      ],
      isActive: true,
      firstSeen: '2014-01-01',
      lastSeen: '2024-01-15',
    },
    {
      name: 'DarkSide',
      aliases: ['Carbon Spider'],
      description: 'Criminal ransomware group responsible for high-profile attacks including the Colonial Pipeline incident. Operates as Ransomware-as-a-Service (RaaS).',
      classification: ThreatActorClassification.CRIMINAL,
      knownTargets: ['Critical Infrastructure', 'Energy', 'Healthcare', 'Manufacturing'],
      geography: ['Eastern Europe', 'Global'],
      techniques: ['Ransomware Deployment', 'Data Exfiltration', 'Double Extortion', 'Phishing'],
      references: [
        'https://www.cisa.gov/news-events/cybersecurity-advisories/aa21-131a',
        'https://www.fbi.gov/news/pressrel/press-releases/fbi-and-cisa-release-darkside-ransomware-technical-advisory',
      ],
      isActive: false,
      firstSeen: '2020-08-01',
      lastSeen: '2021-06-01',
    },
    {
      name: 'Lazarus Group',
      aliases: ['APT38', 'Hidden Cobra', 'Zinc'],
      description: 'North Korean state-sponsored threat actor involved in cyber espionage and financially motivated attacks, including cryptocurrency theft.',
      classification: ThreatActorClassification.STATE_SPONSORED,
      knownTargets: ['Financial Services', 'Cryptocurrency', 'Defense', 'Government'],
      geography: ['North Korea', 'Asia-Pacific', 'Global'],
      techniques: ['Supply Chain Attacks', 'Cryptocurrency Theft', 'Spear Phishing', 'Watering Hole'],
      references: [
        'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-039a',
        'https://www.mandiant.com/resources/north-korea-lazarus-group',
      ],
      isActive: true,
      firstSeen: '2009-01-01',
      lastSeen: '2024-02-01',
    },
    {
      name: 'Anonymous Sudan',
      aliases: ['Sudan Hackers'],
      description: 'Hacktivist group conducting DDoS attacks against organizations in response to geopolitical events.',
      classification: ThreatActorClassification.HACKTIVIST,
      knownTargets: ['Government', 'Financial Services', 'Education'],
      geography: ['Sudan', 'Africa', 'Middle East'],
      techniques: ['DDoS Attacks', 'Website Defacement', 'Data Leaks'],
      references: [
        'https://www.bleepingcomputer.com/news/security/anonymous-sudan-hacktivist-group/',
      ],
      isActive: true,
      firstSeen: '2023-06-01',
      lastSeen: '2024-01-20',
    },
    {
      name: 'FIN7',
      aliases: ['Carbon Spider', 'Gold Maxim', 'El Bruto'],
      description: 'Financially motivated cybercriminal group known for targeting the retail, restaurant, and hospitality sectors with point-of-sale malware.',
      classification: ThreatActorClassification.CRIMINAL,
      knownTargets: ['Retail', 'Restaurants', 'Hospitality', 'Financial Services'],
      geography: ['Eastern Europe', 'North America'],
      techniques: ['Spear Phishing', 'POS Malware', 'Social Engineering', 'USB Drops'],
      references: [
        'https://www.cisa.gov/news-events/cybersecurity-advisories/aa21-200a',
        'https://www.mandiant.com/resources/fin7-operations',
      ],
      isActive: true,
      firstSeen: '2015-01-01',
      lastSeen: '2024-01-10',
    },
  ];

  for (const actor of actors) {
    db.createThreatActor(actor);
  }
}

function seedMalware(): void {
  const malware = [
    {
      name: 'LockBit 3.0',
      type: MalwareType.RANSOMWARE,
      description: 'Highly sophisticated ransomware variant that uses double extortion tactics, encrypting files and threatening to leak stolen data. Known for rapid encryption speeds and custom ransom notes.',
      targets: ['Windows', 'Linux', 'VMware ESXi'],
      associatedActors: [],
      detectionInfo: 'Monitor for rapid file encryption, shadow copy deletion, and suspicious PowerShell execution. Look for .lockbit3 file extensions.',
      mitigation: 'Maintain offline backups, implement EDR solutions, segment networks, disable SMBv1, and apply security patches promptly.',
      references: [
        'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-099a',
        'https://www.mandiant.com/resources/lockbit-ransomware',
      ],
      firstSeen: '2022-06-01',
      lastSeen: '2024-01-15',
    },
    {
      name: 'Cobalt Strike',
      type: MalwareType.TROJAN,
      description: 'Legitimate penetration testing tool frequently abused by threat actors for post-exploitation activities. Provides advanced C2 capabilities and lateral movement tools.',
      targets: ['Windows', 'Linux', 'macOS'],
      associatedActors: [],
      detectionInfo: 'Monitor for beacon traffic patterns, named pipe creation, and suspicious PowerShell execution. Check for known Cobalt Strike default beacons.',
      mitigation: 'Implement application whitelisting, monitor for suspicious process creation, use EDR solutions, and restrict PowerShell execution.',
      references: [
        'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-315a',
      ],
      firstSeen: '2010-01-01',
      lastSeen: '2024-02-01',
    },
    {
      name: 'Emotet',
      type: MalwareType.TROJAN,
      description: 'Modular malware initially designed as banking trojan, now primarily used as a delivery mechanism for other malware including ransomware. Known for sophisticated evasion techniques.',
      targets: ['Windows'],
      associatedActors: [],
      detectionInfo: 'Monitor for suspicious macro execution, registry modifications, and network connections to known C2 infrastructure.',
      mitigation: 'Disable Office macros from internet, implement email filtering, use EDR solutions, and keep systems patched.',
      references: [
        'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-352a',
      ],
      firstSeen: '2014-06-01',
      lastSeen: '2023-11-01',
    },
    {
      name: 'BlackCat',
      type: MalwareType.RANSOMWARE,
      description: 'Ransomware written in Lua scripting language, known for targeting large enterprises. Uses unique encryption methods and anti-analysis techniques.',
      targets: ['Windows', 'Linux'],
      associatedActors: [],
      detectionInfo: 'Monitor for Lua script execution, unusual file modifications, and network traffic to suspicious domains.',
      mitigation: 'Implement application whitelisting, monitor for suspicious script execution, maintain offline backups.',
      references: [
        'https://www.mandiant.com/resources/blackcat-ransomware',
      ],
      firstSeen: '2021-10-01',
      lastSeen: '2023-08-01',
    },
    {
      name: 'Agent Tesla',
      type: MalwareType.SPYWARE,
      description: 'Info-stealing malware capable of harvesting credentials from various applications and browsers. Often distributed via phishing emails with malicious attachments.',
      targets: ['Windows'],
      associatedActors: [],
      detectionInfo: 'Monitor for suspicious process injection, credential access attempts, and network connections to known C2 servers.',
      mitigation: 'Implement email filtering, disable macros, use EDR solutions, and educate users about phishing.',
      references: [
        'https://www.malwarebytes.com/agent-tesla',
      ],
      firstSeen: '2014-01-01',
      lastSeen: '2024-01-20',
    },
  ];

  for (const m of malware) {
    db.createMalware(m);
  }
}

function seedIndicators(): void {
  const indicators = [
    {
      type: IndicatorType.DOMAIN,
      value: 'malicious-c2-server.com',
      description: 'Command and control server associated with Phantom Bear operations',
      severity: ThreatSeverity.HIGH,
      firstSeen: '2024-01-01',
      lastSeen: '2024-01-15',
      context: 'Identified during incident response for financial sector target',
      references: ['https://www.cisa.gov/news-events/cybersecurity-advisories/aa22-277a'],
    },
    {
      type: IndicatorType.IP,
      value: '185.220.101.45',
      description: 'Known Tor exit node used for anonymizing C2 traffic',
      severity: ThreatSeverity.MEDIUM,
      firstSeen: '2023-12-01',
      lastSeen: '2024-01-20',
      context: 'Observed in network logs during ransomware investigation',
      references: ['https://www.mandiant.com/resources/tor-exit-nodes'],
    },
    {
      type: IndicatorType.URL,
      value: 'https://phishing-site.com/login/credential-harvest',
      description: 'Credential harvesting page targeting Office 365 users',
      severity: ThreatSeverity.HIGH,
      firstSeen: '2024-01-10',
      lastSeen: '2024-01-18',
      context: 'Reported by multiple organizations in financial sector',
      references: [],
    },
    {
      type: IndicatorType.FILE_HASH,
      value: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
      description: 'SHA256 hash of LockBit 3.0 ransomware executable',
      severity: ThreatSeverity.CRITICAL,
      firstSeen: '2024-01-05',
      lastSeen: '2024-01-15',
      context: 'Identified in multiple ransomware incidents across healthcare sector',
      references: ['https://www.virustotal.com/gui/file/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0'],
    },
    {
      type: IndicatorType.EMAIL,
      value: 'phishing@fake-bank.com',
      description: 'Email address used in phishing campaign impersonating financial institutions',
      severity: ThreatSeverity.HIGH,
      firstSeen: '2024-01-12',
      lastSeen: '2024-01-19',
      context: 'Part of widespread phishing campaign targeting banking customers',
      references: [],
    },
    {
      type: IndicatorType.DOMAIN,
      value: 'update-service.suspicious.net',
      description: 'Domain used for malware distribution disguised as software updates',
      severity: ThreatSeverity.HIGH,
      firstSeen: '2023-11-01',
      lastSeen: '2024-01-10',
      context: 'Associated with Emotet distribution campaign',
      references: ['https://www.malwarebytes.com/emotet-campaign'],
    },
    {
      type: IndicatorType.IP,
      value: '91.215.85.120',
      description: 'Cobalt Strike team server IP address',
      severity: ThreatSeverity.CRITICAL,
      firstSeen: '2024-01-08',
      lastSeen: '2024-01-20',
      context: 'Identified during penetration test red team operations',
      references: [],
    },
    {
      type: IndicatorType.FILE_HASH,
      value: 'f1e2d3c4b5a69788796a5b4c3d2e1f0e9d8c7b6a',
      description: 'SHA256 hash of Agent Tesla infostealer variant',
      severity: ThreatSeverity.HIGH,
      firstSeen: '2023-12-15',
      lastSeen: '2024-01-18',
      context: 'Distributed via phishing emails with malicious Word documents',
      references: ['https://www.virustotal.com/gui/file/f1e2d3c4b5a69788796a5b4c3d2e1f0e9d8c7b6a'],
    },
  ];

  for (const indicator of indicators) {
    db.createIndicator(indicator);
  }
}

function seedThreatReports(): void {
  const threatActors = db.listThreatActors().data;
  const malwareList = db.listMalware().data;
  const indicators = db.listIndicators().data;

  const phantomBear = threatActors.find(a => a.name === 'Phantom Bear');
  const darkside = threatActors.find(a => a.name === 'DarkSide');
  const lazarus = threatActors.find(a => a.name === 'Lazarus Group');

  const lockbit = malwareList.find(m => m.name === 'LockBit 3.0');
  const cobaltStrike = malwareList.find(m => m.name === 'Cobalt Strike');
  const emotet = malwareList.find(m => m.name === 'Emotet');

  const reports = [
    {
      title: 'Phantom Bear Targets Financial Sector with Advanced Persistent Threat',
      summary: 'Iranian state-sponsored group Phantom Bear (APT35) has been observed conducting sophisticated espionage operations against financial institutions in North America and Europe. The group employs spear-phishing campaigns and credential harvesting techniques to gain initial access.',
      threatActorId: phantomBear?.id ?? null,
      malwareIds: [cobaltStrike?.id ?? ''],
      targetSector: ['Financial Services', 'Government'],
      geography: ['North America', 'Europe'],
      techniques: ['Spear Phishing', 'Credential Harvesting', 'Cobalt Strike C2'],
      indicators: indicators.slice(0, 2).map(i => i.id),
      detectionGuidance: 'Monitor for suspicious email attachments, credential access attempts, and Cobalt Strike beacon traffic. Implement email filtering and MFA.',
      mitigation: 'Deploy EDR solutions, implement network segmentation, conduct regular security awareness training, and maintain offline backups.',
      references: [
        'https://www.cisa.gov/news-events/cybersecurity-advisories/aa22-277a',
        'https://www.mandiant.com/resources/iranian-threat-group-apt35',
      ],
      publicationDate: '2024-01-15',
      severity: ThreatSeverity.CRITICAL,
    },
    {
      title: 'LockBit 3.0 Ransomware Campaign Targets Healthcare Organizations',
      summary: 'LockBit 3.0 ransomware operators have intensified attacks against healthcare organizations, exploiting known vulnerabilities and using double extortion tactics. Multiple hospitals and clinics have been impacted across North America and Europe.',
      threatActorId: null,
      malwareIds: [lockbit?.id ?? ''],
      targetSector: ['Healthcare', 'Critical Infrastructure'],
      geography: ['North America', 'Europe'],
      techniques: ['Ransomware Deployment', 'Data Exfiltration', 'Shadow Copy Deletion'],
      indicators: indicators.slice(2, 4).map(i => i.id),
      detectionGuidance: 'Monitor for rapid file encryption, shadow copy deletion, and suspicious PowerShell execution. Implement file integrity monitoring.',
      mitigation: 'Maintain offline backups, segment networks, patch vulnerabilities promptly, and deploy EDR solutions with ransomware-specific detection rules.',
      references: [
        'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-099a',
        'https://www.hhs.gov/hipaa/for-professionals/cybersecurity',
      ],
      publicationDate: '2024-01-12',
      severity: ThreatSeverity.CRITICAL,
    },
    {
      title: 'Lazarus Group Conducts Cryptocurrency Exchange Attacks',
      summary: 'North Korean threat actor Lazarus Group (APT38) has been targeting cryptocurrency exchanges with sophisticated supply chain attacks and social engineering. The group has stolen over $100 million in digital assets in recent months.',
      threatActorId: lazarus?.id ?? null,
      malwareIds: [],
      targetSector: ['Cryptocurrency', 'Financial Services'],
      geography: ['Asia-Pacific', 'Global'],
      techniques: ['Supply Chain Compromise', 'Social Engineering', 'Credential Theft'],
      indicators: indicators.slice(4, 6).map(i => i.id),
      detectionGuidance: 'Monitor for suspicious supply chain activity, unauthorized API access, and unusual cryptocurrency transactions.',
      mitigation: 'Implement multi-signature wallets, conduct thorough vendor assessments, and monitor for anomalous transaction patterns.',
      references: [
        'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-039a',
        'https://www.fbi.gov/news/pressrel/press-releases/fbi-warns-of-lazarus-group-cryptocurrency-attacks',
      ],
      publicationDate: '2024-01-10',
      severity: ThreatSeverity.HIGH,
    },
    {
      title: 'Emotet Malware Distribution Campaign Resurges',
      summary: 'Emotet malware has resurfaced after a period of inactivity, with a new distribution campaign targeting organizations in the education and manufacturing sectors. The malware is being delivered via phishing emails with malicious Word documents.',
      threatActorId: null,
      malwareIds: [emotet?.id ?? ''],
      targetSector: ['Education', 'Manufacturing'],
      geography: ['Global'],
      techniques: ['Phishing', 'Macro Execution', 'Lateral Movement'],
      indicators: indicators.slice(5, 7).map(i => i.id),
      detectionGuidance: 'Monitor for suspicious macro execution, registry modifications, and network connections to known C2 infrastructure.',
      mitigation: 'Disable Office macros from internet, implement email filtering, use EDR solutions, and conduct security awareness training.',
      references: [
        'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-352a',
        'https://www.malwarebytes.com/emotet-campaign',
      ],
      publicationDate: '2024-01-08',
      severity: ThreatSeverity.HIGH,
    },
    {
      title: 'DarkSide Ransomware Group Targets Critical Infrastructure',
      summary: 'DarkSide ransomware group has resumed operations targeting critical infrastructure organizations, particularly in the energy sector. The group employs double extortion tactics and has demonstrated capability to disrupt operational technology systems.',
      threatActorId: darkside?.id ?? null,
      malwareIds: [],
      targetSector: ['Energy', 'Critical Infrastructure'],
      geography: ['North America'],
      techniques: ['Ransomware Deployment', 'OT System Compromise', 'Data Exfiltration'],
      indicators: indicators.slice(6, 8).map(i => i.id),
      detectionGuidance: 'Monitor IT/OT network boundaries, implement network segmentation, and deploy specialized OT security solutions.',
      mitigation: 'Segment IT and OT networks, implement strict access controls, maintain offline backups, and develop incident response plans for OT environments.',
      references: [
        'https://www.cisa.gov/news-events/cybersecurity-advisories/aa21-131a',
        'https://www.dhs.gov/critical-infrastructure-security',
      ],
      publicationDate: '2024-01-05',
      severity: ThreatSeverity.CRITICAL,
    },
  ];

  for (const report of reports) {
    // Filter out empty strings from malwareIds
    report.malwareIds = report.malwareIds.filter(id => id !== '');
    db.createThreatReport(report);
  }
}
