export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  company?: string;
  role: 'admin' | 'client';
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'Eingegangen' | 'In Prüfung' | 'Rückfrage' | 'Abgeschlossen';
  priority: 'Niedrig' | 'Normal' | 'Hoch';
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  request_id: string | null;
  user_id: string;
  content: string;
  is_from_admin: boolean;
  is_internal: boolean;
  note_type: string;
  created_at: string;
}

export interface UploadedFile {
  id: string;
  request_id?: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: string;
  created_at: string;
}
