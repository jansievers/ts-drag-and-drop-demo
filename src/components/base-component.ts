// Used default export here, import works like this then:
// import NameOfYourChoice from "./base-component.js";

export default abstract class ProjectComponent<T extends HTMLElement, U extends HTMLElement> {
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