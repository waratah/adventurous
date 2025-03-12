import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfAbseilSafeComponent } from './pdf-abseil-safe.component';

describe('PdfAbseilSafeComponent', () => {
  let component: PdfAbseilSafeComponent;
  let fixture: ComponentFixture<PdfAbseilSafeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfAbseilSafeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfAbseilSafeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
