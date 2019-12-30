import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {BehaviorSubject, Observable, Observer} from 'rxjs';
import { UserModel } from '../../../shared/interfaces/user.model';
import { UserService } from '../../../shared/services/user.service';
import { TrainingService } from '../../../shared/services/training.service';

@Component({
  selector: 'mtd-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {

  userTypes = [
    {
      name: 'employee',
      iconClass: 'fas fa-user',
    },
    {
      name: 'volunteer',
      iconClass: 'far fa-user',
    },
    {
      name: 'customer',
      iconClass: 'fas fa-user-tie',
    },
  ];

  trainingStatus = [
    {
      status: 'uptodate',
      color: 'green'
    },
    {
      status: 'pastdue',
      color: 'red'
    },
  ];

  userForm: FormGroup;
  userTags$: Observable<{ label: string, value: string }[]>;
  resources$: Observable<{ label: string, value: string }[]>;
  iconColor: string;
  iconClass = '';
  authenticatedUser$: Observable<UserModel>;
  authenticatedUser: UserModel;
  selectedUser$: Observable<UserModel>;
  trainingsForSelect$: Observable<{label: string, value: string}[]>;
  selectedUserIndex$: Observable<number>;
  fallbackIcon = 'fas fa-user';
  icon: string;
  showInfoPanel = true;
  status$: Observable<{color: string, msg: string}>;
  selectedUserId: string;
  selectedUser: UserModel;
  newUser: UserModel;
  title$: Observable<string>;
  showStatus$: Observable<boolean>;
  showSelectedItem$: Observable<boolean>;
  statusType = 'success';
  saveButtonLabel = 'Save';
  deleteButtonLabel = 'Delete';
  userTypeHash: {} = {};
  trainingStatusHash: {} = {};
  userTypeValue = 'employee';
  action$: Observable<string>;
  action = '';
  userRoles: {name: string, description: string, dataRoutes: string[], iconClass: string, iconColor: string}[];
  saveNeeded = false;
  isConfirmDeleteModalVisible = false;
  deleteEvent: any;
  disableDelete = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private trainingService: TrainingService) {
    this.selectedUser$ = this.userService.getSelectedUserStream();
    this.title$ = this.userService.getTitleStream();
    this.trainingsForSelect$ = this.trainingService.getTrainingOptionsStream();
  }

  ngOnInit() {
    this.userForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      userType: ['', [Validators.required]],
      email: ['', Validators.required],
      userStatus: ['', Validators.required],
      trainingStatus: ['',Validators.required],
      profilePicUrl: [''],
      supervisor: [''],
//      trainings: ['',Validators.required],
      tags: [''],
    });

    this.selectedUser$.subscribe((item) => {
      if (item) {
        this.selectedUserId = item._id;

        // Here we clone the object so we are not fucking with the actual selected object
        this.selectedUser = Object.assign({}, item);

        this.userForm.patchValue({
          firstName: item.firstName,
          lastName: item.lastName,
          userType: item.userType,
          email: item.email,
          userStatus: item.userStatus,
          trainingStatus: item.trainingStatus,
          jobTitle: item.jobTitle,
          profilePicUrl: item.profilePicUrl,
          supervisorId: item.supervisorId,
          _id: item._id,
        });
      }
    });
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.authenticatedUser$.subscribe((user) => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
    });

    for (const userType of this.userTypes) {
      this.userTypeHash[userType.name] = userType;
    }

    for (const item of this.trainingStatus) {
      this.trainingStatusHash[item.status] = item;
    }
    this.action$ = this.userService.getActionStream();
    this.action$.subscribe( data => {
      this.action = data;
      if (this.action === 'new') {
        this.disableDelete = true;
      } else {
        this.disableDelete = false;
      }
    })

  }

  get f() {
    return this.userForm.controls;
  }

  get tags() {
    return this.userForm.get('tags') as FormArray;
  }

  showDeleteModal($event): void {
    $event.preventDefault();

    this.isConfirmDeleteModalVisible =  true;
    this.deleteEvent = $event;
  }

  handleCancel(): void {
    this.isConfirmDeleteModalVisible = false;
  }

  handleOk(): void {
    this.delete(this.deleteEvent);
    this.isConfirmDeleteModalVisible = false;
  }

  submitForm = ($event: any, value: any) => {
    $event.preventDefault();
    for (const key in this.userForm.controls) {
      if (this.userForm.controls.hasOwnProperty(key)) {
        this.userForm.controls[key].markAsDirty();
        this.userForm.controls[key].updateValueAndValidity();
      }
    }

    // update the selected data item with the new data
    this.selectedUser.firstName = value.firstName;
    this.selectedUser.lastName = value.lastName;
    this.selectedUser.userType = value.userType;
    this.selectedUser.email = value.email;
    this.selectedUser.teamId = value.teamId;
    this.selectedUser.userStatus = value.userStatus;
    this.selectedUser.trainingStatus = value.trainingStatus;
    this.selectedUser.profilePicUrl = value.profilePicUrl;
    this.selectedUser.supervisorId = value.supervisorId;

    console.log('submit user form', this.selectedUser);
    if (this.action && this.action === 'edit') {
      this.userService.updateUser(this.selectedUser);
    } else {
      this.userService.createNewUser(this.selectedUser);
    }

    this.userForm.reset();
    for (const key in this.userForm.controls) {
      if (this.userForm.controls.hasOwnProperty(key)) {
        this.userForm.controls[key].markAsPristine();
        this.userForm.controls[key].updateValueAndValidity();
      }
    }

  }

  resetForm(e: MouseEvent): void {
    e.preventDefault();
    this.userForm.reset();
    for (const key in this.userForm.controls) {
      if (this.userForm.controls.hasOwnProperty(key)) {
        this.userForm.controls[key].markAsPristine();
        this.userForm.controls[key].updateValueAndValidity();
      }
    }
  }

  cancel(e: MouseEvent): void {
    e.preventDefault();
    this.userForm.reset();
    for (const key in this.userForm.controls) {
      if (this.userForm.controls.hasOwnProperty(key)) {
        this.userForm.controls[key].markAsPristine();
        this.userForm.controls[key].updateValueAndValidity();
      }
    }
  }

  delete(e: MouseEvent): void {
    e.preventDefault();

    console.log('deleting ...', this.selectedUser);
    this.userService.deleteUser(this.selectedUser._id);
    this.userForm.reset();
  }

}
