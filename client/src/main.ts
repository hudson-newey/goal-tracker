import { importProvidersFrom, isDevMode } from "@angular/core";
import { AppComponent } from "./app/app.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormsModule } from "@angular/forms";
import { bootstrapApplication } from "@angular/platform-browser";
import { ConfigInterceptor } from "./app/services/config-interceptor/config.interceptor";
import {
  HTTP_INTERCEPTORS,
  withInterceptorsFromDi,
  provideHttpClient,
} from "@angular/common/http";
import { provideServiceWorker } from "@angular/service-worker";
import { provideRouter } from "@angular/router";
import { mainRoutes as clientRoutes } from "./main.routes";

bootstrapApplication(AppComponent, {
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ConfigInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(clientRoutes),
    provideServiceWorker("ngsw-worker.js", {
      enabled: !isDevMode(),
      registrationStrategy: "registerWhenStable:30000",
    }),
  ],
}).catch((err) => console.error(err));
