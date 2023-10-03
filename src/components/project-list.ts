import { Autobind } from "../decorators/autobind.js";
import { DragTarget } from "../models/drag-interfaces.js";
import { Project, ProjectStatusEnum } from "../models/project.js";
import { ProjectState } from "../state/project-state.js";
import { ProjectComponent } from "./base-component.js";
import { ProjectItem } from "./project-item.js";

const state = ProjectState.getInstance();

export class ProjectList extends ProjectComponent<HTMLDivElement, HTMLElement> implements DragTarget {
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