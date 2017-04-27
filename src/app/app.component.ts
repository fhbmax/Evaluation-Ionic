import { Component } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { HubPage } from '../pages/hub/hub';
import { ScannerPage } from '../pages/scanner/scanner';

@Component({
  templateUrl: 'app.html'
})
export class EvaluationIonic {
  rootPage = ScannerPage;

  constructor(public alertCtrl: AlertController, public platform: Platform) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //StatusBar.styleDefault();
      StatusBar.backgroundColorByHexString("#CC0A2F");
      Splashscreen.hide();
    });
  }

  exit() {
    console.log("exit() hook called");

    let confirm = this.alertCtrl.create({
      title: 'Beenden',
      message: 'Möchtest du die App wirklich beenden?',
      buttons: [
        {
          text: 'Nein',
          role: 'cancel'        
        },
        {
          text: 'Ja',
          handler: () => {
            this.platform.exitApp();
          }
        }
      ]
    });
    confirm.present();
  }

}
