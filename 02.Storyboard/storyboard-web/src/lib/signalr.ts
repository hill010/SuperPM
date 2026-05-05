import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { getApiUrl } from "./api";

let connection: HubConnection | null = null;

export function getGenerationHubConnection(token: string): HubConnection {
  if (connection) return connection;

  connection = new HubConnectionBuilder()
    .withUrl(`${getApiUrl()}/hubs/generation`, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        if (retryContext.elapsedMilliseconds < 60000) {
          return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 5000);
        }
        return null;
      },
    })
    .configureLogging(LogLevel.Warning)
    .build();

  return connection;
}

export interface JobCreatedEvent {
  jobId: string;
  jobType: string;
  shotId?: string;
  shotNumber?: number;
  status: string;
  createdAt: string;
}

export interface JobStartedEvent {
  jobId: string;
  status: string;
  startedAt: string;
}

export interface JobProgressEvent {
  jobId: string;
  progress: number;
  message: string;
}

export interface JobCompletedEvent {
  jobId: string;
  status: string;
  resultPath?: string;
  completedAt: string;
}

export interface JobFailedEvent {
  jobId: string;
  status: string;
  error: string;
  completedAt: string;
}
