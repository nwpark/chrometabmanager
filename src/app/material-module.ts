import {NgModule} from '@angular/core';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatButtonModule, MatGridListModule, MatIconModule} from '@angular/material';

@NgModule({
  exports: [
    DragDropModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class MaterialModule {}
