import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfUserComponent } from './pdf-user.component';

describe('PdfUserComponent', () => {
  let component: PdfUserComponent;
  let fixture: ComponentFixture<PdfUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfUserComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
