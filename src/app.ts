//Drag & Drop Interfaces
interface Draggable{
    dragStartHandler(event:DragEvent):void;
    dragEndHandler(event:DragEvent):void;
}

interface DragTarget{
    dragOverHandler(event:DragEvent):void;
    dropHandler(event:DragEvent):void;
    dragLeaveHandler(event:DragEvent):void;
}

//Project Type
enum ProjectStatus {
    Active,
    Finished
}

class Project{
    constructor(
        public id:string,
        public title:string,
        public description:string,
        public people:number,
        public status:ProjectStatus
    ){}
}

//Project State Management
type Listener<T> = (items:T[]) =>void;

abstract class State<T>{
    protected listeners:Listener<T>[] = [];

    addListener(listenerFn:Listener<T>){
        this.listeners.push(listenerFn);
    }
}

class ProjectState extends State<Project> {
    private projects: Project[] = [];
    //making it a singleton
    private static instance: ProjectState;

    private constructor(){
        super();
    }

    //singleton initalization method
    static getInstance(){
        if(!this.instance) this.instance = new ProjectState();
        return this.instance;
    }
    
    addProject(title:string, description:string, numOfPeople:number){
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Active
        );
        this.projects.push(newProject);
        this.updateListeners();
    }

    moveProject(projectId:string, newStatus:ProjectStatus){
        const project = this.projects.find(prj => prj.id === projectId);
        if(project && project.status !== newStatus){
            project.status = newStatus;
            this.updateListeners();
        }
    }

    updateListeners(){
        //iterate the listeners and call the function
        for(const listenerFn of this.listeners){
            listenerFn(this.projects.slice());
        }
    }
}

//GLOBAL INSTANCE OF STATE PROJECT
const projectState = ProjectState.getInstance();

//Validator
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

const validate = (validatableInput: Validatable) => {
    let isValid = true;
    //validation critiria
    if (validatableInput.required) {
        //if isValid is true and the value is not empty
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if(
        validatableInput.minLength != null &&
        typeof validatableInput.value === 'string'
    ){
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if(
        validatableInput.maxLength != null &&
        typeof validatableInput.value === 'string'
    ){
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if(
        validatableInput.min != null &&
        typeof validatableInput.value === 'number'
    ){
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if(
        validatableInput.max != null &&
        typeof validatableInput.value === 'number'
    ){
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
}

//decorators
const Autobind = (_:any, _2:string, descriptor:PropertyDescriptor) =>{
    const originalMethod = descriptor.value;
    const modDescriptor:PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get(){
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    }
    return modDescriptor;
}

//General Component Class
abstract class Component<T extends HTMLElement, U extends HTMLElement>{
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

//Project Item Class
//we have to pass the types of the host and the element
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{
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
        console.log('DragEnd');
    }
}

//ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
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

//ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
    //propeties to hold the user input
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor(){
        super(
            'project-input',
            'app',
            true,
            'user-input'
        );
        //grabbinh the inputs
        this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title')!;
        this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description')!;
        this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people')!;
        
        this.configure();
    }

    renderContent(){}

    configure(){
        this.element.addEventListener('submit', this.submitHandler);
    }

    //type is a tuple type
    //method to grab input from the form
    private gatherUserInput():[string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        //creating validatable objects and assigning validation
        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        }
        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 10
        }

        if(
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)
        ){
            alert('Invalid input, please try again');
            return;
        }
        return [enteredTitle, enteredDescription, +enteredPeople];
    }

    //method for clearing the form
    private clearInputs(){
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    //this method will gain aceess to the form data
    //attach decorator to bind the method to the class and not the event
    @Autobind
    private submitHandler(e:Event){
        e.preventDefault();
        const userInput = this.gatherUserInput();
        //use this to make sure it is a tuple type
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            //calls the global states and adds the new project
            projectState.addProject(title, desc, people);
            this.clearInputs();
        }
    }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');