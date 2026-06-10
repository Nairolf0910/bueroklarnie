import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Upload as UploadIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  X,
  FolderOpen,
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

interface ServiceRequest {
  id: string;
  title: string;
  status: string;
}

const categories = [
  { value: 'Rechnung', label: 'Rechnung' },
  { value: 'Quittung', label: 'Quittung' },
  { value: 'Bankauszug', label: 'Bankauszug' },
  { value: 'Sonstiges', label: 'Sonstiges' },
];

export function Upload() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [uploading, setUploading] = useState(false);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    searchParams.get('request_id') || ''
  );
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (user) loadRequests();
  }, [user]);

  const loadRequests = async () => {
    const { data } = await supabase
      .from('service_requests')
      .select('id, title, status')
      .eq('user_id', user!.id)
      .neq('status', 'Abgeschlossen')
      .order('created_at', { ascending: false });
    setRequests(data || []);
    setLoadingRequests(false);
  };

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles: FileWithProgress[] = Array.from(incoming).map((file) => ({
      file,
      progress: 0,
      status: 'pending',
      category: 'Sonstiges',
      description: '',
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const updateFile = (index: number, updates: Partial<FileWithProgress>) => {
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, ...updates } : f)));
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
          request_id: selectedRequestId || null,
        });

        if (dbError) throw dbError;

        updateFile(i, { status: 'success', progress: 100 });
      } catch (error) {
        console.error('Upload error:', error);
        updateFile(i, {
          status: 'error',
          error: 'Upload fehlgeschlagen. Bitte erneut versuchen.',
        });
      }
    }

    setUploading(false);
  };

  const hasPendingFiles = files.some((f) => f.status === 'pending' || f.status === 'error');
  const hasSuccessFiles = files.some((f) => f.status === 'success');
  const selectedRequest = requests.find((r) => r.id === selectedRequestId);

  return (
    <div className="min-h-screen bg-anthracite-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={selectedRequestId ? `/requests/${selectedRequestId}` : '/dashboard'}
            className="inline-flex items-center gap-2 text-anthracite-600 hover:text-dark-blue-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {selectedRequestId ? 'Zurück zum Auftrag' : 'Zurück zum Dashboard'}
          </Link>
          <h1 className="text-3xl font-bold text-dark-blue-900">Belege hochladen</h1>
          <p className="text-anthracite-600 mt-2">
            Laden Sie Ihre Rechnungen, Quittungen und anderen Belege hoch.
          </p>
        </div>

        {/* Auftrag Dropdown */}
        <div className="bg-white rounded-xl border border-anthracite-200 p-6 mb-6">
          <label className="block text-sm font-semibold text-dark-blue-900 mb-3 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-petrol-600" />
            Auftrag verknüpfen (optional)
          </label>
          {loadingRequests ? (
            <div className="flex items-center gap-2 text-anthracite-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Aufträge werden geladen...
            </div>
          ) : (
            <select
              value={selectedRequestId}
              onChange={(e) => setSelectedRequestId(e.target.value)}
              className="w-full px-4 py-3 border border-anthracite-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-petrol-500 bg-white text-dark-blue-900"
            >
              <option value="">— Kein Auftrag (allgemeine Ablage) —</option>
              {requests.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.title} ({req.status})
                </option>
              ))}
            </select>
          )}
          {selectedRequest && (
            <p className="mt-2 text-xs text-petrol-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Dateien werden dem Auftrag &bdquo;{selectedRequest.title}&ldquo; zugeordnet
            </p>
          )}
          {requests.length === 0 && !loadingRequests && (
            <p className="mt-2 text-xs text-anthracite-500">
              Noch keine offenen Aufträge.{' '}
              <Link to="/request/new" className="text-petrol-600 underline">Neuen Auftrag erstellen</Link>
            </p>
          )}
        </div>

        {/* Drop Zone */}
        <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden mb-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`p-12 border-2 border-dashed rounded-xl m-4 cursor-pointer transition-colors text-center ${
              dragOver
                ? 'border-petrol-500 bg-petrol-50'
                : 'border-anthracite-300 hover:border-petrol-400 hover:bg-petrol-50/50'
            }`}
          >
            <UploadIcon className="w-12 h-12 text-anthracite-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-dark-blue-900 mb-2">
              Klicken oder Dateien hierher ziehen
            </p>
            <p className="text-sm text-anthracite-500">
              PDF, JPG, PNG, Word, Excel – max. 50 MB pro Datei
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.txt"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden mb-6">
            <div className="p-4 border-b border-anthracite-100 flex items-center justify-between">
              <h2 className="font-semibold text-dark-blue-900">
                Ausgewählte Dateien ({files.length})
              </h2>
              {hasPendingFiles && (
                <span className="text-xs text-anthracite-500">
                  Kategorie & Beschreibung vor dem Upload anpassen
                </span>
              )}
            </div>

            <div className="divide-y divide-anthracite-100">
              {files.map((fileItem, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-anthracite-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-anthracite-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-dark-blue-900 truncate pr-2">{fileItem.file.name}</p>
                        <button
                          onClick={() => removeFile(index)}
                          disabled={uploading && fileItem.status === 'uploading'}
                          className="p-1 hover:bg-red-50 rounded-lg text-anthracite-400 hover:text-red-600 disabled:opacity-50 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs text-anthracite-500">
                          {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        {fileItem.status === 'success' && (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" /> Hochgeladen
                          </span>
                        )}
                        {fileItem.status === 'error' && (
                          <span className="flex items-center gap-1 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3" /> {fileItem.error}
                          </span>
                        )}
                        {fileItem.status === 'uploading' && (
                          <span className="flex items-center gap-1 text-xs text-petrol-600">
                            <Loader2 className="w-3 h-3 animate-spin" /> {fileItem.progress}%
                          </span>
                        )}
                      </div>

                      {fileItem.status === 'uploading' && (
                        <div className="w-full bg-anthracite-100 rounded-full h-1.5 mb-3">
                          <div
                            className="bg-petrol-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${fileItem.progress}%` }}
                          />
                        </div>
                      )}

                      {fileItem.status === 'pending' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-anthracite-600 mb-1">Kategorie</label>
                            <select
                              value={fileItem.category}
                              onChange={(e) =>
                                updateFile(index, { category: e.target.value as FileWithProgress['category'] })
                              }
                              className="w-full px-3 py-2 border border-anthracite-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-petrol-500"
                            >
                              {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-anthracite-600 mb-1">Beschreibung (optional)</label>
                            <input
                              type="text"
                              value={fileItem.description}
                              onChange={(e) => updateFile(index, { description: e.target.value })}
                              placeholder="z.B. Büromiete Januar 2025"
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
            to={selectedRequestId ? `/requests/${selectedRequestId}` : '/dashboard'}
            className="px-4 py-2 border border-anthracite-300 text-anthracite-600 rounded-lg hover:bg-anthracite-50 transition-colors"
          >
            Abbrechen
          </Link>

          <button
            onClick={handleUpload}
            disabled={!hasPendingFiles || uploading}
            className="px-6 py-2.5 bg-petrol-600 text-white rounded-lg font-medium hover:bg-petrol-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Wird hochgeladen...</>
            ) : (
              <><UploadIcon className="w-4 h-4" /> {files.length} Datei{files.length !== 1 ? 'en' : ''} hochladen</>
            )}
          </button>
        </div>

        {/* Erfolg */}
        {hasSuccessFiles && !hasPendingFiles && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">Upload erfolgreich!</h3>
            <p className="text-green-700 mb-4">
              {selectedRequest
                ? `Die Dateien wurden dem Auftrag "${selectedRequest.title}" zugeordnet.`
                : 'Ihre Dateien wurden erfolgreich hochgeladen.'}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {selectedRequestId ? (
                <Link
                  to={`/requests/${selectedRequestId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-petrol-600 text-white rounded-lg font-medium hover:bg-petrol-700 transition-colors"
                >
                  Zum Auftrag
                </Link>
              ) : (
                <Link
                  to="/request/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Neuen Auftrag erstellen
                </Link>
              )}
              <button
                onClick={() => setFiles([])}
                className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                Weitere Dateien hochladen
              </button>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-dark-blue-50 rounded-xl p-6 border border-dark-blue-100">
          <h3 className="font-semibold text-dark-blue-900 mb-2">Hinweis zum Upload</h3>
          <ul className="text-sm text-anthracite-600 space-y-1.5">
            <li>• Unterstützte Formate: PDF, JPG, PNG, Word, Excel, TXT</li>
            <li>• Maximale Dateigröße: 50 MB pro Datei</li>
            <li>• Ihre Dokumente werden DSGVO-konform gespeichert</li>
            <li>• Bitte laden Sie nur Ihre eigenen Belege hoch</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
