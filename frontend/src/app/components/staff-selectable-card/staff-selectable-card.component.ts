import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StaffResource } from '../../interfaces/staff.interface';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent, IonIcon, IonImg, IonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-staff-selectable-card',
  templateUrl: './staff-selectable-card.component.html',
  styleUrls: ['./staff-selectable-card.component.scss'],
  standalone: true,
  imports: [CommonModule,
    IonCard,
    IonCardContent,
    IonImg,
    IonText,
    IonIcon],
})
export class StaffSelectableCardComponent  implements OnInit {

  @Input({ required: true }) staff!: StaffResource;
  @Input() selected = false;

  @Output() selectedStaff = new EventEmitter<StaffResource>();

  constructor() { }

  ngOnInit() {}

  selectStaff() {
    this.selectedStaff.emit(this.staff);
  }

  get nomeCompleto() {
    return `${this.staff.nome} ${this.staff.cognome}`;
  }

  get dettaglioStaff() {
    return this.staff.genereMusicale
      || this.staff.genereFotografico
      || this.staff.mansione
      || this.staff.tipo;
  }

  get staffImage() {
    if (this.staff.url) {
      if (this.staff.url.startsWith('http://') || this.staff.url.startsWith('https://')) {
        return this.staff.url;
      }

      return 'http://localhost:3000' + this.staff.url;
    }

    return 'https://via.placeholder.com/350x180';
  }

}
