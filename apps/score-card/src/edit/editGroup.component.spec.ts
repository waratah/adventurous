import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { EditGroupComponent } from './editGroup.component';
import { QuestionsService } from '../service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { PageDisplay, Question } from '../definitions';
import { questionGroup } from '../definitions/questionGroup';

// Mock components for dialogues and services
class MockQuestionsService {
  sections$ = of([]); // Mock observable
  allQuestionGroups$ = of([]); // Mock observable
  group = '';
  saveGroup = jest.fn(); // Mock saveGroup method
  updateQuestion = jest.fn();
  selectedGroup$ = of({}); // Mock selected group
}
class MockDialog {
  opened = false;
  data?: any;
  open(data:any) {
    this.data = data;
    this.opened = true;
  }
}

class MockRouter {
  navigate = jest.fn();
}

describe('EditGroupComponent', () => {
  let component: EditGroupComponent;
  let fixture: ComponentFixture<EditGroupComponent>;
  let mockQuestionsService: MockQuestionsService;
  let mockDialog: MockDialog;
  let mockRouter: MockRouter;

  beforeEach(async () => {
    mockQuestionsService = new MockQuestionsService();
    mockDialog = new MockDialog();
    mockRouter = new MockRouter();

    await TestBed.configureTestingModule({
      providers: [
        { provide: QuestionsService, useValue: mockQuestionsService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Router, useValue: mockRouter },
      ],
      imports: [ReactiveFormsModule, EditGroupComponent], // Required for forms
    }).compileComponents();

    fixture = TestBed.createComponent(EditGroupComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });


  it('should remove a question from the section', () => {
    const mockSections: PageDisplay[] = [
      {
        heading: 'Section 1',
        questions: [<Question>{ code: 'question1', text: 'Sample Question' }],
        level: '',
        requiresSignOff: false,
      },
    ];
    const questionToRemove = <Question>{ code: 'question1', text: 'Sample Question' };

    component.removeQuestion(questionToRemove, mockSections[0], mockSections);

    expect(mockSections[0].questions).toHaveLength(0);
    expect(mockQuestionsService.saveGroup).toHaveBeenCalledWith('', mockSections);
  });

  it('should add a question to the section', () => {
    const mockSections: PageDisplay[] = [
      {
        heading: 'Section 1',
        level: '',
        questions: [],
        requiresSignOff: false,
      },
    ];
    const questionToAdd = { code: 'question2', text: 'New Question' };

    component.addQuestion(questionToAdd, mockSections[0], mockSections);

    expect(mockSections[0].questions).toHaveLength(1);
    expect(mockQuestionsService.saveGroup).toHaveBeenCalledWith('', mockSections);
  });

  it('should call editQuestion and open dialog', () => {
    const mockQuestion = { code: 'question1', text: 'Edit me' };

    component.editQuestion(mockQuestion);

    expect(mockDialog.opened).toBe(true);

  });

  it('should handle dragging sections', () => {
    const event: any = {
      previousContainer: {
        data: [{ heading: 'Section 1' }, { heading: 'Section 2' }],
      },
      previousIndex: 0,
      currentIndex: 1,
      container: {
        data: [],
      },
    };

    component.dropSection(event, event.previousContainer.data);

    expect(mockQuestionsService.saveGroup).toHaveBeenCalled();
  });

  it('should clone a section and call saveGroup', async () => {
    const mockSections: PageDisplay[] = [
      {
        heading: 'Section 1',
        questions: [],
        level: '',
        requiresSignOff: false,
      },
    ];
    const dialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    mockDialog.open = jest.fn().mockReturnValue(dialogRef);

    await component.cloneSection(mockSections[0], 0, mockSections);

    expect(mockSections.length).toBe(2);
    expect(mockQuestionsService.saveGroup).toHaveBeenCalledWith('', mockSections);
  });

  it('should delete a section and call saveGroup', async () => {
    const mockSections: PageDisplay[] = [
      {
        heading: 'Section 1',
        questions: [],
        level: '',
        requiresSignOff: false,
      },
    ];
    const dialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    mockDialog.open = jest.fn().mockReturnValue(dialogRef);

    await component.deleteSection(mockSections[0], 0, mockSections);

    expect(mockSections.length).toBe(0);
    expect(mockQuestionsService.saveGroup).toHaveBeenCalledWith('', mockSections);
  });

  it('should navigate to edit group on successful editGroupDetail', async () => {
    const dialogRef = {
      afterClosed: jest.fn().mockReturnValue(of({ id: '1' })),
    };
    mockDialog.open = jest.fn().mockReturnValue(dialogRef);

    const g: questionGroup = {
      id: '1',
      name: 'name',
      books: {},
      pages: [],
    };

    await component.editGroupDetail(g);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['edit', mockQuestionsService.group]);
  });

});
