import { Component } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { Camera } from 'ionic-native';

import { NavController, Platform } from 'ionic-angular';
import { TextQuestionDTO, TextAnswerDTO } from "../../common/dtos";
//import {QuestionDataService} from "../../common/question-data.service";

import { CameraWebPage } from "../camera-web/camera-web";
import { Subject } from "rxjs/Subject";
import 'rxjs/add/operator/debounceTime';


@Component({
  selector: 'page-text-question',
  templateUrl: 'text-question.html'
})
export class TextQuestionPage {
  private photoScr: string = "";
  private inputDebounced: Subject<string> = new Subject<string>();

  @Input() textQuestion: TextQuestionDTO;
  @Output() answer: EventEmitter<TextAnswerDTO> = new EventEmitter<TextAnswerDTO>();
  @Output() imageString: EventEmitter<string> = new EventEmitter<string>();

  constructor(public platform: Platform, public navCtrl: NavController){
    this.inputDebounced
      .debounceTime(500)
      .subscribe(
        (value) => {
          let answerDTO: TextAnswerDTO = <TextAnswerDTO>{
            "questionID": this.textQuestion.questionID,
            "questionText": this.textQuestion.questionText,
            "answerText": value,         
          };
          this.answer.emit(answerDTO);
        }
      );  
  }

  onInputChanged(event): void {  
    this.inputDebounced.next(event);
  }

  takePicture() {
    // launch Camera plugin if cordova is available, WebRTC implementation otherwise
    if (this.platform.is('cordova') && Camera) {
      Camera.getPicture({
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
        targetHeight: 1024,
        targetWidth: 1024,
        saveToPhotoAlbum: false,
        correctOrientation: true   
      }).then((imageData) => {
        this.photoScr = "data:image/jpeg;base64," + imageData;
        this.imageString.emit(this.photoScr);
      }, (err) => {
        console.log(err); // show error toast or something
      });
    }
    else {
      let photoCallbackFunc = (param) => {
        return new Promise((resolve, reject) => {
            this.photoScr = param;
            this.imageString.emit(param);
            resolve();
        });        
      }
      this.navCtrl.push(CameraWebPage, {callback: photoCallbackFunc});
    }
  }

  deletePicture() {
    this.photoScr = "";
  }
};
