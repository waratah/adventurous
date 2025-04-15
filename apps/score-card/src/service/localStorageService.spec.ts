import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './localStorageService';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(() => {
    // Create a new instance of the LocalStorageService
    // and inject the mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    TestBed.runInInjectionContext(() => {
    service = new LocalStorageService();
    });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear all mock calls between tests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get an item from localStorage', () => {
    const key = 'testKey';
    const value = JSON.stringify({ foo: 'bar' });

    // Mock getItem to return the specified item
    mockLocalStorage.getItem.mockReturnValue(value);

    const result = service.get<{ foo: string }>(key);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
    expect(result).toEqual({ foo: 'bar' });
  });

  it('should return null if item does not exist', () => {
    const key = 'nonExistentKey';

    mockLocalStorage.getItem.mockReturnValue(null);

    const result = service.get(key);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
    expect(result).toBeNull();
  });

  it('should save an item to localStorage', () => {
    const key = 'testKey';
    const value = { foo: 'bar' };

    service.set(key, value);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
  });

  it('should remove an item from localStorage', () => {
    const key = 'testKey';

    service.remove(key);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(key);
  });

  it('should remove multiple keys from localStorage', () => {
    const keys = ['key1', 'key2', 'key3'];

    service.removeKeys(keys);
    keys.forEach(key => {
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(key);
    });
  });

  it('should clear localStorage', () => {
    service.clear();
    expect(mockLocalStorage.clear).toHaveBeenCalled();
  });

  it('should validate JSON correctly', () => {
    // Access the private method using 'any' type
    const isJSONValid = (service as any).isJSONValid;

    expect(isJSONValid('{"valid":"json"}')).toBe(true);
    expect(isJSONValid('{invalid:json}')).toBe(false);
  });
});
