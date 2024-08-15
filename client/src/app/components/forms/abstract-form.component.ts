import { Directive, Input } from "@angular/core";

export interface IAbstractFormComponent<T> {
  creating: boolean;
  model?: T;
}

@Directive({
  selector: "app-abstract-form",
  standalone: true,
})
export abstract class AbstractFormComponent<T extends object>
  implements IAbstractFormComponent<T>
{
  @Input({ required: true })
  public creating!: boolean;

  @Input({ required: false })
  public model: T = {} as T;
}
