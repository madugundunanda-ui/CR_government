import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { OfficerDashboardComponent } from './officer-dashboard.component';
import { AuthService } from '../../core/services/auth.service';
import { ComplaintService, ComplaintResponse } from '../../core/services/complaint.service';

const MOCK_TASKS: ComplaintResponse[] = [
    {
        id: 1, title: 'Road Issue', description: 'Pothole', status: 'ASSIGNED', priority: 'HIGH',
        citizenId: 1, citizenName: 'Citizen', createdAt: new Date().toISOString(), slaDeadline: new Date().toISOString()
    },
    {
        id: 2, title: 'Water Leak', description: 'Leak', status: 'IN_PROGRESS', priority: 'URGENT',
        citizenId: 2, citizenName: 'Citizen2', createdAt: new Date().toISOString(), slaDeadline: new Date().toISOString()
    },
    {
        id: 3, title: 'Garbage', description: 'Not collected', status: 'RESOLVED', priority: 'LOW',
        citizenId: 3, citizenName: 'Citizen3', createdAt: new Date().toISOString(), slaDeadline: new Date().toISOString()
    },
];

describe('OfficerDashboardComponent', () => {
    let fixture: ComponentFixture<OfficerDashboardComponent>;
    let component: OfficerDashboardComponent;
    let complaintSpy: jasmine.SpyObj<ComplaintService>;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', ['currentUser', 'logout', 'isLoggedIn', 'getRole']);
        authSpy.currentUser.and.returnValue({ id: '2', name: 'Officer Test', email: 'o@t.com', role: 'OFFICER', isActive: true, createdAt: '' });

        complaintSpy = jasmine.createSpyObj('ComplaintService', ['getMyTasks', 'updateTaskStatus']);
        complaintSpy.getMyTasks.and.returnValue(of(MOCK_TASKS));

        await TestBed.configureTestingModule({
            imports: [OfficerDashboardComponent, RouterTestingModule, CommonModule, FormsModule],
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: ComplaintService, useValue: complaintSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(OfficerDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('creates the officer dashboard', () => expect(component).toBeTruthy());

    // TC-08: Filter tasks by priority
    it('TC-08: filteredComplaints respects status filter', () => {
        component.filterStatus = 'ASSIGNED';
        const filtered = component.filteredComplaints;
        expect(filtered.every(c => c.status === 'ASSIGNED')).toBeTrue();
        expect(filtered.length).toBe(1);
    });

    it('TC-08b: shows all when filterStatus is ""', () => {
        component.filterStatus = '';
        expect(component.filteredComplaints.length).toBe(3);
    });

    // TC-09: Stat counts correct
    it('TC-09: stat counts are calculated correctly', () => {
        expect(component.inProgressCount).toBe(1);  // 1 IN_PROGRESS
        expect(component.resolvedCount).toBe(1);    // 1 RESOLVED
        expect(component.pendingCount).toBe(1);     // 1 ASSIGNED (treated as pending action)
    });

    it('urgentCount includes HIGH and URGENT', () => {
        expect(component.urgentCount).toBe(2); // HIGH + URGENT
    });

    // TC-09b: changeStatus calls service
    it('TC-09b: changeStatus calls updateTaskStatus', () => {
        complaintSpy.updateTaskStatus.and.returnValue(of({ ...MOCK_TASKS[0], status: 'IN_PROGRESS' }));
        component.changeStatus(MOCK_TASKS[0], 'IN_PROGRESS');
        expect(complaintSpy.updateTaskStatus).toHaveBeenCalledWith(1, 'IN_PROGRESS');
    });

    it('resolutionRate calculates correctly', () => {
        // 1 resolved out of 3 = 33%
        expect(component.resolutionRate).toBe(33);
    });

    it('search filter works', () => {
        component.searchQ = 'Road';
        expect(component.filteredComplaints.length).toBe(1);
        expect(component.filteredComplaints[0].title).toBe('Road Issue');
    });
});