import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'page-send',
  templateUrl: 'send.html'
})
export class SendPage {
    @Output() 
    sendPressed = new EventEmitter();

    onClickSend(): void {
      this.sendPressed.emit();
    }
}
