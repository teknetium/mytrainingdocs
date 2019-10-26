import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserModel } from '../../../shared/interfaces/user.model';
import { TrainingModel } from '../../../shared/interfaces/training.type';
import { SafeResourceUrl } from '@angular/platform-browser';
import { TrainingService } from '../../../shared/services/training.service';
import { UserService } from '../../../shared/services/user.service';
import { FileService } from '../../../shared/services/file.service';
import { NzInputNumberComponent } from 'ng-zorro-antd';

@Component({
  selector: 'mtd-training-detail',
  templateUrl: './training-detail.component.html',
  styleUrls: ['./training-detail.component.css']
})
export class TrainingDetailComponent implements OnInit {

  private disableBS$ = new BehaviorSubject<boolean>(true);

  disable$: Observable<boolean>;
  authenticatedUser$: Observable<UserModel>;
  selectedTraining$: Observable<TrainingModel>;
  filesForSelect$: Observable<{label: string, value: string}[]>;
  tagsForSelect$: Observable<{label: string, value: string}[]>;
  showStatus$: Observable<boolean>;
  status$: Observable<{color: string, msg: string}>;
  showSelectedItem$: Observable<boolean>;
  showSelectedIndexFeedback$: Observable<boolean>;
  action$: Observable<string>;

  private trainingForm: FormGroup;
  private iconColor: string;
  private iconClass: string;
  private authenticatedUser: UserModel;
  private selectedTraining: TrainingModel;
  private statusType = 'success';
  action = 'new';
  private submitLabel = 'Save';
  private fallbackIcon = '';

  constructor(
    private formBuilder: FormBuilder,
    private trainingService: TrainingService,
    private userService: UserService,
    private fileService: FileService,
  ) {
    this.filesForSelect$ = this.fileService.getFileOptionsStream();
    this.status$ = this.trainingService.getStatusStream();
    this.disable$ = this.disableBS$.asObservable();
  }

  ngOnInit() {
    this.trainingForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      type: ['', [Validators.required]],
      description: ['', [Validators.required]],
      iconClass: ['', [Validators.required]],
      iconColor: ['', [Validators.required]],
      estimatedTimeToComplete: ['', [Validators.required]],
//      tags: [''],
    });
    this.selectedTraining$ = this.trainingService.getSelectedTrainingStream();
    this.selectedTraining$.subscribe((item) => {
      if (item) {
        if (this.action !== 'new') {
          this.trainingService.setAction('initializing');
        }
        this.selectedTraining = Object.assign({}, item);
        this.iconClass = item.iconClass;
        this.iconColor = item.iconColor;
        this.trainingForm.patchValue({
          _id: this.selectedTraining._id,
          type: this.selectedTraining.type,
          title: this.selectedTraining.title,
          teamId: this.selectedTraining.teamId,
          owner: this.selectedTraining.owner,
          dateCreated: this.selectedTraining.dateCreated,
          estimatedTimeToComplete: this.selectedTraining.estimatedTimeToComplete,
          description: this.selectedTraining.description,
          image: this.selectedTraining.image,
          iconClass: this.selectedTraining.iconClass,
          iconColor: this.selectedTraining.iconColor,
          sections: this.selectedTraining.sections,
          assessment: this.selectedTraining.assessment,
          tags: this.selectedTraining.tags,
        });

        for (const key in this.trainingForm.controls) {
          if (this.trainingForm.controls.hasOwnProperty(key)) {
            this.trainingForm.controls[key].markAsPristine();
            this.trainingForm.controls[key].markAsUntouched();
            this.trainingForm.controls[key].updateValueAndValidity();
          }
        }
        this.trainingForm.markAsPristine();
        this.trainingForm.markAsUntouched();

        if (this.action !== 'new') {
          this.action = 'edit';
        }

      } else {
        for (const key in this.trainingForm.controls) {
          if (this.trainingForm.controls.hasOwnProperty(key)) {
            this.trainingForm.controls[key].markAsPristine();
            this.trainingForm.controls[key].markAsUntouched();
            this.trainingForm.controls[key].updateValueAndValidity();
          }
        }

      }


    });

    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.authenticatedUser$.subscribe((user) => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
    });
//    this.status$ = this.trainingService.getStatusStream();
//    this.showStatus$ = this.trainingService.getShowStatusStream();
    this.showSelectedItem$ = this.trainingService.getShowSelectedItemStream();
    this.showSelectedIndexFeedback$ = this.trainingService.getShowSelectedIndexFeedbackStream();
    this.action$ = this.trainingService.getActionStream();
    this.action$.subscribe( data => {
      console.log('action$:', data);

      this.action = data;
      if (this.action === 'new') {
        this.submitLabel = 'Create Training';
      } else if (this.action === 'edit') {
        this.submitLabel = 'Save';
      }
    });
  }

  get f() {
    return this.trainingForm.controls;
  }

  get tags() {
    return this.trainingForm.get('tags') as FormArray;
  }

  onIconPickerSelect(icon: string): void {
    this.iconClass = icon;
    this.trainingForm.controls.iconClass.setValue(icon);
    if (this.action === 'initializing') {
      console.log('ICON PICKER...initializing');
      this.trainingForm.controls.iconClass.markAsPristine();
      this.trainingService.setAction('edit');
    } else {
      console.log('ICON PICKER...  NOT  initializing', this.action);
      this.trainingForm.controls.iconClass.markAsDirty();
    }
    this.trainingForm.controls.iconClass.updateValueAndValidity();
  }

  onColorChange(color: string): void {
    this.trainingForm.controls.iconColor.setValue(color);
    if (this.action === 'initializing') {
      this.trainingForm.controls.iconColor.markAsPristine();
    } else {
      this.trainingForm.controls.iconColor.markAsDirty();
    }
    this.trainingForm.controls.iconColor.updateValueAndValidity();
  }

  submitForm = ($event: any, value: any) => {

    $event.preventDefault();

    for (const key in this.trainingForm.controls) {
      if (this.trainingForm.controls.hasOwnProperty(key)) {
        this.trainingForm.controls[key].markAsDirty();
        this.trainingForm.controls[key].updateValueAndValidity();
      }
    }

    const tags: string[] = [];
    const files: string[] = [];

    for (const item of value.files) {
      files.push(item);
    }

    // update the selected data item with the new data
    if (this.selectedTraining) {
      this.selectedTraining.title = value.title;
      this.selectedTraining.type = value.type;
      this.selectedTraining.teamId = 
      this.selectedTraining.description = value.description;
      this.selectedTraining.iconClass = this.iconClass;
      this.selectedTraining.iconColor = this.iconColor;
      this.selectedTraining.estimatedTimeToComplete = value.estimatedTimeToComplete;
      this.selectedTraining.sections = value.sections;
      this.selectedTraining.assessment = value.assessment;
      this.selectedTraining.tags = value.tags;
      this.selectedTraining.image = value.image;

      console.log('in Submit', this.action);

      if (this.action === 'new') {
        this.trainingService.createTraining(this.selectedTraining);
      } else {
        this.trainingService.saveTraining(this.selectedTraining);
      }

//      this.resetForm(null);
    }

    for (const key in this.trainingForm.controls) {
      if (this.trainingForm.controls.hasOwnProperty(key)) {
        this.trainingForm.controls[key].markAsPristine();
        this.trainingForm.controls[key].updateValueAndValidity();
      }
    }
  };


  resetForm(e: MouseEvent): void {
    if (e) {
      e.preventDefault();
    }

    this.disableBS$.next(true);
    this.iconClass = 'fas fa-user';
    this.iconColor = 'black';
    this.trainingService.selectItem(-1);
    this.trainingForm.reset();
    for (const key in this.trainingForm.controls) {
      if (this.trainingForm.controls.hasOwnProperty(key)) {
        this.trainingForm.controls[key].markAsPristine();
        this.trainingForm.controls[key].updateValueAndValidity();
      }
    }
  }

  deleteCancel() {

  }

  cancel(): void {
    this.trainingService.selectItem(-1);
  }

  viewTraining() {

  }

  deleteConfirm(): void {

    this.trainingForm.reset();
    /*
    for (const key in this.trainingForm.controls) {
      if (this.trainingForm.controls.hasOwnProperty(key)) {
        this.trainingForm.controls[key].markAsPristine();
        this.trainingForm.controls[key].updateValueAndValidity();
      }
    }
     */

    this.trainingService.deleteTraining(this.selectedTraining._id);
  }
}
