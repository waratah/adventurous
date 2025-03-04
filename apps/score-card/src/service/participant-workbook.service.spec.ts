import { TestBed } from '@angular/core/testing';

import { ParticipantWorkbookService } from './participant-workbook.service';

describe('ParticipantWorkbookService', () => {
  let service: ParticipantWorkbookService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParticipantWorkbookService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
