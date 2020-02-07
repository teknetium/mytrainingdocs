import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { UserTrainingService } from '../../shared/services/userTraining.service';
import { TrainingService } from '../../shared/services/training.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { UserModel } from 'src/app/shared/interfaces/user.model';
import { UserTrainingModel } from 'src/app/shared/interfaces/userTraining.type';
import { TrainingModel } from 'src/app/shared/interfaces/training.type';

interface Day {
  dayOfMonth: number,
  dayOfWeek: number,
  trainingsDue: string[]
}

interface Month {
  monthIndex: number,
  days: Day[],
  name: string
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  monthDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  year = new Array<Month>(12);

  trainings$: Observable<TrainingModel[]>;
  trainings: TrainingModel[];
  userTrainings$: Observable<UserTrainingModel[]>;
  selectedUser$: Observable<UserModel>;
  selectedUser: UserModel;
  daysBS$ = new BehaviorSubject<Day[]>([]);
  days$: Observable<Day[]> = this.daysBS$.asObservable();
  days: Day[];
  today = new Date();
  currentDayOfWeek: number = this.today.getDay();
  currentDayOfMonth: number = this.today.getDate();
  currentMonth: number = this.today.getMonth();
  currentYear: number = this.today.getFullYear();
  nextMonth = this.currentMonth + 1;
  dayOfMonthOffset: number;
  dayOfWeekOffset: number;
  dayVal: number;
  currentDay: Day;

  sub1: Subscription;
  sub2: Subscription;
  sub3: Subscription;

  trainingIdHash = {};
  rangeEnd = 28;
  earliestMonth = 11;
  latestMonth = 0;
  showMonth = {};
  visibleMonthCnt = 0;
  calendarHeight = 0;

  constructor(private userService: UserService,
    private userTrainingService: UserTrainingService,
    private trainingService: TrainingService) {
    this.userTrainings$ = this.userTrainingService.getUserTrainingStream();
    this.trainings$ = this.trainingService.getAllTrainingsObservable();
    this.selectedUser$ = this.userService.getSelectedUserStream();

    for (let i = 0; i < 12; i++) {
      let days = new Array<Day>(this.monthDays[i]);
      for (let j = 0; j < this.monthDays[i]; j++) {

        let day = <Day>{
          dayOfMonth: j,
          dayOfWeek: 0,
          trainingsDue: []
        }
        console.log('filling up month...',day )
        days[j] = day;
      }
      let month = <Month>{
        days: days,
        name: this.monthNames[i]
      };
      this.year[i] = month;

    }
  } 

  ngOnInit() {
    this.sub1 = this.selectedUser$.subscribe(user => {
      if (!user) {
        return;
      }
      this.selectedUser = user;
      this.userTrainingService.loadTrainingsForUser(this.selectedUser._id);
    });


    this.sub2 = this.userTrainings$.subscribe(userTrainings => {

      // reset earlistMonth and latestMonth
      this.earliestMonth = 11;
      this.latestMonth = 0;
      let today = new Date().getTime();
      if (userTrainings.length > 0) {
        for (let userTraining of userTrainings) {
          if (userTraining.dueDate === 0) {
            continue;
          }
          let dueDateDOM = new Date(userTraining.dueDate).getDate();
          let dueDateMOY = new Date(userTraining.dueDate).getMonth();
          let dueDateYear = new Date(userTraining.dueDate).getFullYear();
          if (dueDateYear === this.currentYear) {
            if (dueDateMOY < this.earliestMonth) {
              this.earliestMonth = dueDateMOY;
            }
            if (dueDateMOY > this.latestMonth) {
              this.latestMonth = dueDateMOY;
            }
          }
          this.year[dueDateMOY].days[dueDateDOM].trainingsDue.push(userTraining.tid);
        }

        for (let i = 0; i < 12; i++) {
          if (i < this.earliestMonth || i > this.latestMonth) {
            this.showMonth[this.monthNames[i]] = 'false';
          } else {
            this.visibleMonthCnt++;
            this.showMonth[this.monthNames[i]] = 'true';
          }
        }
        this.calendarHeight = this.visibleMonthCnt * 34;


        this.sub3 = this.trainings$.subscribe(trainings => {
          this.trainings = trainings;
          for (let i = 0; i < this.trainings.length; i++) {
            this.trainingIdHash[this.trainings[i]._id] = this.trainings[i];
          }
        })
      }


      // If the current month is December then we just set nextMonth to January
      /*
      if (this.nextMonth === 12) {
        this.nextMonth = 0;
      }
      for (var i = 0; i < this.days.length; i++) {
        let dayOfMonth: number;
        let dayOfWeek: number;
        let monthLabel: string;
   
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
   
        trainingsDue = [];
        if (userTrainings.length > 0) {
          for (let userTraining of userTrainings) {
            let dueDateDayOfMonth = new Date(userTraining.dueDate).getDate();
            if (dueDateDayOfMonth === dayOfMonth) {
              trainingsDue.push(userTraining.tid);
            }
          }
        }
   
        this.days[i] = {
          monthLabel: monthLabel,
          dayOfMonth: dayOfMonth,
          dayOfWeek: dayOfWeek,
          trainingsDue: trainingsDue,
        };
      }
   
      this.daysBS$.next(this.days);
  */
    })
  }

  ngOnDestroy() {
    if (this.sub1) {
      this.sub1.unsubscribe();
    }
    if (this.sub2) {
      this.sub2.unsubscribe();
    }
    if (this.sub3) {
      this.sub3.unsubscribe();
    }
  }

}
