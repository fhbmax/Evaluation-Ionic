import { Component, Input, Output, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { List } from 'ionic-angular';
import { Link } from '../../common/link';
import { ChoiceDTO } from '../../common/dtos';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  @ViewChild(List) list: List;

  @Input()
  links: Link[];

  @Input() 
  selectedIndex: number;

  @Output()
  linkSelected: EventEmitter<ChoiceDTO> = new EventEmitter<ChoiceDTO>();

  constructor() {}

  ngOnChanges(changes: SimpleChanges) { 
    // bring the selected list item into view
    if(changes["selectedIndex"]){
        if(this.list) {
          let listElement = this.list.getNativeElement();
          if(listElement) {
            let selectedItem = listElement.children[this.selectedIndex];
            if (selectedItem) {
              selectedItem.focus();
            }
          }
        }
    }
  }

  onSelect(item: any) {
    this.linkSelected.emit(item);
  }
}
