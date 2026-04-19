// =============================================
// CORE MODELS / INTERFACES
// =============================================

export type UserRole = 'citizen' | 'officer' | 'admin';
export type ComplaintStatus = 'pending' | 'open' | 'in-progress' | 'resolved' | 'closed' | 'rejected';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type Department =
  | 'Roads & Infrastructure'
  | 'Water & Sanitation'
  | 'Electricity'
  | 'Solid Waste Management'
  | 'Parks & Recreation'
  | 'Health & Sanitation'
  | 'Traffic & Transport'
  | 'Building & Town Planning'
  | 'Property Tax'
  | 'Street Lighting'
  | 'Others';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Complaint {
  id: string;
  ticketNo: string;
  title: string;
  description: string;
  category: Department;
  status: ComplaintStatus;
  priority: Priority;
  citizenId: string;
  citizenName: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  ward?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  timeline: TimelineEvent[];
  rating?: number;
  feedback?: string;
}

export interface TimelineEvent {
  id: string;
  event: string;
  description: string;
  status: ComplaintStatus;
  timestamp: string;
  by: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  slaSuccess: number;
}

export interface Department_ {
  id: string;
  name: string;
  head: string;
  totalComplaints: number;
  resolved: number;
  pending: number;
  avgResolutionDays: number;
}

export interface Officer {
  id: string;
  name: string;
  email: string;
  department: Department;
  employeeId: string;
  assignedComplaints: number;
  resolvedComplaints: number;
  isActive: boolean;
}
