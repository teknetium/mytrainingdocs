import { Injectable } from '@angular/core';
import { throwError as ObservableThrowError, Observable, BehaviorSubject, Subscription } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class JobTitleService {

  jobTitlesBS$ = new BehaviorSubject<string[]>([]);
  jobTitles: string[] = [];

  constructor() {  }

  getJobTitleStream(): Observable<string[]> {
    return this.jobTitlesBS$.asObservable();
  }

  addJobTitles(jobTitles: string[]): void {
    for (let jobTitle of jobTitles) {
      if (!this.jobTitles.includes(jobTitle)) {
        this.jobTitles.push(jobTitle);
      }
    }
    this.jobTitlesBS$.next(Object.assign([], this.jobTitles));
  }

  addJobTitle(jt: string) {
    jt = jt.trim();
    if (jt && !this.jobTitles.includes(jt)) {
      this.jobTitles.push(jt);
      this.jobTitlesBS$.next(this.jobTitles);
    }
  }

}
