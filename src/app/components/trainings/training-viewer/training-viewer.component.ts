import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { FileService } from '../../../shared/services/file.service';
import { TrainingService } from '../../../shared/services/training.service';
import { UserService } from '../../../shared/services/user.service';
import { UserTrainingService } from '../../../shared/services/userTraining.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { TrainingModel, Page, Portlet, Assessment, AssessmentItem, TrainingVersion } from 'src/app/shared/interfaces/training.type';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FileModel, Version } from 'src/app/shared/interfaces/file.type';
import { UserModel, UserIdHash } from 'src/app/shared/interfaces/user.type';
import { VgAPI } from 'videogular2/compiled/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { merge, take } from 'rxjs/operators';
import { SendmailService } from '../../../shared/services/sendmail.service';
import { MessageModel } from '../../../shared/interfaces/message.type';
import { NzMessageService } from 'ng-zorro-antd';
import * as cloneDeep from 'lodash/cloneDeep';
import { NzModalService } from 'ng-zorro-antd/modal';
import { read } from 'fs';



@Component({
  selector: 'app-training-viewer',
  templateUrl: './training-viewer.component.html',
  styleUrls: ['./training-viewer.component.css'],
  animations: [
    trigger('tocToggle', [
      // ...
      state('closed', style({
        'margin-left': '-250px'
      })),
      state('open', style({
        'margin-left': '0',
      })),
      transition('open => closed', [
        animate('200ms')
      ]),
      transition('* => open', [
        animate('200ms')
      ]),
    ]),
    trigger('questionSlide', [
      // ...
      state('in', style({
        'left': '0',
        'opacity': '1'
      })),
      state('out', style({
        'left': ' 600px',
        'opacity': '0'
      })),
      transition('in => out', [
        animate('200ms')
      ]),
      transition('out => in', [
        animate('200ms')
      ])
    ]),
    trigger('itemFocus', [
      // ...
      state('in', style({
        'font-size': '28px',
        'margin-left': '16px'
      })),
      state('out', style({
        'font-size': '16px',
        'margin-left': '24px'

      })),
      transition('in => out', [
        animate('200ms')
      ]),
      transition('out => in', [
        animate('200ms')
      ])
    ])
  ]


})
export class TrainingViewerComponent implements OnInit {

  vgApi: VgAPI;

  isAuthenticated$: Observable<boolean>;
  isIconSelectModalVisible = false;
  selectedTraining$: Observable<TrainingModel>;
  selectedTrainingVersions$: Observable<TrainingVersion[]>;
  //  selectedTrainingIndex$: Observable<number>;
  fileUploaded$: Observable<FileModel>;
  safeFileUrl$: Observable<SafeResourceUrl>;
  myTeamHash$: Observable<UserIdHash>;
  myTeamHash: UserIdHash;
  usersAffected: UserModel[] = [];
  teamMembers: UserModel[] = [];
  users$: Observable<string[]>;
  assignableUsers: string[] = [];
  assignedToUsers: string[] = [];
  assignToUser: UserModel;
  currentSelectedUserToAssign = '';
  currentPageId = 'intro';
  isOpen = true;
  pageContainerMarginLeft = '270';
  selectedTraining: TrainingModel;
  fullscreen = true;
  helpPanelIsVisible = true;
  badUrl = false;
  more = '...';
  lockTrainingModalIsVisible = false;

  userTypeIconHash = {
    individualContributor: 'fad fa-fw fa-user',
    supervisor: 'fad fa-fw fa-user-tie',
    volunteer: 'fad fa-fw fa-user-cowboy',
    customer: 'fad fa-fw fa-user-crown',
    candidate: 'fad fa-fw fa-user-graduate'
  };

  trainingStatusColorHash = {
    uptodate: '#52c41a',
    pastdue: 'red'
  }

  okDisabled = true;
  cancelDisabled = false;
  messageDialogVisible = false;

  toAddresses: string[];
  subject: string = 'Feedback Requested'
  messageBody: string = 'Please'
  usersToDelete
  currentStep = -1;

  rating = 0;

  tempIcon = '';
  tempIconColor = '';
  showConfirmDeleteTrainingWithAffectedUsers = false;
  showConfirmDeleteTrainingWithoutAffectedUsers = false;
  showRollbackModalFlag = false;
  showAssignToUserDialog = false;
  assignedUserIdSelected = '';

  private items = [
    {
      name: 'toc-container',
    },
    {
      name: 'toc-title',
    },
    {
      name: 'toc-entry',
    },
    {
      name: 'main-content',
    },
    {
      name: 'page',
    }
  ]


  alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  assessment: Assessment;
  /*
    newAssessment: Assessment = {
      _id: String(new Date().getTime()),
      type: 'choiceFeedback',
      timeLimit: 0,
      passingGrade: 70,
      items: [
        {
          question: 'This is question 1',
          choices: [
            'This is the first choice',
            'This is the second choice',
          ],
          correctChoice: -1
        },
        {
          question: 'This is question 2',
          choices: [
            'This is the first choice',
            'This is the second choice',
          ],
          correctChoice: -1
  
        },
        {
          question: 'This is question 3',
          choices: [
            'This is the first choice',
            'This is the second choice',
          ],
          correctChoice: -1
  
        },
      ]
    };
    */


  assessmentResponseHash = {};
  assessmentResponse = [];
  showNext = false;
  //  runningTour = false;

  @Input() mode = 'Edit';
  @Input() trainingStatus = 'unlocked';
  @Input() trainingId = '';
  @Input() production = 'false';
  @Output() assessmentResult = new EventEmitter<{ tid: string, score: number, pass: boolean }>();

  docStreamPageHash = {};
  pageDocUrlHash = {};
  pageFileHash = {};
  mainContentContainerHeight = 51;
  pageIdHash = {};
  isNewVersionModalVisible = false;
  commentsVisible = false;
  questionEditorVisible = false;
  like = false;
  dislike = false;
  assessmentType = {
    choice: false,
    question: false,
    assessment: false
  }
  newChoice: string;

  itemWithFocus = 'greg ';
  selectedTrainingIndex = -1;
  error1 = false;
  error2 = false;
  changeLevel = '';
  newVersion = <Version>{
    version: '',
    changeLog: '',
    owner: '',
    fsHandle: '',
    url: '',
    dateUploaded: 0
  };

  authenticatedUser$: Observable<UserModel>;
  authenticatedUser: UserModel;
  selectedFile: FileModel;
  safeFileUrlHash = {};
  newVersion$: Observable<Version>;
  //  versionsHash = {};

  data: any[] = [];
  submitting = false;
  user = {
    author: 'Han Solo',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  };
  inputValue = '';
  currentHelpPanel = '';
  currentAssessmentItemIndex = -1;
  assessmentComplete = false;
  assessmentInProgress = false;
  assessmentCorrectCnt = 0;
  assessmentIncorrectCnt = 0;
  answerIsCorrect = false;
  passedAssessment = false;
  slideNewQuestionHash = {};

  score = 0;
  markCompletedModalIsVisible = false;
  emailAddr: string;
  pageUrl: string = '';
  urlError = false;
  safeUrlHash = {};
  passingGrade: number = 70;
  currentQuestion: AssessmentItem = {
    question: '',
    choices: [],
    correctChoice: -1
  }
  currentQuestionIndex = -1;
  currentCorrectChoice: string;
  assignToDisabled = false;
  currentVersionIndex = 0;
  trainingArchive: TrainingModel;

  trainingIntroShiftHash = {
    introduction: 0,
    execSummaryLabel: 1,
    execSummary: 2,
    //    goalsLabel: 3,
    //    goals: 4
  };
  validationItems = ['config', 'intro', 'mainContent', 'assessment'];
  itemNameHash = {
    //    trainingWizardTour: 'Training Wizard Tour',
    config: 'Training Configuration',
    intro: 'Training Introduction',
    mainContent: 'Main Content',
    assessment: 'Assessment'
  }
  trainingIsValidBS$ = new BehaviorSubject<boolean>(false);
  trainingIsValid$: Observable<boolean> = this.trainingIsValidBS$.asObservable();
  introFieldMask = 0;
  trainingValidMask = 0;
  rollbackVersion = '';
  currentTrainingState = 'invalid';
  //  previousSelectedTraining: TrainingModel = null;
  justLocked = false;
  versionCnt = 0;
  selectedTrainingVersionHash = {};
  selectedTrainingVersions = [];
  newTraining = true;
  changeLog = '';
  currentSelectedTrainingVersions: TrainingVersion[] = [];
  currentSelectedTrainingVersionObj: TrainingVersion;
  trainingWC: TrainingModel;
  debug = false;

  constructor(
    private trainingService: TrainingService,
    private modalService: NzModalService,
    private fileService: FileService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private userService: UserService,
    private userTrainingService: UserTrainingService,
    private mailService: SendmailService,
    private message: NzMessageService,
    private authService: AuthService) {
    this.isAuthenticated$ = this.authService.getIsAuthenticatedStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.myTeamHash$ = this.userService.getMyTeamIdHashStream();
    this.newVersion$ = this.fileService.getNewVersionStream();
    this.selectedTraining$ = this.trainingService.getSelectedTrainingStream();
    this.selectedTrainingVersions$ = this.trainingService.getSelectedTrainingVersionsStream();
    this.safeFileUrl$ = this.fileService.getSafeFileUrlStream();
    this.users$ = this.userTrainingService.getUsersForTrainingStream();
  }

  ngOnInit() {
    this.mode = 'Edit';

    if (this.production === 'true') {
      this.debug = false;
    }

    this.fileUploaded$ = this.fileService.getUploadedFileStream();
    this.selectedTraining$.subscribe(training => {

      if (!training || !training.versions) {
        return;
      }

      if (training.status === 'locked') {
        this.currentPageId = 'intro';
      } else {
        this.currentPageId = 'config';
      }


      if (training._id !== 'readOnly') {
        this.selectedTraining = training;
        this.trainingWC = training;

        this.currentSelectedTrainingVersions = training.versions;
        this.currentSelectedTrainingVersionObj = training.versions[0];
      } else {
        this.selectedTraining = training;
        this.currentSelectedTrainingVersionObj = training.versions[0];
      }

      this.userTrainingService.getUTForTraining(this.trainingWC._id);
      this.setCurrentPage(this.currentPageId);
      this.pageFileHash['intro'] = null;
      this.pageFileHash['config'] = null;
      this.pageFileHash['assessment'] = null;
      for (const page of training.pages) {
        if (page.type === 'url') {
          this.safeUrlHash[page.url] = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(page.url));
        } else if (page.type === 'file') {
          let file: FileModel = this.fileService.getFile(page.file);
          this.pageFileHash[page._id] = file;
        }
      }

      this.tempIconColor = this.trainingWC.iconColor;
      this.tempIcon = this.trainingWC.iconClass;
    });

    this.fileUploaded$.subscribe(file => {
      let found = false;
      let newPage: Page;
      if (!file) {
        return;
      }

      if (!this.trainingWC) {
        return;
      }

      for (const page of this.trainingWC.pages) {
        if (page.file === file._id) {
          console.log('TrainingViewer:fileUploaded stream - page already exists', file);
          found = true;
        }
      }

      if (!found) {
        const newPage = <Page>{
          _id: String(new Date().getTime()),
          type: 'file',
          url: '',
          title: file.versions[0].fileName,
          intro: 'Introduction to the document',
          file: file._id,
          portlets: [],
        };
        this.trainingWC.pages.push(newPage);
        this.setValidation('mainContent', true);
        this.saveTraining(false);
        this.pageFileHash[newPage._id] = file;
        this.setCurrentPage(newPage._id);
      }
    });

    this.myTeamHash$.subscribe(myTeamHash => {
      this.myTeamHash = myTeamHash;
    })

    this.users$.subscribe(userList => {
      console.log('TrainingViewer:users$.subscribe userList', userList);
      if (!userList) {
        return;
      }
      this.assignableUsers = [];
      if (this.myTeamHash) {
        this.assignedToUsers = userList;
        let teamMemberIds = Object.keys(this.myTeamHash);
        for (let userId of teamMemberIds) {
          if (this.assignedToUsers.includes(userId)) {
            continue;
          } else {
            this.assignableUsers.push(userId);
          }
        }
      }
      if (this.assignableUsers.length > 0) {
        this.assignToDisabled = false;
      } else {
        this.assignToDisabled = true;
      }
    })


    this.newVersion$.subscribe(version => {
      if (!version) {
        return;
      }

      if (!this.pageFileHash[this.currentPageId]) {
        console.log('newVersion$ pageFileHash[this.currentPageId] is null', this.currentPageId);
        return;
      }


      console.log('newVersion$.subscribe', version, this.currentPageId, this.pageFileHash);
      this.fileService.selectFsHandle(this.pageFileHash[this.currentPageId], 0);
    })

    this.authenticatedUser$.pipe(take(2)).subscribe(user => {
      this.authenticatedUser = user;
    })
  }

  bumpPatchLevel(): string {
    const versionArray = this.currentSelectedTrainingVersions[0].version.split('_', 3);
    let majorNum = parseInt(versionArray[0], 10);
    let minorNum = parseInt(versionArray[1], 10);
    let patchNum = parseInt(versionArray[2], 10);

    patchNum++;
    return majorNum + '_' + minorNum + '_' + patchNum;
  }


  unlockTraining() {
    let newTrainingVersionObj: TrainingVersion = {
      _id: String(new Date().getTime()),
      version: this.trainingWC.versions[0].version,
      pending: true,
      changeLog: null,
      ownerId: this.authenticatedUser._id,
      dateCreated: 0,
      title: this.trainingWC.title,
      iconClass: this.trainingWC.iconClass,
      iconColor: this.trainingWC.iconColor,
      trainingObj: null
    };
    this.currentSelectedTrainingVersions.unshift(newTrainingVersionObj);
    this.trainingWC.status = 'unlocked';
    this.saveTraining(true);

  }

  loadVersion(version) {
    this.currentSelectedTrainingVersionObj = version;
    this.trainingService.selectTrainingVersion(version.trainingObj);
  }

  showVersionModal() {
    this.isNewVersionModalVisible = true;
  }

  cancelLockTraining() {

  }

  handleLockTraining() {
    this.error1 = false;
    this.error2 = false;

    let readOnlyTraining: TrainingModel;

    if (!this.changeLevel) {
      this.error1 = true;
      this.lockTrainingModalIsVisible = true;
      return;
    }

    const versionArray = this.currentSelectedTrainingVersions[0].version.split('_', 3);
    let majorNum = parseInt(versionArray[0], 10);
    let minorNum = parseInt(versionArray[1], 10);
    let patchNum = parseInt(versionArray[2], 10);
    if (this.changeLevel === 'major') {
      majorNum++;
      minorNum = 0;
      patchNum = 0;
      this.resetTrainingStatus();
    } else if (this.changeLevel === 'minor') {
      minorNum++;
      patchNum = 0;
      this.sendNotifications();
    } else if (this.changeLevel === 'patch') {
      patchNum++;
    }
    let newVersion = majorNum + '_' + minorNum + '_' + patchNum;

    this.trainingWC.status = 'locked';

    this.trainingWC.versions[0].version = newVersion;
    this.trainingWC.versions[0].changeLog = this.changeLog;
    this.trainingWC.versions[0].pending = false;
    this.trainingWC.versions[0].title = this.trainingWC.title;
    this.trainingWC.versions[0].iconClass = this.trainingWC.iconClass;
    this.trainingWC.versions[0].iconColor = this.trainingWC.iconColor;

    readOnlyTraining = cloneDeep(this.trainingWC);
    readOnlyTraining._id = 'readOnly';
    this.trainingWC.versions[0].trainingObj = readOnlyTraining;

    this.trainingService.saveNewVersion(this.trainingWC);
    this.trainingService.selectTrainingVersion(this.trainingWC.versions[0]);

    this.lockTrainingModalIsVisible = false;
  }

  saveNewVersion() {

    let readOnlyTraining: TrainingModel;

    if (this.currentSelectedTrainingVersions.length === 1) {
      this.trainingWC.status = 'locked';

      this.trainingWC.versions[0].changeLog = 'Initial Training Creation';
      this.trainingWC.versions[0].pending = false;
      this.trainingWC.versions[0].title = this.trainingWC.title;
      this.trainingWC.versions[0].iconClass = this.trainingWC.iconClass;
      this.trainingWC.versions[0].iconColor = this.trainingWC.iconColor;


      readOnlyTraining = cloneDeep(this.trainingWC);
      readOnlyTraining._id = 'readOnly';

      this.trainingWC.versions[0].trainingObj = readOnlyTraining;

      this.trainingService.saveNewVersion(this.trainingWC);
      this.trainingService.selectTrainingVersion(this.trainingWC.versions[0]);
    } else {
      this.lockTrainingModalIsVisible = true;
    }
  }

  createMessage(type: string, msg: string): void {
    this.message.create(type, msg);
  }

  versionFormatter(version) {
    if (!version) {
      return;
    }
    let re = /_/g;
    return version.replace(re, '.');
    version
  }

  setValidation(item: string, value: boolean) {
    this.trainingWC.isValid[item] = value;
    this.saveTraining(false);
    /*
    let type: string;
    let validityStr: string;
    if (value) {
      type = 'success';
      validityStr = 'is valid'
    } else {
      type = 'warning';
      validityStr = 'is not valid'
    }
*/
    let trainingIsValid = true;
    for (let item of this.validationItems) {
      if (!this.trainingWC.isValid[item]) {
        trainingIsValid = false;
        return;
      }
    }
    this.trainingIsValidBS$.next(trainingIsValid);
  }

  useAssessmentChanged(event) {
    console.log('useAssessmentChanged', event);
    this.setValidation('assessment', true);
  }


  resetTrainingStatus() {
    this.userTrainingService.resetUserTrainingStatus(this.trainingWC._id);
  }

  sendNotifications() {
    this.subject = 'The Content of a Training has changed!'
    this.messageBody = "Training '" + this.trainingWC.title + "' has been updated.  Please review the training."
    console.log('sending notification message');
    for (let user of this.assignedToUsers) {
      let msg = <MessageModel>{
        to: this.myTeamHash[user].email,
        from: this.authenticatedUser.email,
        subject: this.subject,
        text: this.messageBody
      }
      this.mailService.sendMessage(msg);
    }
  }

  openPicker(type: string): void {
    if (type === 'doc') {
      this.fileService.openDocPicker();
    } else if (type === 'video') {
      this.fileService.openVideoPicker();
    } else if (type === 'audio') {
      this.fileService.openAudioPicker();
    } else if (type === 'image') {
      this.fileService.openImagePicker();
    }
  }

  pageUrlChanged() {
    if (this.pageUrl === '') {
      return;
    }

    this.badUrl = false;
    if (this.pageUrl !== '' && !this.pageUrl.startsWith('https://')) {
      this.badUrl = true;
      this.pageUrl = '';
      return;
    }

    let safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(this.pageUrl));
    this.safeUrlHash[this.pageUrl] = safeUrl;
    const newPage = <Page>{
      _id: String(new Date().getTime()),
      type: 'url',
      url: this.pageUrl,
      title: this.pageUrl,
      intro: 'Introduction to the document',
      file: '',
      portlets: [],
    };
    this.trainingWC.pages.push(newPage);
    this.setValidation('mainContent', true);
    this.saveTraining(false);
    this.setCurrentPage(newPage._id);

    //    newPage = this.trainingService.addNewPage(this.trainingWC._id, 'url', this.pageUrl, '', this.pageUrl);
    this.setValidation('mainContent', true);
    this.saveTraining(false);
    this.setCurrentPage(newPage._id);
    this.pageUrl = '';
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

  handleSubmit(): void {
    this.submitting = true;
    const content = this.inputValue;
    this.inputValue = '';
    setTimeout(() => {
      this.submitting = false;
      this.data = [
        ...this.data,
        {
          ...this.user,
          content,
          datetime: new Date(),
          displayTime: 'foo'
          //          displayTime: distanceInWords(new Date(), new Date())
        }
      ].map(e => {
        return {
          ...e,
          displayTime: 'foo'
          //          displayTime: distanceInWords(new Date(), e.datetime)
        };
      });
    }, 800);
  }

  setCurrentStepPanel(newIndex) {
    this.currentStep = newIndex;
    //    this.runningTour = true;
  }

  viewVersion(index) {
    this.currentVersionIndex = index;
    this.fileService.selectFsHandle(this.pageFileHash[this.currentPageId], index);
  }

  setCurrentPage(pageId) {
    if (this.assessmentInProgress) {
      console.log('setCurrentPage : assessmentInProgress');
      return;
    }
    //    console.log('setCurrentPage', pageId, this.mode, this.production);
    //    if (pageId === 'mainContent' && (this.mode === 'Preview' || this.production)) {
    //      return;
    //    }

    this.currentVersionIndex = 0;
    if (pageId === 'assessment') {
      this.resetAssessment();
    }

    this.currentPageId = pageId;
    if (this.pageFileHash[pageId]) {
      this.fileService.selectFsHandle(this.pageFileHash[pageId], this.currentVersionIndex);
    }
    this.currentHelpPanel = '';
  }

  setIcon(event) {
    this.tempIcon = event.icon;
    this.tempIconColor = event.color;
    this.okDisabled = false;
  }

  deleteAssignedUser() {
    this.userTrainingService.deleteUserTrainingByTidUid(this.trainingWC._id, this.assignedUserIdSelected);
    this.userTrainingService.getUTForTraining(this.trainingWC._id);
    this.trainingService.reloadAllTrainings();
  }

  configChanged(event) {
    this.setValidation('config', true);
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId);
  }

  contentChanged(newVal: string, propName: string) {
    this.trainingWC[propName] = newVal;
    this.introFieldMask = this.introFieldMask | 1 << this.trainingIntroShiftHash[propName];
    if (this.introFieldMask === 7) {
      this.setValidation('intro', true);
    }
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId);
  }

  pageContentChanged(newVal: string, index: number, propName: string) {
    this.trainingWC.pages[index][propName] = newVal;
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId);
  }
  /*
    pageChanged(newVal: string, index: number, propName: string) {
      let page: Page;
      page = this.selectedTraining.pages[index];
      page[propName] = newVal;
      this.saveTraining(false);
      this.setCurrentPage(this.currentPageId);
    }
  */
  handleIconSelectCancel() {
    this.tempIconColor = '';
    this.tempIcon = '';
    this.isIconSelectModalVisible = false;
    this.okDisabled = true;
  }

  dismissNewVersionModal() {
    this.isNewVersionModalVisible = false;
  }

  handleIconSelectConfirm() {
    this.trainingWC.iconClass = this.tempIcon;
    this.trainingWC.iconColor = this.tempIconColor;
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId);

    this.isIconSelectModalVisible = false;
    this.okDisabled = true;
  }

  closeViewer() {
    console.log('closeVIewer');
    this.userTrainingService.stopSession(this.trainingWC._id);
    this.trainingService.selectTraining(null);
    this.assessmentInProgress = false;
  }

  toggleTOC(state: boolean) {
    this.isOpen = state;
    if (state) {
      this.pageContainerMarginLeft = '270';
    } else {
      this.pageContainerMarginLeft = '20';
    }
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

    let currentFile: FileModel = this.pageFileHash[this.currentPageId];

    const versionArray = currentFile.versions[0].version.split('_', 3);
    let majorNum = parseInt(versionArray[0], 10);
    let minorNum = parseInt(versionArray[1], 10);
    let patchNum = parseInt(versionArray[2], 10);
    if (this.changeLevel === 'major') {
      majorNum++;
      minorNum = 0;
      patchNum = 0;
    } else if (this.changeLevel === 'minor') {
      minorNum++;
      patchNum = 0;
    } else if (this.changeLevel === 'patch') {
      patchNum++;
    }
    this.newVersion.version = majorNum + '_' + minorNum + '_' + patchNum;

    this.newVersion.owner = this.authenticatedUser._id;
    this.newVersion.dateUploaded = new Date().getTime();

    let mimeType = currentFile.versions[0].mimeType.substring(0, currentFile.versions[0].mimeType.indexOf('/'));
    let pickerType;
    console.log('mimetype', mimeType);
    if (mimeType === 'application') {
      pickerType = 'doc';
    } else {
      pickerType = mimeType;
    }

    this.fileService.pickNewVersion(this.newVersion, pickerType);
    this.isNewVersionModalVisible = false;
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

  addNewQuestion() {
    let newQuestionIndex = this.trainingWC.assessment.items.length;
    let newItem = {
      question: '',
      choices: [],
      correctChoice: -1
    };

    this.trainingWC.assessment.items.push(newItem);
    this.setValidation('assessment', true);
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId);
    this.editQuestion(newQuestionIndex);
  }

  addNewChoice(event, itemIndex) {
    const newChoice = 'New Choice';
    this.trainingWC.assessment.items[itemIndex].choices.push(newChoice);
    this.saveTraining(false);

    this.setCurrentPage(this.currentPageId);
  }

  questionChanged(event, item, itemIndex) {

    console.log('questionChanged', item, itemIndex);
    this.trainingWC.assessment.items[itemIndex] = item;
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId);
  }

  choiceContentChanged(event, choice: string, itemIndex: number, choiceIndex: number) {
    console.log('choiceContentChanged', event);
    this.trainingWC.assessment.items[itemIndex].choices[choiceIndex] = choice;
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId);
  }

  correctChoiceChanged(event, item, itemIndex) {
    this.trainingWC.assessment.items[itemIndex] = item;
    this.saveTraining(false);
    console.log('correctChoiceChanged', item, itemIndex);
  }

  saveTraining(reload: boolean) {
    if (this.trainingWC.teamId === 'mytrainingdocs') {
      return;
    }
    this.trainingService.saveTraining(this.trainingWC, reload);
    this.setCurrentPage(this.currentPageId);
  }

  cancelAssignToUser() {
    this.currentSelectedUserToAssign = '';
    this.showAssignToUserDialog = false;
  }

  confirmAssignmentToUser() {
    this.showAssignToUserDialog = false;
    this.userTrainingService.assignTraining(this.assignToUser._id, this.trainingWC._id);
    this.userTrainingService.getUTForTraining(this.trainingWC._id);
  }

  selectTeamMemberToAssign(uid: string) {
    this.assignToUser = this.myTeamHash[uid];
    this.currentSelectedUserToAssign = uid;
  }

  showAssignmentDialog() {
    this.showAssignToUserDialog = true;
    this.teamMembers = Object.values(this.myTeamHash);
  }

  showRollbackConfirm(): void {
    this.modalService.confirm({
      nzTitle: 'Are you sure you want to discard the latest changes?',
      nzContent: '<b style="color: red;">The most recent version will be reloaded.</b>',
      nzOkText: 'Yes',
      nzOkType: 'danger',
      nzOnOk: () => this.rollback(),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }
  showChangeLog(): void {
    this.modalService.info({
      nzTitle: 'Change Log',
      nzContent: this.currentSelectedTrainingVersionObj.changeLog,
      nzOnOk: () => console.log('Info OK')
    });
  }
  showRollbackModal() {
    this.showRollbackModalFlag = true;
  }

  showConfirmDelete() {
    this.usersAffected = [];
    this.userTrainingService.getUTForTraining$(this.trainingWC._id).subscribe(userTrainings => {
      for (let ut of userTrainings) {
        this.usersAffected.push(this.myTeamHash[ut.uid]);
      }
      if (this.usersAffected.length > 0) {
        this.showConfirmDeleteTrainingWithAffectedUsers = true;
      } else {
        this.showConfirmDeleteTrainingWithoutAffectedUsers = true;
      }
    });
  }

  cancelDelete() {
    this.showConfirmDeleteTrainingWithoutAffectedUsers = false;
    this.showConfirmDeleteTrainingWithAffectedUsers = false;
    this.usersAffected = [];
  }

  confirmDelete() {
    this.userTrainingService.getUTForTraining$(this.trainingWC._id).subscribe(userTrainings => {
      for (let ut of userTrainings) {
        this.userTrainingService.deleteUserTraining$(ut._id).subscribe(item => {
          this.userTrainingService.initUserTrainingsForUser(ut.uid);
        })
      }
    });
    this.trainingService.deleteTraining(this.trainingWC._id);
    this.trainingService.selectTraining(null);
    this.usersAffected = [];
  }

  showIconSelectModal() {
    this.tempIcon = this.trainingWC.iconClass;
    this.tempIconColor = this.trainingWC.iconColor;

    this.isIconSelectModalVisible = true;
  }

  setMode(newMode: string) {
    this.assessmentInProgress = false;
    this.currentAssessmentItemIndex = -1;
    this.mode = newMode;
    if (newMode === 'Preview' && (this.currentPageId === 'config' || this.currentPageId === 'mainContent' || (this.currentPageId === 'assessment' && !this.selectedTraining.useAssessment))) {
      this.currentPageId = 'intro'
    }
    this.resetAssessment();
  }

  confirmDeleteQuestion(questionIndex) {
    this.trainingWC.assessment.items.splice(questionIndex, 1);
    if (this.trainingWC.assessment.items.length === 0) {
      this.setValidation('assessment', false);
    }
    this.saveTraining(false);
  }

  confirmDeletePage(pageIndex) {
    this.trainingWC.pages.splice(pageIndex, 1);
    if (this.trainingWC.pages.length > 0) {
      this.setValidation('mainContent', true);
    } else {
      this.setValidation('mainContent', false);
    }

    this.saveTraining(true);
    if (this.trainingWC.pages.length > 0 && pageIndex < this.trainingWC.pages.length) {
      this.setCurrentPage(this.trainingWC.pages[pageIndex]._id);
    } else {
      this.setCurrentPage('intro');
    }

  }

  showComments() {
    this.commentsVisible = !this.commentsVisible;
  }

  markCompleted(training) {
    this.markCompletedModalIsVisible = true;
  }

  handleMarkAsCompletedCancel() {
    this.markCompletedModalIsVisible = false;
  }

  markTrainingAsComplete(training) {
    training.rating.push(this.rating);
  }

  addEmailToInterestList() {
    if (this.emailAddr === '') {
      return;
    }
    this.trainingWC.interestList.push(this.emailAddr);
    this.emailAddr = '';
    this.saveTraining(false);
  }

  deleteInterestListItem(index) {
    this.trainingWC.interestList.splice(index, 1);
    this.saveTraining(false);
  }

  answeredQuestion(itemIndex) {
    this.showNext = true;
    if (this.assessmentResponseHash[this.currentAssessmentItemIndex] === this.trainingWC.assessment.items[itemIndex].correctChoice) {
      this.answerIsCorrect = true;
      this.assessmentCorrectCnt++;
      this.score = (this.assessmentCorrectCnt / this.trainingWC.assessment.items.length) * 100;
    } else {
      this.answerIsCorrect = false;
      this.assessmentIncorrectCnt++;
    }
  }

  beginAssessment() {
    this.assessmentInProgress = true;
    this.currentAssessmentItemIndex = -1;
    this.nextQuestion();
  }
  /*
  beginTour() {
    this.runningTour = true;
  }

  endTour() {
    this.currentStep = -1;
    this.runningTour = false;
    this.setValidation('trainingWizardTour', true);
    this.saveTraining(false);
  }
  */

  resetAssessment() {
    this.showNext = false;
    this.assessmentInProgress = false;
    this.assessmentComplete = false;
    this.currentAssessmentItemIndex = -1;
    this.passedAssessment = false;
    this.assessmentCorrectCnt = 0;
    this.assessmentIncorrectCnt = 0;
    for (let i = 0; i < this.trainingWC.assessment.items.length; i++) {
      this.slideNewQuestionHash[i] = false;
      this.assessmentResponseHash[i] = null;
    }
  }

  nextQuestion() {
    this.slideNewQuestionHash[this.currentAssessmentItemIndex] = false;
    this.currentAssessmentItemIndex++;
    this.showNext = false;
    if (this.currentAssessmentItemIndex === this.trainingWC.assessment.items.length) {
      this.currentAssessmentItemIndex = -1;
      this.assessmentComplete = true;
      this.assessmentInProgress = false;
      this.score = (this.assessmentCorrectCnt / this.trainingWC.assessment.items.length) * 100.0;
      if (this.score < this.trainingWC.assessment.passingGrade) {
        this.passedAssessment = false;
      } else {
        this.passedAssessment = true;
        this.assessmentResult.emit({ tid: this.trainingWC._id, score: this.score, pass: true });
      }
    } else {
      this.slideNewQuestionHash[this.currentAssessmentItemIndex] = true;
    }
  }

  retake() {
    this.assessmentInProgress = true;
    this.assessmentComplete = false;
    this.currentAssessmentItemIndex = 0;
    this.passedAssessment = false;
    this.assessmentCorrectCnt = 0;
    this.assessmentIncorrectCnt = 0;
    for (let i = 0; i < this.trainingWC.assessment.items.length; i++) {
      this.assessmentResponseHash[i] = null;
    }
    this.slideNewQuestionHash[this.currentAssessmentItemIndex] = true;
  }
  /*
    setAssessmentType(type) {
      if (type === 'choiceFeedback') {
        this.assessmentType.choice = true;
        this.assessmentType.question = false;
        this.assessmentType.assessment = false;
      } else if (type === 'questionFeedback') {
        this.assessmentType.choice = false;
        this.assessmentType.question = true;
        this.assessmentType.assessment = false;
      } else if (type === 'assessmentFeedback') {
        this.assessmentType.choice = false;
        this.assessmentType.question = false;
        this.assessmentType.assessment = true;
      }
    }
    */

  assessmentChanged(event) {
    this.trainingWC.assessment.passingGrade = event;
    this.saveTraining(false);
  }

  setCurrentHelpPanel(panelName: string): void {
    this.currentHelpPanel = panelName;
  }

  postMessageDialog() {
    this.messageDialogVisible = true;
  }

  emailInterestList() {
    let msg = <MessageModel>{
      to: this.trainingWC.interestList[0],
      from: this.authenticatedUser.email,
      subject: this.subject,
      text: this.messageBody
    }
    this.mailService.sendMessage(msg);
    this.messageDialogVisible = false;
  }

  handleEmailInterestListCancel() {
    this.messageDialogVisible = false;
  }

  updateQuestion() {
    this.currentQuestion.correctChoice = Number(this.currentCorrectChoice);
    this.trainingWC.assessment.items[this.currentQuestionIndex] = this.currentQuestion;
    this.saveTraining(false);
    this.questionEditorVisible = false;
  }

  handleQuestionEditCancel() {
    this.questionEditorVisible = false;
  }

  editQuestion(itemIndex) {
    this.currentQuestion = {
      question: this.trainingWC.assessment.items[itemIndex].question,
      choices: this.trainingWC.assessment.items[itemIndex].choices,
      correctChoice: this.trainingWC.assessment.items[itemIndex].correctChoice
    }
    this.currentCorrectChoice = this.trainingWC.assessment.items[itemIndex].correctChoice.toString();
    this.currentQuestionIndex = itemIndex;
    this.questionEditorVisible = true;
  }

  movePage(currentIndex, positions) {
    // can't move first page up
    if (currentIndex === 0 && positions === -1) {
      return;
    }

    // can't move last page down
    if (currentIndex === this.trainingWC.pages.length - 1 && positions === 1) {
      return;
    }

    let pageToMove = this.trainingWC.pages.splice(currentIndex, 1);
    this.trainingWC.pages.splice(currentIndex + positions, 0, pageToMove[0]);

    this.saveTraining(false);
  }

  rollback() {
    this.trainingService.selectTrainingVersion(this.currentSelectedTrainingVersions[0].trainingObj);
    this.saveTraining(false);
  }
}