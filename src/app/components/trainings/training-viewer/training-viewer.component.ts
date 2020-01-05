import { Component, OnInit, Input } from '@angular/core';
import { FileService } from '../../../shared/services/file.service';
import { TrainingService } from '../../../shared/services/training.service';
import { UserService } from '../../../shared/services/user.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { TrainingModel, Page, Portlet, Assessment } from 'src/app/shared/interfaces/training.type';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FileModel } from 'src/app/shared/interfaces/file.type';

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
    ])
  ]

})
export class TrainingViewerComponent implements OnInit {

  isIconSelectModalVisible = false;
  selectedTraining$: Observable<TrainingModel>;
  selectedTrainingIndex$: Observable<number>;
  fileUploaded$: Observable<FileModel>;
  currentPageId = 'config';
  isOpen = true;
  pageContainerMarginLeft = '270';
  selectedTraining: TrainingModel;
  fullscreen = false;
  helpPanelIsVisible = true;

  okDisabled = true;
  cancelDisabled = false;

  tempIcon = '';
  tempIconColor = '';
  authenticatedUser$ = this.userService.getAuthenticatedUserStream();

  helpTextHash = {
    intro: `<h5>Intro</h5>Click on the blue pencil icon in the page below to customize the content for the training
    you are creating. `,

    mainContent: `<h5>Main Content</h5>This is where you upload a single document or multiple documents for this training.<br><br>
    Each document is associated with it's own page in the training and it's own entry in the <b>Table of Contents<b>.`,

    assessment: `<h5>Assessment</h5>`,

    ratingsComments: `<h5>Ratings & Comments</h5>`,
  }

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
  useAssessment = false;
  applyAssessment = false;

  assessment: Assessment;

  newAssessment: Assessment = {
    _id: String(new Date().getTime()),
    items: [
      {
        question: 'This is question 1',
        choices: [
          {
            text: 'This is the first choice',
            correct: false
          },
          {
            text: 'This is the second choice',
            correct: false
          }
        ]
      },
      {
        question: 'This is question 2',
        choices: [
          {
            text: 'This is the first choice',
            correct: false
          },
          {
            text: 'This is the second choice',
            correct: false
          }
        ]
      },
      {
        question: 'This is question 3',
        choices: [
          {
            text: 'This is the first choice',
            correct: false
          },
          {
            text: 'This is the second choice',
            correct: false
          }
        ]
      },
    ]
  };

  newItem = {
    question: 'Enter the question',
    choices: [
      {
        text: 'This is the first choice',
        correct: false
      },
      {
        text: 'This is the second choice',
        correct: false
      }
    ]
  };


  @Input() mode = 'edit';
  docStreamPageHash = {};
  pageDocUrlHash = {};
  mainContentContainerHeight = 51;
  pageIdBSHash = {};

  selectedTrainingIndex = -1;
  styleMap = new Map();

  constructor(private trainingService: TrainingService, private fileService: FileService, private sanitizer: DomSanitizer, private userService: UserService) {
    this.authenticatedUser$ = userService.getAuthenticatedUserStream();
      this.selectedTraining$ = this.trainingService.getSelectedTrainingStream();
      this.selectedTrainingIndex$ = this.trainingService.getSelectedTrainingIndexStream();
    }

    ngOnInit() {
      this.fileUploaded$ = this.fileService.getUploadedFileStream();
      this.selectedTrainingIndex$.subscribe(index => {
        this.selectedTrainingIndex = index;
      })
      this.selectedTraining$.subscribe(training => {

        this.selectedTraining = training;
        if (training) {
          for (const page of training.pages) {
            //          this.fileService.setupPrivateDocumentStream(page._id);
            //          this.fileService.setupPrivateSelectedFileStream(portlet._id);
            //          this.fileService.setupPrivateSelectedFileIndexStream(portlet._id);

            if (!page.file) {
              console.log('ERROR: TrainingViewerComponent:ngOnInit - no document set on training', training.title);
            } else {
              this.pageDocUrlHash[page._id] = this.fileService.getSafeUrl(page.file);
              console.log('OnInnit', this.pageDocUrlHash[page._id]);
              this.pageIdBSHash[page._id] = new BehaviorSubject<SafeResourceUrl>(null);
              this.docStreamPageHash[page._id] = this.pageIdBSHash[page._id].asObservable();


              //            this.fileService.selectItemById(page.file, page._id);
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
        }
      });


      this.fileUploaded$.subscribe(file => {
        if (!file) {
          return;
        }
        this.selectedTraining.files.push(file._id);
        this.trainingService.addNewPage(this.selectedTraining._id, file._id, file.name);
      })

      for (const item of this.items) {
        console.log('adding to styleMap', item.name, this.styleMap);
        this.styleMap.set(item.name, new Map());
      }
      console.log('styleMap...', this.styleMap);

      this.styleMap.get('toc-container').set('width.%', 25);
      this.styleMap.get('main-content').set('width.%', 73);
      this.styleMap.get('toc-entry').set('width.%', 100);
      this.styleMap.get('toc-title').set('font-size.px', 18);
      this.styleMap.get('toc-title').set('margin-top.px', 10);
      this.styleMap.get('toc-title').set('color', 'red');
      this.styleMap.get('page').set('font-size.px', 26);
    }

    setCurrentPage(pageId) {
      console.log('setCurrentPage', pageId);
      this.currentPageId = pageId;
      if (this.pageIdBSHash[pageId]) {
        console.log('setCurrentPage', this.pageDocUrlHash[pageId]);
        this.pageIdBSHash[pageId].next(this.pageDocUrlHash[pageId]);
      }
    }

    setIcon(event) {
      console.log('training-viewer:setIcon', event);
      this.tempIcon = event.icon;
      this.tempIconColor = event.color;
      this.okDisabled = false;
    }

    contentChanged(newVal: string, propName: string) {
      this.selectedTraining[propName] = newVal;
      this.trainingService.saveTraining(this.selectedTraining);
    }

    pageContentChanged(newVal: string, index: number, propName: string) {
      this.selectedTraining.pages[index][propName] = newVal;
      this.trainingService.saveTraining(this.selectedTraining);
    }

    pageChanged(newVal: string, index: number, propName: string) {
      let page: Page;
      page = this.selectedTraining.pages[index];
      page[propName] = newVal;

      this.trainingService.saveTraining(this.selectedTraining);
    }

    handleIconSelectCancel() {
      this.tempIconColor = '';
      this.tempIcon = '';
      this.isIconSelectModalVisible = false;
      this.okDisabled = true;
    }

    handleIconSelectConfirm() {
      this.selectedTraining.iconClass = this.tempIcon;
      this.selectedTraining.iconColor = this.tempIconColor;
      this.trainingService.saveTraining(this.selectedTraining);

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


    addNewQuestion() {
      this.assessment.items.push(this.newItem);

      this.selectedTraining.assessment = this.assessment;
      this.trainingService.saveTraining(this.selectedTraining);
    }

    addNewChoice(itemIndex) {
      const newChoice = {
        text: 'New Choice',
        correct: false
      }
      this.assessment.items[itemIndex].choices.push(newChoice);
      this.selectedTraining.assessment = this.assessment;
      this.trainingService.saveTraining(this.selectedTraining);

    }

    applyAssessmentChanged(event) {
      console.log('apply assessment', event);
      if (event) {
        this.selectedTraining.assessment = this.assessment;
      } else {
        this.selectedTraining.assessment = null;
      }
      this.trainingService.saveTraining(this.selectedTraining);
    }

    questionChanged(event, itemIndex) {
      this.assessment.items[itemIndex].question = event;
      this.selectedTraining.assessment = this.assessment;
      this.trainingService.saveTraining(this.selectedTraining);
    }

    choiceContentChanged(event, itemIndex, choiceIndex, propName) {
      this.assessment.items[itemIndex].choices[choiceIndex][propName] = event;
      this.selectedTraining.assessment = this.assessment;
      this.trainingService.saveTraining(this.selectedTraining);
    }

    saveTraining() {
      this.trainingService.saveTraining(this.selectedTraining);

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

    switchMode(newMode: string) {
      this.mode = newMode;
      if (newMode === 'view') {
        this.currentPageId = 'intro';
      }
    }

  }