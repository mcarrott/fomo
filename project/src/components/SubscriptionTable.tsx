import { useState, useMemo } from 'react';
import { Trash2, Eye, EyeOff, Check, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Subscription {
  id: string;
  name: string;
  purpose: string | null;
  login_email: string | null;
  login_password: string | null;
  cost: number | null;
  billing_cycle: string;
  is_active: boolean;
  notes: string | null;
}

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onRefresh: () => void;
}

type SortField = 'is_active' | 'name' | 'purpose' | 'login_email' | 'cost' | 'billing_cycle' | 'notes';
type SortDirection = 'asc' | 'desc' | null;

export default function SubscriptionTable({ subscriptions, onRefresh }: SubscriptionTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Subscription>>({});
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleEdit = (subscription: Subscription) => {
    setEditingId(subscription.id);
    setEditingData(subscription);
  };

  const handleSave = async () => {
    if (!editingId) return;

    const { error } = await supabase
      .from('subscriptions')
      .update({
        name: editingData.name,
        purpose: editingData.purpose || null,
        login_email: editingData.login_email || null,
        login_password: editingData.login_password || null,
        cost: editingData.cost || null,
        billing_cycle: editingData.billing_cycle || 'monthly',
        is_active: editingData.is_active,
        notes: editingData.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingId);

    if (error) {
      console.error('Error updating subscription:', error);
    } else {
      setEditingId(null);
      setEditingData({});
      await onRefresh();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subscription:', error);
    } else {
      await onRefresh();
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedSubscriptions = useMemo(() => {
    if (!sortField || !sortDirection) return subscriptions;

    return [...subscriptions].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      if (sortField === 'cost') {
        aValue = aValue ? parseFloat(aValue.toString()) : 0;
        bValue = bValue ? parseFloat(bValue.toString()) : 0;
      }

      if (sortField === 'is_active') {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [subscriptions, sortField, sortDirection]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-slate-400" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-4 h-4 text-blue-600" />;
    }
    return <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-2">No subscriptions yet</p>
        <p className="text-sm text-slate-400">Add your first subscription to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-slate-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
              <button
                onClick={() => handleSort('is_active')}
                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                Active
                {getSortIcon('is_active')}
              </button>
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
              <button
                onClick={() => handleSort('name')}
                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                Name
                {getSortIcon('name')}
              </button>
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
              <button
                onClick={() => handleSort('purpose')}
                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                Purpose
                {getSortIcon('purpose')}
              </button>
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
              <button
                onClick={() => handleSort('login_email')}
                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                Login Email
                {getSortIcon('login_email')}
              </button>
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Password</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
              <button
                onClick={() => handleSort('cost')}
                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                Cost
                {getSortIcon('cost')}
              </button>
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
              <button
                onClick={() => handleSort('billing_cycle')}
                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                Billing
                {getSortIcon('billing_cycle')}
              </button>
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
              <button
                onClick={() => handleSort('notes')}
                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                Notes
                {getSortIcon('notes')}
              </button>
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedSubscriptions.map(subscription => {
            const isEditing = editingId === subscription.id;
            const data = isEditing ? editingData : subscription;

            return (
              <tr
                key={subscription.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="py-3 px-4">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={data.is_active}
                      onChange={(e) => setEditingData({ ...editingData, is_active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  ) : (
                    <div
                      className={`w-3 h-3 rounded-full ${
                        subscription.is_active ? 'bg-green-500' : 'bg-slate-300'
                      }`}
                    />
                  )}
                </td>

                <td className="py-3 px-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.name || ''}
                      onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="font-medium text-slate-800">{subscription.name}</span>
                  )}
                </td>

                <td className="py-3 px-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.purpose || ''}
                      onChange={(e) => setEditingData({ ...editingData, purpose: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-slate-600 text-sm">{subscription.purpose || '-'}</span>
                  )}
                </td>

                <td className="py-3 px-4">
                  {isEditing ? (
                    <input
                      type="email"
                      value={data.login_email || ''}
                      onChange={(e) => setEditingData({ ...editingData, login_email: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-slate-600 text-sm">{subscription.login_email || '-'}</span>
                  )}
                </td>

                <td className="py-3 px-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.login_password || ''}
                      onChange={(e) => setEditingData({ ...editingData, login_password: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 text-sm font-mono">
                        {subscription.login_password
                          ? showPasswords[subscription.id]
                            ? subscription.login_password
                            : '••••••••'
                          : '-'}
                      </span>
                      {subscription.login_password && (
                        <button
                          onClick={() => togglePasswordVisibility(subscription.id)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          {showPasswords[subscription.id] ? (
                            <EyeOff className="w-3 h-3 text-slate-500" />
                          ) : (
                            <Eye className="w-3 h-3 text-slate-500" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </td>

                <td className="py-3 px-4">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={data.cost || ''}
                      onChange={(e) => setEditingData({ ...editingData, cost: parseFloat(e.target.value) || null })}
                      className="w-20 px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-slate-800 font-medium">
                      {subscription.cost ? `$${parseFloat(subscription.cost.toString()).toFixed(2)}` : '-'}
                    </span>
                  )}
                </td>

                <td className="py-3 px-4">
                  {isEditing ? (
                    <select
                      value={data.billing_cycle || 'monthly'}
                      onChange={(e) => setEditingData({ ...editingData, billing_cycle: e.target.value })}
                      className="px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  ) : (
                    <span className="text-slate-600 text-sm capitalize">{subscription.billing_cycle}</span>
                  )}
                </td>

                <td className="py-3 px-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.notes || ''}
                      onChange={(e) => setEditingData({ ...editingData, notes: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-slate-600 text-sm">{subscription.notes || '-'}</span>
                  )}
                </td>

                <td className="py-3 px-4">
                  {isEditing ? (
                    <div className="flex gap-1">
                      <button
                        onClick={handleSave}
                        className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                        aria-label="Save"
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Cancel"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(subscription)}
                        className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subscription.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
