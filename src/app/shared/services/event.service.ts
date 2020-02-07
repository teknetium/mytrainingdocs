import { Injectable } from '@angular/core';
import { EventModel } from '../interfaces/event.type';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ENV } from './env.config';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { throwError as ObservableThrowError, Observable, BehaviorSubject, Subscription } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class EventService {

  private events: EventModel[] = [];
  private eventsBS$ = new BehaviorSubject<EventModel[]>([]);

  constructor(private http: HttpClient, private auth: AuthService) {
    this.eventsBS$.next([]);
  }

  getEventStream(): Observable<EventModel[]> {
    return this.eventsBS$.asObservable();
  }

  addEvent(newEvent: EventModel) {
    this.events.push(newEvent);
    this.eventsBS$.next(this.events);
  }

  // POST new training (admin only)
  postEvent$ (event: EventModel): Observable<EventModel> {
    return this.http
      .post<EventModel>(`${ENV.BASE_API}events/new`, event, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  getEvents$(teamId: string): Observable<EventModel[]> {
    return this.http
      .get<EventModel[]>(`${ENV.BASE_API}events/${teamId}`)
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

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

}
