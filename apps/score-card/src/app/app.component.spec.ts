import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { QuestionsService } from '../service/questions.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockQuestionsService: Partial<QuestionsService>;
  let mockRouter: Partial<Router>;

  beforeEach(async () => {
    mockQuestionsService = jasmine.createSpyObj<QuestionsService>(
      'QuestionsService',
      ['group']
    );
    mockQuestionsService.allQuestionGroups$ = of([]);
    mockQuestionsService.selectedGroup$ = of({
      id: '1',
      level: '',
      name: 'Group 1',
      pages: [],
    });

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: QuestionsService, useValue: mockQuestionsService },
        { provide: Router, useValue: mockRouter },
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

  it('should navigate to a group when gotoGroup is called', () => {
    const group = { id: '2', name: 'Group 2', pages: [] };
    component.gotoGroup(group);
    expect(mockQuestionsService.group).toEqual(group.id);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['view', group.id]);
  });

  it('should change action and navigate correctly', () => {
    mockQuestionsService.group = '3';
    component.changeAction('edit');
    expect(component.action).toBe('edit');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['edit', '3']);
  });
});
