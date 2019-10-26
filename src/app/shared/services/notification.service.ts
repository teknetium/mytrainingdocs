import { Injectable } from '@angular/core';
import { NotificationModel } from '../interfaces/notification.type';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  customNotifications: NotificationModel[] = [];
  notifications$ = new BehaviorSubject<NotificationModel[]>([]);
  notificationCnt$ = new BehaviorSubject<number>(0);
  selectedNotificationBS$ = new BehaviorSubject<NotificationModel>(null);
  selectedNotificationIndexBS$ = new BehaviorSubject<number>(null);

  constructor() {

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
}
