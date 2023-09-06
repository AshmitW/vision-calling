import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class SignupPage implements OnInit {
  loading: boolean = false;
  name: string;
  email: string;
  password: string;

  constructor(
    public menuCtrl: MenuController,
    private router: Router,
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

  // Sign up endpoint
  signUp() {
    // If username, email and password are not empty
    if (!this.name || !this.email || !this.password) {
      this.presentToast('Please fill in all the fields!');
      return;
    }
    this.loading = true;
    this.userService
      .signUp(this.name, this.email, this.password)
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.loading = false;
          // set a short and small timer of 500 miliseconds to allow the loading bar to turn off before changing routes
          setTimeout(() => {
            this.router.navigate(['/login'], { replaceUrl: true });
          }, 500);
        },
        error: (error) => {
          this.loading = false;
          // Showing different errors based on code
          if (error.error.error.code === 'VALIDATION_FAILED') {
            if (error.error.error.details[0].code === 'format') {
              this.presentToast('The format for email is incorrect!');
            }
            if (error.error.error.details[0].code === 'minLength') {
              this.presentToast(
                'Password should be minimum 8 characters long!'
              );
            }
          } else {
            this.presentToast(error.error.error.message);
          }
        },
      });
  }
}
