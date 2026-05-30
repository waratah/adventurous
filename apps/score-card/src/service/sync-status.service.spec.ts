import { Auth, user, User } from '@angular/fire/auth';
import { Subject } from 'rxjs';
import { SyncStatusService } from './sync-status.service';

jest.mock('@angular/fire/auth', () => ({
  user: jest.fn(),
}));

describe('SyncStatusService', () => {
  let auth: Auth;
  let mutableAuth: { currentUser: User | null };
  let authEvents: Subject<User | null>;
  let service: SyncStatusService;

  beforeEach(() => {
    authEvents = new Subject<User | null>();
    mutableAuth = {
      currentUser: null,
    };
    auth = mutableAuth as Auth;
    (user as jest.Mock).mockReturnValue(authEvents.asObservable());
    service = new SyncStatusService(auth);
  });

  afterEach(() => {
    service.ngOnDestroy();
    jest.clearAllMocks();
  });

  it('does not start queued writes while logged out', () => {
    const write = jest.fn().mockResolvedValue(undefined);

    service.trackWrite(write);

    expect(write).not.toHaveBeenCalled();
    expect(service.status().pendingWrites).toBe(1);
    expect(service.status().authenticated).toBe(false);
  });

  it('runs queued writes after login', async () => {
    const write = jest.fn().mockResolvedValue('synced');
    const sync = service.trackWrite(write);

    mutableAuth.currentUser = {} as User;
    authEvents.next(mutableAuth.currentUser);

    await expect(sync).resolves.toBe('synced');
    expect(write).toHaveBeenCalledTimes(1);
    expect(service.status().pendingWrites).toBe(0);
    expect(service.status().authenticated).toBe(true);
  });

  it('keeps an auth-failed write queued when logout happens during sync', async () => {
    let failFirstWrite: (reason?: unknown) => void = () => undefined;
    const firstWrite = new Promise<never>((_resolve, reject) => {
      failFirstWrite = reject;
    });
    const write = jest.fn()
      .mockReturnValueOnce(firstWrite)
      .mockResolvedValueOnce('retried');

    mutableAuth.currentUser = {} as User;
    authEvents.next(mutableAuth.currentUser);

    const sync = service.trackWrite(write);

    mutableAuth.currentUser = null;
    authEvents.next(null);
    failFirstWrite({ code: 'permission-denied' });
    await Promise.resolve();
    await Promise.resolve();

    expect(write).toHaveBeenCalledTimes(1);
    expect(service.status().pendingWrites).toBe(1);

    mutableAuth.currentUser = {} as User;
    authEvents.next(mutableAuth.currentUser);

    await expect(sync).resolves.toBe('retried');
    expect(write).toHaveBeenCalledTimes(2);
    expect(service.status().pendingWrites).toBe(0);
  });
});
