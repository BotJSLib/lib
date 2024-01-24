import SelectMenuOption from "./option";

export default class SelectMenu {
  label: string;
  data: string;
  options: SelectMenuOption[];

  constructor(label: string, data: string) {
    this.label = label;
    this.data = data;
    this.options = [];
  }

  addOption(option: SelectMenuOption) {
    this.options.push(option);
  }
}
