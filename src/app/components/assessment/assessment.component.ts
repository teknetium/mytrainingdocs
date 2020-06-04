import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Assessment, AssessmentItem } from '../../shared/interfaces/training.type';
import { Observable } from 'rxjs';
import { AssessmentService } from 'src/app/shared/services/assessment.service';
import { BaseComponent } from '../base.component';
import { takeUntil } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TrainingModel } from 'src/app/shared/interfaces/training.type';
import { TrainingService } from '../../shared/services/training.service';

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.css'],
  animations: [
    trigger('tocToggle', [
      // ...
      state('closed', style({
        'margin-left': '-200px'
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
export class AssessmentComponent extends BaseComponent implements OnInit {
  assessment: Assessment;
  assessment$: Observable<Assessment>;
  selectedTraining$: Observable<TrainingModel>;
  selectedTraining: TrainingModel;
  assessmentResponseHash = {};
  assessmentResponse = [];
  showNext = false;
  currentAssessmentItemIndex;
  answerIsCorrect: boolean;
  assessmentCorrectCnt;
  score;
  assessmentIncorrectCnt;
  currentQuestion: AssessmentItem = {
    question: '',
    choices: [],
    correctChoice: -1
  }
  questionEditorVisible = false;
  alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  assessmentInProgress = false;
  assessmentComplete = false;
  passedAssessment = false;
  slideNewQuestionHash = {};
  @Output() assessmentResult = new EventEmitter<{ tid: string, score: number, pass: boolean }>();
  currentQuestionIndex = -1;
  currentCorrectChoice: string;


  constructor(private assessmentService: AssessmentService, private trainingService: TrainingService) {
    super();
    this.selectedTraining$ = this.trainingService.getSelectedTrainingStream();
    this.assessment$ = this.assessmentService.getAssessmentStream();
  }

  ngOnInit(): void {
    this.assessment$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(assessment => {
      this.assessment = assessment;
    });
    this.selectedTraining$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(selectedTraining => {
      this.selectedTraining = selectedTraining;
    });
  }
  
  addNewQuestion() {

    this.questionEditorVisible = true;
    let newQuestionIndex = this.assessment.items.length;
    let newItem = {
      question: '',
      choices: [],
      correctChoice: -1
    };

    this.assessment.items.push(newItem);
    this.editQuestion(newQuestionIndex);
  }

  addNewChoice(event, itemIndex) {
    const newChoice = 'New Choice';
    this.assessment.items[itemIndex].choices.push(newChoice);
  }

  questionChanged(event, item, itemIndex) {

    console.log('questionChanged', item, itemIndex);
    this.assessment.items[itemIndex] = item;
  }

  choiceContentChanged(event, choice: string, itemIndex: number, choiceIndex: number) {
    console.log('choiceContentChanged', event);
    this.assessment.items[itemIndex].choices[choiceIndex] = choice;
  }

  correctChoiceChanged(event, item, itemIndex) {
    this.assessment.items[itemIndex] = item;
  }

  answeredQuestion(itemIndex) {
    this.showNext = true;
    if (this.assessmentResponseHash[this.currentAssessmentItemIndex] === this.assessment.items[itemIndex].correctChoice) {
      this.answerIsCorrect = true;
      this.assessmentCorrectCnt++;
      this.score = (this.assessmentCorrectCnt / this.assessment.items.length) * 100;
    } else {
      this.answerIsCorrect = false;
      this.assessmentIncorrectCnt++;
    }
  }


  resetAssessment() {
    this.showNext = false;
    this.assessmentInProgress = false;
    this.assessmentComplete = false;
    this.currentAssessmentItemIndex = -1;
    this.passedAssessment = false;
    this.assessmentCorrectCnt = 0;
    this.assessmentIncorrectCnt = 0;
    for (let i = 0; i < this.assessment.items.length; i++) {
      this.slideNewQuestionHash[i] = false;
      this.assessmentResponseHash[i] = null;
    }
  }

  nextQuestion() {
    this.slideNewQuestionHash[this.currentAssessmentItemIndex] = false;
    this.currentAssessmentItemIndex++;
    this.showNext = false;
    if (this.currentAssessmentItemIndex === this.assessment.items.length) {
      this.currentAssessmentItemIndex = -1;
      this.assessmentComplete = true;
      this.assessmentInProgress = false;
      this.score = (this.assessmentCorrectCnt / this.assessment.items.length) * 100.0;
      if (this.score < this.assessment.passingGrade) {
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
    for (let i = 0; i < this.assessment.items.length; i++) {
      this.assessmentResponseHash[i] = null;
    }
    this.slideNewQuestionHash[this.currentAssessmentItemIndex] = true;
  }

  assessmentChanged(event) {
    this.assessment.passingGrade = event;
    this.assessmentService.updateAssessment(this.assessment);
  }


  updateQuestion() {
    this.currentQuestion.correctChoice = Number(this.currentCorrectChoice);
    this.assessment.items[this.currentQuestionIndex] = this.currentQuestion;
    console.log('updateQuestion', )
    this.assessmentService.updateAssessment(this.assessment);
    this.questionEditorVisible = false;
  }

  handleQuestionEditCancel() {
    this.questionEditorVisible = false;
  }

  editQuestion(itemIndex) {
    this.currentQuestion = {
      question: this.assessment.items[itemIndex].question,
      choices: this.assessment.items[itemIndex].choices,
      correctChoice: this.assessment.items[itemIndex].correctChoice
    }
    this.currentCorrectChoice = this.assessment.items[itemIndex].correctChoice.toString();
    this.currentQuestionIndex = itemIndex;
    this.questionEditorVisible = true;
  }
}
