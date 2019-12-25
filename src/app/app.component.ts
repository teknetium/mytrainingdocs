import { Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { AuthService } from './shared/services/auth.service';
import { TrainingService } from './shared/services/training.service';
import { UserService } from './shared/services/user.service';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { UserModel } from './shared/interfaces/user.model';
import { TrainingModel } from './shared/interfaces/training.type';
import { Router } from '@angular/router';
import { FileModel } from './shared/interfaces/file.type';
import { FileService } from './shared/services/file.service';
// import { Auth0ProfileModel } from './shared/models/auth0Profile.model';
import { NotificationService } from './shared/services/notification.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { LandingpageComponent } from './components/landingpage/landingpage.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('yogaPoses', [
      state('open', style({
        opacity: 1,

      })),
      state('closed', style({
        opacity: 0
      })),
      state('paused', style({
        opacity: 1,
        height: '120px',
      })),
      transition('open => closed', [
        animate('750ms')
      ]),
      transition('closed => open', [
        animate('750ms')
      ]),
      transition('* => paused', [
        animate('750ms')
      ])
    ]),
    trigger('getHelp', [
      // ...
      state('closed', style({
        height: '0',
      })),
      state('open', style({
        height: '150px',
      })),
      transition('open => closed', [
        animate('1s')
      ]),
      transition('closed => open', [
        animate('1s')
      ]),
    ]),
    trigger('viewHelpText', [
      // ...
      state('hidden', style({
        opacity: '.0',
        top: '5px',
        left: '200px'
      })),
      state('open', style({
        height: '200px',
        top: '40px',
        left: '-20px'
      })),
      transition('open => closed', [
        animate('.4s')
      ]),
      transition('closed => open', [
        animate('.4s')
      ]),
    ]),
  ]
})
export class AppComponent implements OnInit {

  isCollapsed = false;
  triggerTemplate: TemplateRef<void> | null = null;

  localFiles: FileModel[];

  uploadedFile$: Observable<FileModel>;
  selectedFileToEdit$: Observable<FileModel>;
  docUrl$: Observable<SafeResourceUrl>;
  isConfirmDeleteModalVisible = false;
  editId: string | null;


  userTypes = [
    {
      name: 'employee',
      iconClass: 'fa-fw fas fa-user',
    },
    {
      name: 'volunteer',
      iconClass: 'fa-fw far fa-user',
    },
    {
      name: 'customer',
      iconClass: 'fa-fw fas fa-user-tie',
    },
  ];
  userTypeHash: {} = {};

  fileIdToDelete: string;

  myTrainings$: Observable<TrainingModel[]>;
  allTrainings$: Observable<TrainingModel[]>;
  myTeam$: Observable<UserModel[]>;
  files$: Observable<FileModel[]>;
  isAuthenticated$: Observable<boolean>;

  list = new Array<any>([]);
  isLoggedIn = false;

  image$: Observable<string>;
  imageBS$ = new BehaviorSubject<string>('');
  isIn = true;
  pauseYoga = false;
  helpIsClosed = true;
  imageBase = '../assets/yoga';
  dogImageBase = '../assets/dog';
  yogaImage = '';
  useYogaImages = false;
  currentYogaImageNumber = 1;
  currentDogImageNumber = 1;
  numYogaImages = 28;
  themeValue = 'dogs';
  searchVisible: boolean = false;
  quickViewVisible: boolean = false;


  constructor(
    private authService: AuthService,
    private userService: UserService,
    private trainingService: TrainingService,
    private router: Router,
    private notificationService: NotificationService,
    private zorroNotificationService: NzNotificationService,
    private fileService: FileService,
  ) {
    this.image$ = this.imageBS$.asObservable();
  }

  ngOnInit(): void {
    this.myTeam$ = this.userService.getMyTeamStream();
    this.allTrainings$ = this.trainingService.getAllTrainingsObservable();
    this.myTrainings$ = this.trainingService.getMyTrainingsObservable();
    this.files$ = this.fileService.getFilesStream();
    this.isAuthenticated$ = this.authService.getIsAuthenticatedStream();

    this.currentYogaImageNumber = 0;

  };

  newTheme(val) {
    if (val === 'dogs') {
      this.useYogaImages = false;
    } else if (val === 'yoga') {
      this.useYogaImages = true;
    }
  }


  toString(file) {
//    return JSON.stringify(file);
    return '';
  }


  pauseYogaSequence() {
    this.pauseYoga = true;
  }

  toggleHelp() {
    this.helpIsClosed = !this.helpIsClosed;
  }

  save(i: number, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editId = '';
    this.fileService.saveFile(this.localFiles[i]);
  }

  handleCancel(): void {
    this.isConfirmDeleteModalVisible = false;
  }

  handleOk(): void {
    /*
    this.fileService.deleteFile(this.fileIdToDelete).subscribe(data => {
      this.fileService.loadData();
      this.zorroNotificationService.create('success', 'Delete Successful.', '');
    });
    this.isConfirmDeleteModalVisible = false;

     */
  }

  signup() {
    this.authService.signup();
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }
  searchToggle(): void {
    this.searchVisible = !this.searchVisible;
  }

  quickViewToggle(): void {
    this.quickViewVisible = !this.quickViewVisible;
  }

  notificationList = [
    {
      title: 'You received a new message',
      time: '8 min',
      icon: 'mail',
      color: 'ant-avatar-' + 'blue'
    },
    {
      title: 'New user registered',
      time: '7 hours',
      icon: 'user-add',
      color: 'ant-avatar-' + 'cyan'
    },
    {
      title: 'System Alert',
      time: '8 hours',
      icon: 'warning',
      color: 'ant-avatar-' + 'red'
    },
    {
      title: 'You have a new update',
      time: '2 days',
      icon: 'sync',
      color: 'ant-avatar-' + 'gold'
    }
  ];

}
