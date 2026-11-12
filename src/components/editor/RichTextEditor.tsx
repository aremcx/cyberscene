import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { markdownToHtml, extractTableOfContents } from '../../lib/markdown';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your content in Markdown...',
  className,
  minHeight = '500px',
}: RichTextEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [showToc, setShowToc] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toc = extractTableOfContents(value);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(500, textareaRef.current.scrollHeight)}px`;
    }
  }, [value]);

  const insertMarkdown = (before: string, after = '') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const toolbar = (
    <div className="flex items-center gap-1 p-2 border-b border-gray-800 bg-gray-900/50">
      {/* Format buttons */}
      <button
        type="button"
        onClick={() => insertMarkdown('**', '**')}
        className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        title="Bold"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6 4a1 1 0 00-1 1v10a1 1 0 102 0V5a1 1 0 00-1-1zM8 4a1 1 0 00-1 1v10a1 1 0 102 0V5a1 1 0 00-1-1zM12 4a1 1 0 00-1 1v3.586l-.293-.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L13 8.586V5a1 1 0 00-1-1z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => insertMarkdown('*', '*')}
        className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        title="Italic"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9v10h2a1 1 0 110 2H9a1 1 0 01-1-1V3z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => insertMarkdown('# ', '')}
        className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        title="Heading"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 11-2 0V9H4v6a1 1 0 11-2 0V4a1 1 0 011-1zM11 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 11-2 0V9h-1v6a1 1 0 11-2 0V4a1 1 0 011-1z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => insertMarkdown('[', '](url)')}
        className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        title="Link"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => insertMarkdown('```\n', '\n```')}
        className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        title="Code Block"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => insertMarkdown('- ', '')}
        className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        title="List"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => insertMarkdown('> ', '')}
        className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        title="Quote"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      </button>

      <div className="flex-1" />

      {/* TOC toggle */}
      {toc.length > 0 && (
        <button
          type="button"
          onClick={() => setShowToc(!showToc)}
          className={cn(
            'p-2 rounded transition-colors',
            showToc ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-gray-800 text-gray-400 hover:text-white'
          )}
          title="Table of Contents"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Mode switcher */}
      <div className="flex items-center gap-1 ml-2 border-l border-gray-800 pl-2">
        <button
          type="button"
          onClick={() => setMode('edit')}
          className={cn(
            'px-3 py-1 text-xs font-medium rounded transition-colors',
            mode === 'edit' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'
          )}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setMode('split')}
          className={cn(
            'px-3 py-1 text-xs font-medium rounded transition-colors',
            mode === 'split' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'
          )}
        >
          Split
        </button>
        <button
          type="button"
          onClick={() => setMode('preview')}
          className={cn(
            'px-3 py-1 text-xs font-medium rounded transition-colors',
            mode === 'preview' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'
          )}
        >
          Preview
        </button>
      </div>
    </div>
  );

  return (
    <div className={cn('rounded-lg border border-gray-800 bg-gray-950 overflow-hidden', className)}>
      {toolbar}

      <div className="flex" style={{ minHeight }}>
        {/* TOC Sidebar */}
        {showToc && toc.length > 0 && (
          <div className="w-64 border-r border-gray-800 bg-gray-900/30 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-white mb-3">Table of Contents</h3>
            <nav className="space-y-1">
              {toc.map((heading, idx) => (
                <a
                  key={idx}
                  href={`#${heading.id}`}
                  className={cn(
                    'block text-sm text-gray-400 hover:text-emerald-400 transition-colors',
                    heading.level === 2 && 'pl-4',
                    heading.level === 3 && 'pl-8'
                  )}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </div>
        )}

        {/* Editor / Preview */}
        <div className={cn('flex-1 flex', mode === 'split' && 'divide-x divide-gray-800')}>
          {/* Editor */}
          {(mode === 'edit' || mode === 'split') && (
            <div className={cn('flex-1', mode === 'split' && 'w-1/2')}>
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-full p-4 bg-transparent text-gray-100 placeholder-gray-600 resize-none focus:outline-none font-mono text-sm leading-relaxed"
                style={{ minHeight }}
              />
            </div>
          )}

          {/* Preview */}
          {(mode === 'preview' || mode === 'split') && (
            <div className={cn('flex-1 p-6 overflow-y-auto prose prose-invert max-w-none', mode === 'split' && 'w-1/2')}>
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
