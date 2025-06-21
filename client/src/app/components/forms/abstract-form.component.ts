import { Directive, input } from "@angular/core";

@Directive({ selector: "app-abstract-form" })
export abstract class AbstractFormComponent<T extends object> {
  public creating = input.required<boolean>();
  public model = input<T>({} as T);
}
