import { Injectable } from '@angular/core';

/**
 * @deprecated All data is now served from the backend API.
 * This service is kept as a stub to avoid breaking existing imports during migration.
 * Phase 2 will remove all remaining references.
 */
@Injectable({ providedIn: 'root' })
export class MockDataService {
  // All real data is now in the database. API services provide actual data.
}
