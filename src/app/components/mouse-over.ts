import {ChangeDetectorRef, HostListener} from '@angular/core';

export class MouseOver {

  mouseOver: boolean;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  @HostListener('mouseenter') onMouseEnter() {
    this.mouseOver = true;
    this.changeDetectorRef.detectChanges();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.mouseOver = false;
    this.changeDetectorRef.detectChanges();
  }

}
