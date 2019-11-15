import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { TrainingModel, Page, Portlet, Assessment } from '../../../shared/interfaces/training.type'
import { Observable, BehaviorSubject } from 'rxjs';
import { TrainingService } from '../../../shared/services/training.service';
import { FileService } from '../../../shared/services/file.service';
import { FileModel } from '../../../shared/interfaces/file.type';
import { ScrollToAnimationEasing, ScrollToOffsetMap } from '@nicky-lenaers/ngx-scroll-to';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'mtd-training-basic',
  templateUrl: './training-basic.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./training-basic.component.css']
})
export class TrainingBasicComponent implements OnInit, AfterViewInit {

  trainings$: Observable<TrainingModel[]>;
  files$: Observable<FileModel[]>;
  action$: Observable<string>;

  @ViewChild('toc', { static: false }) toc: ElementRef;

  // the following 2 variables warrant a brief description
  // Each page in a training object will have a corresponding document stream 
  sF$: Observable<FileModel>;
  sFI$: Observable<number>;
  showEditor$: Observable<boolean>;

  selectedTraining$: Observable<TrainingModel>;
  selectedTrainingIndex$: Observable<number>;
  selectedTrainingIndex;
  currentPageIndex = 0;
  currentPage: Page;
  currentPortletIndex = 0;
  currentPortlet: Portlet;
  fontSize = 10;
  selectedTraining: TrainingModel;
  trainingTpl: TrainingModel;
  imageWidth;
  currentTemplate;
  isFileSelectModalVisible = false;
  isIconSelectModalVisible = false;
  fallbackIcon = 'fa fa-graduation-cap';
  bannerImage$: Observable<FileModel>;
  headerOpen = false;
  mode = 'edit';
  fullscreen = false;
  rating = 0;
  trainings: TrainingModel[];
  iconSearchStr = '';
  previewDocTypes: string[] = ['pdf', 'doc', 'ppt', 'xls'];

  pageDocUrlHash = {};
  currentPageId = 'intro';
  dragging = false;
  currentEvent: any;
  startx;
  starty;

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

  offsetLeft;

  foo : boolean[][];

  public ngxScrollToDuration: number;
  public ngxScrollToEasing: ScrollToAnimationEasing;
  public ngxScrollToOffset = 60;


  constructor(private trainingService: TrainingService, private fileService: FileService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.showEditor$ = this.trainingService.getShowEditorStream();
    this.trainings$ = this.trainingService.getAllTrainingsObservable();
    this.files$ = this.fileService.getFilesStream();
    this.selectedTraining$ = this.trainingService.getSelectedTrainingStream();
    this.selectedTrainingIndex$ = this.trainingService.getSelectedTrainingIndexStream();
    this.action$ = this.trainingService.getActionStream();
    this.selectedTraining$.subscribe(training => {

      if (!training) {
        return;
      }

      this.selectedTraining = training;
      for (const page of training.pages) {
        for (const portlet of page.portlets) {
          this.fileService.setupPrivateDocumentStream(portlet._id);
          this.fileService.setupPrivateSelectedFileStream(portlet._id);
          this.fileService.setupPrivateSelectedFileIndexStream(portlet._id);

          if (!portlet.file) {
            console.log('ERROR: TrainingBasicComponent:ngOnInit - no document set on training', training.title);
          } else {
            this.pageDocUrlHash[page._id] = this.fileService.getSafeUrl(portlet.file);

            this.fileService.selectItemById(portlet.file, portlet._id);
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

    });
    this.selectedTrainingIndex$.subscribe(index => {
      this.selectedTrainingIndex = index;
    });

    this.ngxScrollToDuration = 1000;
    this.ngxScrollToEasing = 'easeOutCubic';
    this.ngxScrollToOffset = 0;

    this.trainings$.subscribe(trainingList => {
      this.trainings = trainingList;
    })
  }

  ngAfterViewInit() {
    if (this.toc) {
      this.offsetLeft = this.toc.nativeElement.offsetLeft;
      console.log('ngAfterViewInit', this.offsetLeft);
    }
  }

  onIconPickerSelect(icon) {
    if (!this.selectedTraining) {
      console.log('onIconPickerSelect: selectedTraining is null', this.selectedTraining);
    }
    this.selectedTraining.iconClass = icon;
    this.contentChanged(icon, 'iconClass');
  }

  onColorChange(newColor) {
    this.selectedTraining.iconColor = newColor;
    this.contentChanged(newColor, 'iconColor');
  }

  setBannerImage() {
    //    this.fileService.openPicker();
  }

  selectFile(file: FileModel, index: number) {
    this.currentPortlet.file = file._id;
    this.isFileSelectModalVisible = false;
    if (file.iconType === 'video') {
      this.fileService.selectItem(index, this.currentPortlet._id);
    } else {
      this.fileService.selectItem(index, this.currentPortlet._id);
      this.trainingService.saveTraining(this.selectedTraining);
      //      this.pageDocUrlHash[this.currentPage._id] = this.fileService.getSafeUrl(this.currentPage.file);

//        this.fileService.selectItem(index, this.currentPage._id);
    }
  }

  postFileSelectionModal(portlet: Portlet) {
    this.isFileSelectModalVisible = true;
    this.currentPortlet = portlet;
  }

  createTraining() {
    this.trainingService.createTraining(this.selectedTraining);

  }

  headerActiveChange() {
    this.headerOpen = !this.headerOpen;
  }

  addFinalAssessment(i) {
  }

  addPortlet(pageIndex) {
    const newPortlet = <Portlet>{
      _id: String(new Date().getTime()),
      title: 'New Portlet',
      intro: 'This is an introduction to this portlet',
      file: '',
      width: 400,
      height: 400,
      xLoc: 200,
      yLoc: 200
    };
    this.selectedTraining.pages[pageIndex].portlets.push(newPortlet);
    this.fileService.setupPrivateSelectedFileStream(newPortlet._id);
    this.fileService.setupPrivateSelectedFileStream(newPortlet._id);
    this.fileService.setupPrivateSelectedFileIndexStream(newPortlet._id);

    this.trainingService.saveTraining(this.selectedTraining);
    //    this.fileService.selectItemById(newPage.file, newPage._id);
  }

  setContent(portlet: Portlet) {
    this.postFileSelectionModal(portlet);

  }

  deletePage(i) {
    this.selectedTraining.pages.splice(i, 1);
    this.trainingService.saveTraining(this.selectedTraining);
  }

  close() {
    this.trainingService.changeEditorVisualState(false);
    this.fullscreen = false;
  }

  handleCancel() {
    this.isFileSelectModalVisible = false;
  }

  deleteItemConfirm() {
    this.trainingService.deleteTraining(this.selectedTraining._id);
  }

  deleteItemCancel() {

  }

  setMode(mode) {
    this.trainingService.setViewMode(mode);
    this.mode = mode;
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
    this.isIconSelectModalVisible = false;
  }

  handleIconSelectConfirm() {
    this.isIconSelectModalVisible = false;
  }

  setIcon($event) {
    this.selectedTraining.iconClass = $event;
    this.trainingService.saveTraining(this.selectedTraining);
    this.isIconSelectModalVisible = false;
  }

  setCurrentPage(pageId) {
    console.log('setCurrentPage', pageId);
    this.currentPageId = pageId;
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
/*
  addAssessmentItem() {
    if (!this.selectedTraining.assessment) {
      this.selectedTraining.assessment = null;
    }
    this.selectedTraining.assessment.items.push(this.newItem);
    this.trainingService.saveTraining(this.selectedTraining);
  }
 */
}
