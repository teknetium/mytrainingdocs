import { Injectable } from '@angular/core';
import * as cms from 'filestack-js';
import { PickerDisplayMode, PickerOptions, PickerResponse } from 'filestack-js/build/main/lib/picker';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BehaviorSubject, Observable, throwError as ObservableThrowError } from 'rxjs';
import { FileModel } from '../interfaces/file.type';
import { UserService } from './user.service';
import { UserModel } from '../interfaces/user.model';
import { ENV } from './env.config';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class FileService {

  authenticatedUser: UserModel;
  authenticatedUser$: Observable<UserModel>;
  fileUploadResult: PickerResponse;

  private files: FileModel[] = [];
  private files$ = new BehaviorSubject<FileModel[]>(null);
  private fileCnt$ = new BehaviorSubject<number>(0);
  private filesAlertBS$ = new BehaviorSubject<{ show: boolean, type: string, message: string, description: string }>(null);

  private failedFiles$ = new BehaviorSubject<FileModel[]>(null);
  private fileUploaded$ = new BehaviorSubject<FileModel>(null);
  private filesUploadedCnt$ = new BehaviorSubject<number>(0);

  processResultCnt = 0;
  newFile: FileModel;

  fileTags: { label: string, value: string }[] = [];
  fileTags$ = new BehaviorSubject<{ label: string, value: string }[]>(null);
  tagsStringArray: string[] = [];

  fileTypeHash = {
    ppt: {
      iconClass: 'file-ppt',
      iconColor: '#fa541c',
      iconType: 'ppt'
    },
    pptx: {
      iconClass: 'file-ppt',
      iconColor: '#fa541c',
      iconType: 'ppt'
    },
    xls: {
      iconClass: 'file-excel',
      iconColor: '#52c41a',
      iconType: 'xls'
    },
    xlsx: {
      iconClass: 'file-excel',
      iconColor: '#52c41a',
      iconType: 'xls'
    },
    doc: {
      iconClass: 'file-word',
      iconColor: '#3f87f5',
      iconType: 'doc'
    },
    docx: {
      iconClass: 'file-word',
      iconColor: '#3f87f5',
      iconType: 'doc'
    },
    pdf: {
      iconClass: 'file-pdf',
      iconColor: '#de4436',
      iconType: 'pdf'
    },
    gif: {
      iconClass: 'file-image',
      iconColor: '#eb2f96',
      iconType: 'image'
    },
    tiff: {
      iconClass: 'file-image',
      iconColor: '#eb2f96',
      iconType: 'image'
    },
    jpg: {
      iconClass: 'file-image',
      iconColor: '#eb2f96',
      iconType: 'image'
    },
    png: {
      iconClass: 'file-image',
      iconColor: '#eb2f96',
      iconType: 'image'
    },
    psd: {
      iconClass: 'file-image',
      iconColor: '#eb2f96',
      iconType: 'image'
    },
    ai: {
      iconClass: 'file-image',
      iconColor: '#eb2f96',
      iconType: 'image'
    },
    mp4: {
      iconClass: 'video-camera',
      iconColor: '#886cff',
      iconType: 'video'
    },
    MP4: {
      iconClass: 'video-camera',
      iconColor: '#886cff',
      iconType: 'video'
    },
    flv: {
      iconClass: 'video-camera',
      iconColor: '#886cff',
      iconType: 'video'
    },
    avi: {
      iconClass: 'video-camera',
      iconColor: '#886cff',
      iconType: 'video'
    },
    wmv: {
      iconClass: 'video-camera',
      iconColor: '#886cff',
      iconType: 'video'
    },
    mov: {
      iconClass: 'video-camera',
      iconColor: '#886cff',
      iconType: 'video'
    },
    txt: {
      iconClass: 'file-text',
      iconColor: '#a0d911',
      iconType: 'txt'
    },
    unknown: {
      iconClass: 'file-unknown',
      iconColor: '#ff0000',
      iconType: 'unknown'
    },
    html: {
      iconClass: 'html5',
      iconColor: '#e9913a',
      iconType: 'html'
  },
  mp3: {
    iconClass: 'audio',
    iconColor: '#e9764f',
    iconType: 'audio'
},
};

  iconClass = '';
  iconColor = '';
  docURL: SafeResourceUrl;
  apikey = 'AUOKQ8sdPStajfMsbFfedz';
  client = cms.init(this.apikey);
  previewUrl = 'https://cdn.filestackcontent.com/Fl4SEyA3SNi6Xv0MuRRm';

  options: PickerOptions = {
    //    displayMode: PickerDisplayMode.inline,

    //    container: '#inline',
    maxFiles: 20,

    //    storeTo: {
    //      container: 'devportal-customers-assets',
    //      path: '/mytrainingdocs/',
    //  },
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
//  videoBS$ = new BehaviorSubject<SafeResourceUrl>(null);
//  docDownloadUrlBS$ = new BehaviorSubject<string>('');
  selectedFileBS$ = new BehaviorSubject<FileModel>(null);
//  selectedFileToEditBS$ = new BehaviorSubject<FileModel>(null);
  selectedFileIndexBS$ = new BehaviorSubject<number>(-1);
//  statusMessageBS$ = new BehaviorSubject<{ color: string, msg: string }>(null);
//  titleBS$ = new BehaviorSubject<string>('');
//  showStatusBS$ = new BehaviorSubject<boolean>(false);
//  showSelectedIndexFeedbackBS$ = new BehaviorSubject<boolean>(true);
//  showSelectedItemBS$ = new BehaviorSubject<boolean>(false);
  uploadResultsBS$ = new BehaviorSubject<PickerResponse>(null);
  filesForSelect$ = new BehaviorSubject<{ label: string, value: string }[]>([]);
  fileOptions: [{ label: string, value: string }] = [null];
  selectedFile: FileModel;
  action = '';
  uploadType = 'newFile';
  newVersion = {
    version: '',
    changeLog: '',
    owner: '',
    fsHandle: '',
    url: '',
    dateUploaded: 0
  };
  actionBS$ = new BehaviorSubject<string>('');

  fileIdHash = {};
  fileIdIndexHash = {};
// pDoc - private document hash 
// pSFHash - private selected file hash 
// pSFIHash - private selected file index hash
  privateDocumentHash = {};
  privateSelectedFileHash = {};
  privateSelectedFileIndexHash = {};

  constructor(private http: HttpClient, private userService: UserService, private auth: AuthService, private sanitizer: DomSanitizer) {
    this.authenticatedUser$ = userService.getAuthenticatedUserStream();
    this.authenticatedUser$.subscribe((userObj) => {
      if (userObj) {
        let uid = '';
        this.authenticatedUser = userObj;
        this.action = 'init';
        if (this.authenticatedUser.userType === 'supervisor') {
          uid = this.authenticatedUser._id;
        } else {
          uid = this.authenticatedUser.supervisorId;
        }
        this.getAllFiles$(this.authenticatedUser.uid).subscribe(files => {
          if (!files) {
            return;
          }
          this.files = files;
          for (const file of files) {
            this.fileIdHash[file._id] = file;
          }

          for (const index in files) {
            this.fileIdIndexHash[this.files[index]._id] = index;
          }
          this.loadData();
          this.setAction('init');
        })
      }
    });
    //    this.client.picker().open();

    //    picker = this.client.picker(this.options);

  }
  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  loadData() {

    this.files$.next(this.files);
    this.fileCnt$.next(this.files.length);
    
    let i;
    if (this.action === 'save') {
      i = this.selectedFileIndexBS$.value;
    } else if (this.action === 'init') {
      i = -1;
    } else if (this.action === 'newFile') {
      i = this.files.length - 1;
    } else if (this.action === 'add') {
      i = this.files.length - 1;
    } else {
      if (this.selectedFileIndexBS$.value > this.files.length - 1) {
        i = this.files.length - 1;
      } else {
        i = this.selectedFileIndexBS$.value;
      }
    }
    
    /*
    const fileOptions: { label: string, value: string }[] = [];
    for (const file of this.files) {
      fileOptions.push({ label: file.name, value: file._id });

    }
    this.filesForSelect$.next(fileOptions);
    */
  }

  getFileOptionsStream(): Observable<{ label: string, value: string }[]> {
    return this.filesForSelect$.asObservable();
  }

  /*
    viewDoc(elementId: string) {
      this.selectedFileBS$.subscribe(item => {
        if (item) {
          this.client.preview(item._id, {id: elementId, css: this.previewUrl});
        }
      });
    }
  
   */
  getActionStream(): Observable<string> {
    return this.actionBS$.asObservable();
  }

  setupPrivateDocumentStream(streamId: string) {
    if (!this.privateDocumentHash[streamId]) {
      console.log('fileService.setupPrivateDocumentStream', streamId);
      this.privateDocumentHash[streamId] = new BehaviorSubject<SafeResourceUrl>(null);
    }
  }

  setupPrivateSelectedFileStream(streamId: string) {
    if (!this.privateSelectedFileHash[streamId]) {
      this.privateSelectedFileHash[streamId] = new BehaviorSubject<FileModel>(null);
    }
  }

  setupPrivateSelectedFileIndexStream(streamId: string) {
    if (!this.privateSelectedFileIndexHash[streamId]) {
      this.privateSelectedFileIndexHash[streamId] = new BehaviorSubject<number>(-1);
    }
  }

  getPrivateDocumentStream(streamId: string): Observable<SafeResourceUrl> {
    if (!this.privateDocumentHash[streamId]) {
      this.privateDocumentHash[streamId] = new BehaviorSubject<SafeResourceUrl>(null);
    }
    return this.privateDocumentHash[streamId].asObservable();
  }

  getPrivateSelectedFileStream(streamId: string): Observable<FileModel> {
    if (!this.privateSelectedFileHash[streamId]) {
      this.privateSelectedFileHash[streamId] = new BehaviorSubject<FileModel>(null);
    }
    return this.privateSelectedFileHash[streamId].asObservable();
  }

  getPrivateSelectedFileIndexStream(streamId: string): Observable<number> {
    if (!this.privateSelectedFileIndexHash[streamId]) {
      this.privateSelectedFileIndexHash[streamId] = new BehaviorSubject<number>(-1);
    }
    return this.privateSelectedFileIndexHash[streamId].asObservable();
  }

  getFile(id): FileModel {
    return this.fileIdHash[id];
  }

  processResults(results: PickerResponse) {

    this.closePicker();

    this.uploadResultsBS$.next(results);
    // process the files that failed to up
    // load
    if (results.filesFailed.length > 0) {
      console.log('upload failed', results);
    }

    if (results.filesUploaded.length > 0) {
      console.log('processResults : ', this.uploadType);
      if (this.uploadType === 'newVersion') {
        this.setAction('newVersion');
        const uploadedFile = results.filesUploaded[0];

        this.newVersion.fsHandle = uploadedFile.handle;
        this.newVersion.url = uploadedFile.url;
        this.selectedFile.versions.unshift(this.newVersion);
        this.saveFile(this.selectedFile);
        this.uploadType = 'newFile';
        
        return;
      }
      console.log('processResults', results);

      for (const file of results.filesUploaded) {
        this.setAction('newFile');
        let sizeStr: string;

        if (file.size < 1000) {
          sizeStr = file.size + ' B';
        } else if (file.size < 1000000) {
          sizeStr = (file.size / 1000).toFixed(1) + ' kB';
        } else {
          sizeStr = (file.size / 1000000).toFixed(1) + ' MB';
        }
      
        let fileExt: string;

        if (file.filename.indexOf('.') > 0) {
          fileExt = file.filename.substring(file.filename.lastIndexOf('.') + 1);
        } else {
          fileExt = 'unkwown'
        }

        let iconClass: string;
        let iconType: string;
        let iconColor: string;

        if (!this.fileTypeHash[fileExt]) {
          iconClass = 'file-unknown';
          iconType = 'unknown';
          iconColor = '#ff0000';
        } else {
          iconClass = this.fileTypeHash[fileExt].iconClass;
          iconType = this.fileTypeHash[fileExt].iconType;
          iconColor = this.fileTypeHash[fileExt].iconColor;
        }

        
        this.newFile = <FileModel>{
          _id: file.handle,
          name: file.filename,
          size: sizeStr,
          mimeType: file.mimetype,
          teamId: this.authenticatedUser.uid,
          description: '',
          versions: [{ version: '1.0.0', changeLog: 'New Upload', owner: this.authenticatedUser._id, fsHandle: file.handle, url: file.url, dateUploaded: new Date().getTime() }],
          iconClass: iconClass,
          iconType: iconType,
          iconColor: iconColor,
          iconSource: 'ngZorro',
          tags: []
        };

        this.postFile$(this.newFile).subscribe(data => {
          this.newFile = data;
          this.files.push(this.newFile);
          this.fileIdHash[this.newFile._id] = this.newFile;
          this.fileIdIndexHash[this.newFile._id] = this.files.length - 1;
          this.fileUploaded$.next((this.newFile));
          this.loadData();
        });
      }
    }
  }

  cancelEdit(): void {
//    this.selectedFileToEditBS$.next(null);
  }

  fileAlert(alert) {
    this.filesAlertBS$.next(alert);
  }

  saveFile(file: FileModel) {
    this.action = 'save';
    this.putFile$(file).subscribe(data => {
      this.loadData();
    },
      err => {
        console.log('saveFile', file);
      });
  }

  getSafeUrl(fileId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(this.fileIdHash[fileId].versions[0].fsHandle));
  }

  viewFile(file: FileModel, versionIndex: number, streamId: string) {
    console.log('In fileService:viewFile');
    let mediaItem: SafeResourceUrl;
    if (file.iconType === 'video') {
      mediaItem = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(file.versions[versionIndex].url));
      if (!this.privateSelectedFileHash[streamId]) {
        console.log('ERROR ...fileService.viewFile, privateVideoPreviewStreamHash is null...', streamId);        
      } 
      this.privateSelectedFileHash[streamId].next(mediaItem);

    } else {
      mediaItem = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(this.previewUrlBase) + file.versions[versionIndex].fsHandle);
      console.log('fileService.viewFile', mediaItem, streamId);
      this.privateSelectedFileHash[streamId].next(mediaItem);
      this.docPreviewUrlBS$.next(mediaItem);
    }
  }

  selectItemById(id, streamId: string) {
    this.selectItem(this.fileIdIndexHash[id], streamId);
  }

  /*
  setupPrivateDocumentStream(pSId: string) {
    console.log('setupPrivateDocumentStream', pSId);
    this.privateDocumentStreamHash[pSId] = new BehaviorSubject<FileModel>(null);
  }
  setupPrivateVideoStream(pSId: string) {
    console.log('setupPrivateVideoStream', pSId);
    this.privateVideoStreamHash[pSId] = new BehaviorSubject<FileModel>(null);
  }
*/
  
  /*
  publishToPrivateDoc$(fileIndex: number, streamId: string) {
    console.log('pubToPDoc$')
    this.privateDocumentHash[streamId].next(this.files[fileIndex]);
  }

  publishByIdToPDoc$(id: string, streamId: string) {
    this.privateDocumentHash[streamId].next(this.fileIdHash[id]);
  }
*/
  selectItem(index, streamId) {
    if (index < 0 || index >= this.files.length) {
      //      this.showSelectedItemBS$.next(false);
      if (this.privateSelectedFileHash[streamId]) {
        this.privateSelectedFileHash[streamId].next(null);
      }

      if (this.privateSelectedFileIndexHash[streamId]) {
        this.privateSelectedFileIndexHash[streamId].next(null);
      }
      
      if (this.privateDocumentHash[streamId]) {
        this.privateDocumentHash[streamId].next(null);
      }

      this.docPreviewUrlBS$.next(null);
      this.selectedFileIndexBS$.next(index);
      this.selectedFileBS$.next(null);
      return;
    }
    this.selectedFile = this.files[index];

    const fileHandle = this.files[index].versions[0].fsHandle;
    //    const previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl( encodeURI(this.previewUrlBase) + fileHandle);
    //    console.log('previewURL', previewUrl);
    //    const downloadUrl = this.downloadUrlBase + fileHandle + '?dl=1';
    //    this.docDownloadUrlBS$.next(downloadUrl);
    //    this.docPreviewUrlBS$.next(previewUrl);
    //    this.showSelectedIndexFeedbackBS$.next(true)
    this.privateSelectedFileHash[streamId].next(this.files[index]);
    this.selectedFileIndexBS$.next(index);
    this.selectedFileBS$.next(this.selectedFile);
    this.viewFile(this.selectedFile, 0, streamId);
  }

  setAction(action: string) {
    this.action = action;
    this.actionBS$.next(this.action);
  }

  /*
  selectFileToEdit(index): void {
    this.selectedFileToEditBS$.next(this.files[index]);
  }
  */

  getFilesStream(): Observable<FileModel[]> {
    return this.files$.asObservable();
  }

  getSelectedFileStream(): Observable<FileModel> {
    return this.selectedFileBS$.asObservable();
  }

  getSelectedFileIndexStream(): Observable<number> {
    return this.selectedFileIndexBS$.asObservable();
  }

  getDocPreviewStream(): Observable<SafeResourceUrl> {
    return this.docPreviewUrlBS$.asObservable();
  }

  getFileCntStream(): Observable<number> {
    return this.fileCnt$.asObservable();
  }

  getFilesAlertStream(): Observable<{ show: boolean, type: string, message: string, description: string }> {
    return this.filesAlertBS$.asObservable();
  }

  getFilesFailedStream() {
    return this.failedFiles$.asObservable();
  }

  getUploadedFileStream(): Observable<FileModel> {
    return this.fileUploaded$.asObservable();
  }

  deleteFile(id: string): void {
    this.action = 'delete';
    this.deleteFile$(id).subscribe(val => {
      this.getAllFiles$(this.authenticatedUser.uid).subscribe(files => {
        if (!files) {
          return;
        }
        this.files = files;
        this.selectedFileBS$.next(null);
        this.loadData();
//        this.selectItem(-1, '');
      })
    });

  }

  openPicker() {
    this.client.picker(this.options).open();
  }

  closePicker() {
    this.client.picker(this.options).close();
  }

  pickNewVersion(version: { version: string, changeLog: string, owner: string, fsHandle: string, url: string, dateUploaded: number }) {
    this.uploadType = 'newVersion';
    this.newVersion = version;
    this.client.picker(this.options).open();
  }

  pickBannerImage() {
    this.uploadType = 'newTrainingBanner';
    this.client.picker(this.options).open();
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
      this.auth.login();
    }
    return ObservableThrowError(errorMsg);
  }

}
