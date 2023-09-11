import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink],
})
export class LoginPage implements OnInit {
  loading: boolean = false;
  returnUrl: string;
  email: string;
  password: string;

  constructor(
    public menuCtrl: MenuController,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // getting the current or returned URL
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Turn off the sidemenu
  ionViewWillEnter() {
    this.loading = false;
    this.menuCtrl.enable(false);
  }

  ionViewWillLeave() {
    this.loading = false;
  }

  // Toast template
  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      position: 'bottom',
    });

    await toast.present();
  }

  routeToSignUp() {
    this.router.navigate(['signup']);
  }

  // login endpoint
  login() {
    // Stop if email or password is empty
    if (!this.email || !this.password) {
      this.presentToast('Please fill in the email and password fields!');
      return;
    }
    this.loading = true;
    this.userService
      .login(this.email, this.password)
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.loading = false;
          // set a short and small timer of 500 miliseconds to allow the loading bar to turn off before changing routes
          setTimeout(() => {
            this.router.navigate([this.returnUrl], { replaceUrl: true });
          }, 500);
        },
        error: (error) => {
          this.loading = false;
          // Show validation errors in toast
          if (error.error.message === 'validation error') {
            this.presentToast(error.error.errors.errors[0].messages[0]);
          } else {
            // Show Other errors in toast
            this.presentToast(error.error.errors.message);
          }
        },
      });
  }
}
