import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonImg, IonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-resource-detail',
  templateUrl: './resource-detail.page.html',
  styleUrls: ['./resource-detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonImg, IonBackButton, IonIcon, IonText, IonButton]
})
export class ResourceDetailPage implements OnInit {
  itemCorrente: any;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if(navigation?.extras.state){
      this.itemCorrente = navigation.extras.state['details'];
    }
   }

  ngOnInit() {
    if (!this.itemCorrente) {
      this.router.navigate(['/tabs/tab2']);
    }
  }

}
