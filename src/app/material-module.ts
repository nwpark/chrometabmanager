import {NgModule} from '@angular/core';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatButtonModule, MatGridListModule, MatIconModule, MatProgressSpinnerModule} from '@angular/material';
import {ScrollingModule} from '@angular/cdk/scrolling';

@NgModule({
  exports: [
    DragDropModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    ScrollingModule,
    MatProgressSpinnerModule
  ]
})
export class MaterialModule {}
