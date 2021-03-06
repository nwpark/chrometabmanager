import {NgModule} from '@angular/core';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatGridListModule,
  MatIconModule,
  MatListModule,
  MatMenuModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSlideToggleModule,
  MatTooltipModule
} from '@angular/material';
import {ScrollingModule} from '@angular/cdk/scrolling';

@NgModule({
  exports: [
    DragDropModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    ScrollingModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatCardModule,
    MatListModule,
    MatProgressBarModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    MatCheckboxModule
  ]
})
export class MaterialModule {}
