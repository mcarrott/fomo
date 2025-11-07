import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import IdeaBubble from './IdeaBubble';

interface BrainstormCard {
  id: string;
  name: string;
  color: string;
}

interface IdeaNode {
  id: string;
  card_id: string;
  user_id: string;
  content: string;
  position_x: number;
  position_y: number;
  color: string;
}

interface NodeConnection {
  id: string;
  from_node_id: string;
  to_node_id: string;
}

interface MindMapCanvasProps {
  card: BrainstormCard;
  onBack: () => void;
}

export default function MindMapCanvas({ card, onBack }: MindMapCanvasProps) {
  const { user } = useAuth();
  const [nodes, setNodes] = useState<IdeaNode[]>([]);
  const [connections, setConnections] = useState<NodeConnection[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFromNode, setConnectingFromNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (user) {
      fetchNodes();
      fetchConnections();
    }
  }, [user, card.id]);

  async function fetchNodes() {
    if (!user) return;

    const { data, error } = await supabase
      .from('idea_nodes')
      .select('*')
      .eq('card_id', card.id)
      .eq('user_id', user.id)
      .order('created_at');

    if (error) {
      console.error('Error fetching nodes:', error);
    } else if (data) {
      setNodes(data);
    }
  }

  async function fetchConnections() {
    if (!user) return;

    const { data, error } = await supabase
      .from('node_connections')
      .select('*')
      .eq('card_id', card.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching connections:', error);
    } else if (data) {
      setConnections(data);
    }
  }

  const handleAddNode = async () => {
    if (!user) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2 - 75;
    const centerY = rect.height / 2 - 50 + Math.random() * 100;

    const { data, error } = await supabase
      .from('idea_nodes')
      .insert({
        card_id: card.id,
        user_id: user.id,
        content: 'New Idea',
        position_x: centerX,
        position_y: centerY,
        color: card.color,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating node:', error);
    } else if (data) {
      setNodes([...nodes, data]);
    }
  };

  const handleNodeUpdate = async (nodeId: string, content: string) => {
    const { error } = await supabase
      .from('idea_nodes')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', nodeId);

    if (error) {
      console.error('Error updating node:', error);
    } else {
      setNodes(nodes.map((n) => (n.id === nodeId ? { ...n, content } : n)));
    }
  };

  const handleNodeMove = async (nodeId: string, x: number, y: number) => {
    const { error } = await supabase
      .from('idea_nodes')
      .update({
        position_x: x,
        position_y: y,
        updated_at: new Date().toISOString(),
      })
      .eq('id', nodeId);

    if (error) {
      console.error('Error moving node:', error);
    } else {
      setNodes(nodes.map((n) => (n.id === nodeId ? { ...n, position_x: x, position_y: y } : n)));
    }
  };

  const handleNodeDelete = async (nodeId: string) => {
    const { error } = await supabase.from('idea_nodes').delete().eq('id', nodeId);

    if (error) {
      console.error('Error deleting node:', error);
    } else {
      setNodes(nodes.filter((n) => n.id !== nodeId));
      setConnections(
        connections.filter((c) => c.from_node_id !== nodeId && c.to_node_id !== nodeId)
      );
    }
  };

  const handleStartConnection = (nodeId: string) => {
    if (!connectingFromNode) {
      setConnectingFromNode(nodeId);
    } else {
      handleCompleteConnection(nodeId);
    }
  };

  const handleCompleteConnection = async (toNodeId: string) => {
    if (!user || !connectingFromNode || connectingFromNode === toNodeId) {
      return;
    }

    const exists = connections.some(
      (c) =>
        (c.from_node_id === connectingFromNode && c.to_node_id === toNodeId) ||
        (c.from_node_id === toNodeId && c.to_node_id === connectingFromNode)
    );

    if (exists) {
      setIsConnecting(false);
      setConnectingFromNode(null);
      return;
    }

    const { data, error } = await supabase
      .from('node_connections')
      .insert({
        card_id: card.id,
        user_id: user.id,
        from_node_id: connectingFromNode,
        to_node_id: toNodeId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating connection:', error);
    } else if (data) {
      setConnections([...connections, data]);
    }

    setIsConnecting(false);
    setConnectingFromNode(null);
  };

  const handleDeleteConnection = async (connectionId: string) => {
    const { error } = await supabase.from('node_connections').delete().eq('id', connectionId);

    if (error) {
      console.error('Error deleting connection:', error);
    } else {
      setConnections(connections.filter((c) => c.id !== connectionId));
    }
  };

  const getNodePosition = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return null;
    return { x: node.position_x + 75, y: node.position_y + 50 };
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <div className="bg-white dark:bg-slate-800 shadow-md border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Back to cards"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{card.name}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {nodes.length} {nodes.length === 1 ? 'idea' : 'ideas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsConnecting(!isConnecting);
                setConnectingFromNode(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isConnecting
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              {isConnecting ? (connectingFromNode ? 'Click target bubble' : 'Click first bubble') : 'Connect'}
            </button>
            <button
              onClick={handleAddNode}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Idea
            </button>
          </div>
        </div>
      </div>

      <div ref={canvasRef} className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {connections.map((connection) => {
            const from = getNodePosition(connection.from_node_id);
            const to = getNodePosition(connection.to_node_id);
            if (!from || !to) return null;

            return (
              <g key={connection.id}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  className="dark:stroke-slate-600"
                />
                <circle
                  cx={(from.x + to.x) / 2}
                  cy={(from.y + to.y) / 2}
                  r="8"
                  fill="#ef4444"
                  className="cursor-pointer pointer-events-auto hover:r-10 transition-all"
                  onClick={() => handleDeleteConnection(connection.id)}
                />
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  ×
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute inset-0" style={{ zIndex: 2 }}>
          {nodes.map((node) => (
            <IdeaBubble
              key={node.id}
              node={node}
              isConnecting={isConnecting}
              isConnectingFrom={connectingFromNode === node.id}
              onUpdate={handleNodeUpdate}
              onMove={handleNodeMove}
              onDelete={handleNodeDelete}
              onStartConnection={handleStartConnection}
            />
          ))}
        </div>

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Start brainstorming
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Click "Add Idea" to create your first bubble
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
