import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Answer, Question } from '../definitions';
import { DialogViewComponent } from '../dialog';
import { AnswersService, QuestionsService, UsersService } from '../service';
import { ScoreCardComponent } from './scoreCard.component';

jest.mock('html2canvas');
jest.mock('jspdf', () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => {
      return {
        addImage: jest.fn(),
        save: jest.fn(),
      };
    }),
  };
});

describe('ScoreCardComponent', () => {
  let component: ScoreCardComponent;
  let fixture: ComponentFixture<ScoreCardComponent>;
  let mockAnswersService: jest.Mocked<AnswersService>;
  let mockQuestionsService: jest.Mocked<QuestionsService>;
  let mockUsersService: jest.Mocked<UsersService>;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockActivatedRoute: ActivatedRoute;

  beforeEach(async () => {
    mockAnswersService = {
      updateAnswer: jest.fn(),
      updateVerify: jest.fn(),
      userId: 'user-id-test',
    } as unknown as jest.Mocked<AnswersService>;

    mockQuestionsService = {
      sections$: of([]),
      allQuestionGroups$: of([]),
      group: '',
    } as unknown as jest.Mocked<QuestionsService>;

    mockUsersService = {
      userId: 'user-id-test',
    } as unknown as jest.Mocked<UsersService>;

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of({ filenames: ['file1.png'] })),
      }),
    } as unknown as jest.Mocked<MatDialog>;

    mockActivatedRoute = {
      paramMap: of({
        get: jest.fn().mockReturnValue('test-id'),
      }),
    } as unknown as ActivatedRoute;

    await TestBed.configureTestingModule({
      imports: [ScoreCardComponent],
      providers: [
        { provide: AnswersService, useValue: mockAnswersService },
        { provide: QuestionsService, useValue: mockQuestionsService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreCardComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and set up subscriptions on ngOnInit', () => {
    const paramMapSubscriptionSpy = jest.spyOn(component, 'ngOnDestroy');

    component.ngOnInit();

    expect(mockQuestionsService.group).toBe('test-id');

    component.ngOnDestroy();
    expect(paramMapSubscriptionSpy).toHaveBeenCalled();
  });

  it('should update answer done status and date', () => {
    const detail = {
      answer: { done: false, doneDate: new Date(), code: 'q1' },
      question: <Question>{ code: 'q1' },
    };

    component.updateDone(detail, true);

    expect(detail.answer.done).toBe(true);
    expect(detail.answer.doneDate).toBeInstanceOf(Date);
    expect(mockAnswersService.updateAnswer).toHaveBeenCalledWith(detail.answer);
  });

  it('should update answer text and done status', () => {
    const detail = {
      answer: { done: false, doneDate: new Date(), code: 'q1', text: '' },
      question: <Question>{ code: 'q1' },
    };
    const event = { target: { value: 'Some text' } } as unknown as FocusEvent;

    component.updateText(detail, event);

    expect(detail.answer.text).toBe('Some text');
    expect(detail.answer.done).toBe(true);
    expect(mockAnswersService.updateAnswer).toHaveBeenCalledWith(detail.answer);
  });


  it('should open upload dialog', () => {
    const detail = {
      answer: <Answer>{ proof: '' },
      question: <Question>{},
    };

    component.uploadProof(detail);

    expect(mockDialog.open).toHaveBeenCalled();
    expect(detail.answer.proof).toBe('file1.png');
    expect(detail.answer.done).toBe(true);
    expect(mockAnswersService.updateAnswer).toHaveBeenCalledWith(detail.answer);
  });

  it('should open view proof dialog', () => {
    const detail = {
      answer: <Answer>{ proof: 'some-proof.png' },
      question: <Question>{},
    };

    component.viewProof(detail);

    expect(mockDialog.open).toHaveBeenCalledWith(DialogViewComponent, {
      data: { filename: 'some-proof.png' },
    });
  });
});
