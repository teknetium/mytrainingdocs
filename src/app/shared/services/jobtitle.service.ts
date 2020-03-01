import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { UserModel } from '../interfaces/user.type';
import { TrainingService } from './training.service';
import { TrainingModel, TrainingIdHash } from '../interfaces/training.type';
import { throwError as ObservableThrowError, Observable, BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';


@Injectable({
  providedIn: 'root'
})
export class JobTitleService {

  jobTitlesBS$ = new BehaviorSubject<string[]>([]);
  jobTitles: string[] = [];

  trainingJobTitles$: Observable<string[]>;
  userJobTitles$: Observable<string[]>;

  constructor(private trainingService: TrainingService, private userService: UserService) {
    this.trainingJobTitles$ = this.trainingService.getJobTitleStream();
    this.userJobTitles$ = this.userService.getJobTitleStream();
    this.trainingJobTitles$.subscribe(jobTitles => {
      let tmpArray: string[];
      tmpArray = this.jobTitles.concat(jobTitles);
      this.jobTitlesBS$.next(this.jobTitles);
      this.userJobTitles$.subscribe(jobTitles => {
        this.jobTitles = tmpArray.concat(jobTitles);
        this.jobTitlesBS$.next(this.jobTitles);
      })
    })

  }

  getJobTitleStream(): Observable<string[]> {
    return this.jobTitlesBS$.asObservable();
  }

  addJobTitle(jt: string) {
    this.jobTitles.push(jt);
    this.jobTitlesBS$.next(this.jobTitles);
  }

}
