import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfWorkbookComponent } from './pdf-workbook.component';

describe('PdfWorkbookComponent', () => {
  let component: PdfWorkbookComponent;
  let fixture: ComponentFixture<PdfWorkbookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfWorkbookComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfWorkbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
