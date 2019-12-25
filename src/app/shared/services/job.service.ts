import { Injectable } from '@angular/core';
import { JobModel } from '../interfaces/job.type';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  private jobs: JobModel[];
  private jobs$ = new BehaviorSubject<JobModel[]>([]);

  constructor() {

  }


  selectJob(index) {
    if (index < 0 || index >= this.jobs.length) {
      return;
    }
  }

  getJobsStream(): Observable<JobModel[]> {
    return this.jobs$.asObservable();
  }

}
