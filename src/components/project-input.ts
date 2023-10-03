import { Autobind } from "../decorators/autobind.js";
import { ProjectState } from "../state/project-state.js";
import { Validateable, validate } from "../util/validation.js";
import { ProjectComponent } from "./base-component.js";

const state = ProjectState.getInstance();

export class ProjectInput extends ProjectComponent<HTMLDivElement, HTMLFormElement> {
    public formElementTitle!: HTMLInputElement;
    public formElementDesc!: HTMLTextAreaElement;
    public formElementPeople!: HTMLInputElement;

    constructor() {
        super('project-input', 'app', true, 'user-input');
    
        this.configure();
    } 

    public configure() {
        // Get form elements
        this.formElementTitle = this.element.querySelector('input#title') as HTMLInputElement;
        this.formElementDesc = this.element.querySelector('textarea#description') as HTMLTextAreaElement;
        this.formElementPeople = this.element.querySelector('input#people') as HTMLInputElement;

        // F*cking this is very tricky here again!!!!
        //this.form.addEventListener('submit', this.submitHandler.bind(this));
        this.element.addEventListener('submit', this.submitHandler);
    }

    public renderContent(): void {} // Just to fullfill the base-class

    private getUserInput(): [string, string, number] | void { // Return type is a tuple here
        const title = this.formElementTitle.value;
        const descr = this.formElementDesc.value;
        const people = this.formElementPeople.value;
        
        const titleValidateable: Validateable = {
            value: title, required: true
        };
        const descrValidateable: Validateable = {
            value: descr,
            required: true,
            minLength: 5,
            maxLength: 20
        };
        const peopleValidateable: Validateable = {
            value: people,
            required: true,
            min: 2
        };
        // Todo: add error message(s) about what is invalid
        if (
            !validate(titleValidateable) ||
            !validate(descrValidateable) ||
            !validate(peopleValidateable)
        ) {
            alert('Invalid!');
            return;
        } else {
            return [title, descr, Number(people)];
        }
    }

    // Autobind this decoratpr
    @Autobind
    private submitHandler(e: Event) {

        e.preventDefault();
        const userInput = this.getUserInput();
        // It's not possible to check for Tuple (its just available in TypeScript), but check for isArray and 3 elements in array)
        if (Array.isArray(userInput) && userInput.length === 3) {
            const [title, desc, people] = userInput; // De-Structuring
            state.addProject(title, desc, people);
            this.clear();

        }
    }

    private clear(): void {
        this.formElementTitle.value = '';
        this.formElementDesc.value = '';
        this.formElementPeople.value = '';
    }
}
