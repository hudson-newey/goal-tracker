import { IHabit } from "../habit";

export function createFakeHabit(): IHabit {
  return {
    Id: "1",
    Name: "Fake Habit",
    Description:
      "This is a fake model used in development. Change production = true in the environment.ts to enable communication with the api",
    CompletedDates: ["2020-01-01"],
  };
}
