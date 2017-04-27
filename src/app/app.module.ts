import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { HttpModule } from "@angular/http";
import { BrowserModule } from '@angular/platform-browser';

import { QrScannerModule } from 'angular2-qrscanner';

import { EvaluationIonic } from './app.component';
import { ScannerPage } from '../pages/scanner/scanner';
import { HubPage } from '../pages/hub/hub';
import { ChoiceQuestionPage } from '../pages/choice-question/choice-question';
import { TextQuestionPage } from '../pages/text-question/text-question';    
import { CoursePage } from "../pages/course/course";
import { ListPage } from "../pages/list/list";
import { SendPage } from "../pages/send/send";
import { CameraWebPage } from "../pages/camera-web/camera-web";

import { QuestionDataService } from "../common/question-data.service";

@NgModule({
  declarations: [
    EvaluationIonic,
    ScannerPage,
    HubPage,
    CoursePage,
	  ChoiceQuestionPage,
    TextQuestionPage,
    CameraWebPage,
    ListPage,
    SendPage    
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(EvaluationIonic),
    QrScannerModule 
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    EvaluationIonic,
    ScannerPage,
    HubPage,
    CoursePage,
	  ChoiceQuestionPage,
    TextQuestionPage,
    CameraWebPage,
    ListPage    
  ],
  providers: [QuestionDataService, {provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
