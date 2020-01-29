import { Component, OnInit, Input } from '@angular/core';
import { FileService } from '../../../shared/services/file.service';
import { TrainingService } from '../../../shared/services/training.service';
import { UserService } from '../../../shared/services/user.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { TrainingModel, Page, Portlet, Assessment } from 'src/app/shared/interfaces/training.type';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FileModel, Version } from 'src/app/shared/interfaces/file.type';
import { UserModel } from 'src/app/shared/interfaces/user.model';
import { VgAPI } from 'videogular2/compiled/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'mtd-training-viewer',
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
    ])
  ]


})
export class TrainingViewerComponent implements OnInit {

  vgApi: VgAPI;

  isAuthenticated$: Observable<boolean>;
  isIconSelectModalVisible = false;
  selectedTraining$: Observable<TrainingModel>;
  selectedTrainingIndex$: Observable<number>;
  fileUploaded$: Observable<FileModel>;
  safeUrl$: Observable<SafeResourceUrl>;
  currentPageId = 'intro';
  isOpen = true;
  pageContainerMarginLeft = '270';
  selectedTraining: TrainingModel;
  fullscreen = false;
  helpPanelIsVisible = true;

  okDisabled = true;
  cancelDisabled = false;
  messageDialogVisible = false;

  toAddresses: string[];
  subject: string = 'Feedback Requested'
  messageBody: string = 'Please'

  rating = 0;

  tempIcon = '';
  tempIconColor = '';

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

  applyAssessment = false;
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

  newItem = {
    question: 'Enter the question',
    choices: [
      'This is the first choice',
      'This is the second choice',
    ],
    correctChoice: -1
  };
  assessmentResponseHash = {};
  assessmentResponse = [];
  showNext = false;
  runningTour = false;

  @Input() mode = 'Edit';
  @Input() trainingStatus = 'Under Development';
  @Input() trainingId = '';

  docStreamPageHash = {};
  pageDocUrlHash = {};
  pageFileHash = {};
  mainContentContainerHeight = 51;
  pageIdBSHash = {};
  isNewVersionModalVisible = false;
  commentsVisible = false;
  like = false;
  dislike = false;
  assessmentType = {
    choice: false,
    question: false,
    assessment: false
  }

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
  fsHandleSafeUrl$Hash = {};
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

  passingGrade: number = 70;


  constructor(
    private trainingService: TrainingService,
    private fileService: FileService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService) {
    this.isAuthenticated$ = authService.getIsAuthenticatedStream();
    this.authenticatedUser$ = userService.getAuthenticatedUserStream();
    this.selectedTraining$ = this.trainingService.getSelectedTrainingStream();
    this.selectedTrainingIndex$ = this.trainingService.getSelectedTrainingIndexStream();
    this.newVersion$ = this.fileService.getNewVersionStream();
  }

  ngOnInit() {
    this.currentPageId = 'trainingWizardTour';
    this.fileUploaded$ = this.fileService.getUploadedFileStream();
    this.selectedTrainingIndex$.subscribe(index => {
      this.selectedTrainingIndex = index;
    })
    this.selectedTraining$.subscribe(training => {

      this.selectedTraining = training;
      if (training) {
        this.currentPageId = 'trainingWizardTour';
        this.pageFileHash['intro'] = null;
        this.pageFileHash['config'] = null;
        this.pageFileHash['assessment'] = null;
        for (const page of training.pages) {

          if (!page.file) {
            console.log('ERROR: TrainingViewerComponent:ngOnInit - no document set on training', training.title);
          } else {
            let file: FileModel = this.fileService.getFile(page.file);
            this.pageFileHash[page._id] = file;

            for (const version of file.versions) {
              this.fsHandleSafeUrl$Hash[version.fsHandle] = this.fileService.getFsHandleStream(version.fsHandle);
            }
          }

        }

        if (this.selectedTraining.assessment) {
          this.assessment = this.selectedTraining.assessment;
          this.applyAssessment = true;
        } else {
          this.assessment = this.newAssessment;
          this.applyAssessment = false;
        }

        this.tempIconColor = this.selectedTraining.iconColor;
        this.tempIcon = this.selectedTraining.iconClass;

        this.mode = 'Edit';
      }
    });

    this.fileUploaded$.subscribe(file => {
      let found = false;
      if (!file) {
        return;
      }

      for (const page of this.selectedTraining.pages) {
        if (page.file === file._id) {
          console.log('TrainingViewer:ngOnInit - fileUploaded$.subscribe - duplicate file', this.selectedTraining);
          found = true;
        }
      }

      if (!found) {
        this.trainingService.addNewPage(this.selectedTraining._id, file._id, file.name);
      }
    })

    this.newVersion$.subscribe(newVersion => {
      if (!newVersion) {
        return;
      }
      this.pageFileHash[this.currentPageId].versions.unshift(newVersion);
    })

    this.authenticatedUser$.subscribe(user => {
      this.authenticatedUser = user;
    })
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

  setCurrentPage(pageId) {
    if (this.assessmentInProgress) {
      return;
    }
    this.currentPageId = pageId;
    if (this.pageFileHash[pageId]) {
      this.fileService.selectFsHandle(this.pageFileHash[pageId].versions[0].fsHandle);
    }
    this.currentHelpPanel = '';
  }

  setIcon(event) {
    this.tempIcon = event.icon;
    this.tempIconColor = event.color;
    this.okDisabled = false;
  }

  contentChanged(newVal: string, propName: string) {
    this.selectedTraining[propName] = newVal;
    this.trainingService.saveTraining(this.selectedTraining, false);
    this.setCurrentPage(this.currentPageId);
  }

  pageContentChanged(newVal: string, index: number, propName: string) {
    this.selectedTraining.pages[index][propName] = newVal;
    this.trainingService.saveTraining(this.selectedTraining, false);
    this.setCurrentPage(this.currentPageId);
  }

  pageChanged(newVal: string, index: number, propName: string) {
    let page: Page;
    page = this.selectedTraining.pages[index];
    page[propName] = newVal;

    this.trainingService.saveTraining(this.selectedTraining, false);
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
    this.trainingService.saveTraining(this.selectedTraining, true);
    this.setCurrentPage(this.currentPageId);

    this.isIconSelectModalVisible = false;
    this.okDisabled = true;
  }

  closeViewer() {
    this.trainingService.selectItemForEditing(-1);
    this.fullscreen = false;
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

    const versionArray = this.fileService.getFile(this.pageFileHash[this.currentPageId]).versions[0].version.split('.', 3);
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
    this.assessment.items.push(this.newItem);

    this.selectedTraining.assessment = this.assessment;
    this.trainingService.saveTraining(this.selectedTraining, false);
    this.setCurrentPage(this.currentPageId);
  }

  addNewChoice(itemIndex) {
    const newChoice = 'New Choice';
    this.assessment.items[itemIndex].choices.push(newChoice);
    this.selectedTraining.assessment = this.assessment;
    this.trainingService.saveTraining(this.selectedTraining, false);

    this.setCurrentPage(this.currentPageId);
  }

  questionChanged(item, itemIndex) {
    this.trainingService.saveTraining(this.selectedTraining, false);
    this.setCurrentPage(this.currentPageId);
  }

  choiceContentChanged(choice: string, itemIndex: number, choiceIndex: number) {
    this.selectedTraining.assessment.items[itemIndex].choices[choiceIndex] = choice;
    this.trainingService.saveTraining(this.selectedTraining, false);
    this.setCurrentPage(this.currentPageId);
  }

  correctChoiceChanged(item, itemIndex) {
    console.log('correctChoiceChanged', item, itemIndex); 
  }

  saveTraining(reload: boolean) {
//    console.log('saveTraining', model, event);
//    object[property] = model;
    this.trainingService.saveTraining(this.selectedTraining, reload);

    this.setCurrentPage(this.currentPageId);
  }

  openPicker() {
    this.fileService.openPicker();
  }

  confirmDelete() {
    this.trainingService.deleteTraining(this.selectedTraining._id);
    this.trainingService.selectItemForEditing(this.selectedTrainingIndex);
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
    this.currentPageId = 'intro';
    
  }

  confirmDeleteQuestion(questionIndex) {
    this.selectedTraining.assessment.items.splice(questionIndex, 1);
    this.trainingService.saveTraining(this.selectedTraining, false);
  }

  confirmDeletePage(pageIndex) {
    this.selectedTraining.pages.splice(pageIndex, 1);
    this.trainingService.saveTraining(this.selectedTraining, false);
    this.currentPageId = 'intro';
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

  setStatus(status) {
    this.selectedTraining.status = status;
    this.currentPageId = 'intro';
  }

  addEmailToInterestList() {
    if (this.emailAddr === '') {
      return;
    }
    this.selectedTraining.interestList.push(this.emailAddr);
    this.emailAddr = '';
    this.trainingService.saveTraining(this.selectedTraining, false);
  }

  deleteInterestListItem(index) {
    this.selectedTraining.interestList.splice(index, 1);
    this.trainingService.saveTraining(this.selectedTraining, false);    
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
    this.nextQuestion();
  }

  beginTour() {
    this.runningTour = true;
  }

  endTour() {
    this.currentHelpPanel = '';
    this.runningTour = false;
  }

  resetAssessment() {
    this.assessmentInProgress = false;
    this.assessmentComplete = false;
    this.currentAssessmentItemIndex = -1;
    this.passedAssessment = false;
    this.assessmentCorrectCnt = 0;
    this.assessmentIncorrectCnt = 0;
    for (let i = 0; i < this.selectedTraining.assessment.items.length; i++) {
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
      }
    } else {
      this.slideNewQuestionHash[this.currentAssessmentItemIndex] = true;
    }
  }

  retake() {
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
    this.trainingService.saveTraining(this.selectedTraining, false);
  }

  setCurrentHelpPanel(panelName: string): void {
    this.currentHelpPanel = panelName;
  }

  postMessageDialog() {
    this.messageDialogVisible = true;
  }

  emailInterestList() {

  }

  handleEmailInterestListCancel() {
    this.messageDialogVisible = false;
  }

  movePage(currentIndex, positions) {
    // can't move first page up
    if ( currentIndex === 0 && positions === -1 ) {
      return;
    }

    // can't move last page down
    if (currentIndex === this.selectedTraining.pages.length - 1 && positions === 1) {
      return;
    }

    let pageToMove = this.selectedTraining.pages.splice(currentIndex, 1);
    this.selectedTraining.pages.splice(currentIndex + positions, 0, pageToMove[0]);

    this.trainingService.saveTraining(this.selectedTraining, false);    
  }
}