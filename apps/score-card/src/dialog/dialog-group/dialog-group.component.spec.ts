import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogGroupComponent } from './dialog-group.component';

describe('DialogGroupComponent', () => {
  let component: DialogGroupComponent;
  let fixture: ComponentFixture<DialogGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
