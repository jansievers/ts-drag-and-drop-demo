import { ProjectComponent } from "./../components/base-component.js";
import { Project } from "./../models/project.js";
import { Dragable } from "../models/drag-interfaces.js";
import { Autobind } from "../decorators/autobind.js";

export class ProjectItem extends ProjectComponent<HTMLUListElement, HTMLLIElement> implements Dragable {
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
