import { Component, OnInit } from '@angular/core';
import { EventService } from '../../shared/services/event.service';
import { EventModel } from '../../shared/interfaces/event.type';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';

interface Day {
  monthLabel: string,
  dayOfMonth: number,
  dayOfWeek: number,
  trainingsDue: EventModel[],
  notificationsToSend: EventModel[]
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  daysBS$ = new BehaviorSubject<Day[]>([]);
  days$: Observable<Day[]> = this.daysBS$.asObservable();
  days: Day[] = new Array(28);
  today = new Date();
  currentDayOfWeek: number = this.today.getDay();
  currentDayOfMonth: number = this.today.getDate();
  currentMonth: number = this.today.getMonth();
  nextMonth = this.currentMonth + 1;
  dayOfMonthOffset: number;
  dayOfWeekOffset: number;
  dayVal: number;
  currentDay: Day;

  events$: Observable<EventModel[]>;
  sub1: Subscription;

  constructor(private eventService: EventService) {
    this.events$ = this.eventService.getEventStream();

  }

  ngOnInit() {
    this.sub1 = this.events$.subscribe(events => {
      this.dayOfMonthOffset = this.currentDayOfMonth;
      this.dayOfWeekOffset = this.currentDayOfWeek;
      // If the current month is December then we just set nextMonth to January
      if (this.nextMonth === 12) {
        this.nextMonth = 0;
      }
      for (var i = 0; i < this.days.length; i++) {
        let dayOfMonth: number;
        let dayOfWeek: number;
        let monthLabel: string;
        let trainingsDue: EventModel[] = [];
        let notificationsToSend: EventModel[] = [];

        if (i === 0) {
          monthLabel = this.monthNames[this.currentMonth];
        } else {
          monthLabel = '';
        }

        this.dayVal = i + this.dayOfMonthOffset;
        if (this.dayVal > this.monthDays[this.currentMonth]) {
          this.dayOfMonthOffset = this.currentDayOfMonth - this.monthDays[this.currentMonth];
        }

        dayOfMonth = i + this.dayOfMonthOffset;
        if (dayOfMonth === 1 && i !== 0) {
          monthLabel = this.monthNames[this.nextMonth];
        }

        dayOfWeek = (i + this.dayOfWeekOffset) % 7;

        for (let event of events) {
          let eventDayOfMonth = new Date(event.actionDate).getDate();
          if (eventDayOfMonth === dayOfMonth) {
            if (event.type === 'trainingDue') {
              trainingsDue.push(event);
            } else {
              notificationsToSend.push(event);
            }
          }
        }
        this.days[i] = {
          monthLabel: monthLabel,
          dayOfMonth: dayOfMonth,
          dayOfWeek: dayOfWeek,
          trainingsDue: trainingsDue,
          notificationsToSend: notificationsToSend
        };
      }

      this.daysBS$.next(this.days);

    })
  }

  ngOnDestroy() {
    this.sub1.unsubscribe();
  }

}
