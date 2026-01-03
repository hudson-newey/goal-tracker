import { Directive, input } from "@angular/core";

@Directive({ selector: "app-abstract-form" })
export abstract class AbstractFormComponent<T extends object> {
  public readonly creating = input.required<boolean>();
  public readonly model = input<T>({} as T);
}
