import { DriveService } from './drive';
import { google } from 'googleapis';
import fs from 'fs';

jest.mock('googleapis');
jest.mock('fs');

const mockedGoogle = google as jest.Mocked<typeof google>;
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('DriveService', () => {
  let service: DriveService;
  let mockOAuth2Client: any;
  let mockDrive: any;

  beforeEach(() => {
    mockOAuth2Client = {
      setCredentials: jest.fn(),
    };
    mockedGoogle.auth.OAuth2 = jest.fn(() => mockOAuth2Client) as any;
    mockDrive = {
      files: {
        create: jest.fn(),
      },
    };
    mockedGoogle.drive = jest.fn().mockReturnValue(mockDrive);
    mockedFs.createReadStream = jest.fn().mockReturnValue('stream');
    console.error = jest.fn();

    service = new DriveService();
  });

  describe('uploadFileToReptileFolder', () => {
    it('should successfully upload a file and return the file ID', async () => {
      const fileName = 'test.pdf';
      const filePath = '/path/to/test.pdf';
      const mimeType = 'application/pdf';

      const expectedResponse = { data: { id: '12345' } };
      mockDrive.files.create.mockResolvedValue(expectedResponse);

      const result = await service.uploadFileToReptileFolder(
        fileName,
        filePath,
        mimeType
      );
      expect(result).toBe(expectedResponse.data);
      expect(mockDrive.files.create).toHaveBeenCalledWith({
        requestBody: {
          name: fileName,
          mimeType,
          parents: ['1Ci_nD7E258zv0Cjd8M90I44HEoOFWJcl'],
        },
        media: {
          mimeType,
          body: 'stream',
        },
        fields: 'id',
      });
    });

    it('should throw an error if file upload fails', async () => {
      const fileName = 'test.pdf';
      const filePath = '/path/to/test.pdf';
      const mimeType = 'application/pdf';
      const errorMessage = 'Failed to upload file';

      mockDrive.files.create.mockRejectedValue(new Error(errorMessage));

      await expect(
        service.uploadFileToReptileFolder(fileName, filePath, mimeType)
      ).rejects.toThrow(errorMessage);
    });
  });
});
