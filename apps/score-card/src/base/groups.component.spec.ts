import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupsComponent } from './groups.component';
import { QuestionsService } from '../service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../service';
import { QuestionGroup } from '../definitions';
import { DialogGroupComponent, DialogUploadComponent } from '../dialog';


describe('GroupsComponent', () => {
  let component: GroupsComponent;
  let fixture: ComponentFixture<GroupsComponent>;

  let questionsServiceMock: Partial<QuestionsService>;
  let authServiceMock: Partial<AuthService>;
  let dialogMock: Partial<MatDialog>;
  let routerMock: Partial<Router>;

  beforeEach(async () => {
    questionsServiceMock = {
      allQuestionGroups$: of([]), // Empty observable for testing
      selectedGroup$: of(<QuestionGroup>{}), // Mock for selected group
      group: '1',
    };

    authServiceMock = {
      user$: of(null), // Mock for user observable
    };

    dialogMock = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of({ id: 'new-group-id' }), // Mock close with result
      }),
    };

    routerMock = {
      navigate: jest.fn(), // Mock navigate function
    };

    const activatedRouteMock = {
      paramMap: of({
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'id') return 'test-id'; // Adjust as needed for your tests
          return null;
        })
      })
    };

    await TestBed.configureTestingModule({
      imports: [GroupsComponent],
      providers: [
        { provide: QuestionsService, useValue: questionsServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to edit route when clicking a group and isEdit is true', () => {
    component.isEdit = true;
    const group: QuestionGroup = { id: '1', name: 'Test Group', books: {}, pages: [] };

    component.click(group);

    expect(routerMock.navigate).toHaveBeenCalledWith(['edit', group.id]);
  });

  it('should navigate to verify route when clicking a group and isVerify is true', () => {
    component.isVerify = true;
    const group: QuestionGroup = { id: '2', name: 'Test Group', books: {}, pages: [] };

    component.click(group);

    expect(routerMock.navigate).toHaveBeenCalledWith(['verify', group.id]);
  });

  it('should navigate to check route when clicking a group without isEdit or isVerify', () => {
    component.isEdit = false;
    component.isVerify = false;
    const group: QuestionGroup = { id: '3', name: 'Test Group', books: {}, pages: [] };

    component.click(group);

    expect(routerMock.navigate).toHaveBeenCalledWith(['check', group.id]);
  });

  it('should open the dialog for editing group details', () => {
    const group: QuestionGroup = { id: '4', name: 'New Group', books: {}, pages: [] };

    component.editGroupDetail(group);

    expect(dialogMock.open).toHaveBeenCalledWith(DialogGroupComponent, { data: { group } });
  });

  it('should navigate to edit after dialog closes with result containing id', () => {
    component.editGroupDetail({ id: '5', name: 'Another Group', books: {}, pages: [] });

    expect(routerMock.navigate).toHaveBeenCalledWith(['edit', component.questionsService.group]);
  });

  it('should call upload and open the upload dialog', () => {
    component.upload();

    expect(dialogMock.open).toHaveBeenCalledWith(DialogUploadComponent, {
      data: { directory: 'upload' },
    });
  });
});
