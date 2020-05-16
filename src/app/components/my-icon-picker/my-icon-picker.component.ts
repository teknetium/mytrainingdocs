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
    this.getIcons$('*').subscribe(icons => {
      this.matchingIconsBS$.next(icons);
      this.matchingIcons = icons;
    })

    
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
    if (this.iconSearchStr === '') {
      this.getIcons$('*').subscribe(icons => {
        this.matchingIcons = icons;
        this.matchingIconsBS$.next(this.matchingIcons);
      })
    }
    this.getIcons$(this.iconSearchStr).subscribe(icons => {
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
