import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/*
  Generated class for the CameraWeb page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-camera-web',
  templateUrl: 'camera-web.html'
})
export class CameraWebPage {
  @ViewChild('video') video: any;
  @ViewChild('canvas') canvas: any;

  callback: Function;

  numberOfCams: number = 0;

  streaming: boolean = false;
  shutterDisabled: boolean = true;
  frontCam: boolean = false;

  mediaStream: MediaStream;
 
  photoDataString: string = "";

  width: number = 1024;
  height: number = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
      return;
    }

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      devices.forEach(function(device) {
        if(device.kind == "videoinput"){
          console.log(device.kind + ": " + device.label +
                    " id = " + device.deviceId);
          this.numberOfCams++;
        }
      });
    })
    .catch(function(err) {
      console.log(err.name + ": " + err.message);
    });
  }

  ionViewWillEnter() {
    this.callback = this.navParams.get("callback");
  }

  ionViewDidEnter() {    
    this.startCapture();
  }

  ionViewWillLeave() { 
    this.stopCapture();
  }

  startCapture() {
    if (this.streaming) {
      this.stopCapture();
    }

    let _video = this.video.nativeElement;
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      let camConstrains = {audio: false, video: {facingMode: this.frontCam ? "user" : "environment"}};
      navigator.mediaDevices.getUserMedia(camConstrains).then((stream) => {
        _video.src = window.URL.createObjectURL(stream);
        _video.play();
        this.shutterDisabled = false;
        this.mediaStream = stream;
      }), (err) => { // TODO toast or alert
        console.log("Error when accessing video stream from Camera! " + err);
      }
    } 
    else {
      this.clearPhoto();
    }
  }

  stopCapture() {
    if (this.mediaStream) {    
      let tracks: MediaStreamTrack[] = this.mediaStream.getTracks();
      for (let track of tracks) {
        track.stop();
        console.log(track.id + " stopped");
      }
    }
  }

  streamStarted() {   
    let _video = this.video.nativeElement;
    let _canvas = this.canvas.nativeElement;

    if (!this.streaming) {
      this.height = _video.videoHeight / (_video.videoWidth/this.width);
      _canvas.setAttribute('width', this.width);
      _canvas.setAttribute('height', this.height);
      
      this.streaming = true;
    }
  }

  clearPhoto() {
    let _canvas = this.canvas.nativeElement;
    let context = _canvas.getContext('2d');
    context.fillStyle = "transparent";
    context.fillRect(0, 0, _canvas.width, _canvas.height);

    this.photoDataString = _canvas.toDataURL('image/jpg');
  }

  snapPicture() {  
    let _canvas = this.canvas.nativeElement;
    let _video = this.video.nativeElement;
    let context = _canvas.getContext("2d");

    if(this.width && this.height) {
      context.drawImage(_video, 0, 0, this.width, this.height);
      this.photoDataString = _canvas.toDataURL("image/jpg");

      if (this.callback) {
        this.callback(this.photoDataString).then(()=>{
            this.navCtrl.pop();
        });
      }
    } 
    else {
      this.clearPhoto();
    }   
  }

  flipCam() {
    this.stopCapture();
    this.frontCam = !this.frontCam;
    this.startCapture();
  }
}
