import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload as UploadIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  category: 'Rechnung' | 'Quittung' | 'Bankauszug' | 'Sonstiges';
  description: string;
}

const categories = [
  { value: 'Rechnung', label: 'Rechnung' },
  { value: 'Quittung', label: 'Quittung' },
  { value: 'Bankauszug', label: 'Bankauszug' },
  { value: 'Sonstiges', label: 'Sonstiges' },
];

export function Upload() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: FileWithProgress[] = Array.from(selectedFiles).map((file) => ({
      file,
      progress: 0,
      status: 'pending',
      category: 'Sonstiges',
      description: '',
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateFile = (index: number, updates: Partial<FileWithProgress>) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];

      if (fileItem.status === 'success') continue;

      updateFile(i, { status: 'uploading', progress: 0 });

      try {
        const fileExt = fileItem.file.name.split('.').pop();
        const fileName = `${user!.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, fileItem.file, {
            onUploadProgress: (progress) => {
              const percent = (progress.loaded / progress.total) * 100;
              updateFile(i, { progress: Math.round(percent) });
            },
          });

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase.from('uploaded_files').insert({
          user_id: user!.id,
          file_name: fileItem.file.name,
          file_path: fileName,
          file_type: fileItem.file.type,
          file_size: fileItem.file.size,
          category: fileItem.category,
          description: fileItem.description || null,
        });

        if (dbError) throw dbError;

        updateFile(i, { status: 'success', progress: 100 });
      } catch (error) {
        console.error('Upload error:', error);
        updateFile(i, {
          status: 'error',
          error: 'Upload fehlgeschlagen. Bitte versuchen Sie es erneut.',
        });
      }
    }

    setUploading(false);
  };

  const hasPendingFiles = files.some((f) => f.status === 'pending' || f.status === 'error');
  const hasSuccessFiles = files.some((f) => f.status === 'success');

  return (
    <div className="min-h-screen bg-anthracite-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-anthracite-600 hover:text-dark-blue-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-dark-blue-900">Belege hochladen</h1>
          <p className="text-anthracite-600 mt-2">
            Laden Sie Ihre Rechnungen, Quittungen und anderen Belege hoch.
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden mb-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-12 border-2 border-dashed border-anthracite-300 rounded-xl m-4 cursor-pointer hover:border-petrol-400 hover:bg-petrol-50/50 transition-colors text-center"
          >
            <UploadIcon className="w-12 h-12 text-anthracite-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-dark-blue-900 mb-2">
              Klicken Sie hier oder ziehen Sie Dateien hierher
            </p>
            <p className="text-sm text-anthracite-500">
              PDF, JPG, PNG – Maximal 10 MB pro Datei
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden mb-6">
            <div className="p-4 border-b border-anthracite-100">
              <h2 className="font-semibold text-dark-blue-900">
                Ausgewählte Dateien ({files.length})
              </h2>
            </div>

            <div className="divide-y divide-anthracite-100">
              {files.map((fileItem, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-anthracite-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-anthracite-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-dark-blue-900 truncate">
                          {fileItem.file.name}
                        </p>
                        <button
                          onClick={() => removeFile(index)}
                          disabled={uploading && fileItem.status === 'uploading'}
                          className="p-1 hover:bg-red-50 rounded-lg text-anthracite-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-anthracite-500">
                          {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        {fileItem.status === 'success' && (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            Hochgeladen
                          </span>
                        )}
                        {fileItem.status === 'error' && (
                          <span className="flex items-center gap-1 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            {fileItem.error}
                          </span>
                        )}
                      </div>

                      {fileItem.status === 'uploading' && (
                        <div className="w-full bg-anthracite-100 rounded-full h-2 mb-3">
                          <div
                            className="bg-petrol-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${fileItem.progress}%` }}
                          />
                        </div>
                      )}

                      {fileItem.status === 'pending' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-anthracite-600 mb-1">
                              Kategorie
                            </label>
                            <select
                              value={fileItem.category}
                              onChange={(e) =>
                                updateFile(index, {
                                  category: e.target.value as FileWithProgress['category'],
                                })
                              }
                              className="w-full px-3 py-2 border border-anthracite-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-petrol-500"
                            >
                              {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-anthracite-600 mb-1">
                              Beschreibung (optional)
                            </label>
                            <input
                              type="text"
                              value={fileItem.description}
                              onChange={(e) => updateFile(index, { description: e.target.value })}
                              placeholder="z.B. Büromiete Januar 2024"
                              className="w-full px-3 py-2 border border-anthracite-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-petrol-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Link
            to="/dashboard"
            className="px-4 py-2 border border-anthracite-300 text-anthracite-600 rounded-lg hover:bg-anthracite-50 transition-colors"
          >
            Abbrechen
          </Link>

          <button
            onClick={handleUpload}
            disabled={!hasPendingFiles || uploading}
            className="px-6 py-2 bg-petrol-600 text-white rounded-lg font-medium hover:bg-petrol-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Wird hochgeladen...
              </>
            ) : (
              <>
                <UploadIcon className="w-4 h-4" />
                {files.length} Datei{files.length !== 1 ? 'en' : ''} hochladen
              </>
            )}
          </button>
        </div>

        {hasSuccessFiles && !hasPendingFiles && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Upload erfolgreich!
            </h3>
            <p className="text-green-700 mb-4">
              Ihre Dateien wurden erfolgreich hochgeladen. Erstellen Sie einen Auftrag, um sie prüfen zu lassen.
            </p>
            <Link
              to="/request/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Neuen Auftrag erstellen
            </Link>
          </div>
        )}

        {/* Info Notice */}
        <div className="mt-8 bg-dark-blue-50 rounded-xl p-6 border border-dark-blue-100">
          <h3 className="font-semibold text-dark-blue-900 mb-2">Hinweis zum Upload</h3>
          <ul className="text-sm text-anthracite-600 space-y-2">
            <li>• Unterstützte Formate: PDF, JPG, PNG</li>
            <li>• Maximale Dateigröße: 10 MB</li>
            <li>• Ihre Dokumente werden DSGVO-konform in Deutschland gespeichert</li>
            <li>• Bitte laden Sie nur Ihre eigenen Belege hoch</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
