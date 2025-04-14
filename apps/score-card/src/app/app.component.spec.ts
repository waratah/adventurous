import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { QuestionsService, AuthService, UsersService } from '../service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { User } from '@angular/fire/auth';
import { questionGroup } from '../definitions';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  let questionsServiceMock: Partial<QuestionsService>;
  let authServiceMock: Partial<AuthService>;
  let usersServiceMock: Partial<UsersService>;
  let routerMock: Partial<Router>;

  beforeEach(async () => {
    // Mocking the services
    questionsServiceMock = {
      allQuestionGroups$: of([]), // Mocking an observable for question groups
      selectedGroup$: of(<questionGroup>{}),
      groupId$: of('group-id'), // Mocking groupId
      group: '1',
    };

    authServiceMock = {
      user$: of({ email: 'test@example.com' } as User), // Mocking the user observable
      logout: jest.fn().mockResolvedValue({}), // Mocking logout method
    };

    usersServiceMock = {
      loadEmail: jest.fn(), // Mocking loadEmail method
    };

    routerMock = {
      navigate: jest.fn(), // Mocking navigate method
    };

    const activatedRouteMock = {
      url: of([]),
      data: of({}),
      paramMap: of({
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'id') return 'test-id'; // Adjust as needed for your tests
          return null;
        })
      })
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: QuestionsService, useValue: questionsServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: Router, useValue: routerMock },
         { provide: ActivatedRoute, useValue: activatedRouteMock }
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set groups$ and selectedGroup$ from QuestionsService', () => {
    expect(component.groups$).toBe(questionsServiceMock.allQuestionGroups$);
    expect(component.selectedGroup$).toBe(questionsServiceMock.selectedGroup$);
  });

  it('should load user email on startup if user is authenticated', () => {
    expect(usersServiceMock.loadEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should navigate to the group when gotoGroup is called', () => {
    const group: questionGroup = { id: 'group-id', name: 'Test Group', books: {}, pages: [] };

    component.gotoGroup(group);

    expect(questionsServiceMock.group).toBe(group.id);
    expect(routerMock.navigate).toHaveBeenCalledWith(['view', group.id]); // default action is 'view'
  });

  it('should change action and navigate accordingly', () => {
    component.changeAction('edit');

    expect(component.action).toBe('edit');
    expect(routerMock.navigate).toHaveBeenCalledWith(['edit', questionsServiceMock.group]);
  });

  it('should call logout and navigate to login on successful logout', async () => {
    await component.logout();

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['login']);
  });
});
