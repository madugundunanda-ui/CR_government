export type UserRole = 'citizen' | 'officer' | 'admin';

// These now match the backend enum values exactly
export type ComplaintStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

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
  approved?: boolean;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  contactNumber?: string;
  address?: string;
  approved: boolean;
  createdAt: string;
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

export interface DepartmentResponse {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface Officer {
  id: string;
  name: string;
  email: string;
  department: string;
  employeeId: string;
  assignedComplaints: number;
  resolvedComplaints: number;
  isActive: boolean;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  read: boolean;
  relatedComplaintId?: number;
  createdAt: string;
}

export interface ComplaintStatsResponse {
  total: number;
  pending: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  closed: number;
  highPriority: number;
  urgentPriority: number;
  totalCitizens: number;
  totalOfficers: number;
}
