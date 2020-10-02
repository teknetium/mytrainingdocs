import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { UserModel } from '../../shared/interfaces/user.type';
import { Router } from '@angular/router';
import { ScrollToAnimationEasing } from '@nicky-lenaers/ngx-scroll-to';
import { VgAPI } from 'videogular2/compiled/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TrainingService } from '../../shared/services/training.service';


@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  animations: [
    trigger('videoSlide', [
      // ...
      state('closed', style({
        'margin-top': '-900px'
      })),
      state('open', style({
        'margin-top': '200px',
      })),
      transition('open => closed', [
        animate('300ms')
      ]),
      transition('closed => open', [
        animate('300ms')
      ]),
    ])
  ]
})

export class LandingpageComponent implements OnInit {

  vgApi: VgAPI;
  taskVideo$: Observable<SafeResourceUrl>;
  showTaskVideoModal = false;

  features = [
    {
      name: 'Multiple Training Types',
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`
    },
    {
      name: 'Training Versioning',
      description: ''
    },
    {
      name: 'Custom Notification Schedules',
      description: ''
    },
    {
      name: 'Multiple Assessments',
      description: ''
    },
    {
      name: 'Status Tracking',
      description: ''
    },
    {
      name: 'Dynamic/Interactive Org Chart',
      description: ''
    },
    {
      name: 'Multiple Assessments',
      description: ''
    },
    {
      name: 'Multiple Assessments',
      description: ''
    },
    {
      name: 'Multiple Assessments',
      description: ''
    },
  ]

  benefits = [
    {
      focus: false,
      title: 'Safe & Secure',
      class: 'fal fa-shield-check text-yellow bg-yellow-opacity',
      blurb: 'We have partnered with an industry leading content management company to ensure that your training content is safe and secure and available 24x7.',
      learnMore: ''
    },
    {
      focus: false,
      title: 'Assessments Made Easy',
      class: 'fal fa-file-certificate text-danger bg-danger-opacity',
      blurb: 'Assessments are critical to ensuring mastery of content as well as understanding the effectiveness of the training content itself.',
      learnMore: ''
    },
    {
      focus: false,
      title: 'Interactive Org Chart',
      class: 'fal fa-sitemap text-blue bg-blue-opacity',
      blurb: 'Understand your entire organization\'s training status at a glance.  Interact with users directly in the chart.',
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
      blurb: 'Deploy to your individual team or your entire organization in a matter of minutes, not weeks!',
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
      answer: `myTrainingdocs supports all common document, image, and video formats.  It also supports
      the embedding of extenal websites as well as the in-app creation of HTML documents.`
    },
    {
      active: false,
      question: 'Where does myTrainingdocs store my content?',
      answer: `myTrainingdocs stores all uploaded documents, video, and images in our private, secure
      cloud based repository.`
    },
    {
      active: false,
      question: 'Do I have to manage my training content locally after I have uploaded it into myTrainingdocs?',
      answer: `No, you do not need to keep your local copy.  You can download the file from the training template.`
    }
    /*
        {
          active: false,
          question: 'How do I update the content of a document I have uploaded into myTrainingdocs?',
          answer: `You simply download the document, modify it, and re-upload it.  myTrainingdocs saves
          all old versions.`
        } 
        */
  ];

  plans: string = "monthly"

  duration: string = "month";

  pricingModel = {
    'team': {
      monthly: 250,
      yearly: 2500
    },
    'org': {
      monthly: 750,
      yearly: 7000
    },
    'enterprise': {
      monthly: 1500,
      yearly: 14000
    }
  }

  destinations = {
    home: {
      ngxScrollToDestination: 'home'
    },
    features: {
      ngxScrollToDestination: 'features'
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
  explainerUrl = 'https://cdn.filestackcontent.com/kiKtqljARoygXbEeCN6V';
  orgChartUrl = 'https://cdn.filestackcontent.com/';
  trainingTemplateUrl = 'https://cdn.filestackcontent.com/';
  currentVideo;
  showYouTubeIcon = true;
  explainerVidIsVisible = false;
  planSelected = false;
  plan = '';


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
    this.currentVideo = this.explainerUrl;
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

  selectPlan(plan: string) {
    this.planSelected = true;
    this.plan = plan;
  }

  planChange() {
    if (this.plans == 'annually') {
      this.duration = 'year';
    } else {
      this.duration = 'month';
    }
  }

  closeTaskVideoModal() {
    this.showTaskVideoModal = false;
  }
  onPlayerReady(api: VgAPI) {
    this.vgApi = api;

    this.vgApi.getDefaultMedia().subscriptions.ended.subscribe(() => {
      //      this.playVideo.bind(this)
      this.explainerVidIsVisible = false;
    });

  }

  loadVideo(id) {
    this.currentVideo = id;
    this.explainerVidIsVisible = true;    
  }

  playVideo() {
    this.vgApi.play();
  }
  youtubePlayVideo() {
    this.showYouTubeIcon = false;
    this.vgApi.play();
  }

  hasFocus(index): boolean {
    return this.benefits[index].focus;
  }

  hiddenSignup() {
    this.auth.signup();
  }

  signup() {
    this.auth.signup();
  }
  login() {
    this.auth.login();
  }
}
