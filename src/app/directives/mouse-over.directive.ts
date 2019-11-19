import {ChangeDetectorRef, Directive, HostListener} from '@angular/core';

@Directive({
  selector: '[appMouseOver]',
  exportAs: 'app-mouse-over'
})
export class MouseOverDirective {

  mouseOver = false;

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
