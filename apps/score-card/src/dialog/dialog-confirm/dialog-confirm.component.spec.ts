import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogConfirmComponent } from './dialog-confirm.component';

describe('DialogConfirmComponent', () => {
  let component: DialogConfirmComponent;
  let fixture: ComponentFixture<DialogConfirmComponent>;
  let closed = false;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogConfirmComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            message: 'hello',
          },
        },
        { provide: MatDialogRef, useValue: { close: () => closed = true} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogConfirmComponent);

    // fixture.componentRef.setInput('directory', 'dir');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call closePopup', () => {
    closed = false;
    const clickCloseElement: HTMLElement = fixture.nativeElement.querySelector('[mat-raised-button]');
    clickCloseElement.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(closed).toBe(true);
  });
});
