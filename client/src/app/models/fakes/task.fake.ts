import { ITask } from "../task";

export function createFakeTask(): ITask {
  return {
    Id: "1",
    Name: "Fake Task",
    Description:
      "This is a fake model used in development. Change production = true in the environment.ts to enable communication with the api",
    Completed: false,
  };
}
