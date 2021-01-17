import { Injectable ,SecurityContext} from '@angular/core';
import * as cms from 'filestack-js';
import { PickerDisplayMode, PickerOptions, PickerResponse } from 'filestack-js/build/main/lib/picker';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BehaviorSubject, Observable, throwError as ObservableThrowError, Subscription } from 'rxjs';
import { FileModel, FilePlusModel } from '../interfaces/file.type';
import { Page } from '../interfaces/training.type';
import { UserService } from './user.service';
import { UserModel } from '../interfaces/user.type';
import { ENV } from './env.config';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { SafeMethodCall } from '@angular/compiler';


@Injectable({
  providedIn: 'root'
})
export class FileService {

  fileUploadResult: PickerResponse;
  private fileUploaded$ = new BehaviorSubject<FilePlusModel>(null);
  private safeFileUrlBS$ = new BehaviorSubject<SafeResourceUrl>(null);

  processResultCnt = 0;
  iconClass = '';
  iconColor = '';
  docURL: SafeResourceUrl;
  apikey = 'AUOKQ8sdPStajfMsbFfedz';
  client = cms.init(this.apikey);
  previewUrl = 'https://cdn.filestackcontent.com/Fl4SEyA3SNi6Xv0MuRRm';

  picker = '';


  docOptions: PickerOptions = {
    maxFiles: 20,
    fromSources: [
      'local_file_system',
      'dropbox',
      'googledrive',
    ],
    accept: 'application/*',
    onUploadDone: (results: PickerResponse) => {
      this.processResults(results);
    },
    uploadInBackground: false
  };
  videoOptions: PickerOptions = {
    maxFiles: 20,
    fromSources: [
      'local_file_system',
      'dropbox',
      'googledrive',
    ],
    accept: 'video/*',
    onUploadDone: (results: PickerResponse) => {
      this.processResults(results);
    },
    uploadInBackground: false
  };
  audioOptions: PickerOptions = {
    maxFiles: 20,
    fromSources: [
      'local_file_system',
      'dropbox',
      'googledrive',
    ],
    accept: 'audio/*',
    onUploadDone: (results: PickerResponse) => {
      this.processResults(results);
    },
    uploadInBackground: false
  };
  imageOptions: PickerOptions = {
    maxFiles: 20,
    fromSources: [
      'local_file_system',
      'dropbox',
      'googledrive',
    ],
    accept: 'image/*',
    onUploadDone: (results: PickerResponse) => {
      this.processResults(results);
    },
    uploadInBackground: false
  };
  textOptions: PickerOptions = {
    maxFiles: 1,
    fromSources: [
      'local_file_system',
      'dropbox',
      'googledrive',
    ],
    accept: 'text/*',
    onUploadDone: (results: PickerResponse) => {
      this.processResults(results);
    },
    uploadInBackground: false
  };
  allOptions: PickerOptions = {
    maxFiles: 20,
    fromSources: [
      'local_file_system',
      'dropbox',
      'googledrive',
    ],
    onUploadDone: (results: PickerResponse) => {
      this.processResults(results);
    },
    uploadInBackground: false
  };
  //  https://cdn.filestackcontent.com/preview=css:"https://cdn.filestackcontent.com/CSS_FILEHANDLE"/DOCUMENT_FILEHANDLE

  // https://cdn.filestackcontent.com/zWy9yljTOWm8maPCZsOe
  //  base = 'https://cdn.filestackcontent.com/NttQ1hlThmc1RCKFGp1w/';GOAupu3Rvy8N0588a9UQ Elm6IuwWQum1SY060hqx
  base = 'https://cdn.filestackcontent.com/preview=css:"https://cdn.filestackcontent.com/2fnGzVLASRGFGHQ1reBF"/';
  previewUrlBase = this.base;
  downloadUrlBase = 'https://cdn.filestackcontent.com/';
  docPreviewUrlBS$ = new BehaviorSubject<SafeResourceUrl>(null);
  selectedFileBS$ = new BehaviorSubject<FileModel>(null);
  selectedFileIndexBS$ = new BehaviorSubject<number>(-1);
  uploadResultsBS$ = new BehaviorSubject<PickerResponse>(null);
  filesForSelect$ = new BehaviorSubject<{ label: string, value: string }[]>([]);
  fileOptions: [{ label: string, value: string }] = [null];
  selectedFile: FileModel;
  action = '';
  uploadType = 'newFile';
//  newVersion: Version;
  actionBS$ = new BehaviorSubject<string>('');
  uploadedFile: FilePlusModel = null;
  currentPage: Page;


  constructor(private http: HttpClient, private auth: AuthService, private sanitizer: DomSanitizer) {
    this.uploadedFile = <FilePlusModel>{
      _id: String(new Date().getTime()),
      dateUploaded: 0,
      fileStackId: '',
      fileStackUrl: '',
      safeFileUrl: null,
      mimeType: '',
      page: null
    };
  }
  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  getSafeFileUrlStream(): Observable<SafeResourceUrl> {
    return this.safeFileUrlBS$.asObservable();
  }


  processResults(results: PickerResponse) {

    this.closePicker();

    if (results.filesUploaded.length > 0) {
      const file = results.filesUploaded[0];

      console.log('processResults', file);



      this.uploadedFile.name = file.filename;
      this.uploadedFile.fileStackId = file.handle;
      this.uploadedFile.fileStackUrl = file.url;
      this.uploadedFile.mimeType = file.mimetype;
      this.uploadedFile.dateUploaded = new Date().getTime();
      this.uploadedFile.page = this.currentPage;
      /*
      if (this.uploadedFile.mimeType.includes('video')) {
        this.uploadedFile.safeFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(this.uploadedFile.fileStackUrl));
      } else {
        this.uploadedFile.safeFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI((this.previewUrlBase) + this.uploadedFile.fileStackId));
      }
      */

      console.log('FileService: processResults', this.uploadedFile);

      this.fileUploaded$.next(this.uploadedFile);
      this.safeFileUrlBS$.next(this.uploadedFile.safeFileUrl);
      this.uploadedFile = <FilePlusModel>{};
    }
  }

  getUploadedFileStream(): Observable<FilePlusModel> {
    return this.fileUploaded$.asObservable();
  }


  openAllPicker(page: Page) {
    this.currentPage = page;
    this.picker = 'all';
    this.client.picker(this.allOptions).open();
  }
  openTextPicker(page: Page) {
    this.currentPage = page;
    this.picker = 'text';
    this.client.picker(this.textOptions).open();
  }
  openDocPicker(page: Page) {
    this.currentPage = page;
    this.picker = 'doc';
    this.client.picker(this.docOptions).open();
  }
  openVideoPicker(page: Page) {
    this.currentPage = page;
    this.picker = 'video';
    this.client.picker(this.videoOptions).open();
  }
  openAudioPicker(page: Page) {
    this.currentPage = page;
    this.picker = 'audio';
    this.client.picker(this.audioOptions).open();
  }
  openImagePicker(page: Page) {
    this.currentPage = page;
    this.picker = 'image';
    this.client.picker(this.imageOptions).open();
  }

  closePicker() {
    if (this.picker === 'doc') {
      this.client.picker(this.docOptions).close();
    } else if (this.picker === 'video') {
      this.client.picker(this.videoOptions).close();
    } else if (this.picker === 'audio') {
      this.client.picker(this.audioOptions).close();
    } else if (this.picker === 'image') {
      this.client.picker(this.imageOptions).close();
    } else if (this.picker === 'text') {
      this.client.picker(this.textOptions).close();
    } else if (this.picker === 'all') {
      this.client.picker(this.allOptions).close();
    }
  }

  pickNewVersion(mimeType: string) {
    console.log('pickNewVersion', mimeType);
    this.uploadType = 'newVersion';
    this.picker = mimeType;
    if (this.picker === 'doc') {
      this.client.picker(this.docOptions).open();
    } else if (this.picker === 'video') {
      this.client.picker(this.videoOptions).open();
    } else if (this.picker === 'audio') {
      this.client.picker(this.audioOptions).open();
    } else if (this.picker === 'image') {
      this.client.picker(this.imageOptions).open();
    }
  }

  getAllFiles$(uid): Observable<FileModel[]> {
    return this.http
      .get<FileModel[]>(`${ENV.BASE_API}files/${uid}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );

  }

  postFile$(file: FileModel): Observable<FileModel> {
    return this.http
      .post<FileModel>(`${ENV.BASE_API}files/new/`, file, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );

  }

  putFile$(file: FileModel): Observable<FileModel> {
    return this.http
      .put<FileModel>(`${ENV.BASE_API}files/${file._id}`, file, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );

  }

  deleteFile$(fileId: string): Observable<{}> {
    return this.http
      .delete(`${ENV.BASE_API}files/${fileId}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );

  }

  private _handleError(err: HttpErrorResponse | any): Observable<any> {
    const errorMsg = err.message || 'Error: Unable to complete request.';
    if (err.message && err.message.indexOf('No JWT present') > -1) {
//      this.auth.login();
    }
    return ObservableThrowError(errorMsg);
  }

}
