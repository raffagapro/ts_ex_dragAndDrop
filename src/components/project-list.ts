import { DragTarget } from '../models/drag-drop-interfaces.js';
import { Project, ProjectStatus } from '../models/project.js';
import { Component } from './base-component.js';
import { Autobind } from '../decorators/autobind.js';
import { projectState } from '../state/project-state.js';
import { ProjectItem } from './project-item.js';

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
    assignProjects:Project[];

    //we will have 2 types of lists - active and finished
    constructor(private type: 'active' | 'finished') {
        super(
            'project-list',
            'app',
            false,
            `${type}-projects`
        );
        this.templateElement = <HTMLTemplateElement>document.getElementById('project-list')!;
        this.hostElement = <HTMLDivElement>document.getElementById('app')!;
        this.assignProjects = [];
        this.configure();
        this.renderContent();
    }

    @Autobind
    dragOverHandler(event: DragEvent): void {
        //check if the target is valid
        if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain'){
            event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable');
        }
    }

    @Autobind
    dragLeaveHandler(_: DragEvent): void {
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.remove('droppable');
    }
    
    @Autobind
    dropHandler(event: DragEvent): void {
        const prjId = event.dataTransfer!.getData('text/plain');     
        projectState.moveProject(prjId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);   
    }

    configure(){
        //lsitener for drag events
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);
        //register the listener
        projectState.addListener((projects:Project[]) =>{
            //filtering projects by status
            const relevantProjects = projects.filter(prj => {
                if(this.type === 'active') return prj.status === ProjectStatus.Active;
                return prj.status === ProjectStatus.Finished;
            });
            this.assignProjects = relevantProjects;
            this.renderProjects();
        });
    }

    renderContent(){
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    private renderProjects(){
        const listEl = <HTMLUListElement>document.getElementById(`${this.type}-projects-list`)!;
        //clear list before rendering
        listEl.innerHTML = '';
        for (const prjItem of this.assignProjects) {
            //create a new object and let the class do rendering job
            new ProjectItem(
                this.element.querySelector('ul')!.id,
                prjItem
            );
        }
    }
}