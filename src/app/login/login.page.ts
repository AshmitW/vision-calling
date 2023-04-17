import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LoginPage implements OnInit {
  loading = false;
  submitted = false;
  returnUrl: string;
  email: string;
  password: string;

  constructor(
    public menuCtrl: MenuController,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  login() {
    this.submitted = true;

    // stop here if values are invalid
    if (!this.email || !this.password) {
      return;
    }

    this.loading = true;
    this.userService
      .login(this.email, this.password)
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.loading = false;
        },
      });

    // deprycated old method
    // .subscribe(
    //   (data) => {
    //     this.router.navigate([this.returnUrl]);
    //   },
    //   (error) => {
    //     this.loading = false;
    //   }
    // );
  }
}
