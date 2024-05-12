import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import 'dotenv/config';

export class DriveService {
  private oAuth2Client?: OAuth2Client;
  private drive: drive_v3.Drive;
  constructor() {
    this.drive = google.drive({
      version: 'v3',
      auth: this.getOAuthClient(),
    });
  }

  private init(): OAuth2Client {
    try {
      const CLIENT_ID = process.env.CLIENT_ID;
      const CLIENT_SECRET = process.env.CLIENT_SECRET;
      const REDIRECT_URI = process.env.REDIRECT_URI;
      const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

      const oAuth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
      );
      oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
      return oAuth2Client;
    } catch (error) {
      console.error('Failed to initialize OAuth client', error);
      throw new Error('Failed to initialize OAuth client');
    }
  }

  private getOAuthClient(): OAuth2Client {
    if (!this.oAuth2Client) {
      this.oAuth2Client = this.init();
    }
    return this.oAuth2Client;
  }

  public async uploadFileToReptileFolder(
    fileName: string,
    filePath: string,
    mimeType: string
  ) {
    try {
      const fileMetadata = {
        name: fileName,
        mimeType,
        parents: ['1Ci_nD7E258zv0Cjd8M90I44HEoOFWJcl'],
      };
      const media = {
        mimeType,
        body: fs.createReadStream(filePath),
      };
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to upload file', error);
      throw new Error('Failed to upload file');
    }
  }
}
