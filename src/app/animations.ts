import {animate, animation, style} from '@angular/animations';

export enum CollapseAnimationState {
  Collapsing = 'closing',
  Expanding = 'opening'
}

export const collapseAnimation = animation([
  style({ transform: 'scale(1, 1)', transformOrigin: 'top', height: '*', overflow: 'hidden', position: 'relative' }),
  animate('200ms cubic-bezier(0,0,0.2,1)',
    style({ transform: 'scale(1, 0)', height: '0px', marginBottom: '0', overflow: 'hidden', position: 'relative' }))
]);

// todo: cleanup styling
export const collapseListAnimation = animation([
  style({ transform: 'scale(1, 1)', transformOrigin: 'top', height: '*', overflow: 'hidden', position: 'relative', width: '400px' }),
  animate('400ms cubic-bezier(0,0,0.2,1)',
    style({ transform: 'scale(1, 0)', height: '0px', overflow: 'hidden', position: 'relative', color: 'white' }))
]);

export const expandListAnimation = animation([
  style({ transform: 'scale(1, 0)', transformOrigin: 'top', position: 'relative', color: 'white' }),
  animate('400ms cubic-bezier(0,0,0.2,1)',
    style({ transform: 'scale(1, 1)', color: 'black' }))
]);
