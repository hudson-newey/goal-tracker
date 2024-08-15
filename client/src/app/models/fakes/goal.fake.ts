import { IGoal } from "../goal";

export function createFakeGoal(): IGoal {
  return {
    Id: "1",
    Name: "Fake Goal",
    Description:
      "This is a fake model used in development. Change production = true in the environment.ts to enable communication with the api",
    Completed: false,
  };
}
