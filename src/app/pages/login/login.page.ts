import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
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
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ionViewWillEnter() {
    this.loading = false;
    this.menuCtrl.enable(false);
  }

  ionViewWillLeave() {
    this.loading = false;
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      position: 'bottom',
    });

    await toast.present();
  }

  routeToSignUp() {
    this.router.navigate(['/signup']);
  }

  login() {
    if (!this.email || !this.password) {
      // console.log('Please fill in the email and password fields!');
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
          this.router.navigate([this.returnUrl], { replaceUrl: true });
        },
        error: (error) => {
          this.loading = false;
          if (error.error.error.code === 'VALIDATION_FAILED') {
            if (error.error.error.details[0].code === 'format') {
              // console.log('EMAIL INCORRECT FORMAT');
              this.presentToast('The format for email is incorrect!');
            }
            if (error.error.error.details[0].code === 'minLength') {
              // console.log('PASSWORD minimum 8 characters');
              this.presentToast(
                'Password should be minimum 8 characters long!'
              );
            }
          } else {
            // console.log(error.error.error.message);
            this.presentToast(error.error.error.message);
          }
        },
      });
  }
}
