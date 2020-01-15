import { Component, Input, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Observable, BehaviorSubject } from 'rxjs';
import { ThemeImageService } from '../../shared/services/theme-image.service';

@Component({
  selector: 'mtd-theme-image',
  templateUrl: './theme-image.component.html',
  styleUrls: ['./theme-image.component.css'],
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
    ])
  ]
})
export class ThemeImageComponent implements OnInit {

  imageBS$: BehaviorSubject<string>;
  triggerBS$: BehaviorSubject<boolean>;
  trigger$: Observable<boolean>;
  image$: Observable<string>;

  theme$: Observable<string>;

  yogaImageBase;
  dogImageBase;
  currentImageNum: number;
  currentImage;

  themeImageWidth = 160;
  staticImage = false;
  numYogaImages = 28;
  numDogImages = 50;
  currentTheme = 'dogs';
  imageUrl = '';

  @Input() height = '100';
  @Input() width = '100';
  @Input() popover = 'false';

  constructor(private themeImageService: ThemeImageService) {
    this.imageBS$ = new BehaviorSubject<string>('');
    this.triggerBS$ = new BehaviorSubject<boolean>(false);
    this.trigger$ = this.triggerBS$.asObservable();
    this.image$ = this.imageBS$.asObservable();
    this.theme$ = this.themeImageService.getThemeStream();

    this.yogaImageBase = '../assets/images/yoga';
    this.dogImageBase = '../assets/images/dog';
    this.currentImageNum = 0;
    this.currentImage = '';
  }

  ngOnInit() {
    this.currentImageNum = 0;
    this.fadeIn();
  }

//  getImageUrl(): string {
//    this.currentImage = this.dogImageBase.concat(this.currentImageNum.toString(), '.jpg');
//    console.log('getImageUrl ', this.currentImage);
//    return this.currentImage;
//  }

  onStaticChange(event) {
    this.themeImageService.setStatic(event);
    this.staticImage = event;
  }

  setTheme(theme) {
    this.themeImageService.setTheme(theme);
    if (this.staticImage) {
      this.fadeIn();
    }
  }

  fadeIn() {
    this.imageBS$.next(this.themeImageService.getImageUrl());

    this.triggerBS$.next(true);
    this.currentImageNum++;
    if (!this.staticImage) {
      setTimeout(() => {
        this.fadeOut();
      }, 3500);
    }
  }

  fadeOut() {
    this.triggerBS$.next(false);
    setTimeout(() => {
      this.fadeIn();
    }, 500);
  }
}
