import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import icons from '../../../assets/fontawesome-pro/metadata/icons.json';


@Component({
  selector: 'mtd-icon-picker',
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

  styles = [];

  timer1;
  iconSearchStr = '';
  matchingIconsBS$ = new BehaviorSubject<string[]>([]);
  matchingIcons$: Observable<string[]> = this.matchingIconsBS$.asObservable();
  matchingIcons: string[] = [];
  @Output() icon = new EventEmitter<{icon:string, color:string}>();
  iconClass: string = 'fal fa-file-certificate';
  iconColor: string = 'black';
  selectedIcon: string = '';
  @ViewChild('iconSearch', { static: false }) iconSearch: ElementRef;

  constructor() {
    this.iconNames = Object.keys(icons);
    for (const iconName of this.iconNames) {
      if (icons[iconName].styles.includes('duotone')) {
        this.duotoneIconNames.push(iconName);
        this.matchingIcons.push('fad fa-' + iconName);
      }
    }
    this.matchingIconsBS$.next(this.matchingIcons);
   }

  ngOnInit() {
//    this.searchForIcons();
  }

  ngAfterViewInit() {
    this.iconSearch.nativeElement.focus();
    }

  mouseOver(i) {
    this.iconClass = this.matchingIcons[i];
  }

  themeChanged($event) {
    this.searchForIcons();
  }

  chooseIcon(i) {
    this.selectedIcon = this.matchingIcons[i];
    console.log('chooseIcon', this.selectedIcon);
  }

  selectIcon(i) {
    this.selectedIcon = this.matchingIcons[i];
    this.icon.emit({ icon: this.matchingIcons[i], color: this.iconColor });
  }

  keypressCallback(keyPress) {
    clearTimeout(this.timer1);

    this.timer1 = setTimeout(() => { this.searchForIcons(); }, 400);
  }

  searchForIcons() {
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
            this.matchingIcons.push('fad fa-' + iconStr);
      }
    }

    this.matchingIconsBS$.next(this.matchingIcons);
  }

  onColorChange(newColor) {
    this.iconColor = newColor;
    this.icon.emit({ icon: this.selectedIcon, color: this.iconColor });
  }
}
