import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogSectionComponent } from './dialog-section.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('DialogSectionComponent', () => {
  let component: DialogSectionComponent;
  let fixture: ComponentFixture<DialogSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogSectionComponent],
       providers: [
              { provide: MAT_DIALOG_DATA, useValue: {} },
              { provide: MatDialogRef, useValue: {} }
            ]
    }).compileComponents();

    fixture = TestBed.createComponent(DialogSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
