import { QuestionsService } from './questions.service';
import { addDoc, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { PageDisplay, Question, questionGroup } from '../definitions';
import { of } from 'rxjs';

const docData = { data: 'MOCK_DATA' };
const docResult = {
  // simulate firestore get doc.data() function
  data: () => docData,
};

const mockCollectionData = jest.fn(() => of([])); // Mocking collectionData

const mockCollectionReference = {
  withConverter: jest.fn(x => x), // Allow chaining with withConverter
  data: mockCollectionData,
};


// Mocking Firestore
jest.mock('@angular/fire/firestore', () => ({
  Firestore: jest.fn(),
  collection: jest.fn(() => mockCollectionReference),
  addDoc: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  collectionData: jest.fn(() => of([])),
  withConverter: jest.fn(),
}));

describe('QuestionsService', () => {
  let service: QuestionsService;
  let mockFirestore: any;

  beforeEach(() => {
    mockFirestore = {
      Firestore: jest.fn(),
      collection: jest.fn(),
      addDoc: jest.fn(),
      doc: jest.fn(),
      setDoc: jest.fn(),
      getDoc: jest.fn(() => Promise.resolve(docResult)),
      collectionData: jest.fn(),
    };
    service = new QuestionsService(mockFirestore);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('should initialize observables correctly', () => {
    expect(service.allQuestions$).toBeDefined();
    expect(service.allQuestionGroups$).toBeDefined();
    expect(service.groupId$).toBeDefined();
    expect(service.selectedGroup$).toBeDefined();
  });

  it('should correctly set and get group', () => {
    service.group = 'testGroupId';
    expect(service.group).toBe('testGroupId');

    // Verify that currentGroup is updated
    service.selectedGroup$.subscribe(group => {
      expect(group.id).toBe('testGroupId');
    });
  });

  it('should call addDoc and setDoc to update a question', async () => {
    const question = { code: 'question1', text: 'Sample Question' };

    (addDoc as jest.Mock).mockResolvedValue({ id: 'question1' }); // Mock response from addDoc
    await service.updateQuestion(question);

    expect(setDoc).toHaveBeenCalledWith(doc(service['questionCollection'], question.code), question);
    expect(addDoc).toHaveBeenCalledWith(service['questionCollection'], question);
    expect(question.code).toBe('question1'); // Ensure that the question code was set correctly
  });

  it('should save a group and call Firestore methods', async () => {
    const section: PageDisplay = {
      heading: 'Section 1',
      level: 'Beginner',
      questions: [<Question>{ code: 'question1' }],
      requiresSignOff: true,
    };
    const mockSections = [section];
    const mockGroupId = 'testGroupId';
    const mockGroupDoc = { pages: [] };

    (getDoc as jest.Mock).mockResolvedValue({ data: jest.fn(() => mockGroupDoc) });
    (setDoc as jest.Mock).mockResolvedValue(undefined);

    await service.saveGroup(mockGroupId, mockSections);

    expect(getDoc).toHaveBeenCalledWith(doc(service['groupCollection'], mockGroupId));
    expect(setDoc).toHaveBeenCalledWith(expect.anything(), {
      ...mockGroupDoc,
      pages: expect.arrayContaining([
        expect.objectContaining({
          heading: 'Section 1',
          level: 'Beginner',
          questions: ['question1'],
        }),
      ]),
    });
  });

  it('should update a group using setDoc', async () => {
    const group = <questionGroup>{ id: 'groupId', name: 'Test Group' };

    (setDoc as jest.Mock).mockResolvedValue(undefined);

    const result = await service.updateGroup(group);

    expect(setDoc).toHaveBeenCalledWith(doc(service['groupCollection'], group.id), group);
    expect(result).toEqual(group); // Check if the returned group matches the input
  });

  it('should handle errors during updating a group', async () => {
    const group = <questionGroup>{ id: 'groupId', name: 'Test Group' };

    (setDoc as jest.Mock).mockRejectedValue(new Error('Error updating group'));

    const result = await service.updateGroup(group);

    expect(setDoc).toHaveBeenCalled();
    expect(result).toBeNull(); // Check if the result is null in case of an error
  });
});
