/**
 * Simple Markdown to HTML parser
 * Supports: headings, bold, italic, links, images, code blocks, lists, blockquotes
 */

import { highlightCode } from './syntaxHighlighter';

export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Code blocks with language
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'javascript';
    const highlighted = highlightCode(code.trim(), language);
    return `<pre class="bg-gray-900 rounded-lg p-4 overflow-x-auto my-4 border border-gray-800"><code class="language-${language} text-sm">${highlighted}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1.5 py-0.5 rounded text-emerald-400 text-sm">$1</code>');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-white mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white mt-8 mb-4">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mt-8 mb-4">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold text-white"><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-emerald-400 hover:text-emerald-300 underline" target="_blank" rel="noopener noreferrer">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-4 max-w-full" />');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-emerald-500 pl-4 py-2 my-4 text-gray-300 italic bg-gray-900/30 rounded-r-lg">$1</blockquote>');

  // Unordered lists
  html = html.replace(/^\* (.*$)/gim, '<li class="ml-6 list-disc text-gray-300">$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li class="ml-6 list-disc text-gray-300">$1</li>');

  // Ordered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-6 list-decimal text-gray-300">$1</li>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="border-gray-800 my-8" />');

  // Paragraphs (lines that don't start with special chars)
  html = html.replace(/^(?!<[hluob]|<li|<hr|<pre|<blockquote|<img)(.*$)/gim, (match) => {
    if (match.trim() === '') return '';
    return `<p class="text-gray-300 leading-relaxed mb-4">${match}</p>`;
  });

  // Clean up extra line breaks
  html = html.replace(/\n\n+/g, '\n');

  return html;
}

/**
 * Extract table of contents from markdown
 */
export function extractTableOfContents(markdown: string): { level: number; text: string; id: string }[] {
  const headings: { level: number; text: string; id: string }[] = [];
  const headingRegex = /^(#{1,3}) (.*$)/gim;
  
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
    headings.push({ level, text, id });
  }
  
  return headings;
}

/**
 * Calculate reading time from markdown
 */
export function calculateReadingTimeFromMarkdown(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract excerpt from markdown (first paragraph or first 160 chars)
 */
export function extractExcerpt(markdown: string, maxLength = 160): string {
  // Remove code blocks
  let text = markdown.replace(/```[\s\S]*?```/g, '');
  // Remove headings
  text = text.replace(/^#+ .*/gm, '');
  // Remove images
  text = text.replace(/!\[.*?\]\(.*?\)/g, '');
  // Remove links but keep text
  text = text.replace(/\[(.*?)\]\(.*?\)/g, '$1');
  // Remove formatting
  text = text.replace(/[*_`]/g, '');
  // Get first paragraph
  const paragraphs = text.split(/\n\n+/);
  const firstParagraph = paragraphs.find(p => p.trim().length > 0) || '';
  
  if (firstParagraph.length <= maxLength) {
    return firstParagraph.trim();
  }
  
  return firstParagraph.trim().slice(0, maxLength).trim() + '...';
}
