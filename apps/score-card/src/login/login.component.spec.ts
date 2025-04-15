import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../service/auth.service';
import { UsersService } from '../service';
import { UserCredential } from '@angular/fire/auth';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockUsersService: jest.Mocked<UsersService>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: jest.Mocked<ActivatedRoute>;

  beforeEach(async () => {
    mockAuthService = {
      login: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    mockUsersService = {
      loadEmail: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    mockRouter = {
      navigateByUrl: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    mockActivatedRoute = {
      // Here you can define any properties or observables needed from ActivatedRoute
      params: of({}),
      queryParams: of({})
    } as unknown as jest.Mocked<ActivatedRoute>;

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the LoginComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.loginForm.value).toEqual({ name: '', password: '' });
  });

  it('should toggle hide signal on clickEvent', () => {
    // Hide is true initially
    expect(component.hide()).toBe(true);

    component.clickEvent(new MouseEvent('click'));
    expect(component.hide()).toBe(false); // After click, it should be false

    component.clickEvent(new MouseEvent('click'));
    expect(component.hide()).toBe(true); // After second click, it should be true
  });

  it('should log in successfully and navigate to groups if user exists', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    component.loginForm.patchValue({ name: email, password: password });
    mockAuthService.login.mockResolvedValue(<UserCredential>{ user: { email } });
    mockUsersService.loadEmail.mockResolvedValue(true); // Simulate existing user

    await component.login();

    expect(mockAuthService.login).toHaveBeenCalledWith(email, password);
    expect(mockUsersService.loadEmail).toHaveBeenCalledWith(email);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/groups');
  });

  it('should log in successfully and navigate to user if user does not exist', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    component.loginForm.patchValue({ name: email, password: password });

    mockAuthService.login.mockResolvedValue(<UserCredential>{ user: { email } });
    mockUsersService.loadEmail.mockResolvedValue(false); // Simulate non-existing user

    await component.login();

    expect(mockAuthService.login).toHaveBeenCalledWith(email, password);
    expect(mockUsersService.loadEmail).toHaveBeenCalledWith(email);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/user');
  });

  it('should set error signal and console log on login failure', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    component.loginForm.patchValue({ name: email, password: password });
    const mockError = { message: 'Login failed' };

    mockAuthService.login.mockRejectedValue(mockError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => true);

    await component.login();

    expect(mockAuthService.login).toHaveBeenCalledWith(email, password);
    expect(component.error()).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith('Email/Password Sign-In error:', mockError);

    consoleSpy.mockRestore(); // Restore console.error after the test
  });

  it('should perform guest login successfully', async () => {
    const email = 'guest@nsw.scouts.com.au';

    mockAuthService.login.mockResolvedValue(<UserCredential>{ user: { email } });
    mockUsersService.loadEmail.mockResolvedValue(true); // Simulate existing user

    await component.guestLogin();

    expect(mockAuthService.login).toHaveBeenCalledWith(email, 'fake_password');
    expect(mockUsersService.loadEmail).toHaveBeenCalledWith(email);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/groups');
  });

  it('should set error signal and console log on guest login failure', async () => {
    const mockError = { message: 'Login failed' };

    mockAuthService.login.mockRejectedValue(mockError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await component.guestLogin();

    expect(mockAuthService.login).toHaveBeenCalledWith('guest@nsw.scouts.com.au', 'fake_password');
    expect(component.error()).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith('Email/Password Sign-In error:', mockError);

    consoleSpy.mockRestore(); // Restore console.error after the test
  });
});
