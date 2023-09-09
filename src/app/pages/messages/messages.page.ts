import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  ToastController,
  IonModal,
  InfiniteScrollCustomEvent,
} from '@ionic/angular';
import { UserService } from '../../services/user.service';
import { first } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class MessagesPage implements OnInit {
  @ViewChild(IonModal) modal: IonModal;
  @ViewChild('mainMsgContent') private mainMsgContent: any;
  @ViewChild('modalMsgContent') private modalMsgContent: any;

  messages = [];
  user = {
    _id: '',
    name: '',
    email: '',
  };

  skip: number = 0;
  limit: number = 10;
  isMsgModalOpen: boolean = false;
  msg;
  newText: string = '';
  isSendMsgModalOpen: boolean = false;
  selectedUser = {
    _id: '',
    name: '',
    email: '',
  };
  searchKeyword: string = '';
  users = [];
  skipUsers: number = 0;
  limitUsers: number = 10;
  sendMsgModalStep: number = 1;
  openMsgId;

  constructor(
    private userService: UserService,
    private toastController: ToastController,
    public _zone: NgZone,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.checkIfOpenMsg();
    this.getAllMessages();
    this.getCurrentUser();
  }

  checkIfOpenMsg() {
    this.route.queryParams.subscribe(async (params) => {
      this.openMsgId = await params['openMsgId'];
      if (this.openMsgId) this.getOneMessage();
    });
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

  getOneMessage() {
    this.userService
      .getOneMessage(this.openMsgId)
      .pipe(first())
      .subscribe({
        next: (message) => {
          this.openMsgModal(message.data[0].items[0]);
        },
        error: (error) => {
          console.log(error);
          this.presentToast(error.error.errors.message);
        },
      });
  }

  getAllMessages() {
    this.userService
      .getAllMessages(this.skip, this.limit)
      .pipe(first())
      .subscribe({
        next: (messages) => {
          this.messages = messages.data[0].items;
        },
        error: (error) => {
          console.log(error);
          this.presentToast(error.error.errors.message);
        },
      });
  }

  getCurrentUser() {
    this.userService
      .getCurrentUser()
      .pipe(first())
      .subscribe({
        next: (user) => {
          this.user = user.data;
        },
        error: (error) => {
          console.log(error);
          this.presentToast(error.error.errors.message);
        },
      });
  }

  convertDate(timestamp) {
    return new Date(timestamp).toLocaleDateString();
  }

  convertTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('en', {
      hour: 'numeric',
      hour12: true,
      minute: 'numeric',
    });
  }

  sendMessage(id) {
    this.userService
      .sendMessage(id, this.newText)
      .pipe(first())
      .subscribe({
        next: (message) => {
          this.msg = message.data;
          this.newText = '';
          this.scrollToBottomForMsg();
          this.getAllMessages();
        },
        error: (error) => {
          console.log(error);
          this.presentToast(error.error.errors.message);
        },
      });
  }

  onDidDismissMsgModal() {
    this.isMsgModalOpen = false;
    this.msg = {};
  }

  openMsgModal(msg) {
    this.isMsgModalOpen = true;
    this.msg = msg;
    this.scrollToBottomForMsg();
  }

  cancelMsgModal() {
    this.isMsgModalOpen = false;
  }

  getUsers() {
    this.userService
      .getAllUsers(this.skipUsers, this.limitUsers, this.searchKeyword)
      .pipe(first())
      .subscribe({
        next: (users) => {
          this.users = users.data[0].items;
        },
        error: (error) => {
          console.log(error);
          this.presentToast(error.error.errors.message);
        },
      });
  }

  refreshUsers(event) {
    setTimeout(() => {
      this.skipUsers = 0;
      this.limitUsers = 10;
      this.searchKeyword = '';
      this.getUsers();
      event.target.complete();
    }, 1000);
  }

  onIonInfinite(ev) {
    this.limitUsers = this.limitUsers + 5;
    this.getUsers();
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  selectUserModal() {
    this.msg = {};
    this.getUsers();
    this.isSendMsgModalOpen = true;
  }

  selectUser(user) {
    this.selectedUser = user;
    this.sendMsgModalStep = 2;
  }

  onDidDismissSendMsgModal() {
    this.isSendMsgModalOpen = false;
    this.sendMsgModalStep = 1;
  }

  cancelSendMsgModal() {
    this.isSendMsgModalOpen = false;
    this.sendMsgModalStep = 1;
  }

  scrollToBottomForMsg() {
    this._zone.run(() => {
      setTimeout(() => {
        if (this.mainMsgContent) this.mainMsgContent.scrollToBottom(500);
        if (this.modalMsgContent) this.modalMsgContent.scrollToBottom(500);
      });
    });
  }
}
