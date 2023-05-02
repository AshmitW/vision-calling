import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { UserToken } from '../models/user-token';
import { UserInfo } from '../models/user-info';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AgoraToken } from '../models/agora-token';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private tokenSubject: BehaviorSubject<UserToken>;
  public token: Observable<UserToken>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) {
    this.tokenSubject = new BehaviorSubject<UserToken>(
      JSON.parse(localStorage.getItem('user-token'))
    );
    this.token = this.tokenSubject.asObservable();
  }

  // Get the JWT
  public get tokenValue(): UserToken {
    return this.tokenSubject.value;
  }

  // To check if authenticated with the JWT
  public isAuthenticated(): boolean {
    if (localStorage.getItem('user-token')) {
      const token = JSON.parse(localStorage.getItem('user-token')).token;
      // console.log(token);
      // Check whether the token is expired and return true or false
      return !this.jwtHelper.isTokenExpired(token);
    } else {
      return false;
    }
  }

  // Login endpoint
  login(email: string, password: string) {
    return this.http
      .post<UserToken>(`${environment.apiUrl}/users/login`, {
        email,
        password,
      })
      .pipe(
        map((token) => {
          const userToken: UserToken = token;

          localStorage.setItem('user-token', JSON.stringify(userToken));
          this.tokenSubject.next(userToken);

          return userToken;
        })
      );
  }

  // Signup endpoint
  signUp(username: string, email: string, password: string) {
    return this.http
      .post<UserInfo>(`${environment.apiUrl}/signup`, {
        username,
        email,
        password,
      })
      .pipe(
        map((user) => {
          return user;
        })
      );
  }

  // Get user from ID with this endpoint
  getUser(id: string) {
    return this.http
      .post<UserInfo>(`${environment.apiUrl}/users`, {
        id,
      })
      .pipe(
        map((user) => {
          return user;
        })
      );
  }

  // Get current user from ID inside JWT with this endpoint
  getCurrentUser() {
    return this.http.get<UserInfo>(`${environment.apiUrl}/whoAmI`).pipe(
      map((user: UserInfo) => {
        return user;
      })
    );
  }

  // Get RTC token with this endpoint
  getAgoraRtcToken(channelName: string, uid: string) {
    return this.http
      .post<AgoraToken>(`${environment.apiUrl}/agora/token`, {
        channelName,
        uid,
      })
      .pipe(
        map((agoraToken) => {
          return agoraToken;
        })
      );
  }

  // Logout from where we remove the JWT
  logout() {
    localStorage.removeItem('user-token');
    this.tokenSubject.next(null);
    this.router.navigate(['/login']);
  }
}
