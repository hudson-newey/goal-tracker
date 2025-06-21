import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { mainConfig } from "./main.config";

bootstrapApplication(AppComponent, mainConfig).catch((err) => {
  console.error(err);
});
