import { Routes } from "@angular/router";

export const mainRoutes: Routes = [
  // prettier wants to expand each route object property onto its own line
  // however, I think that having each route on its own line is more readable
  // even if it does exceed the 80 and 120 character limit
  // prettier-ignore
  // goals
  { path: "goals", loadComponent: () => import("./app/pages/goals/list/list.component").then((m) => m.GoalsPageComponent) },
  {
    path: "goals/new",
    loadComponent: () =>
      import("./app/pages/goals/new/new.component").then(
        (m) => m.NewGoalPageComponent,
      ),
  },
  {
    path: "goals/:id",
    loadComponent: () =>
      import("./app/pages/goals/show/show.component").then(
        (m) => m.GoalPageComponent,
      ),
  },
  {
    path: "goals/:id/delete",
    loadComponent: () =>
      import("./app/pages/goals/delete/delete.component").then(
        (m) => m.DeleteGoalPageComponent,
      ),
  },
  {
    path: "goals/:id/edit",
    loadComponent: () =>
      import("./app/pages/goals/update/update.component").then(
        (m) => m.GoalsUpdateComponent,
      ),
  },

  // habits
  {
    path: "",
    loadComponent: () =>
      import("./app/pages/habits/list/list.component").then(
        (m) => m.HabitListComponent,
      ),
  },
  {
    path: "habits/new",
    loadComponent: () =>
      import("./app/pages/habits/new/new.component").then(
        (m) => m.NewHabitPage,
      ),
  },
  {
    path: "habits/:id",
    loadComponent: () =>
      import("./app/pages/habits/show/show.component").then(
        (m) => m.HabitShowPageComponent,
      ),
  },
  {
    path: "habits/:id/delete",
    loadComponent: () =>
      import("./app/pages/habits/delete/delete.component").then(
        (m) => m.DeleteHabitPageComponent,
      ),
  },
  {
    path: "habits/:id/edit",
    loadComponent: () =>
      import("./app/pages/habits/update/update.component").then(
        (m) => m.HabitsUpdateComponent,
      ),
  },

  // tasks
  {
    path: "tasks",
    loadComponent: () =>
      import("./app/pages/tasks/list/list.component").then(
        (m) => m.TasksPageComponent,
      ),
  },
  {
    path: "tasks/new",
    loadComponent: () =>
      import("./app/pages/tasks/new/new.component").then(
        (m) => m.NewTaskPageComponent,
      ),
  },
  {
    path: "tasks/:id",
    loadComponent: () =>
      import("./app/pages/tasks/show/show.component").then(
        (m) => m.TaskPageComponent,
      ),
  },
  {
    path: "tasks/:id/delete",
    loadComponent: () =>
      import("./app/pages/tasks/delete/delete.component").then(
        (m) => m.DeleteTaskPageComponent,
      ),
  },
  {
    path: "tasks/:id/edit",
    loadComponent: () =>
      import("./app/pages/tasks/update/update.component").then(
        (m) => m.TasksUpdateComponent,
      ),
  },

  // logbook
  {
    path: "logbook",
    loadComponent: () =>
      import("./app/pages/logbook/list/list.component").then(
        (m) => m.LogbookListComponent,
      ),
  },
  {
    path: "logbook/new",
    loadComponent: () =>
      import("./app/pages/logbook/new/new.component").then(
        (m) => m.LogbookNewComponent,
      ),
  },
  {
    path: "logbook/:id",
    loadComponent: () =>
      import("./app/pages/logbook/show/show.component").then(
        (m) => m.LogbookShowComponent,
      ),
  },
  {
    path: "logbook/:id/delete",
    loadComponent: () =>
      import("./app/pages/logbook/delete/delete.component").then(
        (m) => m.LogbookDeleteComponent,
      ),
  },
  {
    path: "logbook/:id/edit",
    loadComponent: () =>
      import("./app/pages/logbook/edit/edit.component").then(
        (m) => m.LogbookEditComponent,
      ),
  },

  // general
  {
    path: "schedule",
    loadComponent: () =>
      import("./app/pages/schedule/schedule.component").then(
        (m) => m.SchedulePageComponent,
      ),
  },
  {
    path: "configure",
    loadComponent: () =>
      import("./app/pages/configure/configure.component").then(
        (m) => m.ConfigurePageComponent,
      ),
  },
];
