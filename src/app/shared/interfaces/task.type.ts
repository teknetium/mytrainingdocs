
export interface TaskModel {
    taskId: string,
    description: string,
    steps: string[]
}
export interface TaskStepContentModel {
  task: string,
  title: string,
  content: string
}
  
export interface TaskStepContentHash {
  [indexer: string]: TaskStepContentModel;
}


export interface TaskHash {
  [indexer: string]: TaskModel;
}