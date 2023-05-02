import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from './user.service';
@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(public userService: UserService, public router: Router) {}
  // canActivate() is depcrecated but for this use case this app wont be updated hence we can safely use this
  // Angular doc recommends just using plain javascript in the future
  canActivate(): boolean {
    if (!this.userService.isAuthenticated()) {
      // Route to login page if user is not authenticated
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }
}
