import { User } from "./user";

export class Command {
  name: string;
  description: string;
  callback: (user: User, args: Map<string, string>) => string;
  args: Argument[];

  constructor(
    name: string,
    description: string,
    callback: (user: User, args: Map<string, string>) => string,
    args: Argument[]
  ) {
    this.name = name;
    this.description = description;
    this.callback = callback;
    this.args = args;
  }
}

export class Argument {
  name: string;
  required: boolean;
  description: string;
  constructor(name: string, required: boolean, description: string) {
    this.name = name;
    this.required = required;
    this.description = description;
  }
}