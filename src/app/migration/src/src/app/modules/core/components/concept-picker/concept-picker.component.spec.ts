import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptPickerComponent } from './concept-picker.component';

describe('ConceptPickerComponent', () => {
  let component: ConceptPickerComponent;
  let fixture: ComponentFixture<ConceptPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConceptPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConceptPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
