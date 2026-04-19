import { Injectable } from '@angular/core';
import { Complaint, User, Officer, Department_ } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MockDataService {

  readonly mockUsers: User[] = [
    { id: 'u1', name: 'Rajesh Kumar', email: 'citizen@demo.com', phone: '9876543210', address: '42, MG Road, Bengaluru - 560001', role: 'citizen', createdAt: '2024-01-15', isActive: true },
    { id: 'u2', name: 'Priya Sharma', email: 'priya@demo.com', phone: '9876543211', address: '18, Indiranagar, Bengaluru - 560038', role: 'citizen', createdAt: '2024-02-10', isActive: true },
    { id: 'u3', name: 'Anand Verma', email: 'officer@demo.com', phone: '9876543212', address: 'Corporation Office, Bengaluru', role: 'officer', createdAt: '2023-10-01', isActive: true },
    { id: 'u4', name: 'Suresh Babu', email: 'admin@demo.com', phone: '9876543213', address: 'BBMP HQ, Bengaluru', role: 'admin', createdAt: '2023-08-01', isActive: true },
  ];

  readonly mockComplaints: Complaint[] = [
    {
      id: 'c1', ticketNo: 'GRV-2024-00142',
      title: 'Pothole on 5th Main Road causing accidents',
      description: 'There is a large pothole near the SBI ATM on 5th Main Road, Indiranagar. It is approximately 2 feet wide and very deep. Two-wheelers have already fallen due to this. Urgent repair needed.',
      category: 'Roads & Infrastructure', status: 'in-progress', priority: 'HIGH',
      citizenId: 'u1', citizenName: 'Rajesh Kumar',
      assignedOfficerId: 'u3', assignedOfficerName: 'Anand Verma',
      imageUrl: 'https://images.unsplash.com/photo-1586936893354-362ad6ae47ba?w=400',
      latitude: 12.9784, longitude: 77.6408, address: '5th Main Rd, Indiranagar, Bengaluru', ward: 'Ward 81',
      createdAt: '2024-03-01T09:30:00', updatedAt: '2024-03-04T14:00:00',
      timeline: [
        { id: 't1', event: 'Complaint Submitted', description: 'Complaint raised by citizen', status: 'pending', timestamp: '2024-03-01T09:30:00', by: 'Rajesh Kumar' },
        { id: 't2', event: 'Under Review', description: 'Complaint reviewed and assigned to Roads dept.', status: 'open', timestamp: '2024-03-02T10:00:00', by: 'System' },
        { id: 't3', event: 'Work In Progress', description: 'Field officer Anand Verma assigned. Site inspection done.', status: 'in-progress', timestamp: '2024-03-04T14:00:00', by: 'Anand Verma' },
      ],
    },
    {
      id: 'c2', ticketNo: 'GRV-2024-00138',
      title: 'No water supply for 3 days in HSR Layout',
      description: 'Our entire block (Sector 2, HSR Layout) has not received water supply for the past 3 days. Repeated calls to BWSSB helpline have not been addressed.',
      category: 'Water & Sanitation', status: 'resolved', priority: 'HIGH',
      citizenId: 'u1', citizenName: 'Rajesh Kumar',
      imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400',
      latitude: 12.9116, longitude: 77.6389, address: 'Sector 2, HSR Layout, Bengaluru', ward: 'Ward 174',
      createdAt: '2024-02-20T11:00:00', updatedAt: '2024-02-23T16:30:00', resolvedAt: '2024-02-23T16:30:00',
      timeline: [
        { id: 't1', event: 'Complaint Submitted', description: 'Complaint raised by citizen', status: 'pending', timestamp: '2024-02-20T11:00:00', by: 'Rajesh Kumar' },
        { id: 't2', event: 'Assigned to Water Dept', description: 'Forwarded to BWSSB team', status: 'open', timestamp: '2024-02-21T09:00:00', by: 'Admin' },
        { id: 't3', event: 'Issue Resolved', description: 'Pipeline blockage cleared. Water supply restored.', status: 'resolved', timestamp: '2024-02-23T16:30:00', by: 'Officer Team' },
      ],
      rating: 4, feedback: 'Quick resolution! Happy with the service.',
    },
    {
      id: 'c3', ticketNo: 'GRV-2024-00151',
      title: 'Street lights not working on Cunningham Road',
      description: 'Multiple street lights on Cunningham Road near Queens Circle are not working for the past week. This is creating safety concerns especially at night.',
      category: 'Street Lighting', status: 'pending', priority: 'MEDIUM',
      citizenId: 'u1', citizenName: 'Rajesh Kumar',
      latitude: 12.9898, longitude: 77.5973, address: 'Cunningham Road, Bengaluru', ward: 'Ward 65',
      createdAt: '2024-03-06T08:00:00', updatedAt: '2024-03-06T08:00:00',
      timeline: [
        { id: 't1', event: 'Complaint Submitted', description: 'Complaint raised by citizen', status: 'pending', timestamp: '2024-03-06T08:00:00', by: 'Rajesh Kumar' },
      ],
    },
    {
      id: 'c4', ticketNo: 'GRV-2024-00133',
      title: 'Garbage not collected for 5 days - Jayanagar',
      description: 'BBMP garbage collection vehicle has not visited our area (Jayanagar 4th Block) for the past 5 days. Garbage is overflowing and causing health hazards.',
      category: 'Solid Waste Management', status: 'closed', priority: 'HIGH',
      citizenId: 'u1', citizenName: 'Rajesh Kumar',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      latitude: 12.9299, longitude: 77.5832, address: '4th Block, Jayanagar, Bengaluru', ward: 'Ward 155',
      createdAt: '2024-02-10T07:30:00', updatedAt: '2024-02-14T12:00:00', resolvedAt: '2024-02-13T10:00:00',
      timeline: [
        { id: 't1', event: 'Complaint Submitted', description: 'Complaint raised', status: 'pending', timestamp: '2024-02-10T07:30:00', by: 'Rajesh Kumar' },
        { id: 't2', event: 'Assigned', description: 'Assigned to Solid Waste Dept', status: 'open', timestamp: '2024-02-11T09:00:00', by: 'Admin' },
        { id: 't3', event: 'Resolved', description: 'Garbage cleared. Route schedule fixed.', status: 'resolved', timestamp: '2024-02-13T10:00:00', by: 'Officer' },
        { id: 't4', event: 'Closed', description: 'Complaint closed after citizen confirmation.', status: 'closed', timestamp: '2024-02-14T12:00:00', by: 'System' },
      ],
      rating: 5, feedback: 'Excellent service! Very prompt action.',
    },
    {
      id: 'c5', ticketNo: 'GRV-2024-00158',
      title: 'Stray dog menace in Whitefield',
      description: 'There is a large pack of stray dogs near the Whitefield Main Road junction. They are attacking passers-by and children going to school.',
      category: 'Health & Sanitation', status: 'open', priority: 'MEDIUM',
      citizenId: 'u1', citizenName: 'Rajesh Kumar',
      latitude: 12.9698, longitude: 77.7500, address: 'Whitefield Main Road, Bengaluru', ward: 'Ward 84',
      createdAt: '2024-03-07T14:00:00', updatedAt: '2024-03-08T09:00:00',
      timeline: [
        { id: 't1', event: 'Complaint Submitted', description: 'Complaint raised', status: 'pending', timestamp: '2024-03-07T14:00:00', by: 'Rajesh Kumar' },
        { id: 't2', event: 'Under Review', description: 'Assigned to Animal Welfare Team', status: 'open', timestamp: '2024-03-08T09:00:00', by: 'Admin' },
      ],
    },
    {
      id: 'c6', ticketNo: 'GRV-2024-00129',
      title: 'Encroachment on footpath near Majestic',
      description: 'Unauthorized shops and vendors have completely blocked the footpath near Majestic Bus Stand. Pedestrians are forced to walk on the road.',
      category: 'Building & Town Planning', status: 'rejected', priority: 'LOW',
      citizenId: 'u1', citizenName: 'Rajesh Kumar',
      latitude: 12.9767, longitude: 77.5713, address: 'Majestic, Bengaluru', ward: 'Ward 56',
      createdAt: '2024-02-05T12:00:00', updatedAt: '2024-02-07T11:00:00',
      timeline: [
        { id: 't1', event: 'Complaint Submitted', description: 'Complaint raised', status: 'pending', timestamp: '2024-02-05T12:00:00', by: 'Rajesh Kumar' },
        { id: 't2', event: 'Rejected', description: 'Duplicate complaint. Already being handled under case GRV-2024-00101.', status: 'rejected', timestamp: '2024-02-07T11:00:00', by: 'Admin' },
      ],
    },
  ];

  // Officer complaints (all complaints for officer view)
  readonly officerComplaints: Complaint[] = [
    ...this.mockComplaints,
    {
      id: 'c7', ticketNo: 'GRV-2024-00163',
      title: 'Broken road divider on Outer Ring Road',
      description: 'The road divider near Marathahalli junction is broken and protruding metal is causing tyre punctures.',
      category: 'Roads & Infrastructure', status: 'open', priority: 'HIGH',
      citizenId: 'u2', citizenName: 'Priya Sharma',
      assignedOfficerId: 'u3', assignedOfficerName: 'Anand Verma',
      latitude: 12.9591, longitude: 77.6974, address: 'Outer Ring Road, Marathahalli, Bengaluru',
      createdAt: '2024-03-08T10:00:00', updatedAt: '2024-03-08T10:00:00',
      timeline: [{ id: 't1', event: 'Complaint Submitted', description: 'Raised by citizen', status: 'open', timestamp: '2024-03-08T10:00:00', by: 'Priya Sharma' }],
    },
    {
      id: 'c8', ticketNo: 'GRV-2024-00167',
      title: 'Sewage overflow on MG Road',
      description: 'Sewage is overflowing onto MG Road near Trinity Circle, creating an extremely unhygienic situation.',
      category: 'Water & Sanitation', status: 'in-progress', priority: 'HIGH',
      citizenId: 'u2', citizenName: 'Priya Sharma',
      assignedOfficerId: 'u3', assignedOfficerName: 'Anand Verma',
      latitude: 12.9767, longitude: 77.6082, address: 'MG Road, Bengaluru',
      createdAt: '2024-03-09T08:00:00', updatedAt: '2024-03-09T14:00:00',
      timeline: [
        { id: 't1', event: 'Submitted', description: 'Raised by citizen', status: 'pending', timestamp: '2024-03-09T08:00:00', by: 'Priya Sharma' },
        { id: 't2', event: 'In Progress', description: 'BWSSB team dispatched', status: 'in-progress', timestamp: '2024-03-09T14:00:00', by: 'Anand Verma' },
      ],
    },
  ];

  readonly departments: Department_[] = [
    { id: 'd1', name: 'Roads & Infrastructure', head: 'K. Murthy', totalComplaints: 12450, resolved: 10820, pending: 1630, avgResolutionDays: 4.2 },
    { id: 'd2', name: 'Water & Sanitation', head: 'S. Reddy', totalComplaints: 9830, resolved: 8960, pending: 870, avgResolutionDays: 2.8 },
    { id: 'd3', name: 'Solid Waste Management', head: 'P. Naik', totalComplaints: 8210, resolved: 7640, pending: 570, avgResolutionDays: 1.5 },
    { id: 'd4', name: 'Electricity', head: 'R. Gowda', totalComplaints: 6540, resolved: 6100, pending: 440, avgResolutionDays: 1.2 },
    { id: 'd5', name: 'Street Lighting', head: 'M. Das', totalComplaints: 4320, resolved: 3980, pending: 340, avgResolutionDays: 3.1 },
    { id: 'd6', name: 'Health & Sanitation', head: 'Dr. A. Kumar', totalComplaints: 3210, resolved: 2940, pending: 270, avgResolutionDays: 5.0 },
    { id: 'd7', name: 'Traffic & Transport', head: 'V. Nair', totalComplaints: 2980, resolved: 2710, pending: 270, avgResolutionDays: 6.4 },
    { id: 'd8', name: 'Parks & Recreation', head: 'S. Joshi', totalComplaints: 1870, resolved: 1720, pending: 150, avgResolutionDays: 7.2 },
  ];

  readonly officers: Officer[] = [
    { id: 'o1', name: 'Anand Verma', email: 'a.verma@bbmp.gov.in', department: 'Roads & Infrastructure', employeeId: 'BBMP/R/2019/0041', assignedComplaints: 18, resolvedComplaints: 11, isActive: true },
    { id: 'o2', name: 'Meena Krishnan', email: 'm.krishnan@bbmp.gov.in', department: 'Water & Sanitation', employeeId: 'BBMP/W/2018/0089', assignedComplaints: 14, resolvedComplaints: 9, isActive: true },
    { id: 'o3', name: 'Ravi Shankar', email: 'r.shankar@bbmp.gov.in', department: 'Solid Waste Management', employeeId: 'BBMP/S/2020/0033', assignedComplaints: 22, resolvedComplaints: 17, isActive: true },
    { id: 'o4', name: 'Deepa Nair', email: 'd.nair@bbmp.gov.in', department: 'Street Lighting', employeeId: 'BBMP/L/2017/0055', assignedComplaints: 10, resolvedComplaints: 8, isActive: true },
    { id: 'o5', name: 'Sanjay Patel', email: 's.patel@bbmp.gov.in', department: 'Health & Sanitation', employeeId: 'BBMP/H/2021/0012', assignedComplaints: 8, resolvedComplaints: 5, isActive: false },
  ];

  getComplaintsByUser(userId: string): Complaint[] {
    return this.mockComplaints.filter(c => c.citizenId === userId);
  }

  getComplaintById(id: string): Complaint | undefined {
    return [...this.mockComplaints, ...this.officerComplaints].find(c => c.id === id);
  }
}
