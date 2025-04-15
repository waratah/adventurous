import { FirebaseError } from '@angular/fire/app';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { of } from 'rxjs';
import { AuthService } from './auth.service';

jest.mock('@angular/fire/auth', () => ({
  Auth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  setPersistence: jest.fn(),
  browserSessionPersistence: {},
  user: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockAuth: Auth;

  const mockUserCredential = {
    user: {
      email: 'test@example.com',
    },
  };

  beforeEach(() => {

    mockAuth = {
      setPersistence: jest.fn(),
      _getRecaptchaConfig:jest.fn(),
    } as any;
    service = new AuthService(mockAuth);

    // Mock the user observable
    (user as jest.Mock).mockReturnValue(of(null));
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log in a user', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);

    const result = await service.login(email, password);

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, email, password);
    expect(result).toBe(mockUserCredential);
  });

  it('should log out a user', async () => {
    (signOut as jest.Mock).mockResolvedValue(undefined);

    await service.logout();

    expect(signOut).toHaveBeenCalledWith(mockAuth);
  });

  xit('should create a new user', async () => {
    const email = 'newuser@example.com';
    const password = 'password123';

    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);

    const result = await service.createUser(email, password);

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, email, password);
    expect(result).toBe(mockUserCredential);
  });

  it('should handle firebase error for email already in use', () => {
    const error: FirebaseError = {
      code: 'auth/email-already-in-use',
      message: 'The email address is already in use.',
    } as FirebaseError;

    const result = service.error(error);

    expect(result).toBe('The email address is already in use.');
  });

  it('should handle a generic firebase error', () => {
    const error: FirebaseError = {
      code: 'auth/invalid-email',
      message: 'The email address is not valid.',
    } as FirebaseError;

    const result = service.error(error);

    expect(result).toBe('The email address is not valid.');
  });
});
