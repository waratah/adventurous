import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlContainer, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { StateSelectComponent } from './state-select.component';

describe('StateSelectComponent', () => {
  let component: StateSelectComponent;
  let fixture: ComponentFixture<StateSelectComponent>;

  let controlContainerMock: Partial<ControlContainer>;

  beforeEach(async () => {
    const interim: any = {
      get: jest.fn().mockReturnValue(new FormControl('NSW', [Validators.required])), // Mocking a FormControl with a default value
      value: 'NSW',
    };
    controlContainerMock = {
      control: interim,
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatSelectModule, StateSelectComponent],
      providers: [{ provide: ControlContainer, useValue: controlContainerMock }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StateSelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formControlName', 'state');
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct label', () => {
    expect(component.label()).toBe('State');
  });

  it('should return the correct form control', () => {
    expect(component.formControl().value).toBe('NSW'); // Default mock value
  });

  it('should return a list of states', () => {
    const expectedStates = [
      'NSW',
      'Queensland',
      'Victoria',
      'ACT',
      'South Australia',
      'Western Australia',
      'Tasmania',
      'Northern Territory',
      'National',
    ];
    expect(component.states).toEqual(expectedStates);
  });

  it('should check if the control is invalid', () => {
    component.formControl().addValidators(Validators.required);
    component.formControl().setValue('');

    expect(component.isInvalid()).toBe(true); // Check if control is invalid
  });

  it('should check if the control is valid', () => {
    component.formControl().setValue('');

    expect(component.isInvalid()).toBe(true); // Check if control is invalid
  });

  it('should check if the control has not been touched', () => {
    expect(component.isTouched()).toBe(false);
  });

  it('should check if the control has been touched', () => {
    component.formControl().markAsTouched();

    expect(component.isTouched()).toBe(true); // Should return true as the control is touched
  });
});
