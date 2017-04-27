import { Component, OnInit, ViewChild } from '@angular/core';

// IONIC Components
import { Slides, Segment, Menu, SplitPane } from 'ionic-angular';

import { Platform, AlertController, NavController } from 'ionic-angular';

// PAGES
// import { ChoiceQuestionPage } from '../choice-question/choice-question';
// import { TextQuestionPage } from '../text-question/text-question';
// import { ListPage } from '../list/list';
// import { CoursePage } from "../course/course";

// SERVICES
import { QuestionDataService } from '../../common/question-data.service';

// DATA CLASSES
import { MultipleChoiceQuestionDTO, TextQuestionDTO, MultipleChoiceAnswerDTO, ResponseDTO } from '../../common/dtos';
import { Link } from '../../common/link';

@Component({
  selector: "hub-page",
  templateUrl: 'hub.html'
})

export class HubPage implements OnInit {
  @ViewChild(Slides) slides: Slides;
  @ViewChild(Segment) segment: Segment;
  @ViewChild(Menu) menu: Menu;
  @ViewChild(SplitPane) splitPane: SplitPane;

  textQuestionsFirst: boolean = false;

  animate: boolean = true;
  animateDuration: number = 250; //transition time in ms

  segmLeft: string = "";
  segmMid: string = "";
  segmRight: string = "";

  courses: string[];
  choiceQuestions: MultipleChoiceQuestionDTO[];
  textQuestions: TextQuestionDTO[];

  totalNumberOfQuestion: number;
  currentIndex: number = 0;

  links: Link[];

  textAnswerBuffer: string = "";

  constructor(public platform: Platform, public alertCtrl: AlertController, public navCtrl: NavController, private qds: QuestionDataService) {
    // Send Answer Callbacks
    this.qds.sendAnswersFailedCallback = (message: ResponseDTO, status: string) => this.alertOnUploadFail(message.message + "<br>HTTP " + status);
    this.qds.sendAnswersSucceedCallback = (message) => this.alertOnUploadComplete();
  }

  ngOnInit(): void {   
    if(this.qds.getIsSurveySet()) {
      this.courses = this.qds.getCourses();
      this.choiceQuestions = this.qds.getChoiceQuestions();
      this.textQuestions = this.qds.getTextQuestions();
      this.textQuestionsFirst = this.qds.getTextQuestionsFirst();

      this.totalNumberOfQuestion = this.choiceQuestions.length + this.textQuestions.length;

      this.generateLinkList();
    }
  }

  ngAfterViewInit() { 
    // prevent accidental swipes 
    this.slides.threshold = 15;

    if (this.menu) { 
      this.menu.type = "push";
    }
  }

  ionViewDidLoad() {
    this.onSlideChanged(); // update segment text
  }

  ionViewCanEnter() {
    return (this.qds && this.qds.getIsSurveySet());
  }

  splitPaneChanged(event) {  
    // prevents slide    
    // this.slides.onlyExternal = this.splitPane.isVisible();
  }

  onSlideChanged(): void {
    this.currentIndex = this.slides.getActiveIndex() || 0; // fallback to 0 if activeIndex undefinded

    if (this.currentIndex > this.totalNumberOfQuestion + 1) {
      this.currentIndex = this.totalNumberOfQuestion + 1;
    }

    this.segmLeft = this.getSegmentText(this.currentIndex - 1);
    this.segmMid = this.getSegmentText(this.currentIndex);
    this.segmRight = this.getSegmentText(this.currentIndex + 1);

    if(this.segment) {
      this.segment.writeValue("linkMid"); // set the middle segment button selected
    }
  }

  getSegmentText(index: number) : string {
    let segmentText = "";
    if (index == 0) {
          segmentText = "Studiengang";
    }
    if (index == this.totalNumberOfQuestion + 1) {
          segmentText = "Senden";
    }
    if ((index  > 0) && (index < this.totalNumberOfQuestion + 1)) {
      segmentText = "Frage " + index.toString() + "/" + this.totalNumberOfQuestion.toString();
    }
    return segmentText;
  }

  onCourseSelected(event) {
     this.links[0].checked = true;
     this.qds.setStudyPath(event as string);
     this.slides.slideNext(this.animate ? this.animateDuration : 0);
  }

  onChoiceSelected(event) {
    if (event) {
      let answer = event as MultipleChoiceAnswerDTO;
      if (answer){
        let index = this.textQuestionsFirst ? this.currentIndex - this.textQuestions.length : this.currentIndex;
        this.qds.addChoiceAnswer(index - 1, event);
        this.links[this.currentIndex].checked = true;
        this.slides.slideNext(this.animate ? this.animateDuration : 0);
      }
    }
    else {
      console.log("selected choice event undefinded");
    }
  }

  onTextAnswerChanged(event) {
    let textQuestionIndex = this.textQuestionsFirst ? this.currentIndex : this.currentIndex - this.choiceQuestions.length;
    if(this.qds.addTextAnswer(textQuestionIndex - 1, event)){
      this.links[this.currentIndex].checked = true;
    }
  }

  onImageAnswerChanged(event) {
    let textQuestionIndex = this.textQuestionsFirst ? this.currentIndex : this.currentIndex - this.choiceQuestions.length;
    if(this.qds.addImageAnswer(textQuestionIndex - 1, event)){
      this.links[this.currentIndex].checked = true;
    }
  }

  onSendPressed(): void {
    if (!this.qds.getStudyPath() || this.qds.getStudyPath() == "") {
      this.warnNoCourseSelected();   
      return;        
    }

    console.log("SEND PRESSED ---- ");

    let unchecked = -1; // -1 (senden-link)
    for (let l of this.links) {
      if (!l.checked) { unchecked++ }
    }  
    if (unchecked > 0) {
      if (unchecked == this.totalNumberOfQuestion) {
        this.warnNoQuestionsAnswered();
      } else {
        this.warnNotComplete(unchecked);
      }
    } else {           
      this.qds.sendAnswers();
    }
  }

  onLinkSelected(event) {
    let num = event as number;
    this.slides.slideTo(num, 0);
    if (this.menu) {
      this.menu.close();
    }
  }

  warnNoCourseSelected() {
    let alert = this.alertCtrl.create({
      title: 'Kein Studiengang gewählt.',
      message: 'Sie müssen einen Studiengang wählen, wenn Sie ihre Antworten absenden wollen.',
      buttons: [{text: 'Okay', handler: () => { this.slides.slideTo(0); } }]
    });
    alert.present();
  }

  warnNoQuestionsAnswered() {
    let confirm = this.alertCtrl.create({
      title: 'Keine Frage beantwortet.',
      message: 'Es wurde keine Frage beantwortet.',
      buttons: [
        {
          text: 'Okay',
          handler: () => { }
        }      
      ]
    });
    confirm.present();
  }

  warnNotComplete(unchecked: number, hideSendAnyway?: boolean) {
    let confirm = this.alertCtrl.create({
      title: 'Nicht vollständig.',
      message: unchecked + ' Fragen wurden nicht beantwortet. Unvollständigen Fragebogen trotzdem senden?',
      buttons: [
        {
          text: 'Abbrechen',
          handler: () => {
            console.log('Disagree clicked');
          }
        }, hideSendAnyway ? {} : 
        {
          text: 'Trotzdem senden',
          handler: () => {
            console.log('TROTZDEM SENDEN');
            this.qds.sendAnswers();
          }
        }
      ]
    });
    confirm.present();
  }

  alertOnUploadFail(_message: string) {
    let confirm = this.alertCtrl.create({
      title: 'Fehler beim Upload der Antworten.',
      message: _message,
      buttons: [
        {
          text: 'Wiederholen',
          handler: () => {
            console.log('UPLOAD WIEDERHOLEN');
            this.qds.sendAnswers();
          }
        },
        {
          text: 'Abbrechen',
          handler: () => {
          }
        }
      ]
    });
    confirm.present();
  }

  alertOnUploadComplete() {
    let confirm = this.alertCtrl.create({
      title: 'Upload abgeschlossen.',
      message: 'Der Upload der Antworten wurde erfolgreich abgeschlossen.',
      buttons: [{
          text: 'Ok',
          handler: () => {
            if (this.platform.is('cordova'))
              this.platform.exitApp();   
            else
              window.location.reload();
          }
        }
      ]
    });
    confirm.present();
  }

  generateLinkList(): void {
    this.links = [];
    let counter = 0;
    this.links.push(new Link("Studiengang", counter++, false));

    if (this.totalNumberOfQuestion > 0)
    {
      // create choice question tabs  
      for (let question of this.choiceQuestions){
        //let tabTitle = "Frage " + counter + "/" + this.totalNumberOfQuestion;
        this.links.push(new Link(question.question, counter++, false));
      }

      // create text question tabs
      for (let question of this.textQuestions){
        //let tabTitle = "Frage " + counter + "/" + this.totalNumberOfQuestion;
        this.links.push(new Link(question.questionText, counter++, false));       
      }
    }

    this.links.push(new Link("Senden", counter, false));
  }
}

