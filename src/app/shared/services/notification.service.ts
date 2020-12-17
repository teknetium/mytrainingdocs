import { NotificationModel } from '../interfaces/notification.type';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError as ObservableThrowError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TrainingService } from '../services/training.service';
import { EventModel } from '../interfaces/event.type';
import { AlertModel } from '../interfaces/notification.type';
import { AuthService } from './auth.service';
import { ENV } from './env.config';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  customNotifications: NotificationModel[] = [];
  notifications$ = new BehaviorSubject<NotificationModel[]>([]);
  notificationCnt$ = new BehaviorSubject<number>(0);
  selectedNotificationBS$ = new BehaviorSubject<NotificationModel>(null);
  selectedNotificationIndexBS$ = new BehaviorSubject<number>(null);
  alertBS$ = new BehaviorSubject<AlertModel>(null);

  constructor(
    private auth: AuthService,
    private http: HttpClient,
  ) {
  }

  showAlert(alert: AlertModel) {
    this.alertBS$.next(alert);
  }

  getAlertStream(): Observable<AlertModel> {
    return this.alertBS$.asObservable();
  }

  getNotificationsStream(): Observable<NotificationModel[]> {
    return this.notifications$.asObservable();
  }

  getNotificationCntStream(): Observable<number> {
    return this.notificationCnt$.asObservable();
  }

  cancelNotificationSelection() {
  }

  create() {}

  selectNewNotification() {

  }

  selectNotification(index) {

  }

  getSelectedNotificationStream(): Observable<NotificationModel> {
    return this.selectedNotificationBS$.asObservable();
  }

  getSelectedNotificationIndexStream(): Observable<number> {
    return this.selectedNotificationIndexBS$.asObservable();
  }

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  // GET the comments associated with a specific training
  getNotificationsForUid$(uid: string): Observable<NotificationModel[]> {
    return this.http
      .get<NotificationModel[]>(`${ENV.BASE_API}notifications/${uid}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // POST new comment (admin only)
  postNotification$(notification: NotificationModel): Observable<NotificationModel> {
    return this.http
      .post<NotificationModel>(`${ENV.BASE_API}notifications/new`, notification, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // DELETE existing comment
  deleteNotification$(id: string): Observable<NotificationModel> {
    return this.http
      .delete(`${ENV.BASE_API}notifications/${id}`, {
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
