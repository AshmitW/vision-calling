import { Routes, CanActivate } from '@angular/router';
import { AuthGuardService as AuthGuard } from './services/auth-guard.service';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup.page').then((m) => m.SignupPage),
  },
  {
    path: 'welcome',
    loadComponent: () =>
      import('./pages/welcome/welcome.page').then((m) => m.WelcomePage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard],
  },
  {
    path: 'messages',
    loadComponent: () =>
      import('./pages/messages/messages.page').then((m) => m.MessagesPage),
    canActivate: [AuthGuard],
  },

  {
    path: 'video',
    loadComponent: () =>
      import('./pages/video/video.page').then((m) => m.VideoPage),
    canActivate: [AuthGuard],
  },
];
