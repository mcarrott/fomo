import { useState, useEffect } from 'react';
import { Plus, Upload, DollarSign, FileText, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SubscriptionTable from './SubscriptionTable';
import FinancialDocumentUpload from './FinancialDocumentUpload';

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
  created_at: string;
  updated_at: string;
}

interface FinancialDocument {
  id: string;
  name: string;
  document_type: string;
  year: number | null;
  amount: number | null;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  notes: string | null;
  created_at: string;
}

export default function Finances() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [documents, setDocuments] = useState<FinancialDocument[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<'all' | 'w2' | 'receipt' | 'tax_form' | 'other'>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
      fetchDocuments();
    }
  }, [user]);

  async function fetchSubscriptions() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching subscriptions:', error);
    } else if (data) {
      setSubscriptions(data);
    }
  }

  async function fetchDocuments() {
    const { data, error } = await supabase
      .from('financial_documents')
      .select('*')
      .order('year', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
    } else if (data) {
      setDocuments(data);
    }
  }

  const handleAddSubscription = async () => {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        name: 'New Subscription',
        is_active: true,
        user_id: user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding subscription:', error);
    } else if (data) {
      await fetchSubscriptions();
    }
  };

  const totalMonthlyActive = subscriptions
    .filter(sub => sub.is_active && sub.billing_cycle === 'monthly')
    .reduce((sum, sub) => sum + (sub.cost ? parseFloat(sub.cost.toString()) : 0), 0);

  const totalYearlyActive = subscriptions
    .filter(sub => sub.is_active && sub.billing_cycle === 'yearly')
    .reduce((sum, sub) => sum + (sub.cost ? parseFloat(sub.cost.toString()) : 0), 0);

  const filteredDocuments = selectedDocType === 'all'
    ? documents
    : documents.filter(doc => doc.document_type === selectedDocType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Finances</h1>
            <p className="text-slate-600 dark:text-slate-300">Manage your subscriptions and financial documents</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-300">Monthly Expenses</span>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                ${totalMonthlyActive.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {subscriptions.filter(s => s.is_active && s.billing_cycle === 'monthly').length} active subscriptions
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-300">Yearly Expenses</span>
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                ${totalYearlyActive.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {subscriptions.filter(s => s.is_active && s.billing_cycle === 'yearly').length} active subscriptions
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-300">Total Documents</span>
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {documents.length}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                W2s, receipts, and tax forms
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Subscriptions</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">Track your recurring expenses and login information</p>
              </div>
              <button
                onClick={handleAddSubscription}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add Subscription
              </button>
            </div>

            <SubscriptionTable
              subscriptions={subscriptions}
              onRefresh={fetchSubscriptions}
            />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Financial Documents</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">W2s, receipts, and tax forms</p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Upload className="w-4 h-4" />
                Upload Document
              </button>
            </div>

            <div className="mb-4">
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value as any)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Documents ({documents.length})</option>
                <option value="w2">W2s ({documents.filter(d => d.document_type === 'w2').length})</option>
                <option value="receipt">Receipts ({documents.filter(d => d.document_type === 'receipt').length})</option>
                <option value="tax_form">Tax Forms ({documents.filter(d => d.document_type === 'tax_form').length})</option>
                <option value="other">Other ({documents.filter(d => d.document_type === 'other').length})</option>
              </select>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">No documents yet</p>
                <p className="text-sm text-slate-400">Upload your first financial document to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map(doc => (
                  <div
                    key={doc.id}
                    className="border-2 border-slate-200 rounded-xl p-4 hover:shadow-lg transition-all hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 truncate mb-1">{doc.name}</h3>
                        <p className="text-xs text-slate-500 truncate">{doc.file_name}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-3">
                      {doc.year && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-300">Year:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-100">{doc.year}</span>
                        </div>
                      )}
                      {doc.amount && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-300">Amount:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-100">${parseFloat(doc.amount.toString()).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-300">Type:</span>
                        <span className="font-medium text-slate-800 capitalize">{doc.document_type.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {doc.notes && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{doc.notes}</p>
                    )}

                    <a
                      href={doc.file_url}
                      download
                      className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors text-sm"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isUploadModalOpen && (
        <FinancialDocumentUpload
          onClose={() => setIsUploadModalOpen(false)}
          onUploadComplete={() => {
            setIsUploadModalOpen(false);
            fetchDocuments();
          }}
        />
      )}
    </div>
  );
}
