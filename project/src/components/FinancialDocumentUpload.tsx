import { useState } from 'react';
import { X, Upload, File } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface FinancialDocumentUploadProps {
  onClose: () => void;
  onUploadComplete: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'w2', label: 'W2' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'tax_form', label: 'Tax Form' },
  { value: 'other', label: 'Other' },
];

export default function FinancialDocumentUpload({ onClose, onUploadComplete }: FinancialDocumentUploadProps) {
  const [name, setName] = useState('');
  const [documentType, setDocumentType] = useState('receipt');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name.trim()) return;

    setIsUploading(true);

    try {
      const fileUrl = URL.createObjectURL(file);

      const { error: dbError } = await supabase
        .from('financial_documents')
        .insert({
          name: name.trim(),
          document_type: documentType,
          year: year ? parseInt(year) : null,
          amount: amount ? parseFloat(amount) : null,
          file_url: fileUrl,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          notes: notes.trim() || null,
          user_id: user?.id,
        });

      if (dbError) {
        console.error('Error saving document:', dbError);
        alert('Failed to save document. Please try again.');
      } else {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Close"
          disabled={isUploading}
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <h2 className="text-2xl font-bold text-slate-800 mb-6">Upload Financial Document</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              File <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                required
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className={`flex items-center justify-center gap-3 w-full px-4 py-8 border-2 border-dashed rounded-lg transition-colors ${
                  file
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
                } ${isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                {file ? (
                  <>
                    <File className="w-6 h-6 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-slate-800">{file.name}</p>
                      <p className="text-xs text-slate-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400" />
                    <div className="text-center">
                      <p className="font-medium text-slate-700">Click to upload</p>
                      <p className="text-xs text-slate-500">PDF, images, or documents</p>
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Document Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 2024 W2 - Acme Corp"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isUploading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                required
                disabled={isUploading}
              >
                {DOCUMENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                min="1900"
                max="2100"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isUploading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Amount (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isUploading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any relevant notes..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isUploading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUploading || !file || !name.trim()}
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
