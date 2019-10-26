import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ThemeImageService {

  yogaImageBase = '../assets/yoga';
  dogImageBase = '../assets/dog';

  themeBS$ = new BehaviorSubject<string>('dogs');

  currentImageNum = 0;
  staticImage = false;
  numImages;
  numYogaImages = 28;
  numDogImages = 50;

  currentTheme = 'dogs';
  themeHash = {
    dogs: {
      count: 50,
      baseUrl: '../assets/dog',
      extension: '.jpg',
      image: '../assets/dog42.jpg'
    },
    yoga: {
      count: 29,
      baseUrl: '../assets/yoga',
      extension: '.png',
      image: '../assets/yoga17.png'
    }
  }

  constructor() {
    this.numImages = this.numDogImages;
  }

  getImageUrl(): string {
    if (this.staticImage) {
      return this.themeHash[this.currentTheme].image;
    }

//    this.currentImageNum =  Math.floor(Math.random() * Math.floor(this.themeHash[this.currentTheme].count));
    this.currentImageNum++;

    if (this.currentImageNum >= this.numImages) {
      this.currentImageNum = 0;
    }
    return this.themeHash[this.currentTheme].baseUrl.concat(this.currentImageNum, this.themeHash[this.currentTheme].extension);
  }

  setTheme(theme) {
    if (theme === 'dogs') {
      this.numImages = this.numDogImages;
    } else if (theme === 'yoga') {
      this.numImages = this.numYogaImages;
    }
    this.currentTheme = theme;
    this.themeBS$.next(this.currentTheme);
  }

  getThemeStream(): Observable<string> {
    return this.themeBS$.asObservable();
  }

  setStatic(val) {
    this.staticImage = val;
  }
}
