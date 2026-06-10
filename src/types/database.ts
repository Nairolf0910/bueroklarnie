export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  company_name?: string;
  street?: string;
  postal_code?: string;
  city?: string;
  avatar_url?: string;
  role: 'admin' | 'client' | 'user';
  onboarding_completed?: boolean;
  terms_accepted_at?: string;
  email_confirmed?: boolean;
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
  category?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  request_id: string;
  user_id: string;
  content: string;
  is_from_admin: boolean;
  is_internal: boolean;
  note_type: 'system' | 'user' | 'status' | 'info';
  created_at: string;
}

export interface UploadedFile {
  id: string;
  request_id?: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  category: string;
  description?: string;
  is_verified?: boolean;
  verified_at?: string;
  verified_by?: string;
  tags?: string[];
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: 'request' | 'file' | 'note' | 'profile' | 'task';
  entity_id?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'request_update' | 'new_message';
  is_read: boolean;
  link?: string;
  request_id?: string;
  created_at: string;
}

export interface Task {
  id: string;
  request_id?: string;
  assigned_to?: string;
  title: string;
  description?: string;
  status: 'offen' | 'in_bearbeitung' | 'erledigt';
  priority: 'Niedrig' | 'Normal' | 'Hoch';
  due_date?: string;
  created_by: string;
  completed_at?: string;
  completed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'responded' | 'archived';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminNotification {
  id: string;
  event_type: 'new_request' | 'new_contact_message' | 'request_updated' | 'file_uploaded' | 'note_added';
  event_id?: string;
  title: string;
  message?: string;
  is_read: boolean;
  created_at: string;
}

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  subtitle?: string;
  price_text: string;
  description?: string;
  features: string[];
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrustItem {
  id: string;
  title: string;
  description?: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RequestMessage {
  id: string;
  request_id: string;
  sender_user_id?: string;
  sender_role: 'admin' | 'client';
  message: string;
  is_internal: boolean;
  created_at: string;
}

export interface RequestEvent {
  id: string;
  request_id: string;
  event_type: string;
  event_label: string;
  metadata: Record<string, unknown>;
  visible_to_user: boolean;
  created_at: string;
}
