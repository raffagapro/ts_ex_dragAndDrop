import { Project, ProjectStatus } from '../models/project'

type Listener<T> = (items:T[]) =>void;

abstract class State<T>{
    protected listeners:Listener<T>[] = [];

    addListener(listenerFn:Listener<T>){
        this.listeners.push(listenerFn);
    }
}

export class ProjectState extends State<Project> {
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

export const projectState = ProjectState.getInstance();