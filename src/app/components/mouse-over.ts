import {ChangeDetectorRef, HostListener} from '@angular/core';

export abstract class MouseOver {

  mouseOver: boolean;

  protected constructor(protected changeDetectorRef: ChangeDetectorRef) { }

  @HostListener('mouseenter') onMouseEnter() {
    this.mouseOver = true;
    this.changeDetectorRef.detectChanges();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.mouseOver = false;
    this.changeDetectorRef.detectChanges();
  }

}
