import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { TrainingModel } from '../../../shared/interfaces/training.type'
import { Observable } from 'rxjs';
import { TrainingService } from '../../../shared/services/training.service';
import { FileService } from '../../../shared/services/file.service';
import { FileModel } from '../../../shared/interfaces/file.type';
import { Section } from '../../../shared/interfaces/training.type';

@Component({
  selector: 'mtd-training-basic',
  templateUrl: './training-basic.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./training-basic.component.css']
})
export class TrainingBasicComponent implements OnInit {

  trainings$: Observable<TrainingModel[]>;
  files$: Observable<FileModel[]>;

  selectedTraining$: Observable<TrainingModel>;
  currentSectionIndex = 0;
  fontSize = 10;
  selectedTraining: TrainingModel;
  imageWidth;
  currentTemplate;
  isFileSelectModalVisible = false;
  selectedFileIndex = -1;
  collapsePanelHeight = [200];

  constructor(private trainingService: TrainingService, private fileService: FileService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.trainings$ = this.trainingService.getAllTrainingsObservable();
    this.files$ = this.fileService.getFilesStream();
    this.selectedTraining$ = this.trainingService.getSelectedTrainingStream();

    this.selectedTraining$.subscribe(training => {
      if (!training) {
        return;
      }

      this.selectedTraining = training;
    })

    this.trainingService.addNewTraining();
  }

  selectFile(file: FileModel, index) {
    this.selectedFileIndex = index;
    this.selectedTraining.sections[this.currentSectionIndex].files.push(file._id);
    this.collapsePanelHeight[this.currentSectionIndex] = 500;
    this.isFileSelectModalVisible = false;
    this.cd.detectChanges();
  }

  saveTraining() {

  }

  activateSection(active, sectionIndex) {
    if (active) {
      this.currentSectionIndex = sectionIndex;
      this.fileService.selectFileById(this.selectedTraining.sections[sectionIndex].files[0]);
    }
  }

  addSectionAssessment(i) {
  }

  addFinalAssessment(i) {
  }

  addSection() {
    this.collapsePanelHeight.push(200);
    const newSection = <Section>{
        title: 'New Section',
        intro: 'This is an introduction to the first document in this section',
        files: [],
        assessment: null
    };
    this.selectedTraining.sections.push(newSection);
  }

  deleteContent(i) {
    this.selectedTraining.sections[i].files = [];
    this.collapsePanelHeight[i] = 200;
  }

  handleCancel() {
    this.isFileSelectModalVisible = false;
  }
}

