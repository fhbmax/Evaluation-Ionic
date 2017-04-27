export class Link {
    text: string;
    index: number;
    checked: boolean;

    constructor(text: string, index: number, checked: boolean) {
        this.text = text;
        this.index = index;
        this.checked = checked;         
    }
}