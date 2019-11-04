import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { TrainingModel, Section, Assessment } from '../../../shared/interfaces/training.type'
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
  // Each section in a training object will have a corresponding document stream 
  sF$: Observable<FileModel>;
  sFI$: Observable<number>;
  showEditor$: Observable<boolean>;

  selectedTraining$: Observable<TrainingModel>;
  selectedTrainingIndex$: Observable<number>;
  selectedTrainingIndex;
  currentSectionIndex = 0;
  currentSection: Section;
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

  sectionDocUrlHash = {};

  offsetLeft;

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
      for (const section of training.sections) {
        this.fileService.setupPDocStream(section._id);
        this.fileService.setupPSFStream(section._id);
        this.fileService.setupPSFIStream(section._id);

        if (!section.file) {
          console.log('ERROR: TrainingBasicComponent:ngOnInit - no document set on training', training.title);
        } else {
          this.sectionDocUrlHash[section._id] = this.fileService.getSafeUrl(section.file);

          this.fileService.selectItemById(section.file, section._id);
        }

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
    console.log('selectFile', this.currentSectionIndex, file);
    this.currentSection.file = file._id;
    this.isFileSelectModalVisible = false;
    if (file.iconType === 'video') {
      this.fileService.selectItem(index, this.currentSection._id);
    } else {
      this.fileService.selectItem(index, this.currentSection._id);
      this.trainingService.saveTraining(this.selectedTraining);
      //      this.sectionDocUrlHash[this.currentSection._id] = this.fileService.getSafeUrl(this.currentSection.file);

//        this.fileService.selectItem(index, this.currentSection._id);
    }
  }

  postFileSelectionModal(section: Section) {
    this.isFileSelectModalVisible = true;
    this.currentSection = section;
  }

  createTraining() {
    this.trainingService.createTraining(this.selectedTraining);

  }

  headerActiveChange() {
    this.headerOpen = !this.headerOpen;
  }

  addFinalAssessment(i) {
  }

  addSection() {
    const newSection = <Section>{
      _id: String(new Date().getTime()),
      title: 'New Section',
      intro: 'This is an introduction to the first document in this section',
      file: null,
    };
    this.selectedTraining.sections.push(newSection);
    this.fileService.setupPDocStream(newSection._id);
    this.fileService.setupPSFStream(newSection._id);
    this.fileService.setupPSFIStream(newSection._id);

    this.trainingService.saveTraining(this.selectedTraining);
    //    this.fileService.selectItemById(newSection.file, newSection._id);
  }

  setContent(section: Section) {
    this.postFileSelectionModal(section);

  }

  deleteSection(i) {
    this.selectedTraining.sections.splice(i, 1);
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

  sectionChanged(newVal: string, index: number, propName: string) {
    let section: Section;
    section = this.selectedTraining.sections[index];
    section[propName] = newVal;

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
    this.isIconSelectModalVisible = false;
  }

}
