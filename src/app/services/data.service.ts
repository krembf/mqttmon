import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class DataService {
  public items: any = [];

  constructor() {
    this.items = [
      { title: "one" },
      { title: "two" },
      { title: "three" },
      { title: "four" },
      { title: "five" },
      { title: "six" }
    ];
  }

  filterItems(messages: any, searchTerm: string) {
    if(searchTerm == null || searchTerm == "") {
        return messages;
    }
    return messages.filter(item => {
      return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }
}