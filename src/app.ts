// ! Don't forget to run "npx tsc" in another console.
// Otherwise the JS file will not be created!


interface Dragable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}


enum ProjectStatusEnum {
    Active,
    Finished
}

abstract class ProjectComponent<T extends HTMLElement, U extends HTMLElement> {
    public templateElement!: HTMLTemplateElement;
    public hostElement!: T;  // = app
    public element!: U;

    constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;

        // Get the content of the templateElement which references to the from content
        const importedNode = document.importNode(this.templateElement.content, true);
        // Get the form itself, which is the firstElementChild in this case
        this.element = importedNode.firstElementChild as U;
        if (newElementId) {
            this.element.id = newElementId;            
        }

        this.attach(insertAtStart);
    }

    private attach(insertAtStart: boolean) {
        this.hostElement.insertAdjacentElement(
            insertAtStart ? 'afterbegin' : 'beforeend',
            this.element
        );        
    }

    abstract configure(): void;
    abstract renderContent(): void;
}


class Project {
    constructor(
        public id: string,
        public title: string,
        public desc: string,
        public people: number,
        public status: ProjectStatusEnum
    ) {}
}

type Listener<T> = (items: T[]) => void;

abstract class State<T> {
    protected listeners: Listener<T>[] = [];

    public addListener(listenerFn:Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance?: ProjectState; 

    private constructor() {
        super();
    } // Blocks creation of instance by "new"-keyword => Singleton

    public addProject(title: string, desc: string, numOfPeople: number) {
        this.projects.push(new Project(
            (Math.random() * 10000).toString(),
            title,
            desc,
            numOfPeople,
            ProjectStatusEnum.Active
        ));

        this.updateListeners();
    }

    public moveProject(projectId: string, newStatus: ProjectStatusEnum) {
        const projectToMove = this.projects.find(p => p.id === projectId);
        if (projectToMove && projectToMove.status !== newStatus) {
            projectToMove.status = newStatus;
        }

        this.updateListeners();
    }

    public dumpProjects(): Project[] {
        return this.projects;
    }

    // Singleton implementation, no "new"-keyword but getting instance via this function:
    static getInstance() {
        if (this.instance) {
            return this.instance;
        } else {
            this.instance = new ProjectState();
            return this.instance;
        }
    }

    private updateListeners() {
        this.listeners.forEach(listenerFn => {
            // listenerFn(this.projects.slice()); // Better use Spread-Operator instead slice-hack to create a new Array!     
            listenerFn([...this.projects]);
        });
    }
}

const state = ProjectState.getInstance();



interface Validateable {
    value: string | number;
    required?: boolean;
    // Length of the input string
    minLength?: number;
    maxLength?: number;
    // For numbers, actual min/max value
    min?: number;
    max?: number;
}

function validate(validateable: Validateable): boolean {
    let isValid = true;
    if (validateable.required) {
       isValid = isValid && validateable.value.toString().trim().length !== 0;
    }
    if (validateable.minLength != null && typeof validateable.value === 'string') {
        isValid = isValid && validateable.value.length > validateable.minLength;
    }
    if (validateable.maxLength != null && typeof validateable.value === 'string') {
        isValid = isValid && validateable.value.length < validateable.maxLength;
    }
    if (validateable.min != null && typeof validateable.value === 'number' ) {
        isValid = isValid && validateable.value > validateable.min;
    }
    if (validateable.max != null && typeof validateable.value === 'number' ) {
        isValid = isValid && validateable.value < validateable.max;
    }
    return isValid;
}


// Autobind decorator
// Think about: are these extra lines of code sensefull, or is better to just use ".bind(this)" ???
function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this);
        }
    }
    return adjustedDescriptor;
}





class ProjectItem extends ProjectComponent<HTMLUListElement, HTMLLIElement> implements Dragable {
    private project: Project;

    get persons() {
        if (this.project.people === 1) {
            return "1 person";
        } else {
            return `${this.project.people} persons`;
        }
    }
    
    constructor(hostId: string, project: Project) {
        super('single-project', hostId, false, project.id);
        this.project = project;

        this.configure();
        this.renderContent();
    }

    @Autobind
    dragStartHandler(event: DragEvent): void {
        event.dataTransfer!.setData('text/plain', this.project.id);
        event.dataTransfer!.effectAllowed = 'move';
    }
    
    @Autobind
    dragEndHandler(_: DragEvent): void {
    }

    configure(): void {
        // Event listener, so careful with "this"!
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }
    
    renderContent(): void {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.persons + ' assigned.';
        this.element.querySelector('p')!.textContent = this.project.desc;
    }
}


class ProjectList extends ProjectComponent<HTMLDivElement, HTMLElement> implements DragTarget {
    public assignedProjects!: Project[];

    // This time all the action happens in the constructor, no bootstrap-method.
    constructor(private type: 'active' | 'finished') { // Literal and Union type
        super('project-list', 'app', false, `${type}-projects`);

        this.configure();
        this.renderContent();
    }

    @Autobind
    dragOverHandler(event: DragEvent): void {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            this.element.querySelector('ul')!.classList.add('droppable');
        }
    }

    @Autobind
    dropHandler(event: DragEvent): void {
        const projectId = event.dataTransfer!.getData('text/plain');
        state.moveProject(
            projectId,
            this.type === 'active' ? ProjectStatusEnum.Active : ProjectStatusEnum.Finished
        );
        this.element.querySelector('ul')!.classList.remove('droppable');
    }

    @Autobind
    dragLeaveHandler(_: DragEvent): void {
        this.element.querySelector('ul')!.classList.remove('droppable');
    }

    private renderProjects(): void {
        const listEl = document.getElementById(`${this.type}-project-list`) as HTMLUListElement;
        // Hack cleaning the list
        // Todo improvement: implement comparison
        listEl.innerHTML = '';
        
        for (const projectItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
        }
    }

    public configure(): void {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('drop', this.dropHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);

        state.addListener((projects:Project[]) => {
            // Filter returns a new array.
            const filteredProjects = projects.filter(project => {
                if (this.type === 'active') {
                    return project.status === ProjectStatusEnum.Active
                } else {
                    return project.status === ProjectStatusEnum.Finished
                }
            });  
            
            this.assignedProjects = filteredProjects;
            this.renderProjects();
        });
    }

    renderContent(): void {
        const listId = `${this.type}-project-list`;
        (this.element.querySelector('ul') as HTMLElement).id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'; 
    }
}

class ProjectInput extends ProjectComponent<HTMLDivElement, HTMLFormElement> {
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


new ProjectInput();
new ProjectList('active');
new ProjectList('finished');