import useNotifier from "@saleor/hooks/useNotifier";
import { checkExportFileStatus } from "@saleor/products/queries";
import React from "react";
import { useApolloClient } from "react-apollo";
import { useIntl } from "react-intl";

import BackgroundTasksContext from "./context";
import { handleTask, queueCustom, queueExport } from "./tasks";
import { QueuedTask, Task, TaskData, TaskStatus } from "./types";

export const backgroundTasksRefreshTime = 15 * 1000;

export function useBackgroundTasks() {
  const idCounter = React.useRef(0);
  const tasks = React.useRef<QueuedTask[]>([]);
  const notify = useNotifier();
  const apolloClient = useApolloClient();
  const intl = useIntl();

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      const queue = async () => {
        tasks.current = tasks.current.filter(
          task => task.status !== TaskStatus.ENDED
        );
        try {
          await Promise.all(
            tasks.current.map(async task => {
              let hasFinished: boolean;

              try {
                hasFinished = await handleTask(task);
              } catch (error) {
                throw error;
              }
              if (hasFinished) {
                const taskIndex = tasks.current.findIndex(
                  t => t.id === task.id
                );
                tasks.current[taskIndex].status = TaskStatus.ENDED;
              }
            })
          );
        } catch (error) {
          throw error;
        }
      };

      queue();
    }, backgroundTasksRefreshTime);

    return () => clearInterval(intervalId);
  });

  function cancel(id: number) {
    tasks.current = tasks.current.filter(task => task.id !== id);
  }

  function queue(type: Task, data?: TaskData) {
    idCounter.current += 1;

    switch (type) {
      case Task.CUSTOM:
        queueCustom(idCounter.current, tasks, data);
      case Task.EXPORT:
        queueExport(
          idCounter.current,
          tasks,
          () =>
            apolloClient.query({
              fetchPolicy: "network-only",
              query: checkExportFileStatus,
              variables: {
                id: data.id
              }
            }),
          notify,
          intl
        );
    }

    return idCounter.current;
  }

  return {
    cancel,
    queue
  };
}

const BackgroundTasksProvider: React.FC = ({ children }) => {
  const { cancel, queue } = useBackgroundTasks();

  return (
    <BackgroundTasksContext.Provider
      value={{
        cancel,
        queue
      }}
    >
      {children}
    </BackgroundTasksContext.Provider>
  );
};

BackgroundTasksProvider.displayName = "BackgroundTasksProvider";
export default BackgroundTasksProvider;
