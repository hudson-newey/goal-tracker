import { isDevMode, provideZonelessChangeDetection } from "@angular/core";
import { ConfigInterceptor } from "./app/services/config-interceptor/config.interceptor";
import {
  HTTP_INTERCEPTORS,
  withInterceptorsFromDi,
  provideHttpClient,
} from "@angular/common/http";
import { provideServiceWorker } from "@angular/service-worker";
import { provideRouter } from "@angular/router";
import { clientRoutes } from "./main.routes";

export const mainConfig = {
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ConfigInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(clientRoutes),
    provideZonelessChangeDetection(),

    provideServiceWorker("ngsw-worker.js", {
      enabled: !isDevMode(),
      registrationStrategy: "registerWhenStable:30000",
    }),
  ],
};
