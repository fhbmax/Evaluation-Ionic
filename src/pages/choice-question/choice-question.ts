import { Component } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';

import { MultipleChoiceQuestionDTO, ChoiceDTO, MultipleChoiceAnswerDTO } from "../../common/dtos";
import { Colors } from './choice-colors';

@Component({
  selector: 'page-choice-question',
  templateUrl: 'choice-question.html'
})

export class ChoiceQuestionPage {
  @Input() 
  choiceQuestion: MultipleChoiceQuestionDTO;

  @Output() 
  choiceSelected: EventEmitter<MultipleChoiceAnswerDTO> = new EventEmitter<MultipleChoiceAnswerDTO>();

  selectedAnswer: ChoiceDTO = null;
  selectedindex: number = -1;

  bipolarScale: boolean = false;
  gradeColors = [];

  bipolar: boolean = false;

  Math: any;

  constructor(){
    this.Math = Math;
  }

  ngOnChanges() { 
    let choices = this.choiceQuestion.choices;
    if(choices && choices.length > 0){
      let ncButtonIncluded: boolean;
      if (choices[0].grade === 0) { // "no comment" choice included 
        this.bipolar = choices[1].grade == choices[choices.length - 1].grade;  
      } else { // no "no comment" choice     
        this.bipolar = choices[0].grade == choices[choices.length - 1].grade;    
        // add stub choice to ensure correct palette loading and template
        this.choiceQuestion.choices.unshift({choiceText: "", grade: -1});       
      }      
      this.gradeColors = Colors.getPalette(choices.length, this.bipolar);
    }
  }

  onSelect(choice: ChoiceDTO): void {
    this.selectedAnswer = choice;
    let index = this.choiceQuestion.choices.indexOf(choice);
    this.selectedindex = index;

    let questTxt = this.choiceQuestion.question;

    let answerDTO = <MultipleChoiceAnswerDTO>{
      "questionText": questTxt,
      "choice": choice
    };

    this.choiceSelected.emit(answerDTO);
  }
};
