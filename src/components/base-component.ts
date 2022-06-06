namespace App {
    export abstract class Component<T extends HTMLElement, U extends HTMLElement>{
        templateElement: HTMLTemplateElement;
        hostElement: T;
        element: U;

        constructor(
            templateId:string,
            hostElementId:string,
            insertAtStart:boolean,
            newElementId?:string
        ){
            this.templateElement = <HTMLTemplateElement>document.getElementById(templateId)!;
            this.hostElement = <T>document.getElementById(hostElementId)!;

            //grabbing node from template
            const importedNode = document.importNode(
                this.templateElement.content, true
            );
            this.element = <U>importedNode.firstElementChild;
            if (newElementId) this.element.id = newElementId;

            this.attach();
        }

        private attach(insertAtStart:boolean = false){
            this.hostElement.insertAdjacentElement(
                insertAtStart ? 'afterbegin' : 'beforeend',
                this.element
            );
        }

        //force child class to implement this methods
        abstract configure():void;
        abstract renderContent():void;
    }
}
