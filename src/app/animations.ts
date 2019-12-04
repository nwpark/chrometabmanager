import {animate, animation, style, transition, trigger, useAnimation} from '@angular/animations';

export enum CollapseAnimationState {
  Closing = 'closing',
  Collapsing = 'collapsing',
  Expanding = 'expanding',
  Complete = 'complete'
}

export const collapseWindowAnimation = animation([
  style({ transform: 'scale(1, 1)', transformOrigin: 'top', height: '*', overflow: 'hidden', position: 'relative' }),
  animate('200ms cubic-bezier(0,0,0.2,1)',
    style({ transform: 'scale(1, 0)', height: '0px', marginBottom: '0', overflow: 'hidden', position: 'relative', color: 'white' }))
]);

export const expandWindowAnimation = animation([
  style({ transform: 'scale(1, 0)', transformOrigin: 'top', height: '0px', position: 'relative', color: 'white' }),
  animate('200ms cubic-bezier(0,0,0.2,1)',
    style({ transform: 'scale(1, 1)', height: '*', color: 'black' }))
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
