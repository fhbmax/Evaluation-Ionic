import { Component, ViewChild } from '@angular/core';
import { NavController, Platform, AlertController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { ResponseDTO } from "../../common/dtos";
import { QuestionDataService } from "../../common/question-data.service";
import { HubPage } from "../hub/hub";

import { QrScannerComponent } from "angular2-qrscanner"; 

@Component({
  selector: 'page-scanner',
  templateUrl: 'scanner.html',
  providers: [BarcodeScanner]
})
export class ScannerPage {
  @ViewChild(QrScannerComponent) qrScanner: QrScannerComponent; 
  qrResult: string = "";

  constructor(private platform:Platform, 
    private navCtrl: NavController, 
    private qds: QuestionDataService, 
    private AlertCtrl: AlertController,  
    private barcodeScanner? : BarcodeScanner) { }

  ngOnInit() {
    // http request callbacks
     this.qds.getQuestionsFailedCallback = (errData: ResponseDTO, status: string) => this.alertOnHttpFail(errData, status);
     this.qds.getQuestionsSucceedCallback = (data) => this.navCtrl.setRoot(HubPage, {}, {animate: true, direction: "forward"});
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.scan();
    });
  }

  scan() {
    console.log("scan() ");
    if(this.platform.is('cordova')) {
      console.log("Starting QR scan using cordova plugin BarcodeScanner");
      if(this.barcodeScanner) {
        this.barcodeScanner.scan()
         .then((result) => {             
              this.setQrDataSendRequest(result.text)
            }, (err) => {
              this.alertOnQrFail(err);
            }
          )
      }
      else {
         this.alertOnQrFail("BarcodeScanner plugin unavailable.")
      }
    }
    else {
      console.log("Starting QR scan using angular2-qrscanner");
      if (this.qrScanner) {
        console.log("qr scanner stream: "  + this.qrScanner.stream);
        this.qrScanner.facing = "environment";
        this.qrScanner.startScanning();
      }
      else {
        console.log("qrScanner undefined");
      }
    }   
  }

  onReadQR(event) {
    this.setQrDataSendRequest(event);
  }
  
  setQrDataSendRequest(data: string) {
    if(this.qds.setQrData(data)) {
      this.qrResult = data;
      this.qds.startQuestionsRequest();
    } else {
      this.alertOnQrFail("Falsches Format." + data);
    }
  }

  alertOnQrFail(err: string){
       let alert = this.AlertCtrl.create({
        title: "Fehler beim Scannen des QRCodes.", //String(errData.type),
        subTitle: err,
        buttons: [{
            text: 'Wiederholen',
            handler: () => {
              this.scan();                
            }
        }, {
            text: 'Beenden',
            handler: () => {
                this.platform.exitApp();
            }
        }]
    });
    alert.present();
  }

  alertOnHttpFail(errData: ResponseDTO, status?: string){
    let alert = this.AlertCtrl.create({
        title: "Fehler beim Abruf des Fragebogens.", //String(errData.type),
        subTitle: errData.message + (status ? "<br> HTTP " + status : ""),
        buttons: [{
            text: 'Anfrage wiederholen',
            handler: () => this.qds.startQuestionsRequest()
        }, {
            text: 'QR Scan wiederholen',
            handler: () => this.scan()
        }, {
            text: 'Beenden',
            handler: () => this.platform.exitApp()            
        }]
    });
    alert.present();
  }

  testSkip(): void {
    this.setQrDataSendRequest('{"voteToken":"TestLoadLocal", "host":"debug"}');
  }

  enterToken(): void {
    var token = prompt("Enter the Token", "");
    if (token != null && token != "") {
        this.setQrDataSendRequest('{"voteToken":"'+token+'","host":"https://evaluation.fh-brandenburg.de:8443"}');
    }
  }
}





