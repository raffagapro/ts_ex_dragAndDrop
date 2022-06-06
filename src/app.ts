//Project State Management
class ProjectState {
    private listeners:any[] = [];
    private projects: any[] = [];
    //making it a singleton
    private static instance: ProjectState;

    private constructor(){}

    //singleton initalization method
    static getInstance(){
        if(!this.instance) this.instance = new ProjectState();
        return this.instance;
    }
    
    addListener(listenerFn:Function){
        this.listeners.push(listenerFn);
    }
    
    addProject(title:string, description:string, numOfPeople:number){
        const newProject = {
            id: Math.random().toString(),
            title,
            description,
            people: numOfPeople
        }
        this.projects.push(newProject);
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

//ProjectList Class
class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignProjects:any[];

    //we will have 2 types of lists - active and finished
    constructor(private type: 'active' | 'finished') {
        this.templateElement = <HTMLTemplateElement>document.getElementById('project-list')!;
        this.hostElement = <HTMLDivElement>document.getElementById('app')!;
        this.assignProjects = [];

        //code is explain in ProjectInput class!!!
        const importedNode = document.importNode(
            this.templateElement.content, true
        );
        this.element = <HTMLElement>importedNode.firstElementChild;
        this.element.id = `${this.type}-projects`;
        
        //register the listener
        projectState.addListener((projects:any[]) =>{
            this.assignProjects = projects;
            this.renderProjects();
        });

        this.attach();
        this.renderContent();
    }

    private attach(){
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }

    private renderProjects(){
        const listEl = <HTMLUListElement>document.getElementById(`${this.type}-projects-list`)!;
        for (const prjItem of this.assignProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = prjItem.title;
            listEl.appendChild(listItem);
        }
    }

    private renderContent(){
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }
}

//ProjectInput Class
class ProjectInput{
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    //propeties to hold the user input
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor(){
        this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!;
        this.hostElement = <HTMLDivElement>document.getElementById('app')!;

        //we are getting a node to render the template
        //this const is only available inside the constructor
        const importedNode = document.importNode(
            this.templateElement.content, true
        );
        //we are getting the form element from the template
        this.element = <HTMLFormElement>importedNode.firstElementChild;
        this.element.id = 'user-input';
        //grabbinh the inputs
        this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title')!;
        this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description')!;
        this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people')!;
        
        this.configure();
        this.attach();
    }

    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
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
            max: 5
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

    private configure(){
        this.element.addEventListener('submit', this.submitHandler);
    }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');