export enum Task {
  CUSTOM,
  EXPORT
}
export enum TaskStatus {
  PENDING,
  ENDED
}

export interface QueuedTask {
  id: number;
  handle: () => Promise<boolean>;
  status: TaskStatus;
  onCompleted: () => void;
  onError: (error: Error) => void;
}

export interface TaskData {
  id?: string;
  handle?: () => Promise<boolean>;
  onCompleted?: () => void;
  onError?: () => void;
}

export interface BackgroundTasksContextType {
  cancel: (id: number) => void;
  queue: (type: Task, data?: TaskData) => void;
}
