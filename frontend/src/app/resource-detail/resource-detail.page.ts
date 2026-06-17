import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonImg, IonText, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-resource-detail',
  templateUrl: './resource-detail.page.html',
  styleUrls: ['./resource-detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonImg, IonBackButton, IonIcon, IonText, IonButton]
})
export class ResourceDetailPage implements OnInit{
  @Input() resource: any;

  constructor(private modalController: ModalController) {}

  chiudi() {
    this.modalController.dismiss();
  }

  ngOnInit() {
  console.log('RESOURCE DETTAGLIO:', this.resource);
}

}
