import { Injectable } from '@angular/core';
import { Assessment } from '../interfaces/training.type';
import { BehaviorSubject, Observable, throwError as ObservableThrowError, Subscription } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { ENV } from './env.config';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {

  assessmentBS$ = new BehaviorSubject<Assessment>(null);
  assessmentHash = {};

  constructor(
    private http: HttpClient,
    private auth: AuthService) {
  }

  createAssessment(): string {
    let assessmentId = String(new Date().getTime());
    let assessment = <Assessment>{
      _id: assessmentId,
      passingGrade: 60,
      items: undefined
    };
    this.postAssessment$(assessment).subscribe(assessmentObj => {
      this.assessmentHash[assessmentObj._id] = assessmentObj;
      this.assessmentBS$.next(assessmentObj);
    })
    return assessmentId;
  }

  nextQuestion() {

  }

  loadAssessment(assessmentId: string) {
    let assessmentObj = this.assessmentHash[assessmentId];
    if (assessmentObj) {
      this.assessmentBS$.next(assessmentObj);
    } else {
      this.getAssessment$(assessmentId).subscribe(assessObj => {
        if (assessObj) {
          this.assessmentBS$.next(assessObj);
        }
      })
    }
  }

  updateAssessment(assessment: Assessment) {
    this.updateAssessment$(assessment).subscribe(assObj => {
      console.log('update Assessment', assessment);
    })
  }

  getAssessmentStream(): Observable<Assessment> {
    return this.assessmentBS$.asObservable();
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

  getAssessment$(id: string): Observable<Assessment> {
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

