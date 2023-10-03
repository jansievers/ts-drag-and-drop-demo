import { Project, ProjectStatusEnum } from "../models/project.js";

type Listener<T> = (items: T[]) => void;


export abstract class State<T> {
    protected listeners: Listener<T>[] = [];

    public addListener(listenerFn:Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

export class ProjectState extends State<Project> {
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