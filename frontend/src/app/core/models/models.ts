export type UserRole = 'CITIZEN' | 'OFFICER' | 'SUPERVISOR' | 'ADMIN';

// Match backend enum values exactly
export type ComplaintStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type Category = 'ROADS' | 'WATER' | 'ELECTRICITY' | 'WASTE' | 'PARKS' |
  'HEALTH' | 'TRAFFIC' | 'BUILDING' | 'PROPERTY_TAX' | 'STREET_LIGHT' | 'OTHERS';

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  contactNumber?: string;
  address?: string;
  identityType?: string;
  identityNumber?: string;
  approved: boolean;
  departmentId?: number;
  departmentName?: string;
  createdAt: string;
}

export interface DepartmentResponse {
  id: number;
  name: string;
  description?: string;
  headId?: number;
  headName?: string;
  contactEmail?: string;
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  createdAt?: string;
}

export interface DepartmentStatsResponse {
  departmentId: number;
  departmentName: string;
  headName?: string;
  totalComplaints: number;
  pending: number;
  inProgress: number;
  resolved: number;
  closed: number;
  slaBreached: number;
  resolutionRatePct: number;
  slaCompliancePct: number;
  totalOfficers: number;
}

export interface OfficerPerformanceResponse {
  officerId: number;
  officerName: string;
  officerEmail: string;
  departmentId?: number;
  departmentName?: string;
  totalAssigned: number;
  inProgress: number;
  resolved: number;
  closed: number;
  slaBreached: number;
  resolutionRatePct: number;
  slaCompliancePct: number;
}

export interface ComplaintHistoryResponse {
  id: number;
  complaintId: number;
  changedById: number;
  changedByName: string;
  changedByRole: string;
  fromStatus?: ComplaintStatus;
  toStatus: ComplaintStatus;
  remarks?: string;
  changedAt: string;
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

export interface AuditLogResponse {
  id: number;
  action: string;
  details: string;
  actorName: string;
  entityType: string;
  relatedEntityId: number;
  createdAt: string;
}

