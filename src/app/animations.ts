import {animate, animation, style} from '@angular/animations';

export enum CollapseAnimationState {
  Closing = 'closing'
}

export const collapseAnimation = animation([
  style({ transform: 'scale(1, 1)', transformOrigin: 'top', height: '*', overflow: 'hidden', position: 'relative' }),
  animate('200ms cubic-bezier(0,0,0.2,1)',
    style({ transform: 'scale(1, 0)', height: '0px', margin: '0', overflow: 'hidden', position: 'relative' }))
]);
