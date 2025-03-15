import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionDetailComponent } from './section-detail.component';

describe('GroupDetailComponent', () => {
  let component: SectionDetailComponent;
  let fixture: ComponentFixture<SectionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
