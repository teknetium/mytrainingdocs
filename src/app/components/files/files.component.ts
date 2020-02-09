import { Component, OnInit, Input, ViewChild, HostListener, ElementRef, AfterViewInit } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { FileModel, Version } from '../../shared/interfaces/file.type';
import { FileService } from '../../shared/services/file.service';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { UserModel } from '../../shared/interfaces/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VgAPI } from 'videogular2/compiled/core';


@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css']
})
export class FilesComponent implements OnInit {

  vgApi: VgAPI;

  isAuthenticated$: Observable<boolean>;
  isAuthenticated = false;
  authenticatedUser$: Observable<UserModel>;
  selectedFile$: Observable<FileModel>;
  selectedFileIndex$: Observable<number>;
  headerOpen = false;
  authenticatedUser: UserModel;
  isVisible = false;
  editId: string | null;
  i = 0;
  isConfirmDeleteModalVisible = false;
  fileIdToDelete: string;
  document$: Observable<SafeResourceUrl>;
  video$: Observable<SafeResourceUrl>;
  downloadUrl$: Observable<string>;
  changeLevel = '';
  fontSizes = ['10', '12', '14'];
  lineHeights = ['1', '1.5', '2'];
  fontSize: string;
  lineHeight: string;
  currentFont = 1;
  heavy = '700';
  light = '300';
  currentVersionIndex = 0;
  isNewVersionModalVisible = false;
  newVersion = <Version>{
    version: '',
    changeLog: '',
    owner: '',
    fsHandle: '',
    url: '',
    dateUploaded: 0
  };

  action$: Observable<string>;
  action;

  selectedFile: FileModel;
  selectedFileIndex = -1;
  originalFile: FileModel;

  viewTitle = '';
  error1 = false;
  error2 = false;

  fileForm: FormGroup;

  @Input() showFile = null;
  @Input() readOnly = 'false';
  @Input() height = '500';
  @Input() streamId = '';

  sub1: Subscription;
  sub2: Subscription;
  sub3: Subscription;
  sub4: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private fileService: FileService,
    private auth: AuthService,
    private userService: UserService,
  ) {
    //    this.files$ = this.fileService.getFilesStream();

    this.selectedFile$ = this.fileService.getSelectedFileStream();
//    this.selectedFileIndex$ = this.fileService.getPrivateSelectedFileIndexStream(this.streamId);
    this.selectedFileIndex$ = this.fileService.getSelectedFileIndexStream();
    this.document$ = this.fileService.getDocPreviewStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.isAuthenticated$ = this.auth.getIsAuthenticatedStream();
    this.isAuthenticated$.subscribe((value) => {
      this.isAuthenticated = value;
    });

    this.setFontSize(0);

    this.action$ = this.fileService.getActionStream();
  }

  ngOnInit() {

    this.authenticatedUser$.subscribe(user => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
    })

    this.fileForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: [''],
    });

//    this.fileService.setupPrivateDocumentPreviewStream(this.streamId);
//    this.fileService.setupPrivateVideoPreviewStream(this.streamId);

    this.selectedFile$.subscribe((file) => {
      console.log('selectedFile.subscribe', file);
      this.headerOpen = true;

      if (file) {

        this.originalFile = file;
        this.selectedFile = Object.assign({}, file);

        this.fileForm.patchValue({
          name: file.name,
          description: file.description
        });
        this.viewFile(file);
      }
    });

    //    if (this.showFile) {
    //      this.fileService.selectFileById(this.showFile);
    //    }

    this.action$.subscribe(action => {
      this.action = action;
    });
  }


  onPlayerReady(api: VgAPI) {
    this.vgApi = api;
    /*
        this.vgApi.getDefaultMedia().subscriptions.loadedMetadata.subscribe(
          this.playVideo.bind(this)
        );
    */
  }

  playVideo() {
    this.vgApi.play();
  }

  handleNewVersionContinue() {
    this.error1 = false;
    this.error2 = false;

    if (!this.changeLevel) {
      this.error1 = true;
      this.isNewVersionModalVisible = true;
      return;
    }

    if (!this.newVersion.changeLog) {
      this.error2 = true;
      this.isNewVersionModalVisible = true;
      return;
    }

    const versionArray = this.selectedFile.versions[0].version.split('.', 3);
    let majorNum = parseInt(versionArray[0], 10);
    let middleNum = parseInt(versionArray[1], 10);
    let minorNum = parseInt(versionArray[2], 10);
    if (this.changeLevel === 'major') {
      majorNum++;
      middleNum = 0;
      minorNum = 0;
    } else if (this.changeLevel === 'middle') {
      middleNum++;
      minorNum = 0;
    } else if (this.changeLevel === 'minor') {
      minorNum++;
    }
    this.newVersion.version = majorNum + '.' + middleNum + '.' + minorNum;
    this.newVersion.owner = this.authenticatedUser._id;
    this.newVersion.dateUploaded = new Date().getTime();

    this.fileService.pickNewVersion(this.newVersion);
    this.isNewVersionModalVisible = false;
  }

  uploadFile() {
    this.fileService.openDocPicker();
  }

  dismissNewVersionModal() {
    this.isNewVersionModalVisible = false;
  }


  updateSelectedFile(file: FileModel) {
    this.selectedFile = file;
  }

  headerActiveChange() {
    this.headerOpen = !this.headerOpen;
  }

  uploadNewVersion() {
    this.newVersion = <Version>{
      version: '',
      changeLog: '',
      owner: '',
      fsHandle: '',
      url: '',
      dateUploaded: 0
    };

    this.isNewVersionModalVisible = true;
  }

  dismissModal() {
    this.isVisible = false;
  }

  deleteFileConfirm(): void {
    this.fileService.deleteFile(this.selectedFile._id);
  }

  viewFile(file: FileModel) {
    if (!file) {
      return;
    }
    this.currentVersionIndex = 0;
    this.fileService.viewFile(file, this.currentVersionIndex, this.streamId);
    this.isVisible = false;
  }

  viewVersion(index) {
    this.currentVersionIndex = index;
    this.fileService.viewFile(this.selectedFile, this.currentVersionIndex, this.streamId);
    this.isVisible = false;
  }

  onEvent = ($event) => console.log($event);


  setFontSize(index): void {
    this.fontSize = this.fontSizes[index];
    this.lineHeight = this.lineHeights[index];
    this.currentFont = index;
  }

  /*
  save(i: number, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editId = '';
    this.fileService.saveFile(this.localFiles[i], 'Object Update');
  }

   */

  submitForm = ($event: any, value: any) => {

    $event.preventDefault();

    for (const key in this.fileForm.controls) {
      if (this.fileForm.controls.hasOwnProperty(key)) {
        this.fileForm.controls[key].markAsDirty();
        this.fileForm.controls[key].updateValueAndValidity();
      }
    }

    this.selectedFile.name = value.name;
    this.selectedFile.description = value.description;

    this.fileService.saveFile(this.selectedFile);

    for (const key in this.fileForm.controls) {
      if (this.fileForm.controls.hasOwnProperty(key)) {
        this.fileForm.controls[key].markAsPristine();
        this.fileForm.controls[key].markAsUntouched();
        this.fileForm.controls[key].updateValueAndValidity();
      }
    }
  };

  cancel(): void {
    for (const key in this.fileForm.controls) {
      if (this.fileForm.controls.hasOwnProperty(key)) {
        this.fileForm.controls[key].markAsPristine();
        this.fileForm.controls[key].markAsUntouched();
        this.fileForm.controls[key].updateValueAndValidity();
      }
    }
    this.fileForm.patchValue({
      name: this.originalFile.name,
      description: this.originalFile.description
    });
  }
}
