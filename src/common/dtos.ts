// received questionnaire data format
export class QuestionsDTO {
   studyPaths: string[];
   textQuestions: TextQuestionDTO[];
   multipleChoiceQuestionDTOs: MultipleChoiceQuestionDTO[];
   textQuestionsFirst: boolean;
}

// sent answers data format
export class AnswersDTO {
  voteToken: string;
  studyPath: string;
  textAnswers: TextAnswerDTO[];
  mcAnswers: MultipleChoiceAnswerDTO[];
  deviceID: string;
}

export class TextQuestionDTO {
  questionID: number;
  questionText: string;
  onlyNumbers: boolean;
  maxLength: number;
}

export class TextAnswerDTO {
   questionID: number;
   questionText: string;
   answerText: string;
}

export class MultipleChoiceQuestionDTO {
  question: string;
  choices: ChoiceDTO[];
}

export class MultipleChoiceAnswerDTO {
  questionText: string;
  choice: ChoiceDTO;
}

export class ChoiceDTO {
  choiceText: string;
  grade: number;
}

// HTTP REQUEST and RESPONSE

export class RequestDTO {
  voteToken: string;
  deviceID: string;
}

export class ResponseDTO {
  message: string;
  type: number; // int
}
