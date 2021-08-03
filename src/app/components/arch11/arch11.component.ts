import { Component, OnInit, ViewEncapsulation, ViewChild, HostListener } from '@angular/core';
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
import { NzCarouselComponent } from 'ng-zorro-antd/carousel';
import { timeStamp } from 'console';


interface timeComponents {
  secondsToDday: number;
  minutesToDday: number;
  hoursToDday: number;
  daysToDday: number;
}

interface projectModel {
  title: string,
  shortDesc: string,
  description: string,
  thumbnail: string,
  images: string[],
  tags: string[]
}

@Component({
  selector: 'app-arch11',
  templateUrl: './arch11.component.html',
  styleUrls: ['./arch11.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  animations: [
    trigger('filterBarSlide', [
      // ...
      state('closed', style({
        'bottom': '100px'
      })),
      state('open', style({
        'bottom': '-100px',
      })),
      transition('open => closed', [
        animate('300ms')
      ]),
      transition('closed => open', [
        animate('300ms')
      ]),
    ]),
    trigger('textFade', [
      // ...
      state('invisible', style({
        'opacity': '0'
      })),
      state('visible', style({
        'opacity': '1.0',
      })),
      transition('visible => invisible', [
        animate('800ms')
      ]),
      transition('invisible => visible', [
        animate('800ms')
      ]),
    ]),
    trigger('featureSlide', [
      // ...
      state('closed', style({
        'left': '0',
        'opacity': '1'
      })),
      state('open', style({
        'left': ' 100%',
        'opacity': '0'
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

export class Arch11Component extends BaseComponent implements OnInit {

  vgApi: VgAPI;
  taskVideo$: Observable<SafeResourceUrl>;
  showTaskVideoModal = false;

  costArray = ['Employee Churn', 'Non Compliance', 'Sexual Harrassment'];

  projects: projectModel[] = [
    {
      title: 'House 59',
      shortDesc: `Working directly with three separate clients,
      Arch11 designed these townhomes to the eccentricities of each
      of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      thumbnail: 'assets/images/arch11-images/alder-2-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/alder-2-1600x900-q80.jpeg', 'assets/images/arch11-images/alder-1-2800x1575-q80.jpeg', 'assets/images/arch11-images/2290_5-1600x900-q80.jpeg', 'assets/images/arch11-images/alder-6-2800x1575-q80.jpeg', 'assets/images/arch11-images/alder-7-2800x1575-q80.jpeg', 'assets/images/arch11-images/alder-9-2800x1575-q80.jpeg', 'assets/images/arch11-images/alder-15-2800x1575-q80.jpeg'],
      tags: ['residential', 'boulder']
    },
    {
      title: 'Syncline House',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      thumbnail: 'assets/images/arch11-images/syncline-house-1-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/syncline-house-1-1600x900-q80.jpeg', 'assets/images/arch11-images/syncline-house-2-2800x1575-q80.jpeg', 'assets/images/arch11-images/syncline-house-3-2800x1575-q80.jpeg',
        'assets/images/arch11-images/syncline-house-4-2800x1575-q80.jpeg', 'assets/images/arch11-images/syncline-house-5-2800x1575-q80.jpeg', 'assets/images/arch11-images/syncline-house-6-2800x1575-q80.jpeg', 'assets/images/arch11-images/syncline-house-7.2-2800x1575-q80.jpeg', 'assets/images/arch11-images/syncline-house-8-2800x1575-q80.jpeg', 'assets/images/arch11-images/syncline-house-9-2800x1575-q80.jpeg', 'assets/images/arch11-images/syncline-house-10-2800x1575-q80.jpeg', 'assets/images/arch11-images/syncline-house-12-2800x1575-q80.jpeg', 'assets/images/arch11-images/syncline-house-14-2800x1575-q80.jpeg', 'assets/images/arch11-images/syncline-house-15-2800x1575-q80.jpeg'],
      tags: ['residential', 'boulder']
    },
    {
      title: 'Taylor Mountain',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['residential', 'boulder'],
      thumbnail: 'assets/images/arch11-images/taylor-mountain-1-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/taylor-mountain-1-1600x900-q80.jpeg']
    },
    {
      title: 'Dihedral House',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['residential', 'boulder', 'concrete'],
      thumbnail: 'assets/images/arch11-images/dihedral-house-3-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/dihedral-house-3-1600x900-q80.jpeg']
    },
    {
      title: 'Ogden Street',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['residential', 'boulder'],
      thumbnail: 'assets/images/arch11-images/odgen-1-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/odgen-1-1600x900-q80.jpeg']
    },
    {
      title: 'Observatory Park',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['residential', 'boulder'],
      thumbnail: 'assets/images/arch11-images/observatory-park-1-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/observatory-park-1-1600x900-q80.jpeg']
    },
    {
      title: 'Tree House',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['residential', 'denver'],
      thumbnail: 'assets/images/arch11-images/sandburg-2-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/sandburg-2-1600x900-q80.jpeg']
    },
    {
      title: 'Polo Club',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['residential', 'denver'],
      thumbnail: 'assets/images/arch11-images/polo-club-2-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/polo-club-2-1600x900-q80.jpeg']
    },
    {
      title: 'Lodgepole Retreat',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['residential', 'boulder'],
      thumbnail: 'assets/images/arch11-images/lodgepole-retreat-1-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/lodgepole-retreat-1-1600x900-q80.jpeg']
    },
    {
      title: 'Grid House',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['residential', 'boulder'],
      thumbnail: 'assets/images/arch11-images/grid-house-15-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/grid-house-15-1600x900-q80.jpeg']
    },
    {
      title: 'Geneva',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['residential', 'boulder'],
      thumbnail: 'assets/images/arch11-images/geneva-3-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/geneva-3-1600x900-q80.jpeg']
    },
    {
      title: 'DynaEnergetics',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['commercial', 'denver'],
      thumbnail: 'assets/images/arch11-images/dyna-1-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/dyna-1-1600x900-q80.jpeg']
    },
    {
      title: 'Roth Living Showroom & Headquarters',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['commercial', 'boulder'],
      thumbnail: 'assets/images/arch11-images/roth-denver-2-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/roth-denver-2-1600x900-q80.jpeg']
    },
    {
      title: 'Corrida',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['commercial', 'denver'],
      thumbnail: 'assets/images/arch11-images/corrida-12-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/corrida-12-1600x900-q80.jpeg']
    },
    {
      title: '909 Walnut',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['commercial', 'boulder'],
      thumbnail: 'assets/images/arch11-images/909-walnut-triptych-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/909-walnut-triptych-1600x900-q80.jpeg']
    },
    {
      title: 'Place re: Place',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['unbuilt', 'boulder'],
      thumbnail: 'assets/images/arch11-images/placereplace-5-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/placereplace-5-1600x900-q80.jpeg']
    },
    {
      title: 'Whisky Still',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['unbuilt', 'boulder'],
      thumbnail: 'assets/images/arch11-images/whiskey-still_1-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/whiskey-still_1-1600x900-q80.jpeg']
    },
    {
      title: 'Park Pavilions',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['unbuilt', 'boulder'],
      thumbnail: 'assets/images/arch11-images/04-pm-int-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/04-pm-int-1600x900-q80.jpeg']
    },
    {
      title: 'Meadow Pavilion',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['unbuilt', 'boulder'],
      thumbnail: 'assets/images/arch11-images/turner-2-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/turner-2-1600x900-q80.jpeg']
    },
    {
      title: 'Partners Group',
      shortDesc: `Working directly with three separate clients, Arch11 designed these townhomes to the eccentricities of each of the occupants: a builder, a tech maven, and a graphic designer turned fly fisherman.`,
      description: `Support for both one-time and recurring trainings.  Recurring trainings (certification)
      have a special workflow for attaching image of certificate.`,
      tags: ['unbuilt', 'boulder'],
      thumbnail: 'assets/images/arch11-images/partners-group-3-1600x900-q80.jpeg',
      images: ['assets/images/arch11-images/partners-group-3-1600x900-q80.jpeg']
    },
  ]

  benefits = [
    {
      focus: false,
      title: 'One Click Deploy',
      class: ['fa-light fa-rocket-launch red medium super'],
      blurb: 'Deploy to your entire organization in a matter of minutes, not weeks!',
      learnMore: '',
//      videoLink: 'onboarding'
      videoLink: null
    },
    {
      focus: false,
      title: 'Use Existing Content',
      class: ['fa-light fa-file-word dodgerblue small super small-gap-right',
        'fa-light fa-file-powerpoint firebrick small super small-gap-right',
        'fa-light fa-file-excel green small super small-gap-right',
        'fa-light fa-file-pdf red small super small-gap-right',
        'fa-light fa-file-video blueviolet small super small-gap-right',
        'fa-light fa-file-image orange small super small-gap-right',
        'fa-light fa-file-code black small super small-gap-right',
        'fa-regular fa-ellipsis-h black small sub'],
      blurb: 'Our training template supports the viewing of all common document formats (17 in all) without the application that created them.',
      learnMore: '',
//      videoLink: 'leverageExistingContent'
      videoLink: null
    },
    {
      focus: false,
      title: 'Dynamic Interactive Org Chart',
      class: ['fa-light fa-sitemap orange medium super'],
      blurb: 'Manage users, assign trainings, monitor status, and send messages all from within our unique org chart.',
      learnMore: '',
//      videoLink: 'orgChart'
      videoLink: null
    },
    {
      focus: false,
      title: 'Assessments Made Easy',
      class: ['fa-light fa-ballot-check fuchsia medium super'],
      blurb: 'Quickly and easily add assessments to your trainings.  ',
      learnMore: '',
//      videoLink: 'assessment'
      videoLink: null
    },
    { 
      focus: false,
      title: 'Cloud Based',
      class: ['fa-light fa-cloud skyblue medium'],
      blurb: 'No software to install locally.  Your employees, volunteers, and customers can access their training from anywhere at any time.',
      learnMore: '',
      videoLink: null
    },
    {
      focus: false,
      title: 'Custom Notifications',
      class: ['fa-light fa-bell-on green medium'],
      blurb: 'You control who receives notifications and when they receive them.',
      learnMore: '',
      videoLink: null
    },
    {
      focus: false,
      title: 'Manage Training Versions',
      class: ['fa-light fa-code-branch blueviolet medium'],
      blurb: 'Browse training update history.  Multiple types of training updates: major (reset status), minor (notify only) and bug fix (silent)',
      learnMore: '',
      videoLink: null
    },
    {
      focus: false,
      title: 'Reduced Legal Liability',
      class: ['fa-light fa-balance-scale-right redorange medium'],
      blurb: 'Reduced legal exposure when all employees and volunteers are appropriately trained/certified.',
      learnMore: '',
      videoLink: null
    }
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
      question: '',
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
  carouselDelay = 7000;
  currentHowStep = 0;
  howStepCount;
  timerCnt = 0;
  currentHowMsg: string;
  sub1: Subscription;
  assessmentUrl = 'https://cdn.filestackcontent.com/scOJhgySQn4oic7eiCXA';
  orgChartUrl = 'https://cdn.filestackcontent.com/kN7mQ5O3T6tfgXAnhdf5';
  leverageContentUrl = 'https://cdn.filestackcontent.com/jT9krZqAReOwNO3zGmaA';
  explainerUrl = 'https://cdn.filestackcontent.com/kiKtqljARoygXbEeCN6V';
//  orgChartUrl = 'https://cdn.filestackcontent.com/kSCuMFNzQ3q8Lr8rxDI0';
  onboardingUrl = 'https://cdn.filestackcontent.com/gmktG01nSI2yuMhZg1sM';
  trainingTemplateUrl = 'https://cdn.filestackcontent.com/';
  currentVideo;
  showYouTubeIcon = true;
  explainerVidIsVisible = false;
  planSelected = false;
  plan = '';
  userCnt = 150;
  monthlyCost = 0;
  planCostPerUserHash = {
    basic: [5, 4, 3],
    pro: [8, 6, 4],
    expert: [12, 9, 6]
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
  naydo = true;
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

  showPlanInfo = false;
  nonProfitVar = 'true';

  currentSlide = 0;
  images = [
    {
      image: "assets/images/arch11-images/orchard-1-2800x1575-q80.jpeg",
      text: "Empower your teams to easily and quickly create their own trainings."
    },
    {
      image: "assets/images/arch11-images/303-canyon-1-2800x1575-q80.jpeg",
      text: "Empower your teams to easily and quickly create their own trainings."
    },
    {
      image: "assets/images/arch11-images/alder-1-2800x1575-q80.jpeg",
      text: "Empower your teams to easily and quickly create their own trainings."
    },
    {
      image: "assets/images/arch11-images/dyna-11-2800x1575-q80.jpeg",
      text: "Empower your teams to easily and quickly create their own trainings."
    },
    {
      image: "assets/images/arch11-images/five.jpeg",
      text: "Empower your teams to easily and quickly create their own trainings."
    },
    {
      image: "assets/images/arch11-images/six.jpeg",
      text: "Empower your teams to easily and quickly create their own trainings."
    },
    {
      image: "assets/images/arch11-images/seven.jpeg",
      text: "Empower your teams to easily and quickly create their own trainings."
    },
    {
      image: "assets/images/arch11-images/eight.jpeg",
      text: "Empower your teams to easily and quickly create their own trainings."
    },
    {
      image: "assets/images/arch11-images/nine.jpeg",
      text: "Empower your teams to easily and quickly create their own trainings."
    },
    {
      image: "assets/images/arch11-images/ten.jpeg",
      text: "Empower your teams to easily and quickly create their own trainings."
    },
    {
      image: "assets/images/arch11-images/eleven.jpeg",
      text: "Empower your teams to easily and quickly create their own trainings."
    },
    {
      image: "assets/images/arch11-images/twelve.jpeg",
      text: "Empower your teams to easily and quickly create their own trainings."
    }
  ]
  featureSlides = [
    {
      image: "assets/images/teamworkX.jpeg",
      text: "Empower your teams to easily and quickly create their own trainings."
    },
    {
      image: "assets/images/docsToTraining.jpeg",
      text: "Turn any set of documents into a trackable training complete with assessments in minutes."
    },
    {
      image: "assets/images/pageEditor.jpeg",
      text: "Easily and quickly create custom content using our built-in content editor."
    },
    {
      image: "assets/images/brainstorming.jpeg",
      text: "Easily capture organization wisdom and quickly turn your new employees into your best employees."
    },
    {
      image: "assets/images/work-from-home3.jpeg",
      text: "Access your trainings from anywhere at anytime."
    },
    {
      image: "assets/images/myOrgChart.jpeg",
      text: "Track training status across your entire organization at a glance."
    },
    {
      image: "assets/images/launch.png",
      text: "Deploy to any size organization in minutes not weeks."
    }
  ]

  endInterval = true;
  costIndex = 0;
  costCount = 0;
  currentCostItem = this.costArray[this.costIndex];
  percentTime = 0;
  limitTime = 3500;
  totalTime = 0;
  intervalTime = 20;
  page = 'home';
  currentProject = this.projects[0];
  currentProjectIndex = 0;
  showNav = false;
  showFilters = false;
  pageLabelHash = {
    work: 'Work',
    awards: 'Awards',
    publications: 'Publications',
    postings: 'Postings',
    studio: 'Studio',
    team: 'Team',
    process: 'Process',
    contacts: 'Contacts'
  }

  browserInnerHeight;
  browserInnerWidth;
  projectDetailHeight;

  selectedType: string;
  selectedMaterial: string;
  selectedLocation: string;
  selectedArchElements: string;
  filters = [];
  filteredProjects: projectModel[] = this.projects;
  filterArray: string[];
  projectFullScreen = false;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.browserInnerHeight = window.innerHeight;
    this.browserInnerWidth = window.innerWidth;

    if (this.browserInnerHeight < 900) {
      this.projectDetailHeight = this.browserInnerHeight * .55;
    } else if (this.browserInnerHeight < 1100) {
      this.projectDetailHeight = this.browserInnerHeight * .60;
    } else {
      this.projectDetailHeight = this.browserInnerHeight * .65;
    }
  }


  @ViewChild(NzCarouselComponent, { static: false }) myCarousel: NzCarouselComponent;

  carouselState: string = 'active';


  constructor(
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router) {

    super();
    this.ngxScrollToDuration = 2000;
    this.ngxScrollToEasing = 'easeOutCubic';
    this.ngxScrollToOffset = 0;

    this.browserInnerHeight = window.innerHeight;
    if (this.browserInnerHeight < 900) {
      this.projectDetailHeight = this.browserInnerHeight * .55;
    } else if (this.browserInnerHeight < 1100) {
      this.projectDetailHeight = this.browserInnerHeight * .60;
    } else {
      this.projectDetailHeight = this.browserInnerHeight * .65;
    }
  }

  fadeIn() {
    this.currentCostItem = this.costArray[this.costCount++ % this.costArray.length];
    this.endInterval = false;
    let intervalId = setInterval(() => {
      if (this.percentTime === 100) {
        clearInterval(intervalId);
        this.percentTime = 0;
        this.totalTime = 0
        this.fadeOut();
      } else {
        this.totalTime += this.intervalTime;
        this.percentTime = (this.totalTime / this.limitTime) * 100;
      }
    }, this.intervalTime);

  }

  fadeOut() {
    this.endInterval = true;
    setTimeout(() => {
      this.fadeIn();
    }, 800);

  }

  selectProject(index) {
    this.currentProject = this.filteredProjects[index];
    this.currentProjectIndex = index;
  }

  removeFilter(item) {
    console.log("removeFilter" , item);
  }

  filterChanged(event) {

    this.filterArray = [];
    this.filteredProjects = [];
    if (this.selectedType) {
      this.filterArray.push(this.selectedType);
    }
    if (this.selectedMaterial) {
      this.filterArray.push(this.selectedMaterial);
    }
    if (this.selectedLocation) {
      this.filterArray.push(this.selectedLocation);
    }
    if (this.selectedArchElements) {
      this.filterArray.push(this.selectedArchElements);
    }

    console.log(this.filterArray);

    let filtersFound = true;
    if (this.filterArray.length > 0) {
      for (let project of this.projects) {
        for (let filter of this.filterArray) {
          if (project.tags.indexOf(filter) < 0) {
            filtersFound = false;
            break;
          }
        }
        if (filtersFound) {
          this.filteredProjects.push(project);
        } else {
          filtersFound = true;
        }
      }
    } else {
      this.filteredProjects = this.projects;
    }

    if (this.filteredProjects.length === 0) {
      this.currentProject = null;
      this.currentProjectIndex = -1;
    } else {
      this.currentProject = this.filteredProjects[0];
      this.currentProjectIndex = 0;
    }

    this.showFilters = false;
  }

  goToPage(page) {
    this.page = page;
    this.showNav = false;
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

    this.fadeIn();


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

  goTo(index) {
    this.myCarousel.goTo(index);
  }

  toggleNonProfit(val: string) {
    this.nonProfitVar = val;
    console.log('toggleNonProfit', this.nonProfitVar);
  }

  beforeUpdateDot(event) {
      this.currentSlide = event.to;
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

  calcDateDiff(endDay: Date = new Date("2021-5-1")): timeComponents {
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

  /*
  start() {
    this.carouselDelay = 6000;
  }

  stop() {
    this.carouselDelay = 0;
  }
*/
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
