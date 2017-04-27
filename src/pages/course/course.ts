import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: 'page-course',
  templateUrl: 'course.html'
})
export class CoursePage {

  @Input()
  courses: string[] = [];

  @Output() 
  courseSelected: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
  }

  itemSelected(item: any): void {
     console.log(item.toString());
     this.courseSelected.emit(item.toString());
  }

}
