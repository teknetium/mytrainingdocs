import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { FileService } from '../../../shared/services/file.service';
import { TrainingService } from '../../../shared/services/training.service';
import { UserService } from '../../../shared/services/user.service';
import { UserTrainingService } from '../../../shared/services/userTraining.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { TrainingModel, Page, Portlet, Assessment, AssessmentItem, TrainingArchive } from 'src/app/shared/interfaces/training.type';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FileModel, Version } from 'src/app/shared/interfaces/file.type';
import { UserModel, UserIdHash } from 'src/app/shared/interfaces/user.type';
import { VgAPI } from 'videogular2/compiled/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { merge, take } from 'rxjs/operators';
import { SendmailService } from '../../../shared/services/sendmail.service';
import { MessageModel } from '../../../shared/interfaces/message.type';
import { NzNotificationService } from 'ng-zorro-antd/notification';


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
  currentPageId = 'trainingWizardTour';
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

  assessmentResponseHash = {};
  assessmentResponse = [];
  showNext = false;
  runningTour = false;

  @Input() mode = 'Edit';
  @Input() trainingStatus = 'Under Development';
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

  @ViewChild("myDiv") divView: ElementRef;

  constructor(
    private trainingService: TrainingService,
    private fileService: FileService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private userService: UserService,
    private userTrainingService: UserTrainingService,
    private mailService: SendmailService,
    private notification: NzNotificationService,
    private authService: AuthService) {
    this.isAuthenticated$ = this.authService.getIsAuthenticatedStream();
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.myTeamHash$ = this.userService.getMyTeamIdHashStream();
    this.newVersion$ = this.fileService.getNewVersionStream();
    this.selectedTraining$ = this.trainingService.getSelectedTrainingStream();
    this.safeFileUrl$ = this.fileService.getSafeFileUrlStream();
    this.users$ = this.userTrainingService.getUsersForTrainingStream();
  }

  ngOnInit() {
    this.mode = 'Edit';

    if (this.production === 'true') {
      this.fullscreen = true;
      this.currentPageId = 'intro';
    } else {
      this.currentPageId = 'trainingWizardTour';
    }

    this.fileUploaded$ = this.fileService.getUploadedFileStream();
    this.selectedTraining$.subscribe(training => {
      this.mode = 'Edit';

      this.selectedTraining = training;

      if (training) {
        this.userTrainingService.getUTForTraining(this.selectedTraining._id);
        if (this.production === 'true') {
          this.currentPageId = 'intro';
        } else {
          this.currentPageId = 'trainingWizardTour';
        }
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

        this.tempIconColor = this.selectedTraining.iconColor;
        this.tempIcon = this.selectedTraining.iconClass;


      }
    });
    this.fileUploaded$.subscribe(file => {
      let found = false;
      let newPage: Page;
      if (!file) {
        return;
      }

      if (!this.selectedTraining) {
        return;
      }

      for (const page of this.selectedTraining.pages) {
        if (page.file === file._id) {
          console.log('TrainingViewer:fileUploaded stream - page already exists', file);
          found = true;
        }
      }

      console.log('fileUploaded', file);
      if (!found) {
        newPage = this.trainingService.addNewPage(this.selectedTraining._id, 'file', '', file._id, file.versions[0].fileName);
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

  handleLockTraining() {
    this.error1 = false;
    this.error2 = false;

    if (!this.changeLevel) {
      this.error1 = true;
      this.lockTrainingModalIsVisible = true;
      return;
    }

    const versionArray = this.selectedTraining.versions[0].split('.', 3);
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
    this.selectedTraining.versions[0] = majorNum + '.' + minorNum + '.' + patchNum;
    this.selectedTraining.status = 'In Production';
    this.trainingService.saveTraining(this.selectedTraining, true);
  }

  resetTrainingStatus() {
    this.userTrainingService.resetUserTrainingStatus(this.selectedTraining._id);
  }

  sendNotifications() {
      this.subject = 'The Content of a Training has changed!'
    this.messageBody = "Training '" + this.selectedTraining.title + "' has been updated.  Please review the training."
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

  lockTraining(training) {
    // post show new training version impact dialog
    if (this.selectedTraining.versions[0] === '1.0.0') {
      this.lockTrainingModalIsVisible = false;
      this.selectedTraining.status = 'In Production';
      this.trainingService.saveTraining(this.selectedTraining, true);
    } else {
      this.lockTrainingModalIsVisible = true;
    }
  }

  unlockTraining() {
    this.selectedTraining.status = 'Under Development';
    // clone training
    this.trainingArchive = Object.assign(this.trainingArchive, this.selectedTraining);
    this.trainingArchive.status = 'Archived';
    this.trainingArchive._id = this.trainingArchive._id + '_' + this.selectedTraining.versions[0];
    this.trainingService.createTraining(this.trainingArchive);
    let archiveRecord = <TrainingArchive>{
      _id: String(new Date().getTime()),
      tid: this.selectedTraining._id,
      archiveId: this.trainingArchive._id + '_' + this.trainingArchive.versions[0],
      version: this.trainingArchive.versions[0],
    };
    this.trainingService.createTrainingArchive(archiveRecord);
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

    let newPage: Page;
    let safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(this.pageUrl));
    this.safeUrlHash[this.pageUrl] = safeUrl;
    newPage = this.trainingService.addNewPage(this.selectedTraining._id, 'url', this.pageUrl, '', this.pageUrl);
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
    this.runningTour = true;
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
    this.userTrainingService.deleteUserTrainingByTidUid(this.selectedTraining._id, this.assignedUserIdSelected);
    this.userTrainingService.getUTForTraining(this.selectedTraining._id);
    this.trainingService.reloadAllTrainings();
  }

  contentChanged(newVal: string, propName: string) {
    this.selectedTraining[propName] = newVal;
    //    this.trainingService.saveTraining(this.selectedTraining, false);
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId);
  }

  pageContentChanged(newVal: string, index: number, propName: string) {
    this.selectedTraining.pages[index][propName] = newVal;
    //    this.trainingService.saveTraining(this.selectedTraining, false);
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId);
  }

  pageChanged(newVal: string, index: number, propName: string) {
    let page: Page;
    page = this.selectedTraining.pages[index];
    page[propName] = newVal;

    //    this.trainingService.saveTraining(this.selectedTraining, false);
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId);
  }

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
    this.selectedTraining.iconClass = this.tempIcon;
    this.selectedTraining.iconColor = this.tempIconColor;
    //    this.trainingService.saveTraining(this.selectedTraining, true);
    this.saveTraining(true);
    this.setCurrentPage(this.currentPageId);

    this.isIconSelectModalVisible = false;
    this.okDisabled = true;
  }

  closeViewer() {
    this.userTrainingService.stopSession(this.selectedTraining._id);
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

    const versionArray = currentFile.versions[0].version.split('.', 3);
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
    this.newVersion.version = majorNum + '.' + minorNum + '.' + patchNum;

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
    let newQuestionIndex = this.selectedTraining.assessment.items.length;
    let newItem = {
      question: '',
      choices: [],
      correctChoice: -1
    };

    this.selectedTraining.assessment.items.push(newItem);

    //    this.trainingService.saveTraining(this.selectedTraining, false);
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId);
    this.editQuestion(newQuestionIndex);
  }

  addNewChoice(event, itemIndex) {
    const newChoice = 'New Choice';
    this.selectedTraining.assessment.items[itemIndex].choices.push(newChoice);
    //    this.trainingService.saveTraining(this.selectedTraining, false);
    this.saveTraining(false);

    this.setCurrentPage(this.currentPageId);
  }

  questionChanged(event, item, itemIndex) {

    console.log('questionChanged', item, itemIndex);
    this.selectedTraining.assessment.items[itemIndex] = item;
    //    this.trainingService.saveTraining(this.selectedTraining, false);
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId);
  }

  choiceContentChanged(event, choice: string, itemIndex: number, choiceIndex: number) {
    console.log('choiceContentChanged', event);
    this.selectedTraining.assessment.items[itemIndex].choices[choiceIndex] = choice;
    //    this.trainingService.saveTraining(this.selectedTraining, false);
    this.saveTraining(false);
    this.setCurrentPage(this.currentPageId);
  }

  correctChoiceChanged(event, item, itemIndex) {
    this.selectedTraining.assessment.items[itemIndex] = item;
    //    this.trainingService.saveTraining(this.selectedTraining, false);
    this.saveTraining(false);
    console.log('correctChoiceChanged', item, itemIndex);
  }

  saveTraining(reload: boolean) {
    if (this.selectedTraining.teamId === 'mytrainingdocs') {
      return;
    }
    this.trainingService.saveTraining(this.selectedTraining, reload);

    this.setCurrentPage(this.currentPageId);
  }

  cancelAssignToUser() {
    this.currentSelectedUserToAssign = '';
    this.showAssignToUserDialog = false;
  }

  confirmAssignmentToUser() {
    this.showAssignToUserDialog = false;
    this.userTrainingService.assignTraining(this.assignToUser._id, this.selectedTraining._id);
    this.userTrainingService.getUTForTraining(this.selectedTraining._id);
  }

  selectTeamMemberToAssign(uid: string) {
    this.assignToUser = this.myTeamHash[uid];
    this.currentSelectedUserToAssign = uid;
  }

  showAssignmentDialog() {
    this.showAssignToUserDialog = true;
    this.teamMembers = Object.values(this.myTeamHash);
  }

  showConfirmDelete() {
    this.usersAffected = [];
    this.userTrainingService.getUTForTraining$(this.selectedTraining._id).subscribe(userTrainings => {
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
    this.userTrainingService.getUTForTraining$(this.selectedTraining._id).subscribe(userTrainings => {
      for (let ut of userTrainings) {
        this.userTrainingService.deleteUserTraining$(ut._id).subscribe(item => {
          this.userTrainingService.initUserTrainingsForUser(ut.uid);
        })
      }
    });
    this.trainingService.deleteTraining(this.selectedTraining._id);
    this.trainingService.selectTraining(null);
    this.usersAffected = [];
  }

  showIconSelectModal() {
    this.tempIcon = this.selectedTraining.iconClass;
    this.tempIconColor = this.selectedTraining.iconColor;

    this.isIconSelectModalVisible = true;
  }

  setMode(newMode: string) {
    this.assessmentInProgress = false;
    this.currentAssessmentItemIndex = -1;
    this.mode = newMode;
    if (newMode === 'Preview' && (this.currentPageId === 'config' || this.currentPageId === 'trainingWizardTour' || this.currentPageId === 'mainContent')) {
      this.currentPageId = 'intro'
    }
    this.resetAssessment();
  }

  confirmDeleteQuestion(questionIndex) {
    this.selectedTraining.assessment.items.splice(questionIndex, 1);
    //    this.trainingService.saveTraining(this.selectedTraining, false);
    this.saveTraining(false);
  }

  confirmDeletePage(pageIndex) {
    this.selectedTraining.pages.splice(pageIndex, 1);
    this.saveTraining(false);
    if (this.selectedTraining.pages.length > 0 && pageIndex < this.selectedTraining.pages.length) {
      this.setCurrentPage(this.selectedTraining.pages[pageIndex]._id);
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
    this.selectedTraining.interestList.push(this.emailAddr);
    this.emailAddr = '';
    //    this.trainingService.saveTraining(this.selectedTraining, false);
    this.saveTraining(false);
  }

  deleteInterestListItem(index) {
    this.selectedTraining.interestList.splice(index, 1);
    //    this.trainingService.saveTraining(this.selectedTraining, false);
    this.saveTraining(false);
  }

  answeredQuestion(itemIndex) {
    this.showNext = true;
    if (this.assessmentResponseHash[this.currentAssessmentItemIndex] === this.selectedTraining.assessment.items[itemIndex].correctChoice) {
      this.answerIsCorrect = true;
      this.assessmentCorrectCnt++;
      this.score = (this.assessmentCorrectCnt / this.selectedTraining.assessment.items.length) * 100;
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

  beginTour() {
    this.runningTour = true;
  }

  endTour() {
    this.currentStep = -1;
    this.runningTour = false;
  }

  resetAssessment() {
    this.showNext = false;
    this.assessmentInProgress = false;
    this.assessmentComplete = false;
    this.currentAssessmentItemIndex = -1;
    this.passedAssessment = false;
    this.assessmentCorrectCnt = 0;
    this.assessmentIncorrectCnt = 0;
    for (let i = 0; i < this.selectedTraining.assessment.items.length; i++) {
      this.slideNewQuestionHash[i] = false;
      this.assessmentResponseHash[i] = null;
    }
  }

  nextQuestion() {
    this.slideNewQuestionHash[this.currentAssessmentItemIndex] = false;
    this.currentAssessmentItemIndex++;
    this.showNext = false;
    if (this.currentAssessmentItemIndex === this.selectedTraining.assessment.items.length) {
      this.currentAssessmentItemIndex = -1;
      this.assessmentComplete = true;
      this.assessmentInProgress = false;
      this.score = (this.assessmentCorrectCnt / this.selectedTraining.assessment.items.length) * 100.0;
      if (this.score < this.selectedTraining.assessment.passingGrade) {
        this.passedAssessment = false;
      } else {
        this.passedAssessment = true;
        this.assessmentResult.emit({ tid: this.selectedTraining._id, score: this.score, pass: true });
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
    for (let i = 0; i < this.selectedTraining.assessment.items.length; i++) {
      this.assessmentResponseHash[i] = null;
    }
    this.slideNewQuestionHash[this.currentAssessmentItemIndex] = true;
  }

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

  assessmentChanged(event) {
    this.selectedTraining.assessment.passingGrade = event;
    //    this.trainingService.saveTraining(this.selectedTraining, false);
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
      to: this.selectedTraining.interestList[0],
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
    this.selectedTraining.assessment.items[this.currentQuestionIndex] = this.currentQuestion;
    this.trainingService.saveTraining(this.selectedTraining, false);
    this.questionEditorVisible = false;
  }

  handleQuestionEditCancel() {
    this.questionEditorVisible = false;
  }

  editQuestion(itemIndex) {
    this.currentQuestion = {
      question: this.selectedTraining.assessment.items[itemIndex].question,
      choices: this.selectedTraining.assessment.items[itemIndex].choices,
      correctChoice: this.selectedTraining.assessment.items[itemIndex].correctChoice
    }
    this.currentCorrectChoice = this.selectedTraining.assessment.items[itemIndex].correctChoice.toString();
    this.currentQuestionIndex = itemIndex;
    this.questionEditorVisible = true;
  }

  movePage(currentIndex, positions) {
    // can't move first page up
    if (currentIndex === 0 && positions === -1) {
      return;
    }

    // can't move last page down
    if (currentIndex === this.selectedTraining.pages.length - 1 && positions === 1) {
      return;
    }

    let pageToMove = this.selectedTraining.pages.splice(currentIndex, 1);
    this.selectedTraining.pages.splice(currentIndex + positions, 0, pageToMove[0]);

    //    this.trainingService.saveTraining(this.selectedTraining, false);
    this.saveTraining(false);
  }
}