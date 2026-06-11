import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonList, IonButton, 
  IonModal, IonButtons
 } from '@ionic/angular/standalone';
import { LoginFormComponent } from './login-form/login-form.component';
import { SignupFormComponent } from './signup-form/signup-form.component';

@Component({
  selector: 'app-pag1',
  templateUrl: './pag1.page.html',
  styleUrls: ['./pag1.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonInput,
     IonList, IonButton, IonModal, IonButtons, SignupFormComponent, LoginFormComponent]
})
export class Pag1Page implements OnInit {

  @ViewChild('loginModal') loginModal!: IonModal;
  @ViewChild('signupModal') signupModal!: IonModal;

  constructor() { }

  ngOnInit() {
  }

  loginCancel() {
    this.loginModal.dismiss(null, 'cancel');
  }

  loginConfirm() {
    this.loginModal.dismiss(null, 'confirm');
  }

  signupCancel() {
    this.signupModal.dismiss(null, 'cancel');
  }

  signupConfirm() {
    this.signupModal.dismiss(null, 'confirm');
  }

}
