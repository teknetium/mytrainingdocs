import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {AuthService} from '../../shared/services/auth.service';
import {UserService} from '../../shared/services/user.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {UserModel} from '../../shared/interfaces/user.model';
import {Router} from '@angular/router';
import {ScrollToAnimationEasing, ScrollToOffsetMap} from '@nicky-lenaers/ngx-scroll-to';


@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class LandingpageComponent implements OnInit {

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
      question: 'What type of content does myTrainingdocs come with?',
      answer: 'myTrainingdocs does not come with any content preloaded.  You are responsible for uploading all the content your team uses.'
    },
    {
      active: false,
      question: 'How does myTrainingdocs handle document versioning?',
      answer: `<p>myTrainingdocs allows you to easily manage any number of versions of a given file.
      When uploading a new version, you choose the level of impact on the users
      <ul>
      <li>minor - No impact</li>
      <li>medium - Users are notified of the new content, but no action is required.</li>
      <li>major - Changes to the content are significant.  Training status is reset and all users must retake training. </li>
      </ul></p>`
    },
    {
      active: false,
      question: 'How is job information used by myTrainingdocs? ',
      answer: `We use Jobs to define, prioritize and set due dates for a set of trainings required for a given role in your team.  
      Changes made to job information are automatically propogated to all users associated with that job.`
    }
  ];

  plans:string = "monthly"

  duration:string = "month";

  feesBasic: number = 18;
  feesStandard: number = 15;


  destinations = {
    home:{
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
  benefitBS$ = new BehaviorSubject<{focus: boolean, title: string, class: string, blurb: string, learnMore: string}>(null);
  benefit$: Observable<{focus: boolean, title: string, class: string, blurb: string, learnMore: string}>;
  visible = false;
  authenticatedUser: UserModel;
  currentFocusIndex = -1;
  carouselDelay = 5000;
  currentHowStep = 0;
  howStepCount;
  timerCnt = 0;
  currentHowMsg: string;

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private router: Router)  {


    this.ngxScrollToDuration = 2000;
    this.ngxScrollToEasing = 'easeOutCubic';
    this.ngxScrollToOffset = 0;
  }

  ngOnInit() {
    this.authenticatedUser$ = this.userService.getAuthenticatedUserStream();
    this.authenticatedUser$.subscribe(user => {
      if (!user) {
        return;
      }
      this.authenticatedUser = user;
      this.router.navigate(['']);
    });

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
    } else  {
        this.feesBasic = 18;
        this.feesStandard = 15;
        this.duration = 'month';
    }
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
