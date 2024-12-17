import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

// prettier wants to expand each route object property onto its own line
// however, I think that having each route on its own line is more readable
// even if it does exceed the 80 and 120 character limit
// prettier-ignore
const routes: Routes = [
  // goals
  { path: "goals", loadComponent: () => import("./pages/goals/list/list.component").then((m) => m.GoalsPageComponent) },
  { path: "goals/new", loadComponent: () => import("./pages/goals/new/new.component").then( (m) => m.NewGoalPageComponent) },
  { path: "goals/:id", loadComponent: () => import("./pages/goals/show/show.component").then( (m) => m.GoalPageComponent) },
  { path: "goals/:id/delete", loadComponent: () => import("./pages/goals/delete/delete.component").then( (m) => m.DeleteGoalPageComponent,) },
  { path: "goals/:id/edit", loadComponent: () => import("./pages/goals/update/update.component").then( (m) => m.GoalsUpdateComponent,) },

  // habits
  { path: "", loadComponent: () => import("./pages/habits/list/list.component").then( (m) => m.HabitListComponent) },
  { path: "habits/new", loadComponent: () => import("./pages/habits/new/new.component").then((m) => m.NewHabitPage) },
  { path: "habits/:id", loadComponent: () => import("./pages/habits/show/show.component").then( (m) => m.HabitShowPageComponent) },
  { path: "habits/:id/delete", loadComponent: () => import("./pages/habits/delete/delete.component").then( (m) => m.DeleteHabitPageComponent) },
  { path: "habits/:id/edit", loadComponent: () => import("./pages/habits/update/update.component").then( (m) => m.HabitsUpdateComponent) },

  // tasks
  { path: "tasks", loadComponent: () => import("./pages/tasks/list/list.component").then( (m) => m.TasksPageComponent) },
  { path: "tasks/new", loadComponent: () => import("./pages/tasks/new/new.component").then( (m) => m.NewTaskPageComponent) },
  { path: "tasks/:id", loadComponent: () => import("./pages/tasks/show/show.component").then( (m) => m.TaskPageComponent) },
  { path: "tasks/:id/delete", loadComponent: () => import("./pages/tasks/delete/delete.component").then( (m) => m.DeleteTaskPageComponent) },
  { path: "tasks/:id/edit", loadComponent: () => import("./pages/tasks/update/update.component").then( (m) => m.TasksUpdateComponent) },

  // logbook
  { path: "logbook", loadComponent: () => import("./pages/logbook/list/list.component").then( (m) => m.LogbookListComponent) },
  { path: "logbook/new", loadComponent: () => import("./pages/logbook/new/new.component").then( (m) => m.LogbookNewComponent) },
  { path: "logbook/:id", loadComponent: () => import("./pages/logbook/show/show.component").then( (m) => m.LogbookShowComponent) },
  { path: "logbook/:id/delete", loadComponent: () => import("./pages/logbook/delete/delete.component").then( (m) => m.LogbookDeleteComponent) },
  { path: "logbook/:id/edit", loadComponent: () => import("./pages/logbook/edit/edit.component").then( (m) => m.LogbookEditComponent) },

  // general
  { path: "schedule", loadComponent: () => import("./pages/schedule/schedule.component").then( (m) => m.SchedulePageComponent) },
  { path: "configure", loadComponent: () => import("./pages/configure/configure.component").then( (m) => m.ConfigurePageComponent) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
