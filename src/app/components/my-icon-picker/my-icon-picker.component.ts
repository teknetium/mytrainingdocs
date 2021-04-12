import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import { ENV } from '../../shared/services/env.config';
import { throwError as ObservableThrowError } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-icon-picker',
  templateUrl: './my-icon-picker.component.html',
  styleUrls: ['./my-icon-picker.component.css'],
  animations: [
    trigger('colorSlide', [
      // ...
      state('closed', style({
        'height': '0',
        'opacity': '0'
      })),
      state('open', style({
        'height': '40vh',
        'opacity': '1'
      })),
      transition('open => closed', [
        animate('300ms')
      ]),
      transition('closed => open', [
        animate('300ms')
      ]),
    ]),
  ]
})

export class MyIconPickerComponent implements OnInit, AfterViewInit {

  colors = [
    '#f44336',
    '#ffebee',
    '#ffcdd2',
    '#ef9a9a',
    '#e57373',
    '#ef5350',
    '#f44336',
    '#e53935',
    '#d32f2f',
    '#c62828',
    '#b71c1c',
    '#ff8a80',
    '#ff5252',
    '#ff1744',
    '#d50000',
    '#e91e63',
    '#fce4ec',
    '#f8bbd0',
    '#f48fb1',
    '#f06292',
    '#ec407a',
    '#e91e63',
    '#d81b60',
    '#c2185b',
    '#ad1457',
    '#880e4f',
    '#ff80ab',
    '#ff4081',
    '#f50057',
    '#c51162',
    '#9c27b0',
    '#f3e5f5',
    '#e1bee7',
    '#ce93d8',
    '#ba68c8',
    '#ab47bc',
    '#9c27b0',
    '#8e24aa',
    '#7b1fa2',
    '#6a1b9a',
    '#4a148c',
    '#ea80fc',
    '#e040fb',
    '#d500f9',
    '#aa00ff',
    '#673ab7',
    '#ede7f6',
    '#d1c4e9',
    '#b39ddb',
    '#9575cd',
    '#7e57c2',
    '#673ab7',
    '#5e35b1',
    '#512da8',
    '#4527a0',
    '#311b92',
    '#b388ff',
    '#7c4dff',
    '#651fff',
    '#6200ea',
    '#3f51b5',
    '#e8eaf6',
    '#c5cae9',
    '#9fa8da',
    '#7986cb',
    '#5c6bc0',
    '#3f51b5',
    '#3949ab',
    '#303f9f',
    '#283593',
    '#1a237e',
    '#8c9eff',
    '#536dfe',
    '#3d5afe',
    '#304ffe',
    '#2196f3',
    '#e3f2fd',
    '#bbdefb',
    '#90caf9',
    '#64b5f6',
    '#42a5f5',
    '#2196f3',
    '#1e88e5',
    '#1976d2',
    '#1565c0',
    '#0d47a1',
    '#82b1ff',
    '#448aff',
    '#2979ff',
    '#2962ff',
    '#03a9f4',
    '#e1f5fe',
    '#b3e5fc',
    '#81d4fa',
    '#4fc3f7',
    '#29b6f6',
    '#03a9f4',
    '#039be5',
    '#0288d1',
    '#0277bd',
    '#01579b',
    '#80d8ff',
    '#40c4ff',
    '#00b0ff',
    '#0091ea',
    '#00bcd4',
    '#e0f7fa',
    '#b2ebf2',
    '#80deea',
    '#4dd0e1',
    '#26c6da',
    '#00bcd4',
    '#00acc1',
    '#0097a7',
    '#00838f',
    '#006064',
    '#84ffff',
    '#18ffff',
    '#00e5ff',
    '#00b8d4',
    '#009688',
    '#e0f2f1',
    '#b2dfdb',
    '#80cbc4',
    '#4db6ac',
    '#26a69a',
    '#009688',
    '#00897b',
    '#00796b',
    '#00695c',
    '#004d40',
    '#a7ffeb',
    '#64ffda',
    '#1de9b6',
    '#00bfa5',
    '#4caf50',
    '#e8f5e9',
    '#c8e6c9',
    '#a5d6a7',
    '#81c784',
    '#66bb6a',
    '#4caf50',
    '#43a047',
    '#388e3c',
    '#2e7d32',
    '#1b5e20',
    '#b9f6ca',
    '#69f0ae',
    '#00e676',
    '#00c853',
    '#8bc34a',
    '#f1f8e9',
    '#dcedc8',
    '#c5e1a5',
    '#aed581',
    '#9ccc65',
    '#8bc34a',
    '#7cb342',
    '#689f38',
    '#558b2f',
    '#33691e',
    '#ccff90',
    '#b2ff59',
    '#76ff03',
    '#64dd17',
    '#cddc39',
    '#f9fbe7',
    '#f0f4c3',
    '#e6ee9c',
    '#dce775',
    '#d4e157',
    '#cddc39',
    '#c0ca33',
    '#afb42b',
    '#9e9d24',
    '#827717',
    '#f4ff81',
    '#eeff41',
    '#c6ff00',
    '#aeea00',
    '#ffeb3b',
    '#fffde7',
    '#fff9c4',
    '#fff59d',
    '#fff176',
    '#ffee58',
    '#ffeb3b',
    '#fdd835',
    '#fbc02d',
    '#f9a825',
    '#f57f17',
    '#ffff8d',
    '#ffff00',
    '#ffea00',
    '#ffd600',
    '#ffc107',
    '#fff8e1',
    '#ffecb3',
    '#ffe082',
    '#ffd54f',
    '#ffca28',
    '#ffc107',
    '#ffb300',
    '#ffa000',
    '#ff8f00',
    '#ff6f00',
    '#ffe57f',
    '#ffd740',
    '#ffc400',
    '#ffab00',
    '#ff9800',
    '#fff3e0',
    '#ffe0b2',
    '#ffcc80',
    '#ffb74d',
    '#ffa726',
    '#ff9800',
    '#fb8c00',
    '#f57c00',
    '#ef6c00',
    '#e65100',
    '#ffd180',
    '#ffab40',
    '#ff9100',
    '#ff6d00',
    '#ff5722',
    '#fbe9e7',
    '#ffccbc',
    '#ffab91',
    '#ff8a65',
    '#ff7043',
    '#ff5722',
    '#f4511e',
    '#e64a19',
    '#d84315',
    '#bf360c',
    '#ff9e80',
    '#ff6e40',
    '#ff3d00',
    '#dd2c00',
    '#795548',
    '#efebe9',
    '#d7ccc8',
    '#bcaaa4',
    '#a1887f',
    '#8d6e63',
    '#795548',
    '#6d4c41',
    '#5d4037',
    '#4e342e',
    '#3e2723',
    '#9e9e9e',
    '#fafafa',
    '#f5f5f5',
    '#eeeeee',
    '#e0e0e0',
    '#bdbdbd',
    '#9e9e9e',
    '#757575',
    '#616161',
    '#424242',
    '#212121',
    '#607d8b',
    '#eceff1',
    '#cfd8dc',
    '#b0bec5',
    '#90a4ae',
    '#78909c',
    '#607d8b',
    '#546e7a',
    '#455a64',
    '#37474f',
    '#263238',
  ];

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
  fontSize = 20;
  padding = 6;
  styles = [];

  timer1;
  iconSearchStr = '';
  searchStr = '';
  matchingIconsBS$ = new BehaviorSubject<string[]>([]);
  matchingIcons$: Observable<string[]> = this.matchingIconsBS$.asObservable();
  matchingIcons: string[] = [];
  iconSearchTermHash = {};
  @Input() currentIconClass = '';
  @Input() currentColor = '';
  @Input() height = 200;

  @Output() icon = new EventEmitter<{ icon: string, color: string }>();
  iconName: string = '';
  currentIcon = -1;
  iconColor: string;
  selectedIcon: string = '';
  selectedIconIndex = -1;
  @ViewChild('iconSearch', { static: false }) iconSearch: ElementRef;
  //  solid = true;
  //  regular = true;
  //  light = true;
  //  duotone = true;
  styleStr = 'style=solid';
  redValue = 0;
  greenValue = 0;
  blueValue = 0;
  //  currentStyles = ['Solid', 'Regular', 'Light', 'Two Tone'];
  rgbArray: number[] = [];
  showColorInitModal = false;
  currentIconSize = 20;
  iconStyle: string = 'solid';
  colorArray: { colorName: string, colorVal: string }[] = [];
  showColorPalette = false;

  constructor(private auth: AuthService, private http: HttpClient) {
    /*
    this.iconNames = Object.keys(this.icons);
    for (const iconName of this.iconNames) {
      if (this.icons[iconName].styles.includes('duotone')) {
        this.duotoneIconNames.push(iconName);
        this.matchingIcons.push('fad fa-fw fa-' + iconName);
        this.iconSearchTermHash[iconName] = this.icons[iconName].search.terms;
      }
    }
    */
    this.getIcons$('searchString=*:style=' + this.iconStyle).subscribe(icons => {
      this.matchingIconsBS$.next(icons);
      this.matchingIcons = icons;
    })

  }

  ngOnInit() {
    this.selectedIcon = this.currentIconClass;
    this.setIconColorString(this.currentColor);
  }
  /*
    colorInitCancel() {
      this.showColorInitModal = false;
    }
  
    colorInitOk() {
      this.iconColor = this.currentColor;
      this.rgbArray = this.hexToRgb(this.currentColor);
      this.redValue = this.rgbArray[0];
      this.greenValue = this.rgbArray[1];
      this.blueValue = this.rgbArray[2];
    }
  */

  iconStyleChanged(style: string): void {
    this.iconStyle = style;
    this.styleStr = 'style=' + this.iconStyle;
    this.searchForIcons();
  }

  setIconColorString(color: string) {
    this.iconColor = color;
    this.currentColor = color;
    this.icon.emit({ icon: this.selectedIcon, color: this.iconColor });
    /*
if (this.currentColor.indexOf('#') === 0) {
  this.rgbArray = this.hexToRgb(this.currentColor);
  this.redValue = this.rgbArray[0];
  this.greenValue = this.rgbArray[1];
  this.blueValue = this.rgbArray[2];
  this.iconColor = '#' + this.redValue.toString(16).padStart(2, '0') + this.greenValue.toString(16).padStart(2, '0') + this.blueValue.toString(16).padStart(2, '0');
} else {
  this.rgbArray = this.colors[this.currentColor];
  if (!this.rgbArray) {
    this.redValue = 0;
    this.greenValue = 0;
    this.blueValue = 0;
  } else {
    this.redValue = this.rgbArray[0];
    this.greenValue = this.rgbArray[1];
    this.blueValue = this.rgbArray[2];

  }
  this.iconColor = 'rgb(' + this.redValue + ', ' + this.greenValue + ', ' + this.blueValue + ')';
}
*/
  }

  colorVal(): string {
    if (!this.redValue || !this.greenValue || !this.blueValue) {
      return '#000000';
    }
    this.iconColor = 'rgb(' + this.redValue + ', ' + this.greenValue + ', ' + this.blueValue + ')';
    return this.iconColor;
  }

  colorChange(data, color) {
    if (color === 'red') {
      this.redValue = data;
    }
    if (color === 'green') {
      this.greenValue = data;
    }
    if (color === 'blue') {
      this.blueValue = data;
    }
    /*
    if (!this.redValue || !this.greenValue || !this.blueValue) {
      return;
    }
    */
    this.iconColor = '#' + this.redValue.toString(16).padStart(2, '0') + this.greenValue.toString(16).padStart(2, '0') + this.blueValue.toString(16).padStart(2, '0');
    this.icon.emit({ icon: this.selectedIcon, color: this.iconColor });
  }

  bigger() {
    this.currentIconSize += 10;
    this.sizeChange(this.currentIconSize);
  }
  smaller() {
    this.currentIconSize -= 10;
    this.sizeChange(this.currentIconSize);
  }

  hexToRgb(c): number[] {
    let rgbArray = [];
    if (/^#([a-f0-9]{3}){1,2}$/.test(c)) {
      if (c.length == 4) {
        c = '#' + [c[1], c[1], c[2], c[2], c[3], c[3]].join('');
      }
      c = '0x' + c.substring(1);
      rgbArray.push((c >> 16) & 255);
      rgbArray.push((c >> 8) & 255);
      rgbArray.push(c & 255);
      //    return 'rgb(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ')';
      return Object.assign([], rgbArray);
    }
  }
  /*
    hex_to_RGB(hex) {
      var m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
      return {
        r: parseInt(m[1], 16),
        g: parseInt(m[2], 16),
        b: parseInt(m[3], 16)
      };
    }
    */

  sizeChange(val) {
    this.fontSize = this.minFontSize + Math.floor(((this.maxFontSize - this.minFontSize) * (val / 100)));
    this.padding = this.minPadding + Math.floor(((this.maxPadding - this.minPadding) * (val / 100)));
  }

  ngAfterViewInit() {
    this.iconSearch.nativeElement.focus();
  }

  mouseEnter(i) {
    if (!this.matchingIcons[i]) {
      return;
    }
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
    this.searchStr = 'searchString=';
    if (this.iconSearchStr === '') {
      this.searchStr += '*';
    } else {
      this.searchStr += this.iconSearchStr;
    }
    this.searchStr = this.searchStr + ':' + this.styleStr;
    this.getIcons$(this.searchStr).subscribe(icons => {
      this.matchingIcons = icons;
      this.matchingIconsBS$.next(this.matchingIcons);
    })
  }

  onColorChange(newColor) {
    this.iconColor = newColor;
    this.icon.emit({ icon: this.selectedIcon, color: this.iconColor });
  }

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  getIcons$(searchStr: string): Observable<string[]> {
    return this.http
      .get<string[]>(`${ENV.BASE_API}icons/${searchStr}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  private _handleError(err: HttpErrorResponse | any): Observable<any> {
    const errorMsg = err.message || 'Error: Unable to complete request.';
    if (err.message && err.message.indexOf('No JWT present') > -1) {
      this.auth.login();
    }
    return ObservableThrowError(errorMsg);
  }
}
