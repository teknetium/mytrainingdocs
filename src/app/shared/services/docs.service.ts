import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError as ObservableThrowError } from 'rxjs';
import { DocModel } from '../interfaces/docs.type';
import { catchError } from 'rxjs/operators';
import { ENV } from './env.config';
import { AuthService } from '../services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class DocsService {

  private docsBS$ = new BehaviorSubject<DocModel[]>([]);

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {
  }

  saveDoc(doc: DocModel) {
    this.postDoc$(doc).subscribe(doc => {
    })
  }

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }

  // GET the comments associated with a specific training
  getDoc$(docId: string): Observable<DocModel[]> {
    return this.http
      .get<DocModel[]>(`${ENV.BASE_API}doc/${docId}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // GET the comments associated with a specific training
  getDocs$(productId: string): Observable<DocModel[]> {
    return this.http
      .get<DocModel[]>(`${ENV.BASE_API}docs/product/${productId}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // POST new comment (admin only)
  postDoc$(doc: DocModel): Observable<DocModel> {
    return this.http
      .post<DocModel>(`${ENV.BASE_API}docs/new`, doc, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  // DELETE existing comment
  deleteDoc$(docId: string): Observable<DocModel> {
    return this.http
      .delete(`${ENV.BASE_API}docs/${docId}`, {
        headers: new HttpHeaders().set('Authorization', this._authHeader)
      })
      .pipe(
        catchError((error) => this._handleError(error))
      );
  }

  updateDoc$(doc: DocModel): Observable<DocModel> {
    return this.http
      .put<DocModel>(`${ENV.BASE_API}doc/${doc._id}`, doc, {
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
