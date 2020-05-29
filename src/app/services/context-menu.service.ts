import {ComponentFactoryResolver, Injectable, ViewContainerRef} from '@angular/core';
import {ContextMenuComponent} from '../components/context-menu/context-menu.component';

@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  openContextMenu(event: MouseEvent, viewContainerRef: ViewContainerRef) {
    event.preventDefault();
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ContextMenuComponent);
    const componentRef = viewContainerRef.createComponent(componentFactory);
    componentRef.instance.setPosition(event.clientX, event.clientY);
    componentRef.instance.contextMenuClosed.subscribe(() => {
      componentRef.destroy();
    });
  }
}
