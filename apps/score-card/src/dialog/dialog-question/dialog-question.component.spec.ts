import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogQuestionComponent } from './dialog-question.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('DialogQuestionComponent', () => {
  let component: DialogQuestionComponent;
  let fixture: ComponentFixture<DialogQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogQuestionComponent],
       providers: [
              { provide: MAT_DIALOG_DATA, useValue: {} },
              { provide: MatDialogRef, useValue: {} }
            ]
    }).compileComponents();

    fixture = TestBed.createComponent(DialogQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
