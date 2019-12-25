import { Injectable } from '@angular/core';
import { EventModel } from '../interfaces/event.type';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private events: EventModel[] = [];
  private eventsBS$ = new BehaviorSubject<EventModel[]>([]);

  constructor() {
    this.eventsBS$.next([]);
  }

  getEventStream(): Observable<EventModel[]> {
    return this.eventsBS$.asObservable();
  }

  addEvent(newEvent: EventModel) {
    this.events.push(newEvent);
    this.eventsBS$.next(this.events);
  }

}
