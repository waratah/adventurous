import { TestBed } from '@angular/core/testing';
import { FileServiceService } from './file-service.service';
import { getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';

// Use Jest to mock the Firebase Storage functions

jest.mock('@angular/fire/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn().mockImplementation(() => ({})),
  uploadBytesResumable: jest.fn().mockImplementation(() => Promise.resolve({ success: true })),
}));

describe('FileServiceService', () => {
  let service: FileServiceService;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      service = new FileServiceService();
    });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear all mock calls between tests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should push a file to storage', async () => {
    const basePath = 'uploads';
    const fileUpload = new File(['file content'], 'test-file.txt');

    const result = (await service.pushFileToStorage(basePath, fileUpload)) as any;

    expect(getStorage).toHaveBeenCalled();
    expect(ref).toHaveBeenCalledWith({}, `${basePath}/${fileUpload.name}`);
    expect(uploadBytesResumable).toHaveBeenCalledWith({}, expect.objectContaining({ name: 'test-file.txt' }));
    expect(result?.success).toBe(true); // Ensure the correct task is returned
  });

  it('should handle successful upload', async () => {
    const basePath = 'uploads';
    const fileUpload = new File(['file content'], 'test-file.txt');

    // Simulate upload task resolution

    const result = (await service.pushFileToStorage(basePath, fileUpload)) as any;

    expect(result.success).toBe(true);
  });

  it('should handle upload error', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => false);

    const mock = uploadBytesResumable as jest.Mock;

    const e: any = { code: 'UNKNOWN', message: 'Error' };

    mock.mockImplementation(() => Promise.reject(e));

    const basePath = 'uploads';
    const fileUpload = new File(['file content'], 'test-file.txt');

    (uploadBytesResumable as jest.Mock).mockImplementation(() => Promise.reject(e));

    let error = undefined;

    await service.pushFileToStorage(basePath, fileUpload).catch(e => (error = e));

    expect(errorSpy).toHaveBeenCalledWith(expect.objectContaining(e));

    errorSpy.mockRestore(); // Restore original console.error
  });
});
