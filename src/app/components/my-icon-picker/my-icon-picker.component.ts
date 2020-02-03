import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import icons from '../../../assets/fontawesome-pro/metadata/icons.json';


@Component({
  selector: 'app-icon-picker',
  templateUrl: './my-icon-picker.component.html',
  styleUrls: ['./my-icon-picker.component.css']
})
export class MyIconPickerComponent implements OnInit, AfterViewInit {

  iconStyleHash = {
    solid: 'fas',
    regular: 'far',
    light: 'fal',
    duotone: 'fad',
    brands: 'fab'
  };

  iconNames = [];
  duotoneIconNames = [];
  iconHash = {};

  maxFontSize = 44;
  minFontSize = 18;
  maxPadding = 20;
  minPadding = 5;
  sliderValue = 50;
  fontSize = 36;
  padding = 12;
  styles = [];

  timer1;
  iconSearchStr = '';
  matchingIconsBS$ = new BehaviorSubject<string[]>([]);
  matchingIcons$: Observable<string[]> = this.matchingIconsBS$.asObservable();
  matchingIcons: string[] = [];
  iconSearchTermHash = {};
  @Output() icon = new EventEmitter<{ icon: string, color: string }>();
  iconName: string = '';
  currentIcon = -1;
  iconColor: string = 'black';
  selectedIcon: string = '';
  selectedIconIndex = -1;
  @ViewChild('iconSearch', { static: false }) iconSearch: ElementRef;

  constructor() {
    this.iconNames = Object.keys(icons);
    for (const iconName of this.iconNames) {
      if (icons[iconName].styles.includes('duotone')) {
        this.duotoneIconNames.push(iconName);
        this.matchingIcons.push('fad fa-fw fa-' + iconName);
        this.iconSearchTermHash[iconName] = icons[iconName].search.terms;
      }
    }
    this.matchingIconsBS$.next(this.matchingIcons);
  }

  ngOnInit() {
    //    this.searchForIcons();
  }

  sizeChange(val) {
    this.fontSize = this.minFontSize + Math.floor(((this.maxFontSize - this.minFontSize) * (val / 100)));
    this.padding = this.minPadding + Math.floor(((this.maxPadding - this.minPadding) * (val / 100)));
  }

  ngAfterViewInit() {
    this.iconSearch.nativeElement.focus();
  }

  mouseEnter(i) {
    this.currentIcon = i;
    this.iconName = this.matchingIcons[i].substring(13);
  }

  mouseLeave(i) {
    this.currentIcon = -1;
    this.iconName = '';
  }

  themeChanged($event) {
    this.searchForIcons();
  }

  chooseIcon(i) {
    this.selectedIcon = this.matchingIcons[i];
    console.log('chooseIcon', this.selectedIcon);
  }

  selectIcon(i) {

    this.selectedIconIndex = i;
    this.selectedIcon = this.matchingIcons[i];
    this.icon.emit({ icon: this.matchingIcons[i], color: this.iconColor });
  }

  keypressCallback(keyPress) {
    clearTimeout(this.timer1);

    this.timer1 = setTimeout(() => { this.searchForIcons(); }, 400);
  }

  searchForIcons() {
    this.selectedIconIndex = -1;
    this.matchingIcons = [];
    /*
    for (const iconStr of this.iconNamesSolid) {
      if (iconStr.indexOf(this.iconSearchStr) >= 0) {
        for (const style of iconsSolid[iconStr].styles) {
          this.matchingIcons.push(this.iconStyleHash[style] + ' fa-' + iconStr.trim());
        }
      }
    }
    */
    for (const iconStr of this.duotoneIconNames) {
      if (iconStr.indexOf(this.iconSearchStr) >= 0) {
        this.matchingIcons.push('fad fa-fw fa-' + iconStr);
        continue;
      }
      for (const term of this.iconSearchTermHash[iconStr]) {
        if (typeof term === 'string' && term.indexOf(this.iconSearchStr) >= 0) {
          this.matchingIcons.push('fad fa-fw fa-' + iconStr);
          break;
        }
      }
    }

    this.matchingIconsBS$.next(this.matchingIcons);
  }

  onColorChange(newColor) {
    this.iconColor = newColor;
    this.icon.emit({ icon: this.selectedIcon, color: this.iconColor });
  }
}
