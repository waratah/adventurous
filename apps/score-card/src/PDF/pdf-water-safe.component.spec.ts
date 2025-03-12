import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfWaterSafeComponent } from './pdf-water-safe.component';

describe('PdfWaterSafeComponent', () => {
  let component: PdfWaterSafeComponent;
  let fixture: ComponentFixture<PdfWaterSafeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfWaterSafeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfWaterSafeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
