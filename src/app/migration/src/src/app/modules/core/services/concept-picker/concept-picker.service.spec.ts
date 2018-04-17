import { TestBed, inject } from '@angular/core/testing';

import { ConceptPickerService } from './concept-picker.service';

describe('ConceptPickerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConceptPickerService]
    });
  });

  it('should be created', inject([ConceptPickerService], (service: ConceptPickerService) => {
    expect(service).toBeTruthy();
  }));
});
