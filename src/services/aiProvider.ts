/**
 * AI Provider Abstraction
 * Defines the interface for AI providers and implements a mock provider for demo.
 */

import type { AIProvider, MessageRole } from '../db/aiSchema';

/**
 * Mock AI Provider for demonstration
 * In production, this would be replaced with actual AI providers like OpenAI, Anthropic, etc.
 */
export class MockAIProvider implements AIProvider {
  name = 'mock-provider';

  async generateResponse(
    messages: Array<{ role: MessageRole; content: string }>,
    context?: string
  ): Promise<{
    content: string;
    tokens: number;
    latency: number;
  }> {
    const startTime = Date.now();
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage?.content || '';
    
    // Generate mock response based on query
    const response = this.generateMockResponse(userQuery, context);
    
    const latency = Date.now() - startTime;
    const tokens = Math.floor(response.length / 4); // Rough token estimation
    
    return {
      content: response,
      tokens,
      latency,
    };
  }

  private generateMockResponse(query: string, context?: string): string {
    const lowerQuery = query.toLowerCase();
    
    // SQL Injection
    if (lowerQuery.includes('sql injection') || lowerQuery.includes('sqli')) {
      return `## SQL Injection Explained

SQL Injection is a web security vulnerability that allows an attacker to interfere with the queries that an application makes to its database.

### How It Works

Attackers can inject malicious SQL code through user input fields, potentially:
- Viewing data they shouldn't have access to
- Modifying or deleting data
- Bypassing authentication
- Executing administrative operations

### Example

\`\`\`sql
-- Vulnerable query
SELECT * FROM users WHERE username = '$input' AND password = '$password'

-- Malicious input: ' OR '1'='1
SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '' OR '1'='1'
\`\`\`

### Prevention

1. **Parameterized Queries**: Use prepared statements
2. **Input Validation**: Sanitize all user inputs
3. **Least Privilege**: Limit database account permissions
4. **Web Application Firewall**: Deploy WAF rules

${context ? `\n### Related Articles from CyberVault\n\n${context}` : ''}

**Note**: This explanation is for educational purposes to help you understand and defend against SQL injection attacks.`;
    }
    
    // Active Directory
    if (lowerQuery.includes('active directory') || lowerQuery.includes('ad')) {
      return `## Active Directory Security

Active Directory (AD) is Microsoft's directory and identity management service. Securing AD is critical as it's often the target of advanced attacks.

### Key Security Areas

1. **Authentication**
   - Implement multi-factor authentication (MFA)
   - Use strong password policies
   - Monitor for suspicious login attempts

2. **Privileged Access**
   - Implement Privileged Access Workstations (PAW)
   - Use Just-In-Time (JIT) administration
   - Regularly audit admin accounts

3. **Group Policy**
   - Harden default policies
   - Regularly review GPOs
   - Monitor policy changes

4. **Monitoring & Detection**
   - Enable advanced audit policies
   - Monitor for lateral movement
   - Detect privilege escalation attempts

### Common Attack Vectors

- Kerberoasting
- Pass-the-Hash
- Golden/Silver Tickets
- DCSync attacks

${context ? `\n### Related Articles\n\n${context}` : ''}`;
    }
    
    // Windows Hardening
    if (lowerQuery.includes('windows') && lowerQuery.includes('hardening')) {
      return `## Windows Hardening Checklist

### 1. Account Security
- [ ] Disable guest account
- [ ] Rename default Administrator account
- [ ] Implement strong password policy
- [ ] Enable account lockout policy
- [ ] Use multi-factor authentication

### 2. Network Security
- [ ] Enable Windows Firewall
- [ ] Disable unnecessary services
- [ ] Disable SMBv1
- [ ] Configure network segmentation
- [ ] Enable Network Level Authentication (NLA)

### 3. System Updates
- [ ] Enable automatic updates
- [ ] Regularly patch OS and applications
- [ ] Remove unused software
- [ ] Update firmware and drivers

### 4. Audit & Logging
- [ ] Enable advanced audit policies
- [ ] Configure log retention
- [ ] Forward logs to SIEM
- [ ] Monitor for suspicious activities

### 5. Encryption
- [ ] Enable BitLocker
- [ ] Encrypt sensitive data at rest
- [ ] Use HTTPS for web services
- [ ] Implement TLS 1.2+ for communications

### 6. Application Control
- [ ] Implement AppLocker or WDAC
- [ ] Disable unnecessary features
- [ ] Remove admin shares
- [ ] Disable autorun/autoplay

${context ? `\n### Related Articles\n\n${context}` : ''}`;
    }
    
    // Default response
    return `I'd be happy to help you with your cybersecurity question. 

Based on your query, I recommend exploring our knowledge base for detailed information on this topic. Our platform offers:

- In-depth articles and tutorials
- Threat intelligence reports
- Vulnerability databases
- Hands-on labs

Would you like me to search for specific articles or resources related to your question?

${context ? `\n### Relevant Content from CyberVault\n\n${context}` : ''}

**Note**: For security-sensitive topics, I can provide educational information to help you understand and defend against threats, but I cannot provide instructions for unauthorized activities.`;
  }
}

/**
 * Create AI provider instance
 * In production, this would check environment variables to determine which provider to use
 */
export function createAIProvider(): AIProvider {
  // For now, always return mock provider
  // In production, this would be:
  // const providerName = import.meta.env.VITE_AI_PROVIDER || 'mock';
  // switch (providerName) {
  //   case 'openai': return new OpenAIProvider();
  //   case 'anthropic': return new AnthropicProvider();
  //   default: return new MockAIProvider();
  // }
  return new MockAIProvider();
}
