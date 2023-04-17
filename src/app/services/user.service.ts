import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { UserToken } from '../models/user-token';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private tokenSubject: BehaviorSubject<UserToken>;
  public token: Observable<UserToken>;
  errorMessage: any;

  constructor(private router: Router, private http: HttpClient) {
    this.tokenSubject = new BehaviorSubject<UserToken>(
      JSON.parse(localStorage.getItem('user-token'))
    );
    this.token = this.tokenSubject.asObservable();
  }

  public get tokenValue(): UserToken {
    return this.tokenSubject.value;
  }

  login(email: string, password: string) {
    return (
      this.http
        .post<UserToken>(`${environment.apiUrl}/users/login`, {
          email,
          password,
        })
        // .pipe(
        //   catchError((error: any, caught: Observable<any>): Observable<any> => {
        //     this.errorMessage = error.message;
        //     console.error('There was an error!', error);

        //     // after handling error, return a new observable
        //     // that doesn't emit any values and completes
        //     return of();
        //   })
        // )
        // .subscribe((token) => {
        //   const userToken: UserToken = token;

        //   localStorage.setItem('user-token', JSON.stringify(userToken));
        //   this.tokenSubject.next(userToken);

        //   return userToken;
        // });

        .pipe(
          map((token) => {
            const userToken: UserToken = token;

            localStorage.setItem('user-token', JSON.stringify(userToken));
            this.tokenSubject.next(userToken);

            return userToken;
          })
        )
    );
  }

  logout() {
    localStorage.removeItem('user-token');
    this.tokenSubject.next(null);
    this.router.navigate(['/login']);
  }
}
