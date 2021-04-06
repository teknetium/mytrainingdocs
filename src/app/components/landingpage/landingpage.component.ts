import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { UserModel } from '../../shared/interfaces/user.type';
import { Router, NavigationEnd, ActivatedRoute, NavigationCancel, NavigationStart, NavigationError, Event as NavigationEvent } from '@angular/router';
import { ScrollToAnimationEasing } from '@nicky-lenaers/ngx-scroll-to';
import { VgAPI } from 'videogular2/compiled/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TrainingService } from '../../shared/services/training.service';
import { filter, takeUntil } from 'rxjs/operators';
import { BaseComponent } from '../base.component';
import { map, shareReplay } from "rxjs/operators";


interface timeComponents {
  secondsToDday: number;
  minutesToDday: number;
  hoursToDday: number;
  daysToDday: number;
}

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

export class LandingpageComponent extends BaseComponent implements OnInit {

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
      title: 'One Click Deploy',
      class: ['fal fa-rocket-launch red medium'],
      blurb: 'Deploy to your entire organization in a matter of minutes, not weeks!',
      learnMore: '',
      videoLink: 'onboarding'
    },
    {
      focus: false,
      title: 'Leverage Existing Content',
      class: ['fal fa-file-powerpoint firebrick small', 'fal fa-file-word dodgerblue small', 'fal fa-file-pdf red small', 'fal fa-file-excel green small'],
      blurb: 'Our training template supports all common document formats (17 in all) without the application that created them.',
      learnMore: '',
      videoLink: 'onboarding'
    },
    {
      focus: false,
      title: 'Dynamic Interactive Org Chart',
      class: ['fal fa-sitemap orange medium'],
      blurb: 'Manage users, assign trainings, monitor status, and send messages all from within our unique org chart.',
      learnMore: '',
      videoLink: 'onboarding'
    },
    {
      focus: false,
      title: 'Assessments Made Easy',
      class: ['fal fa-file-check fuchsia medium'],
      blurb: 'Quickly and easily add assessments to your trainings.  ',
      learnMore: '',
      videoLink: 'onboarding'
    },
    { 
      focus: false,
      title: 'Cloud Based',
      class: ['fal fa-cloud skyblue medium'],
      blurb: 'No software to install locally.  Your employees, volunteers, and customers can access their training from anywhere at any time.',
      learnMore: '',
      videoLink: null
    },
    {
      focus: false,
      title: 'Automated Reporting',
      class: ['fal fa-chart-bar gold medium'],
      blurb: 'Track training status, due dates, certification expiration dates, ' +
        'and more.  All delivered to you at your timing without ever logging into the site.',
      learnMore: '',
      videoLink: null
    },
    {
      focus: false,
      title: 'Reduced Legal Liability',
      class: ['fal fa-balance-scale-right steelblue medium'],
      blurb: 'Reduced legal exposure KNOWING that all employees and volunteers are appropriately trained/certified.',
      learnMore: '',
      videoLink: null
    },
    /*
    {
      focus: false,
      title: 'Not Just for Employees',
      class: 'fal fa-hands-helping blueviolet',
      blurb: 'Lets you manage volunteer and customer training too!',
      learnMore: '',
      videoLink: null
    },
    */
    {
      focus: false,
      title: 'Version Tracking',
      class: ['fal fa-copy darkturquoise medium'],
      blurb: 'Automatically reset training status on content changes',
      learnMore: '',
      videoLink: null
    },
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
    'earlyAccess': {
      monthly: 99,
      yearly: 999
    },
    'basic': {
      monthly: 99,
      yearly: 999
    },
    'pro': {
      perUser: 5,
      monthly: 500,
      yearly: 4800
    },
    'enterprise': {
      monthly: 3000,
      yearly: 30000
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
  orgChartUrl = 'https://cdn.filestackcontent.com/kSCuMFNzQ3q8Lr8rxDI0';
  onboardingUrl = 'https://cdn.filestackcontent.com/7EDYT7rQjOwjLAmZg9Gm';
  trainingTemplateUrl = 'https://cdn.filestackcontent.com/';
  currentVideo;
  showYouTubeIcon = true;
  explainerVidIsVisible = false;
  planSelected = false;
  plan = '';
  userCnt = 150;
  monthlyCost = 0;
  planCostPerUserHash = {
    basic: [8, 6, 4],
    pro: [12, 9, 6],
    expert: [16, 12, 8]
  };
  userRange = [100, 300];
  discounts = {
    nonProfit: .25,
    conference: .15
  }
  monthlyCostHash = {
    earlyAccess: 0,
    basic: 0,
    pro: 0,
    expert: 0
  };

  currentPage;
  naydo = false;
  //  route: string;
  showPriceEditor = false;

  earlyAccess = true;

  showContactModal = false;

  subid;
  fname;
  lname;
  email;
  trialEnd;
  showEarlyAccessDetails = false;
  public timeLeft$: Observable<timeComponents>;

  constructor(
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router) {

    super();
    this.ngxScrollToDuration = 2000;
    this.ngxScrollToEasing = 'easeOutCubic';
    this.ngxScrollToOffset = 0;
  }

  ngOnInit() {
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.currentPage = event.url.substring(1);
      console.log('Route ', this.currentPage);
      if (this.currentPage === 'naydo') {
        this.naydo = true;
      }
    });

    this.userCntChanged(this.userCnt);

    this.activatedRoute.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.subid = params.get('subid');
      this.lname = params.get('lname');
      this.fname = params.get('fname');
      this.email = params.get('email');
      this.trialEnd = params.get('trialend');
      console.log('landignpage', this.subid, this.lname, this.fname, this.email, this.trialEnd);
    });

    this.activatedRoute.url.subscribe(url => {
      if (url.toString() === 'naydo') {
        this.naydo = true;
      }
    });

    this.timeLeft$ = interval(1000).pipe(
      map(x => this.calcDateDiff()),
      shareReplay(1)
    );
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

  userRangeChanged(index, newVal) {
    this.userCntChanged(this.userCnt);
  }

  planPriceChanged(plan: string, rangeIndex: number, newPrice: number) {
    this.userCntChanged(this.userCnt);
  }

  userCntChanged(userCnt) {
    let plans: string[] = Object.keys(this.planCostPerUserHash);
    let planCostHash = {};
    let planCost = 0;
    for (let plan of plans) {
      let cost: number;
      if (userCnt <= this.userRange[0]) {
        this.monthlyCostHash[plan] = userCnt * this.planCostPerUserHash[plan][0];
      } else if (userCnt <= this.userRange[1]) {
        cost = ((this.userRange[0]) * this.planCostPerUserHash[plan][0]);
        cost = cost + (userCnt - (this.userRange[0])) * (this.planCostPerUserHash[plan][1]);
        this.monthlyCostHash[plan] = cost;
      } else {
        this.monthlyCostHash[plan] = (this.userRange[0] * this.planCostPerUserHash[plan][0]) +
          (this.userRange[1] - this.userRange[0]) * this.planCostPerUserHash[plan][1] +
          (userCnt - this.userRange[1]) * this.planCostPerUserHash[plan][2];
      }
    }
  }

  showContactUsModal() {
    this.showContactModal = true;
  }

  calcDateDiff(endDay: Date = new Date("2021-4-17")): timeComponents {
    const dDay = endDay.valueOf();

    const milliSecondsInASecond = 1000;
    const hoursInADay = 24;
    const minutesInAnHour = 60;
    const secondsInAMinute = 60;

    const timeDifference = dDay - Date.now();

    const daysToDday = Math.floor(
      timeDifference /
      (milliSecondsInASecond * minutesInAnHour * secondsInAMinute * hoursInADay)
    );

    const hoursToDday = Math.floor(
      (timeDifference /
        (milliSecondsInASecond * minutesInAnHour * secondsInAMinute)) %
      hoursInADay
    );

    const minutesToDday = Math.floor(
      (timeDifference / (milliSecondsInASecond * minutesInAnHour)) %
      secondsInAMinute
    );

    const secondsToDday =
      Math.floor(timeDifference / milliSecondsInASecond) % secondsInAMinute;

    return { secondsToDday, minutesToDday, hoursToDday, daysToDday };
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
