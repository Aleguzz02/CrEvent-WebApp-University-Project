import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonItem, IonInput, IonList, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [IonItem, IonInput, IonList, IonButton, ReactiveFormsModule],
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
})
export class SignupFormComponent  implements OnInit {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.signupForm = this.fb.group({
      nome: ['', Validators.required ],
      cognome: ['', Validators.required],
      dataNascita: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  onSubmit() {
    if (this.signupForm.valid) {
      return this.signupForm.value;
    }
    return null;
  }

}
