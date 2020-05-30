import {ComponentFactoryResolver, Injectable, ViewContainerRef} from '@angular/core';
import {ContextMenuComponent} from '../components/context-menu/context-menu.component';
import {ContextMenuItem} from '../types/action-bar/context-menu-item';

@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  openContextMenu(event: MouseEvent, menuItems: ContextMenuItem[], viewContainerRef: ViewContainerRef) {
    event.preventDefault();
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ContextMenuComponent);
    const componentRef = viewContainerRef.createComponent(componentFactory);
    componentRef.instance.setPosition(event.clientX, event.clientY);
    componentRef.instance.menuItems = menuItems;
    componentRef.instance.contextMenuClosed.subscribe(() => {
      componentRef.destroy();
    });
  }
}
