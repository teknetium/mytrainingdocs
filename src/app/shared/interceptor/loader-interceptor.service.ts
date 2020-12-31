// loader-interceptor.service.ts
import { Injectable } from '@angular/core';
import {
  HttpResponse,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoaderService } from '../services/loader.service';
import { NotificationService } from '../services/notification.service';
import { AlertModel } from '../interfaces/notification.type';
import { catchError, map } from 'rxjs/operators'

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  private requests: HttpRequest<any>[] = [];
  constructor(
    private myLoader: LoaderService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.myLoader.setLoading(true, request.url);
    return next.handle(request)
      .pipe(catchError((err) => {
//        console.log('Error in HTTP_INTERCEPTOR');
        this.myLoader.setLoading(false, request.url);
        return err;
      }))
      .pipe(map<HttpEvent<any>, any>((evt: HttpEvent<any>) => {
        if (evt instanceof HttpResponse) {
          this.myLoader.setLoading(false, request.url);
        }
        return evt;
      }));
  }
}
