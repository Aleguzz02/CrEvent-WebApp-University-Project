import { Component, OnInit } from '@angular/core';
import { IonItem, IonInput, IonList } from '@ionic/angular/standalone';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [IonItem, IonInput, IonList],
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
})
export class SignupFormComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
