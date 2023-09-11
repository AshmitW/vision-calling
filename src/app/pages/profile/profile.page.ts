import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { UserService } from '../../services/user.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ProfilePage implements OnInit {
  segmentValue: string = 'updateProfile';
  name: string;
  currentPassword: string;
  newPassword: string;
  loading: boolean = false;
  constructor(
    private userService: UserService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.getCurrentUserName();
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

  // get Current user's name to display
  getCurrentUserName() {
    this.userService
      .getCurrentUser()
      .pipe(first())
      .subscribe({
        next: (user) => {
          this.name = user.data.name;
        },
      });
  }

  updateProfile() {
    this.loading = true;
    this.userService
      .updateProfile(this.name)
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.loading = false;
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
  changePassword() {
    // Stop if either passwords are empty
    if (!this.currentPassword || !this.newPassword) {
      this.presentToast('Please fill in the both password fields!');
      return;
    }
    this.loading = true;
    this.userService
      .changePassword(this.currentPassword, this.newPassword)
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.loading = false;
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
