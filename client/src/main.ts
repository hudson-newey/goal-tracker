import { importProvidersFrom, isDevMode } from "@angular/core";
import { AppComponent } from "./app/app.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormsModule } from "@angular/forms";
import { AppRoutingModule } from "./app/app-routing.module";
import { BrowserModule, bootstrapApplication } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { VirtualDatabaseService } from "./app/services/virtualDatabase/virtual-database.service";
import { LogbookService } from "./app/services/logbook/logbook.service";
import { ClientConfigService } from "./app/services/clientConfig/client-config.service";
import { TasksService } from "./app/services/tasks/tasks.service";
import { GoalsService } from "./app/services/goals/goals.service";
import { HabitsService } from "./app/services/habits/habits.service";
import { ConfigInterceptor } from "./app/services/config-interceptor/config.interceptor";
import {
  HTTP_INTERCEPTORS,
  withInterceptorsFromDi,
  provideHttpClient,
} from "@angular/common/http";
import { GptService } from "./app/services/gpt/gpt.service";
import { provideServiceWorker } from "@angular/service-worker";
import { VibrationService } from "./app/services/vibration/vibration.service";

const services: any[] = [
  HabitsService,
  GoalsService,
  TasksService,
  ClientConfigService,
  LogbookService,
  GptService,
  VibrationService,

  VirtualDatabaseService,
];

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      CommonModule,
      BrowserModule,
      AppRoutingModule,
      FormsModule,
      FontAwesomeModule,
    ),
    { provide: HTTP_INTERCEPTORS, useClass: ConfigInterceptor, multi: true },
    ...services,
    provideHttpClient(withInterceptorsFromDi()),
    provideServiceWorker("ngsw-worker.js", {
      enabled: !isDevMode(),
      registrationStrategy: "registerWhenStable:30000",
    }),
  ],
}).catch((err) => console.error(err));
