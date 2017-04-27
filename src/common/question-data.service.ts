import { Injectable } from "@angular/core";
import { Headers, Http } from '@angular/http';

import { QuestionsDTO, MultipleChoiceQuestionDTO, AnswersDTO, ChoiceDTO, MultipleChoiceAnswerDTO, TextQuestionDTO, TextAnswerDTO, ResponseDTO, RequestDTO} from './dtos';

import { MultipartItem } from './multipart-upload/multipart-item';
import { MultipartUploader } from './multipart-upload/multipart-uploader';

import JSZip from 'jszip';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';


const API = "v1";

//ref index.html to www/build/js/jszip.min.js
//declare var JSZip:any;
//global debug mode flag
export var debugMode:boolean = true;

class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }
}

@Injectable()
export class QuestionDataService{
  // Private
  private voteToken:string = null;
	private deviceID:string = null;
	private host:string = "";

	private imageBlobs:any = [];

	private surveyQs: QuestionsDTO = undefined;
  private surveyAs: AnswersDTO = undefined;

  // Callbacks
  getQuestionsFailedCallback: (data: ResponseDTO, status: string) => void;
  getQuestionsSucceedCallback: (data: QuestionsDTO) => void;
  sendAnswersFailedCallback: (data: ResponseDTO, status: string) => void;
  sendAnswersSucceedCallback: (successMsg: ResponseDTO) => void;

  constructor(private http:Http) {
    this.generateDeviceIdIfNotExists();
  }

  //GETTER on survey/Questionnaire
  getIsSurveySet(): boolean {
    return this.surveyQs != undefined;
  }

  getCourses():string[] {
    return this.surveyQs.studyPaths;
  }

  getChoiceQuestions(): MultipleChoiceQuestionDTO[] {
    return this.surveyQs.multipleChoiceQuestionDTOs;
  }

  getTextQuestions(): TextQuestionDTO[] {
    return this.surveyQs.textQuestions;
  }

  getTextQuestionsFirst(): boolean {
    return this.surveyQs.textQuestionsFirst;
  }

  // get,set on Answers Data
  setStudyPath(studypath) {
    this.surveyAs.studyPath = studypath;
  }

  getStudyPath() {
    return this.surveyAs.studyPath;
  }

  setQrData(qrString: string) {    
    try {
      var qrDTO = JSON.parse(qrString);
      this.voteToken = qrDTO.voteToken;
      this.host = qrDTO.host;
      return true;
    } catch(e) {
      console.log("Error parsing QR Contents");
      return false;
    }
  }

  startQuestionsRequest() { 
    if(debugMode && this.host === "debug") {
      console.log("DEBUG MODE: loading local test questions");
      this.setTestData();
      this.handleGetQuestionSuccess(this.surveyQs);
      return;
    }

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    let requestDto: RequestDTO = {"voteToken": this.voteToken, "deviceID": this.deviceID};
    let body = JSON.stringify(requestDto);

    if(debugMode)
      console.log(body);
      
    let requestURL = this.host + '/' + API + '/questions';
    console.log("sending post request to " + requestURL);

    this.http.post(requestURL, body, { headers: headers })
      .timeout(5000)
      .map(res => res.json())
      .subscribe(     
        data => this.handleGetQuestionSuccess(data),
        err => this.handleGetQuestionError(err),        
        () => console.log('request done')
    )
  }

  private handleGetQuestionSuccess(data) {
    if (debugMode) {
      console.log("handleGetQuestionSuccess: " + JSON.stringify(data));
    }
    let questionsDTO = <QuestionsDTO>data;
    this.surveyQs = questionsDTO;
    this.initAnswerDto();
    this.getQuestionsSucceedCallback(questionsDTO);
  }

  private handleGetQuestionError(err) {
    console.log("ERROR on get Questions " + err);

    let errBody = err._body;
    if (typeof errBody == 'string' || errBody instanceof String) {
      try {
        let errData: ResponseDTO = <ResponseDTO>(JSON.parse(errBody.toString()));
        this.getQuestionsFailedCallback(errData, err.status);
      } 
      catch (ex) {
        console.log(err.toString());
      }
    } else {
      this.getQuestionsFailedCallback(<ResponseDTO>{"message": "Server not responding", "type": -1}, err.status);
    }
  }

 // ensure compliance with REST API --> include questions with empty answers
  initAnswerDto() {
    let answers = new AnswersDTO();
    answers.voteToken = this.voteToken;
    answers.studyPath = "";
    answers.textAnswers = [];
    for (let tquestion of this.surveyQs.textQuestions) {
      let txtAnswer = new TextAnswerDTO();
      txtAnswer.questionText = tquestion.questionText;
      txtAnswer.questionID = tquestion.questionID;
      txtAnswer.answerText = "";
      answers.textAnswers.push(txtAnswer);
    }    
    answers.mcAnswers = [];
    for(let question of this.surveyQs.multipleChoiceQuestionDTOs) {
      let mcAnswer = new MultipleChoiceAnswerDTO();
      mcAnswer.questionText = question.question;
      mcAnswer.choice = <ChoiceDTO>{"choiceText": (question.choices && question.choices[0].grade == 0) ? question.choices[0].choiceText : "", "grade": 0};
      answers.mcAnswers.push(mcAnswer);
    }
    answers.deviceID = this.deviceID;
    this.surveyAs = answers;     
  }

  generateMultipartItem() {
	  let url = this.host + "/" + API + "/answers";
	  let uploader = new MultipartUploader(url);
		uploader.url = url;
		uploader.timeout = 5000;
		let multipartItem = new MultipartItem(uploader);
		multipartItem.url = url;

    this.surveyAs.deviceID = this.deviceID;
    this.surveyAs.voteToken = this.voteToken;
    this.surveyAs.mcAnswers = this.surveyAs.mcAnswers || [];
    this.surveyAs.textAnswers = this.surveyAs.textAnswers || [];

		let body = JSON.stringify(this.surveyAs);   

	  if (debugMode) 
      console.log("generateMultipartItem: " + body);

		if (multipartItem.formData == null) {
			multipartItem.formData = new FormData();
		}    
	  multipartItem.callback = (data) => this.handleUploadCallback(data);
		multipartItem.formData.append("answers-dto", body);

		return multipartItem;
  }

  sendAnswers() {
    let multipartItem = this.generateMultipartItem();

    if (this.imageBlobs.length == 0) {
      multipartItem.formData.append("images", new Blob());
      multipartItem.upload();
    } 
    else {
      let zip = new JSZip();
      let images = zip.folder("images");            
      for (let img of this.imageBlobs) {
        images.file(img.id + ".jpg", img.image);
      }
      zip.generateAsync({type : "blob"}).then(
        (content) => {
          multipartItem.formData.append("images", content);
          multipartItem.upload();
      });
    }

    return;
  }

  private handleUploadCallback = (data) => {
    if(debugMode) console.log("handleUploadCallback:", data);
    if (data){
      console.log("DATA received");
      try {
        let response:ResponseDTO = <ResponseDTO>(JSON.parse(data)); 
        console.log("DATA JSON parsed");     
        if(response.type == 2) { //type 2 is de.thb.ue.dto.util.ErrorType.ANSWERS_SUCCESSFULLY_ADDED
          this.sendAnswersSucceedCallback(response); 
        } else {
          this.sendAnswersFailedCallback(response, data.status);
        }
      } catch(err) { // 404 message
        console.log("error PARSINg" + err);
        this.sendAnswersFailedCallback(<ResponseDTO>{"message": "Server not responding", "type": -1}, data.status);
      }
    } else {
      console.log("no DATA received >> failedCallback");
      this.sendAnswersFailedCallback(<ResponseDTO>{"message": "Server not responding", "type": -1}, data.status);
    }
  }

  private generateDeviceIdIfNotExists() {
    if (this.deviceID == null) {
      this.deviceID = Guid.newGuid();
    }
  }

  addTextAnswer(index: number, answer:TextAnswerDTO): boolean {
    if (!this.surveyAs.textAnswers) {
      console.log("initialize text answers array");
      this.surveyAs.textAnswers = new Array<TextAnswerDTO>(this.surveyQs.textQuestions.length); 
    }

    if (index < this.surveyAs.textAnswers.length) {
      this.surveyAs.textAnswers[index] = answer;  
      if(debugMode) {
        console.log("addTextAnswer: ", index, answer);   
        console.log("surveyAnswers:" + this.surveyAs.textAnswers);
      }   
      return true;
    }
    else {     
      return false;
    }
  }

  addImageAnswer(index: number, base64str: string) {
    let blob = this.dataURLtoBlob(base64str);   
    let question = this.surveyQs.textQuestions[index].questionText;
		this.imageBlobs.push({"question": question, "image": blob});
    return true;
	}

  addChoiceAnswer(questionIndex:number, choice: MultipleChoiceAnswerDTO) {
    if (!this.surveyAs.mcAnswers) {
      console.log("initialize choice answers array");
      this.surveyAs.mcAnswers = new Array<MultipleChoiceAnswerDTO>(this.surveyQs.multipleChoiceQuestionDTOs.length); 
    }

    this.surveyAs.mcAnswers[questionIndex] = choice;

    if(debugMode) {
      console.log("addChoiceAnswer: ", questionIndex, JSON.stringify(choice));   
      console.log("surveyAnswers:" + this.surveyAs.mcAnswers.toString());
    }    
  }

  dataURLtoBlob(dataurl) {
    let arr = dataurl.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  }

  // TEST METHOD
  setTestData(){
    const ALLTYPES = '{"studyPaths":["Applied Computer Science","Informatik","Medizininformatik","Medieninformatik","Informatik","Digitale Medien","Medieninformatik"],"textQuestions":[{"questionID":19,"questionText":"This shows the interface for a question which can be answered by text or with a photo."},{"questionID":20,"questionText":"This shows how text questions behave when next to each other."}],"multipleChoiceQuestionDTOs":[{"question":"Interface for question with 2 + 1 possible answers.","choices":[{"choiceText":"No comment", "grade": 0},{"choiceText":"Positive answer", "grade": 1},{"choiceText":"Negative answer", "grade": 2}]},{"question":"Interface for question with 3 + 1 possible answers.","choices":[{"choiceText":"No comment", "grade": 0},{"choiceText":"Positive answer", "grade": 1},{"choiceText":"Neutral answer", "grade": 2},{"choiceText":"Negative answer", "grade": 3}]},{"question":"Interface for question with 3 + 1 possible answers. The best answer placed in the middle.","choices":[{"choiceText":"No comment", "grade": 0},{"choiceText":"Negative answer", "grade": 3},{"choiceText":"Positive answer", "grade": 1},{"choiceText":"Negative answer", "grade": 3}]},{"question":"Interface for question with 4 + 1 possible answers.","choices":[{"choiceText":"No comment", "grade": 0},{"choiceText":"Positive answer", "grade": 1},{"choiceText":"Slightly positive answer", "grade": 2},{"choiceText":"Slightly negative answer", "grade": 3},{"choiceText":"Negative answer", "grade": 4}]},{"question":"Interface for question with 5 + 1 possible answers.","choices":[{"choiceText":"No comment", "grade": 0},{"choiceText":"positive answer", "grade": 1},{"choiceText":"Slightly positive answer", "grade": 2}, {"choiceText":"neutral answer", "grade": 3},{"choiceText":"Slightly negative answer", "grade": 4},{"choiceText":"Negative answer", "grade": 5}]},{"question":"Interface for question with 5 + 1 possible answers. The best answer placed in the middle.","choices":[{"choiceText":"No comment", "grade": 0},{"choiceText":"Negative answer", "grade": 5},{"choiceText":"Slightly negative answer", "grade": 3},{"choiceText":"positive answer", "grade": 1},{"choiceText":"Slightly negative answer", "grade": 3},{"choiceText":"Negative answer", "grade": 5}]},{"question":"Interface for question with 6 + 1 possible answers.","choices":[{"choiceText":"No comment", "grade": 0},{"choiceText":"Very positive answer", "grade": 1},{"choiceText":"positive answer", "grade": 2},{"choiceText":"Slightly positive answer", "grade": 3},{"choiceText":"Slightly negative answer", "grade": 4},{"choiceText":"Negative answer", "grade": 5},{"choiceText":"Very negative answer", "grade": 6}]},{"question":"Interface for question with 7 + 1 possible answers.","choices":[{"choiceText":"No comment", "grade": 0},{"choiceText":"Very positive answer", "grade": 1},{"choiceText":"positive answer", "grade": 2},{"choiceText":"Slightly positive answer", "grade": 3},{"choiceText":"Neutral answer", "grade": 4},{"choiceText":"Slightly negative answer", "grade": 5},{"choiceText":"Negative answer", "grade": 6},{"choiceText":"Very negative answer", "grade": 7}]},{"question":"Interface for question with 7 + 1 possible answers. The best answer placed in the middle.","choices":[{"choiceText":"No comment", "grade": 0},{"choiceText":"Very Negative answer", "grade": 7},{"choiceText":"Negative answer", "grade": 5},{"choiceText":"Slightly negative answer", "grade": 3}, {"choiceText":"positive answer", "grade": 1},{"choiceText":"Slightly negative answer","grade": 3},{"choiceText":"Negative answer", "grade": 5},{"choiceText":"Very Negative answer","grade": 7}]}],"textQuestionsFirst":false}';
    this.surveyQs = <QuestionsDTO>JSON.parse(ALLTYPES);
  }
}
