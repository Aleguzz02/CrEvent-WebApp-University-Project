import { Component, OnInit } from '@angular/core';
import { IonItem, IonInput, IonList } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [IonItem, IonInput, IonList],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
