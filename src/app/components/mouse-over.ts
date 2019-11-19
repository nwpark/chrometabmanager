import {ChangeDetectorRef, HostListener} from '@angular/core';

export abstract class MouseOver {

  changeDetectorRef: ChangeDetectorRef;

  mouseOver: boolean;

  protected constructor(changeDetectorRef: ChangeDetectorRef) {
    this.changeDetectorRef = changeDetectorRef;
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.mouseOver = true;
    this.changeDetectorRef.detectChanges();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.mouseOver = false;
    this.changeDetectorRef.detectChanges();
  }

}
