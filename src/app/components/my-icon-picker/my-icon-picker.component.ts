import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import { ENV } from '../../shared/services/env.config';
import { throwError as ObservableThrowError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  searchStr = '';
  matchingIconsBS$ = new BehaviorSubject<string[]>([]);
  matchingIcons$: Observable<string[]> = this.matchingIconsBS$.asObservable();
  matchingIcons: string[] = [];
  iconSearchTermHash = {};
  @Input() currentIconClass = '';
  @Input() currentColor = '';
  @Output() icon = new EventEmitter<{ icon: string, color: string }>();
  iconName: string = '';
  currentIcon = -1;
  iconColor: string;
  selectedIcon: string = '';
  selectedIconIndex = -1;
  @ViewChild('iconSearch', { static: false }) iconSearch: ElementRef;
  solid = true;
  regular = true;
  light = true;
  duotone = true;
  styleStr = 'style=solid,regular,light,duotone';
  redValue = 0;
  greenValue = 0;
  blueValue = 0;
  currentStyles = ['Solid', 'Regular', 'Light', 'Two Tone'];
  rgbArray: number[] = [];

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
    this.getIcons$('searchString=*:style=solid,regular,light,duotone').subscribe(icons => {
      this.matchingIconsBS$.next(icons);
      this.matchingIcons = icons;
    })


  }

  ngOnInit() {
    this.selectedIcon = this.currentIconClass;
    this.iconColor = this.currentColor;
    this.hexToRgb(this.currentColor);
    console.log('icon-picker', this.rgbArray);
    this.redValue = this.rgbArray[0];
    this.greenValue = this.rgbArray[1];
    this.blueValue = this.rgbArray[2];
  }

  colorVal(): string {
    this.iconColor = '#' + this.redValue.toString(16).padStart(2, '0') + this.greenValue.toString(16).padStart(2, '0') + this.blueValue.toString(16).padStart(2, '0');

    return this.iconColor;
    //    return 'rgb(' + this.redValue + ',' + this.greenValue + ',' + this.blueValue + ')';
  }

  toggleStyle(style) {
    this.currentStyles = [];
    this.styleStr = 'style=';
    if (style === 'solid') {
      this.solid = !this.solid;
    } else if (style === 'regular') {
      this.regular = !this.regular;
    } else if (style === 'light') {
      this.light = !this.light;
    } else if (style === 'duotone') {
      this.duotone = !this.duotone;
    }

    if (this.solid) {
      this.currentStyles.push('Solid');
      this.styleStr += 'solid,';
    }
    if (this.regular) {
      this.currentStyles.push('Regular');
      this.styleStr += ',regular';
    }
    if (this.light) {
      this.currentStyles.push('Light');
      this.styleStr += ',light';
    }
    if (this.duotone) {
      this.currentStyles.push('Two Tone');
      this.styleStr += ',duotone';
    }

    this.searchForIcons();
  }

  colorChange(data, color) {
    /*
    if (color === 'red') {
      this.redValue = data;
    } else if (color === 'green') {
      this.greenValue = data;
    } else if (color === 'blue') {
      this.blueValue = data;
    }
    */

    this.iconColor = '#' + this.redValue.toString(16).padStart(2, '0') + this.greenValue.toString(16).padStart(2, '0') + this.blueValue.toString(16).padStart(2, '0');
    console.log('colorChange', data, color);

    this.icon.emit({ icon: this.selectedIcon, color: this.iconColor });
  }

  hexToRgb(c) {
    this.rgbArray = [];
    if (/^#([a-f0-9]{3}){1,2}$/.test(c)) {
      if (c.length == 4) {
        c = '#' + [c[1], c[1], c[2], c[2], c[3], c[3]].join('');
      }
      c = '0x' + c.substring(1);
      this.rgbArray.push((c >> 16) & 255);
      this.rgbArray.push((c >> 8) & 255);
      this.rgbArray.push(c & 255);
      //    return 'rgb(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ')';
    }
  }

  hex_to_RGB(hex) {
    var m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
    return {
      r: parseInt(m[1], 16),
      g: parseInt(m[2], 16),
      b: parseInt(m[3], 16)
    };
  }

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
      /*
      this.getIcons$('*').subscribe(icons => {
        this.matchingIcons = icons;
        this.matchingIconsBS$.next(this.matchingIcons);
      })
      */
    } else {
      this.searchStr += this.iconSearchStr;
    }
    this.searchStr = this.searchStr + ':' + this.styleStr;
    console.log('searchForIcons', this.searchStr);
    this.getIcons$(this.searchStr).subscribe(icons => {
      this.matchingIcons = icons;
      this.matchingIconsBS$.next(this.matchingIcons);
    })
    /*
    for (const iconStr of this.iconNamesSolid) {
      if (iconStr.indexOf(this.iconSearchStr) >= 0) {
        for (const style of iconsSolid[iconStr].styles) {
          this.matchingIcons.push(this.iconStyleHash[style] + ' fa-' + iconStr.trim());
        }
      }
    }
    */
    /*
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
*/
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
