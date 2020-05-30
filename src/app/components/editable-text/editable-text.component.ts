import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-editable-text',
  templateUrl: './editable-text.component.html',
  styleUrls: ['./editable-text.component.scss']
})
export class EditableTextComponent implements OnInit {

  @Input() value: string;
  @Output() valueUpdated: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('textInput', {static: false}) private textInput: ElementRef;

  _formControl: FormControl;
  isEditing = false;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this._formControl = new FormControl(this.value);
  }

  showEditForm() {
    this.isEditing = true;
    this.changeDetectorRef.detectChanges();
    this.textInput.nativeElement.focus();
    this.textInput.nativeElement.select();
  }

  _submitForm() {
    if (this._formControl.value !== this.value) {
      this.valueUpdated.emit(this._formControl.value);
    }
    this.isEditing = false;
  }

  _cancelEditForm() {
    this._formControl.setValue(this.value);
    this.isEditing = false;
  }
}
