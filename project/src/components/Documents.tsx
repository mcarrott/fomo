import { useState, useEffect } from 'react';
import { Upload, FileText, Download, Trash2, Search, Filter, File, FileSpreadsheet, FileImage, FileCode } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import DocumentUploadModal from './DocumentUploadModal';

interface Document {
  id: string;
  name: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  category: string;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: 'all', label: 'All Documents' },
  { value: 'invoice', label: 'Invoices' },
  { value: 'proposal', label: 'Proposals' },
  { value: 'storyboard', label: 'Storyboards' },
  { value: 'resume', label: 'Resume' },
  { value: 'other', label: 'Other' },
];

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  async function fetchDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
    } else if (data) {
      setDocuments(data);
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      console.error('Error deleting document:', error);
    } else {
      await fetchDocuments();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="w-8 h-8 text-blue-500" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    if (fileType.includes('image')) return <FileImage className="w-8 h-8 text-purple-500" />;
    if (fileType.includes('text')) return <FileCode className="w-8 h-8 text-slate-500" />;
    return <File className="w-8 h-8 text-slate-400" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      invoice: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      proposal: 'bg-blue-100 text-blue-700 border-blue-300',
      storyboard: 'bg-purple-100 text-purple-700 border-purple-300',
      resume: 'bg-amber-100 text-amber-700 border-amber-300',
      other: 'bg-slate-100 text-slate-700 border-slate-300',
    };
    return colors[category] || colors.other;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (category: string) => {
    if (category === 'all') return documents.length;
    return documents.filter(doc => doc.category === category).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="p-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Documents</h1>
              <p className="text-slate-600 dark:text-slate-300">Manage your templates, invoices, proposals, and files</p>
            </div>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Upload className="w-5 h-5" />
              Upload Document
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search documents..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label} ({getCategoryCount(cat.value)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">
                  {searchTerm || selectedCategory !== 'all' ? 'No documents found' : 'No documents yet'}
                </p>
                {!searchTerm && selectedCategory === 'all' && (
                  <p className="text-sm text-slate-400">Upload your first document to get started</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map(doc => (
                  <div
                    key={doc.id}
                    className="group bg-white border-2 border-slate-200 rounded-xl p-5 hover:shadow-lg transition-all hover:border-slate-300"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0">
                        {getFileIcon(doc.file_type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 truncate mb-1">
                          {doc.name}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">
                          {doc.file_name}
                        </p>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={doc.file_url}
                          download
                          className="p-2 hover:bg-slate-100 dark:bg-slate-700 rounded-lg transition-colors"
                          aria-label="Download"
                        >
                          <Download className="w-4 h-4 text-slate-600" />
                        </a>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    {doc.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {doc.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className={`px-2 py-1 text-xs font-semibold rounded border ${getCategoryColor(doc.category)}`}>
                        {CATEGORIES.find(c => c.value === doc.category)?.label || doc.category}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatFileSize(doc.file_size)}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-400">
                      {new Date(doc.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
              <div key={cat.value} className="bg-white rounded-xl shadow-lg p-4">
                <div className="text-sm text-slate-600 mb-1">{cat.label}</div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {getCategoryCount(cat.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isUploadModalOpen && (
        <DocumentUploadModal
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
