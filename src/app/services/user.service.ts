import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { UserToken } from '../models/user-token';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private tokenSubject: BehaviorSubject<UserToken>;
  public token: Observable<UserToken>;

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {
    this.tokenSubject = new BehaviorSubject<UserToken>(
      JSON.parse(localStorage.getItem('userToken'))
    );
    this.token = this.tokenSubject.asObservable();
  }

  // Get the JWT
  public get tokenValue(): UserToken {
    return this.tokenSubject.value;
  }

  // To check if authenticated with the JWT
  public isAuthenticated(): boolean {
    if (localStorage.getItem('userToken')) {
      const token = JSON.parse(localStorage.getItem('userToken')).token;
      // console.log(token);
      // Check whether the token is expired and return true or false
      return !this.jwtHelper.isTokenExpired(token);
    } else {
      return false;
    }
  }

  // Login
  login(email: string, password: string) {
    const fcmToken = localStorage.getItem('fcmToken')
      ? localStorage.getItem('fcmToken')
      : ' ';
    return this.http
      .post<UserToken>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
        fcmToken,
      })
      .pipe(
        map((token) => {
          const userToken: UserToken = token;

          localStorage.setItem('userToken', JSON.stringify(userToken));
          this.tokenSubject.next(userToken);

          return userToken;
        })
      );
  }

  // Forgot Password
  forgotPassword(email: string) {
    return this.http
      .get<any>(`${environment.apiUrl}/auth/forgot-password?email=${email}`)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  // Signup
  signUp(name: string, email: string, password: string) {
    return this.http
      .post<any>(`${environment.apiUrl}/auth/register`, {
        name,
        email,
        password,
      })
      .pipe(
        map((user) => {
          return user;
        })
      );
  }

  // Get all users with filters
  getAllUsers(skip: number, limit: number, keyword: string) {
    return this.http
      .get<any>(
        `${environment.apiUrl}/user/all?skip=${skip ?? skip}&limit=${
          limit ?? limit
        }&keyword=${keyword ?? keyword}`
      )
      .pipe(
        map((users) => {
          return users;
        })
      );
  }

  // Update user
  updateProfile(name: string) {
    return this.http
      .post<any>(`${environment.apiUrl}/user/update`, {
        name,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  // Update user
  changePassword(oldPassword: string, newPassword: string) {
    return this.http
      .post<any>(`${environment.apiUrl}/user/change-password`, {
        oldPassword,
        newPassword,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  // Get all messages with filters
  getAllMessages(skip: number, limit: number) {
    return this.http
      .get<any>(
        `${environment.apiUrl}/msg/all?skip=${skip ?? skip}&limit=${
          limit ?? limit
        }`
      )
      .pipe(
        map((msges) => {
          return msges;
        })
      );
  }

  // Get one message
  getOneMessage(msgId: string) {
    return this.http
      .get<any>(`${environment.apiUrl}/msg/all?skip=0&limit=10&msgId=${msgId}`)
      .pipe(
        map((msg) => {
          return msg;
        })
      );
  }

  // send message
  sendMessage(receiverId: string, text: string) {
    return this.http
      .post<any>(`${environment.apiUrl}/msg/send`, {
        receiverId,
        text,
      })
      .pipe(
        map((msg) => {
          return msg;
        })
      );
  }

  // Get all live users with filters
  getAllLiveUsers(skip: number, limit: number, keyword: string) {
    return this.http
      .get<any>(
        `${environment.apiUrl}/user/all?skip=${skip ?? skip}&limit=${
          limit ?? limit
        }&keyword=${keyword ?? keyword}&isLiveStreaming=true`
      )
      .pipe(
        map((users) => {
          return users;
        })
      );
  }

  // Join a call
  joinCall(visionCode: string) {
    return this.http
      .get<any>(`${environment.apiUrl}/rtc/join-call?visionCode=${visionCode}`)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  // Invite a user into a call
  inviteCall(receiverId: string, visionCode: string) {
    return this.http
      .get<any>(
        `${environment.apiUrl}/rtc/invite-call?visionCode=${visionCode}&receiverId=${receiverId}`
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  // Create a live stream
  createStream(visionCode: string) {
    return this.http
      .get<any>(
        `${environment.apiUrl}/rtc/create-stream?visionCode=${visionCode}`
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  // Join a user's live stream
  joinStream(hostId: string) {
    return this.http
      .get<any>(`${environment.apiUrl}/rtc/join-stream?hostId=${hostId}`)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  // End RTC session
  endRtcSession() {
    return this.http.get<any>(`${environment.apiUrl}/rtc/end-session`).pipe(
      map((response) => {
        return response;
      })
    );
  }

  // Get user from ID with this endpoint
  getUser(userId: string) {
    return this.http
      .get<any>(`${environment.apiUrl}/user/get?userId=${userId}`)
      .pipe(
        map((user) => {
          return user;
        })
      );
  }

  // Get current logged in user info
  getCurrentUser() {
    return this.http.get<any>(`${environment.apiUrl}/user/me`).pipe(
      map((user: any) => {
        return user;
      })
    );
  }

  // Logout from where we remove the JWT
  logout() {
    return this.http.get<any>(`${environment.apiUrl}/auth/logout`).pipe(
      map((response: any) => {
        localStorage.removeItem('userToken');
        this.tokenSubject.next(null);
        localStorage.removeItem('visionCode');
        return response;
      })
    );
  }
}
