import { Injectable } from '@angular/core';
import { JobModel } from '../interfaces/job.type';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  private jobs: JobModel[];
  private jobs$ = new BehaviorSubject<JobModel[]>([]);
  private jobCnt$ = new BehaviorSubject<number>(0);
  private selectedJobBS$ = new BehaviorSubject<JobModel>(null);
  private selectedJobIndexBS$ = new BehaviorSubject<number>(-1);
  private actionBS$ = new BehaviorSubject<string>('init');

  constructor() {

  }


  selectJob(index) {
    if (index < 0 || index >= this.jobs.length) {
      return;
    }
    this.actionBS$.next('edit');
    this.selectedJobBS$.next(this.jobs[index]);
    this.selectedJobIndexBS$.next(index);
  }

  getJobsStream(): Observable<JobModel[]> {
    return this.jobs$.asObservable();
  }

  getJobCntStream(): Observable<number> {
    return this.jobCnt$.asObservable();
  }

  getSelectedJobStream(): Observable<JobModel> {
    return this.selectedJobBS$.asObservable();
  }

  getSelectedJobIndexStream(): Observable<number> {
    return this.selectedJobIndexBS$.asObservable();
  }

}
