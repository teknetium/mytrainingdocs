// my-loader.component.ts
import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../../shared/services/loader.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-my-loader',
  templateUrl: './my-loader.component.html',
  styleUrls: ['./my-loader.component.css']
})
export class MyLoaderComponent implements OnInit {

  loading: boolean;

  constructor(private _loading: LoaderService) {
  }

  ngOnInit() {
    this.listenToLoading();
  }

  listenToLoading(): void {
    this._loading.loadingSub
      .pipe(delay(0)) // This prevents a ExpressionChangedAfterItHasBeenCheckedError for subsequent requests
      .subscribe((loading) => {
        this.loading = loading;
      });
  }
}
