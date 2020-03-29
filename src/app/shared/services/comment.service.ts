import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError as ObservableThrowError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TrainingService } from '../services/training.service';
import { EventModel } from '../interfaces/event.type';
import { CommentModel } from '../interfaces/comment.type';
import { AuthService } from './auth.service';
import { ENV } from './env.config';


@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private trainingCommentsBS$ = new BehaviorSubject<CommentModel[]>([]);

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private trainingService: TrainingService
  ) {
  }

  saveTrainingComment(comment: CommentModel) {
    this.postComment$(comment).subscribe(comment => {
      console.log('saveTrainingComment', comment);
    })
  }

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  // GET the comments associated with a specific training
  getComments$(tid: string): Observable<CommentModel[]> {
    return this.http
      .get<CommentModel[]>(`${ENV.BASE_API}comments/${tid}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // POST new comment (admin only)
  postComment$(comment: CommentModel): Observable<CommentModel> {
    return this.http
      .post<CommentModel>(`${ENV.BASE_API}comments/new`, comment, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // DELETE existing comment
  deleteComment$(id: string): Observable<CommentModel> {
    return this.http
      .delete(`${ENV.BASE_API}comments/${id}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
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
