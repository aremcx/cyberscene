/**
 * Simple syntax highlighter for code blocks
 * Supports common programming languages
 */

const languagePatterns: Record<string, { pattern: RegExp; className: string }[]> = {
  javascript: [
    { pattern: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|this|typeof|instanceof)\b/g, className: 'text-purple-400' },
    { pattern: /\b(true|false|null|undefined|NaN|Infinity)\b/g, className: 'text-orange-400' },
    { pattern: /(["'`])(?:(?=(\\?))\2.)*?\1/g, className: 'text-green-400' },
    { pattern: /\/\/.*$/gm, className: 'text-gray-500' },
    { pattern: /\/\*[\s\S]*?\*\//g, className: 'text-gray-500' },
    { pattern: /\b(\d+)\b/g, className: 'text-blue-400' },
  ],
  typescript: [
    { pattern: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|this|typeof|instanceof|interface|type|enum|implements|extends|public|private|protected|readonly)\b/g, className: 'text-purple-400' },
    { pattern: /\b(true|false|null|undefined|NaN|Infinity|string|number|boolean|void|any|never|unknown)\b/g, className: 'text-orange-400' },
    { pattern: /(["'`])(?:(?=(\\?))\2.)*?\1/g, className: 'text-green-400' },
    { pattern: /\/\/.*$/gm, className: 'text-gray-500' },
    { pattern: /\/\*[\s\S]*?\*\//g, className: 'text-gray-500' },
    { pattern: /\b(\d+)\b/g, className: 'text-blue-400' },
  ],
  python: [
    { pattern: /\b(def|class|return|if|elif|else|for|while|import|from|as|try|except|raise|with|pass|break|continue|lambda|yield|global|nonlocal)\b/g, className: 'text-purple-400' },
    { pattern: /\b(True|False|None)\b/g, className: 'text-orange-400' },
    { pattern: /(["'])(?:(?=(\\?))\2.)*?\1/g, className: 'text-green-400' },
    { pattern: /#.*$/gm, className: 'text-gray-500' },
    { pattern: /\b(\d+)\b/g, className: 'text-blue-400' },
  ],
  bash: [
    { pattern: /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|exit|echo|cd|ls|grep|awk|sed)\b/g, className: 'text-purple-400' },
    { pattern: /(["'])(?:(?=(\\?))\2.)*?\1/g, className: 'text-green-400' },
    { pattern: /#.*$/gm, className: 'text-gray-500' },
    { pattern: /\$(\w+)/g, className: 'text-orange-400' },
  ],
  sql: [
    { pattern: /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|NULL|IS|IN|LIKE|BETWEEN|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|AS|DISTINCT|UNION|ALL)\b/gi, className: 'text-purple-400' },
    { pattern: /(["'])(?:(?=(\\?))\2.)*?\1/g, className: 'text-green-400' },
    { pattern: /--.*$/gm, className: 'text-gray-500' },
    { pattern: /\b(\d+)\b/g, className: 'text-blue-400' },
  ],
};

export function highlightCode(code: string, language: string): string {
  const patterns = languagePatterns[language.toLowerCase()] || languagePatterns.javascript;
  
  let highlighted = code;
  
  // Apply each pattern
  for (const { pattern, className } of patterns) {
    highlighted = highlighted.replace(pattern, (match) => {
      return `<span class="${className}">${match}</span>`;
    });
  }
  
  return highlighted;
}

export function getLanguageName(lang: string): string {
  const names: Record<string, string> = {
    js: 'JavaScript',
    javascript: 'JavaScript',
    ts: 'TypeScript',
    typescript: 'TypeScript',
    py: 'Python',
    python: 'Python',
    bash: 'Bash',
    sh: 'Bash',
    shell: 'Bash',
    sql: 'SQL',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
    xml: 'XML',
    yaml: 'YAML',
    md: 'Markdown',
    markdown: 'Markdown',
  };
  
  return names[lang.toLowerCase()] || lang;
}
