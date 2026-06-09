export interface Profile {
  id: string;
  company_name: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'Eingegangen' | 'In Prüfung' | 'Rückfrage' | 'Abgeschlossen';
  priority: 'Niedrig' | 'Normal' | 'Hoch';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface UploadedFile {
  id: string;
  request_id: string | null;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  category: 'Rechnung' | 'Quittung' | 'Bankauszug' | 'Sonstiges' | null;
  description: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  request_id: string | null;
  user_id: string;
  content: string;
  is_from_admin: boolean;
  created_at: string;
}
