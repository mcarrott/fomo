import { useState, useRef, useEffect } from 'react';
import { Trash2, GripVertical } from 'lucide-react';

interface IdeaNode {
  id: string;
  content: string;
  position_x: number;
  position_y: number;
  color: string;
}

interface IdeaBubbleProps {
  node: IdeaNode;
  isConnecting: boolean;
  isConnectingFrom: boolean;
  onUpdate: (nodeId: string, content: string) => void;
  onMove: (nodeId: string, x: number, y: number) => void;
  onDelete: (nodeId: string) => void;
  onStartConnection: (nodeId: string) => void;
}

export default function IdeaBubble({
  node,
  isConnecting,
  isConnectingFrom,
  onUpdate,
  onMove,
  onDelete,
  onStartConnection,
}: IdeaBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(node.content);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const bubbleRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing || e.button !== 0) return;

    const rect = bubbleRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const parent = bubbleRef.current?.parentElement;
      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      const newX = e.clientX - parentRect.left - dragOffset.x;
      const newY = e.clientY - parentRect.top - dragOffset.y;

      const clampedX = Math.max(0, Math.min(newX, parentRect.width - 150));
      const clampedY = Math.max(0, Math.min(newY, parentRect.height - 100));

      if (bubbleRef.current) {
        bubbleRef.current.style.left = `${clampedX}px`;
        bubbleRef.current.style.top = `${clampedY}px`;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (bubbleRef.current) {
        const parent = bubbleRef.current.parentElement;
        if (!parent) return;

        const parentRect = parent.getBoundingClientRect();
        const finalX = e.clientX - parentRect.left - dragOffset.x;
        const finalY = e.clientY - parentRect.top - dragOffset.y;

        const clampedX = Math.max(0, Math.min(finalX, parentRect.width - 150));
        const clampedY = Math.max(0, Math.min(finalY, parentRect.height - 100));

        onMove(node.id, clampedX, clampedY);
      }
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, node.id, onMove]);

  const handleDoubleClick = () => {
    if (!isConnecting) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (content.trim() && content !== node.content) {
      onUpdate(node.id, content.trim());
    } else if (!content.trim()) {
      setContent(node.content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setContent(node.content);
      setIsEditing(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isConnecting) return;

    e.stopPropagation();

    if (isConnectingFrom) {
      return;
    }

    onStartConnection(node.id);
  };

  return (
    <div
      ref={bubbleRef}
      className={`absolute group transition-shadow ${
        isDragging ? 'cursor-grabbing shadow-2xl scale-105' : 'cursor-grab'
      } ${isConnectingFrom ? 'ring-4 ring-green-400 animate-pulse' : ''} ${
        isConnecting && !isConnectingFrom ? 'hover:ring-4 hover:ring-blue-400 cursor-pointer' : ''
      }`}
      style={{
        left: `${node.position_x}px`,
        top: `${node.position_y}px`,
        width: '150px',
      }}
      onMouseDown={isConnecting ? undefined : handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
    >
      <div
        className="relative rounded-2xl shadow-lg p-4 min-h-[100px] flex flex-col"
        style={{
          backgroundColor: node.color,
          opacity: isDragging ? 0.8 : 1,
        }}
      >
        <div className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this idea?')) {
                  onDelete(node.id);
                }
              }}
              className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md"
              aria-label="Delete bubble"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        ) : (
          <div className="text-slate-800 dark:text-slate-100 text-sm font-medium break-words">
            {node.content}
          </div>
        )}

        {!isEditing && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {isConnecting ? (
              <div className="text-xs text-slate-800 bg-white/90 rounded px-2 py-1 font-semibold">
                {isConnectingFrom ? 'Click target' : 'Click to connect'}
              </div>
            ) : (
              <div className="text-xs text-slate-800 bg-white/70 rounded px-2 py-1">
                Double-click to edit
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
