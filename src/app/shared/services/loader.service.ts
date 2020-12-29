import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private isLoading = new BehaviorSubject(false);
  constructor() { }

  setIsLoading(loading: boolean) {
    this.isLoading.next(loading);
  }

  getIsLoadingStream(): Observable<boolean> {
    return this.isLoading.asObservable();
  }
}
