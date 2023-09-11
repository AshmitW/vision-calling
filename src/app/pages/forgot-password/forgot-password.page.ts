import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController, ToastController } from '@ionic/angular';
import { UserService } from '../../services/user.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ForgotPasswordPage implements OnInit {
  email: string;
  loading: boolean = false;
  constructor(
    public menuCtrl: MenuController,
    private userService: UserService,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

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

  forgotPassword() {
    // Stop if email or password is empty
    if (!this.email) {
      this.presentToast('Please fill in the email field!');
      return;
    }
    this.loading = true;
    this.userService
      .forgotPassword(this.email)
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.loading = false;
          this.presentToast('Please check your email for further instructions');
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
