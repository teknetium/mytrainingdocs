import { Component, OnInit, Input } from '@angular/core';
import { FileService } from '../../../shared/services/file.service';
import { TrainingService } from '../../../shared/services/training.service';
import { Observable } from 'rxjs';
import { TrainingModel, Page, Portlet, Assessment } from 'src/app/shared/interfaces/training.type';
import { animate, state, style, transition, trigger } from '@angular/animations';

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
  showEditor$: Observable<boolean>;
  currentPageId = 'intro';
  isOpen = true;
  pageContainerMarginLeft = '270';
  selectedTraining: TrainingModel;
  fullscreen = false;

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


  @Input() mode = 'view';
  pageDocUrlHash = {};


  styleMap = new Map();
  constructor(private trainingService: TrainingService, private fileService: FileService) { }

  ngOnInit() {
    this.selectedTraining$ = this.trainingService.getSelectedTrainingStream();
    this.showEditor$ = this.trainingService.getShowEditorStream();
    this.selectedTraining$.subscribe(training => {

      this.selectedTraining = training;
      if (training) {
        for (const page of training.pages) {
          for (const portlet of page.portlets) {
            this.fileService.setupPrivateDocumentStream(portlet._id);
            //          this.fileService.setupPrivateSelectedFileStream(portlet._id);
            //          this.fileService.setupPrivateSelectedFileIndexStream(portlet._id);

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
      }

    });

    /*
    this.showEditor$.subscribe(
      res => {
        this.isOpen = res;
      }
    )
*/

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

  onColorChange(newColor) {
    this.selectedTraining.iconColor = newColor;
    this.contentChanged(newColor, 'iconColor');
  }

  setCurrentPage(pageId) {
    console.log('setCurrentPage', pageId);
    this.currentPageId = pageId;
  }

  setIcon(event) {
    this.selectedTraining.iconClass = event;
    this.trainingService.saveTraining(this.selectedTraining);
    this.isIconSelectModalVisible = false;
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

}


