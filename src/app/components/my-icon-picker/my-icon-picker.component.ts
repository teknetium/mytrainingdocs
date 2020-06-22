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

  colors = {
  "aliceblue": [240, 248, 255],
  "antiquewhite": [250, 235, 215],
  "aqua": [0, 255, 255],
  "aquamarine": [127, 255, 212],
  "azure": [240, 255, 255],
  "beige": [245, 245, 220],
  "bisque": [255, 228, 196],
  "black": [0, 0, 0],
  "blanchedalmond": [255, 235, 205],
  "blue": [0, 0, 255],
  "blueviolet": [138, 43, 226],
  "brown": [165, 42, 42],
  "burlywood": [222, 184, 135],
  "cadetblue": [95, 158, 160],
  "chartreuse": [127, 255, 0],
  "chocolate": [210, 105, 30],
  "coral": [255, 127, 80],
  "cornflowerblue": [100, 149, 237],
  "cornsilk": [255, 248, 220],
  "crimson": [220, 20, 60],
  "cyan": [0, 255, 255],
  "darkblue": [0, 0, 139],
  "darkcyan": [0, 139, 139],
  "darkgoldenrod": [184, 134, 11],
  "darkgray": [169, 169, 169],
  "darkgreen": [0, 100, 0],
  "darkgrey": [169, 169, 169],
  "darkkhaki": [189, 183, 107],
  "darkmagenta": [139, 0, 139],
  "darkolivegreen": [85, 107, 47],
  "darkorange": [255, 140, 0],
  "darkorchid": [153, 50, 204],
  "darkred": [139, 0, 0],
  "darksalmon": [233, 150, 122],
  "darkseagreen": [143, 188, 143],
  "darkslateblue": [72, 61, 139],
  "darkslategray": [47, 79, 79],
  "darkslategrey": [47, 79, 79],
  "darkturquoise": [0, 206, 209],
  "darkviolet": [148, 0, 211],
  "deeppink": [255, 20, 147],
  "deepskyblue": [0, 191, 255],
  "dimgray": [105, 105, 105],
  "dimgrey": [105, 105, 105],
  "dodgerblue": [30, 144, 255],
  "firebrick": [178, 34, 34],
  "floralwhite": [255, 250, 240],
  "forestgreen": [34, 139, 34],
  "fuchsia": [255, 0, 255],
  "gainsboro": [220, 220, 220],
  "ghostwhite": [248, 248, 255],
  "gold": [255, 215, 0],
  "goldenrod": [218, 165, 32],
  "gray": [128, 128, 128],
  "green": [0, 128, 0],
  "greenyellow": [173, 255, 47],
  "grey": [128, 128, 128],
  "honeydew": [240, 255, 240],
  "hotpink": [255, 105, 180],
  "indianred": [205, 92, 92],
  "indigo": [75, 0, 130],
  "ivory": [255, 255, 240],
  "khaki": [240, 230, 140],
  "lavender": [230, 230, 250],
  "lavenderblush": [255, 240, 245],
  "lawngreen": [124, 252, 0],
  "lemonchiffon": [255, 250, 205],
  "lightblue": [173, 216, 230],
  "lightcoral": [240, 128, 128],
  "lightcyan": [224, 255, 255],
  "lightgoldenrodyellow": [250, 250, 210],
  "lightgray": [211, 211, 211],
  "lightgreen": [144, 238, 144],
  "lightgrey": [211, 211, 211],
  "lightpink": [255, 182, 193],
  "lightsalmon": [255, 160, 122],
  "lightseagreen": [32, 178, 170],
  "lightskyblue": [135, 206, 250],
  "lightslategray": [119, 136, 153],
  "lightslategrey": [119, 136, 153],
  "lightsteelblue": [176, 196, 222],
  "lightyellow": [255, 255, 224],
  "lime": [0, 255, 0],
  "limegreen": [50, 205, 50],
  "linen": [250, 240, 230],
  "magenta": [255, 0, 255],
  "maroon": [128, 0, 0],
  "mediumaquamarine": [102, 205, 170],
  "mediumblue": [0, 0, 205],
  "mediumorchid": [186, 85, 211],
  "mediumpurple": [147, 112, 219],
  "mediumseagreen": [60, 179, 113],
  "mediumslateblue": [123, 104, 238],
  "mediumspringgreen": [0, 250, 154],
  "mediumturquoise": [72, 209, 204],
  "mediumvioletred": [199, 21, 133],
  "midnightblue": [25, 25, 112],
  "mintcream": [245, 255, 250],
  "mistyrose": [255, 228, 225],
  "moccasin": [255, 228, 181],
  "navajowhite": [255, 222, 173],
  "navy": [0, 0, 128],
  "oldlace": [253, 245, 230],
  "olive": [128, 128, 0],
  "olivedrab": [107, 142, 35],
  "orange": [255, 165, 0],
  "orangered": [255, 69, 0],
  "orchid": [218, 112, 214],
  "palegoldenrod": [238, 232, 170],
  "palegreen": [152, 251, 152],
  "paleturquoise": [175, 238, 238],
  "palevioletred": [219, 112, 147],
  "papayawhip": [255, 239, 213],
  "peachpuff": [255, 218, 185],
  "peru": [205, 133, 63],
  "pink": [255, 192, 203],
  "plum": [221, 160, 221],
  "powderblue": [176, 224, 230],
  "purple": [128, 0, 128],
  "red": [255, 0, 0],
  "rosybrown": [188, 143, 143],
  "royalblue": [65, 105, 225],
  "saddlebrown": [139, 69, 19],
  "salmon": [250, 128, 114],
  "sandybrown": [244, 164, 96],
  "seagreen": [46, 139, 87],
  "seashell": [255, 245, 238],
  "sienna": [160, 82, 45],
  "silver": [192, 192, 192],
  "skyblue": [135, 206, 235],
  "slateblue": [106, 90, 205],
  "slategray": [112, 128, 144],
  "slategrey": [112, 128, 144],
  "snow": [255, 250, 250],
  "springgreen": [0, 255, 127],
  "steelblue": [70, 130, 180],
  "tan": [210, 180, 140],
  "teal": [0, 128, 128],
  "thistle": [216, 191, 216],
  "tomato": [255, 99, 71],
  "transparent": [0, 0, 0, 0],
  "turquoise": [64, 224, 208],
  "violet": [238, 130, 238],
  "wheat": [245, 222, 179],
  "white": [255, 255, 255],
  "whitesmoke": [245, 245, 245],
  "yellow": [255, 255, 0],
  "yellowgreen": [154, 205, 50],
  "rebeccapurple": [102, 51, 153]
  }
  
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
  showColorInitModal = false;
  currentIconSize = 50;

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
    this.setIconColorString();
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
  setIconColorString() {
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
  }

  colorVal(): string {
    if (!this.redValue || !this.greenValue || !this.blueValue) {
      return '#000000';
    }
    this.iconColor = 'rgb(' + this.redValue + ', ' + this.greenValue + ', ' + this.blueValue + ')';
    return this.iconColor;
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
