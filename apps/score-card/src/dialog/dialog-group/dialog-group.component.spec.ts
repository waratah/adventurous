import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogGroupComponent } from './dialog-group.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('DialogGroupComponent', () => {
  let component: DialogGroupComponent;
  let fixture: ComponentFixture<DialogGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogGroupComponent],
       providers: [
              { provide: MAT_DIALOG_DATA, useValue: {} },
              { provide: MatDialogRef, useValue: {} }
            ]
    }).compileComponents();

    fixture = TestBed.createComponent(DialogGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
