import { Injectable } from '@angular/core';
import { Assessment } from '../interfaces/assessment.type';
import { BehaviorSubject, Observable, throwError as ObservableThrowError, Subscription } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { ENV } from './env.config';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {

  constructor(
    private http: HttpClient,
    private auth: AuthService) {
  }

  nextQuestion() {

  }
  
  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  postAssessment$(assessment: Assessment): Observable<Assessment> {
    return this.http
      .post<Assessment>(`${ENV.BASE_API}assessment/new/`, assessment, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  updateAssessment$(assessment: Assessment): Observable<Assessment> {
    return this.http
      .put<Assessment>(`${ENV.BASE_API}assessment/${assessment._id}`, assessment, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  deleteAssessment$(id: string): Observable<any> {
    return this.http
      .delete(`${ENV.BASE_API}assessment/${id}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  getAssessment$(id: string): Observable<Assessment[]> {
    return this.http
      .get<Assessment>(`${ENV.BASE_API}assessment/${id}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader),
      })
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

}

