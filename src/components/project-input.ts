import { Component } from "./base-component";
import { Validatable, validate } from "../utils/validation";
import { Autobind } from "../decorators/autobind";
import { projectState } from "../state/project-state";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
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
