import { Draggable } from '../models/drag-drop-interfaces.js';
import { Component } from '../components/base-component.js'
import { Project } from '../models/project.js';
import { Autobind } from '../decorators/autobind.js';

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{
    private _project:Project;

    //helps us return correct string
    get persons(){
        if (this._project.people === 1) return `${this._project.people.toString()} person assigned`
        return `${this._project.people.toString()} people assigned`
    }

    constructor(hostId:string, project:Project){
        super(
            'single-project',
            hostId,
            false,
            project.id
        );
        this._project = project;
        this.configure();
        this.renderContent();
    }

    configure(){
        //add event listener to drag event
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }
    renderContent(){
        this.element.querySelector('h2')!.textContent = this._project.title;
        this.element.querySelector('h3')!.textContent = this.persons;
        this.element.querySelector('p')!.textContent = this._project.description;

    }

    @Autobind
    dragStartHandler(event: DragEvent): void {
        // console.log('from PROJECTITEM', this._project.id);
        event.dataTransfer!.setData('text/plain', this._project.id);
        event.dataTransfer!.effectAllowed = 'move';
    }

    @Autobind
    dragEndHandler(_: DragEvent): void {
        // console.log('DragEnd');
    }
}