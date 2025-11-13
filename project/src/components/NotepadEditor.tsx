import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Clock, List } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NotepadEditorProps {
  page: {
    id: string;
    title: string;
    content: string;
    color: string;
    clients?: {
      name: string;
      color: string;
    } | null;
  };
  onBack: () => void;
}

export default function NotepadEditor({ page, onBack }: NotepadEditorProps) {
  const [content, setContent] = useState(page.content);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(page.content);
    setHasUnsavedChanges(false);
  }, [page.id]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges) {
        handleSave();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [content, hasUnsavedChanges]);

  const handleSave = async () => {
    setIsSaving(true);

    const { error } = await supabase
      .from('notepad_pages')
      .update({
        content: content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', page.id);

    if (error) {
      console.error('Error saving page:', error);
    } else {
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    }

    setIsSaving(false);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      setHasUnsavedChanges(true);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    } else if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const currentLineStart = content.lastIndexOf('\n', start - 1) + 1;
      const currentLine = content.substring(currentLineStart, start);

      const bulletMatch = currentLine.match(/^(\s*)([-•*])\s/);
      const numberedMatch = currentLine.match(/^(\s*)(\d+)\.\s/);

      if (bulletMatch) {
        e.preventDefault();
        const indent = bulletMatch[1];
        const bullet = bulletMatch[2];

        if (currentLine.trim() === bullet) {
          const newContent = content.substring(0, currentLineStart) + content.substring(start);
          setContent(newContent);
          setHasUnsavedChanges(true);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = currentLineStart;
          }, 0);
        } else {
          const newContent = content.substring(0, start) + `\n${indent}${bullet} ` + content.substring(start);
          setContent(newContent);
          setHasUnsavedChanges(true);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + indent.length + 3;
          }, 0);
        }
      } else if (numberedMatch) {
        e.preventDefault();
        const indent = numberedMatch[1];
        const currentNumber = parseInt(numberedMatch[2]);

        if (currentLine.trim() === `${currentNumber}.`) {
          const newContent = content.substring(0, currentLineStart) + content.substring(start);
          setContent(newContent);
          setHasUnsavedChanges(true);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = currentLineStart;
          }, 0);
        } else {
          const nextNumber = currentNumber + 1;
          const newContent = content.substring(0, start) + `\n${indent}${nextNumber}. ` + content.substring(start);
          setContent(newContent);
          setHasUnsavedChanges(true);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + indent.length + `${nextNumber}. `.length + 1;
          }, 0);
        }
      }
    }
  };

  const insertBullet = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const beforeCursor = content.substring(0, start);
    const afterCursor = content.substring(end);

    const lastNewline = beforeCursor.lastIndexOf('\n');
    const currentLineStart = lastNewline + 1;
    const beforeCurrentLine = beforeCursor.substring(0, currentLineStart);
    const currentLine = beforeCursor.substring(currentLineStart);

    let newContent: string;
    let cursorPos: number;

    if (currentLine.trim() === '') {
      newContent = beforeCurrentLine + '• ' + afterCursor;
      cursorPos = beforeCurrentLine.length + 2;
    } else {
      newContent = beforeCursor + '\n• ' + afterCursor;
      cursorPos = start + 3;
    }

    setContent(newContent);
    setHasUnsavedChanges(true);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = cursorPos;
    }, 0);
  };

  const handleBack = async () => {
    if (hasUnsavedChanges) {
      await handleSave();
    }
    onBack();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="glass-card dark:glass-card-dark sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Back to pages"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">
                  {page.title}
                </h1>
                {page.clients && (
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: page.clients.color }}
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {page.clients.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {lastSaved && (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    Saved {lastSaved.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}

              <button
                onClick={insertBullet}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                title="Insert bullet point"
              >
                <List className="w-4 h-4" />
                Bullet
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save' : 'Saved'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Start typing your notes...&#10;&#10;Tips:&#10;• Type '- ' or '• ' or '* ' at the start of a line for bullets&#10;• Type '1. ' for numbered lists&#10;• Press Tab to indent&#10;• Press Enter to continue bullets/numbering"
            className="w-full h-[calc(100vh-200px)] p-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 dark:text-slate-100 resize-none text-lg leading-relaxed"
            style={{
              fontFamily: 'inherit',
              minHeight: '500px',
            }}
          />
        </div>
      </div>

      <div className="glass-card dark:glass-card-dark border-t border-slate-200 dark:border-slate-700 py-3">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span>
                {content.length} characters • {content.split(/\s+/).filter(w => w.length > 0).length} words
              </span>
              <span className="text-xs opacity-70">
                Tip: Type '- ' or '• ' for bullets, '1. ' for numbered lists
              </span>
            </div>
            {hasUnsavedChanges && (
              <div className="text-amber-600 dark:text-amber-400">
                Unsaved changes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
