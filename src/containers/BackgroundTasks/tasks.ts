import { IMessageContext } from "@saleor/components/messages";
import { CheckExportFileStatus } from "@saleor/products/types/CheckExportFileStatus";
import { JobStatusEnum } from "@saleor/types/globalTypes";
import { ApolloQueryResult } from "apollo-client";
import { defineMessages, IntlShape } from "react-intl";

import { QueuedTask, TaskData, TaskStatus } from "./types";

const messages = defineMessages({
  exportFinishedText: {
    defaultMessage:
      "Product export has finished and was sent to your email address."
  },
  exportFinishedTitle: {
    defaultMessage: "Exporting CSV finished",
    description: "csv file exporting has finished, header"
  }
});

export async function handleTask(task: QueuedTask): Promise<boolean> {
  let ok = false;
  try {
    ok = await task.handle();
    if (ok) {
      task.onCompleted();
    }
  } catch (error) {
    task.onError(error);
  }

  return ok;
}

export function handleError(error: Error) {
  throw error;
}

export function queueCustom(
  id: number,
  tasks: React.MutableRefObject<QueuedTask[]>,
  data: TaskData
) {
  (["handle", "onCompleted"] as Array<keyof TaskData>)
    .filter(field => !data[field])
    .forEach(field => {
      throw new Error(`${field} is required when creating custom task`);
    });

  tasks.current = [
    ...tasks.current,
    {
      handle: data.handle,
      id,
      onCompleted: data.onCompleted,
      onError: data.onError || handleError,
      status: TaskStatus.PENDING
    }
  ];
}

export function queueExport(
  id: number,
  tasks: React.MutableRefObject<QueuedTask[]>,
  fetch: () => Promise<ApolloQueryResult<CheckExportFileStatus>>,
  notify: IMessageContext,
  intl: IntlShape
) {
  tasks.current = [
    ...tasks.current,
    {
      handle: async () => {
        const result = await fetch();
        return result.data.exportFile.status === JobStatusEnum.SUCCESS;
      },
      id,
      onCompleted: () =>
        notify({
          text: intl.formatMessage(messages.exportFinishedText),
          title: intl.formatMessage(messages.exportFinishedTitle)
        }),
      onError: handleError,
      status: TaskStatus.PENDING
    }
  ];
}
