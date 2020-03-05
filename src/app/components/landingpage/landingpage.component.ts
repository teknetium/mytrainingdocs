import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { UserModel } from '../../shared/interfaces/user.type';
import { Router } from '@angular/router';
import { ScrollToAnimationEasing, ScrollToOffsetMap } from '@nicky-lenaers/ngx-scroll-to';
import { VgAPI } from 'videogular2/compiled/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { TrainingService } from '../../shared/services/training.service';


@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class LandingpageComponent implements OnInit {

  vgApi: VgAPI;
  taskVideo$: Observable<SafeResourceUrl>;
  showTaskVideoModal = false;

  benefits = [
    {
      focus: false,
      title: 'Safe & Secure',
      class: 'fal fa-shield-check text-yellow bg-yellow-opacity',
      blurb: 'Your training content is safe and secure in our training repository which you, and only you can access from any where at any time.',
      learnMore: ''
    },
    {
      focus: false,
      title: 'Saves Time & Resources',
      class: 'fal fa-clock text-blue bg-blue-opacity',
      blurb: 'Your entire team and all of your training content will be up and running in less than 30 minutes!',
      learnMore: ''
    },
    {
      focus: false,
      title: 'Automated Reporting',
      class: 'fal fa-chart-bar text-purple bg-purple-opacity',
      blurb: 'Track training status, due dates, certification expiration dates, ' +
        'and more.  All delivered to you at your timing without ever logging into the site.',
      learnMore: ''
    },
    {
      focus: false,
      title: 'Reduced Legal Liability',
      class: 'fal fa-balance-scale-right text-danger bg-danger-opacity',
      blurb: 'Reduced legal exposure KNOWING that all employees and volunteers are appropriately trained/certified.',
      learnMore: ''
    },
    {
      focus: false,
      title: 'Not Just for Employees',
      class: 'fal fa-hands-helping text-dark bg-dark-opacity',
      blurb: 'Lets you manage volunteer and customer training too!',
      learnMore: ''
    },
    {
      focus: false,
      title: 'Supports Common Document Formats',
      class: 'fal fa-file-check purple2',
      blurb: 'View your training documents without the application that created them.',
      learnMore: ''
    },
    {
      focus: false,
      title: 'Fast, Easy Deployment',
      class: 'fal fa-shipping-fast orange',
      blurb: 'Our unique deployment model has each manager responsible for the setup of their team and their trainings, all in less than 30 minutes!',
      learnMore: ''
    }
    /*
    {
      focus: false,
      title: 'Simple and Easy',
      class: 'fal fa-pie text-green bg-green-opacity',
      blurb: 'Simplicity and ease-of-use are at the heart of each one of the benefits enumerated here.',
      learnMore: ''
    },
     */
  ];

  panels = [
    {
      active: false,
      question: 'What types of content does myTrainingdocs support?',
      answer: `myTrainingdocs supports all common document, image, video, and audio formats.  It also supports
      the embedding of extenal websites.`
    },
    {
      active: false,
      question: 'Where does myTrainingdocs store my content?',
      answer: `myTrainingdocs stores all uploaded documents, video, audio, and images in our private, secure
      cloud based repository.`
    },
    {
      active: false,
      question: 'Do I have to manage my training content locally after I have started using myTrainingdocs?',
      answer: `No.  Once your content has been uploaded, mytrainingdocs becomes the place of record for that content.`
    },
    {
      active: false,
      question: 'How do I update the content of a document I have uploaded into myTrainingdocs?',
      answer: `You simply download the document, modify it, and re-upload it.  myTrainingdocs saves
      all old versions.`
    } 
  ];

  plans: string = "monthly"

  duration: string = "month";

  feesBasic: number = 18;
  feesStandard: number = 15;


  destinations = {
    home: {
      ngxScrollToDestination: 'home'
    },
    benefits: {
      ngxScrollToDestination: 'benefits'
    },
    price: {
      ngxScrollToDestination: 'price'
    },
    faq: {
      ngxScrollToDestination: 'faq'
    },
    contact: {
      ngxScrollToDestination: 'contact'
    },
  };
  placement = 'top';

  public ngxScrollToDestination: string;
  public ngxScrollToDuration: number;
  public ngxScrollToEasing: ScrollToAnimationEasing;
  public ngxScrollToOffset: number;

  authenticatedUser$: Observable<UserModel>;
  benefitBS$ = new BehaviorSubject<{ focus: boolean, title: string, class: string, blurb: string, learnMore: string }>(null);
  benefit$: Observable<{ focus: boolean, title: string, class: string, blurb: string, learnMore: string }>;
  visible = false;
  authenticatedUser: UserModel;
  currentFocusIndex = -1;
  carouselDelay = 5000;
  currentHowStep = 0;
  howStepCount;
  timerCnt = 0;
  currentHowMsg: string;
  sub1: Subscription;

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private trainingService: TrainingService,
    private router: Router) {


    this.ngxScrollToDuration = 2000;
    this.ngxScrollToEasing = 'easeOutCubic';
    this.ngxScrollToOffset = 0;
  }

  ngOnInit() {
    /*
    this.taskVideo$.subscribe(safeUrl => {
      if (!safeUrl) {
        return;
      }
      this.showTaskVideoModal = true;
    });
    */
    /*
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.authenticatedUser$.subscribe(user => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
      this.router.navigate(['/home']);
    });
*/

    /*
    setInterval(() => {
      this.setCurrentHowStep(this.timerCnt);
      this.timerCnt++;
      if(this.timerCnt === this.howStepCount - 1) {
        this.timerCnt = 0;
      }
    }, 7000);
    this.setCurrentHowStep(0);

     */
  }

  showLearnMore(index) {
    this.benefitBS$.next(this.benefits[index]);
    this.visible = true;
  }
  /*
    setCurrentHowStep(index): void {
      this.currentHowStep = index;
      this.currentHowMsg = this.howItWorks[index].description;
    }
  */
  start() {
    this.carouselDelay = 6000;
  }

  stop() {
    this.carouselDelay = 0;
  }

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  scrollTo(dest: string) {
    this.ngxScrollToDestination = this.destinations[dest].ngxScrollToDestination;
  }

  focus(index) {
    this.currentFocusIndex = index;
    this.benefits[this.currentFocusIndex].focus = true;
  }

  loseFocus(index) {
    this.currentFocusIndex = -1;
    this.benefits[index].focus = false;
  }

  planChange() {
    if (this.plans == 'annually') {
      this.feesBasic = 180;
      this.feesStandard = 144;
      this.duration = 'year';
    } else {
      this.feesBasic = 18;
      this.feesStandard = 15;
      this.duration = 'month';
    }
  }

  closeTaskVideoModal() {
    this.showTaskVideoModal = false;
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

  hasFocus(index): boolean {
    return this.benefits[index].focus;
  }

  signup() {
    this.auth.signup();
  }
  login() {
    this.auth.login();
  }
}
