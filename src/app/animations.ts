import {animate, animation, style} from '@angular/animations';

export enum AnimationState {
  Closing = 'closing',
  Collapsing = 'collapsing',
  Expanding = 'expanding',
  Complete = 'complete'
}

const animationStateMetaInfoMap: AnimationStateMetaInfoMap = {
  [AnimationState.Closing]: {isTerminal: false},
  [AnimationState.Collapsing]: {isTerminal: false},
  [AnimationState.Expanding]: {isTerminal: false},
  [AnimationState.Complete]: {isTerminal: true},
};

type AnimationStateMetaInfoMap = {
  [animationState in AnimationState]: {isTerminal: boolean};
};

export function getAnimationForToggleDisplay(isCollapsed: boolean): AnimationState {
  return isCollapsed ? AnimationState.Expanding : AnimationState.Collapsing;
}

export function isToggleDisplayState(animationState: string) {
  return animationState === AnimationState.Collapsing || animationState === AnimationState.Expanding;
}

export function isTerminalAnimationState(animationState: AnimationState) {
  return animationStateMetaInfoMap[animationState].isTerminal;
}

export const closeWindowAnimation = animation([
  style({ transformOrigin: 'top', height: '*', marginBottom: '20px', overflow: 'hidden' }),
  animate('300ms cubic-bezier(0,0,0.2,1)',
    style({ transform: 'scale(1, 0)', height: '0px', marginBottom: '0', color: 'white' }))
]);

export const closeTabAnimation = animation([
  style({ height: '*', overflow: 'hidden' }),
  animate('150ms cubic-bezier(0,0,0.2,1)',
    style({ height: '0px', color: 'white' }))
]);

export const collapseWindowAnimation = animation([
  style({ height: '*' }),
  animate('300ms cubic-bezier(0,0,0.2,1)',
    style({ height: '0px' }))
]);

export const expandWindowAnimation = animation([
  style({ height: '0px' }),
  animate('300ms cubic-bezier(0,0,0.2,1)',
    style({ height: '*' }))
]);

export const collapseListAnimation = animation([
  style({ height: '*', overflow: 'hidden', width: '400px' }),
  animate('400ms cubic-bezier(0,0,0.2,1)',
    style({ height: '0px', overflow: 'hidden' }))
]);

export const expandListAnimation = animation([
  style({ height: '0', overflow: 'hidden' }),
  animate('400ms cubic-bezier(0,0,0.2,1)',
    style({ height: '*', overflow: 'hidden', marginBottom: '20px' }))
]);
