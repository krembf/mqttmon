import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { IonContent, IonList } from '@ionic/angular';

import * as _ from "lodash";
import * as mqtt from 'mqtt';

import { saveAs } from 'file-saver';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  @ViewChild(IonContent) contentArea: IonContent;
  @ViewChild(IonList, { read: ElementRef }) mqttList: ElementRef;
  private mutationObserver: MutationObserver;
  public searchTerm: string = "";


  selectedMessageIndex = 0;
  messages = [];
  filteredMessages = [];
  payload = "";

  constructor(private dataService: DataService) {
    console.log("Hello from the home page");
    console.log(_.padStart("Hello TypeScript!", 30, " "));

    var client = mqtt.connect({
      servers: [{
        host: "localhost",
        port: 1880,
        protocol: "ws",
      }],
      host: "localhost",
      port: 1880,
      defaultProtocol: "ws",
      protocol: "mqtt",
      protocolId: 'MQIsdp',
      protocolVersion: 3,
      client: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
      clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8)
    });
    console.log('Connected!!');

    let topics = [
      'presence',
      'MolDev/MetaMorph/Default/Connections/SiLAHost_ImagingDevice/#',
      'MolDev/Status/278BORIS-DEV/#',
      'MolDev/MetaMorph/Default/Connections/SiLAHost_ImagingDevice/278BORIS-DEV/IDevCommand/#',
      'MolDev/MetaMorph/Default/Connections/SiLAHost_ImagingDevice/278BORIS-DEV/IDevResponse/#'
    ];

    client.on('connect', () => {
      console.log('Client got connected!!');
      client.subscribe(topics, function (err) {
        if (!err) {
          client.publish('presence', 'Hello mqtt')
        }
      });

      client.on("message", (topic, payload) => {
        console.log([topic, payload].join(": "));
        this.messages.push({
          id: 0,
          name: topic,
          payload: payload.toString(),
          rawPayload: payload,
          time: Date.now(),
          selected: false,
          icon: this.iconDecorator(topic),
          color: topic.endsWith("NACK")?"danger" : "primary"
        });
        this.filteredMessages = this.dataService.filterItems(this.messages, this.searchTerm);
        // client.end()
      })
    })
  }

  iconDecorator(topic: string) {
    if(topic.endsWith("ACK") || topic.endsWith("ACK_STARTED") || topic.endsWith("ACK_FINISHED")) {
      return "arrow-round-back";
    }
    return "arrow-round-forward";
  }

  ngOnInit() {
    console.log("View loaded");

    this.mutationObserver = new MutationObserver((mutations) => {
      console.log("Mutation observed, scrolling to bottom");
      setTimeout(() => {
        this.contentArea.scrollToBottom();
      }, 100);

      //update the last payload
      if(this.messages.length == 0) {
        this.payload = "";
        return;
      }
      this.payload = this.messages[this.messages.length - 1].payload;
    });

    this.mutationObserver.observe(this.mqttList.nativeElement, {
      childList: true
    });

  }

  ngAfterViewInit() {
    console.log("ngAfterViewInit called, view became active");
  }

  isJSON(MyTestStr) {
    try {
      // var MyJSON = JSON.stringify(MyTestStr);
      var json = JSON.parse(MyTestStr);
      // if(typeof(MyTestStr) == 'string')
      //     if(MyTestStr.length == 0)
      //         return false;
    }
    catch (e) {
      return false;
    }
    return true;
  }

  onSelect(message: any) {
    console.log(`Selected message ${JSON.stringify(message)}`);

    if (this.isJSON(message.payload)) {
      let json = JSON.parse(message.payload);
      this.payload = JSON.stringify(json, null, 4);
    }
    else {
      this.payload = message.payload;
    }

    _.forEach(this.messages, (message) => {message.selected = false});
    message.selected = true;
    this.selectedMessageIndex = this.messages.indexOf(message);
  }

  clearMessages() {
    this.messages = [];
    this.filteredMessages = this.dataService.filterItems(this.messages, this.searchTerm);
    this.selectedMessageIndex = 0;
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if(event.keyCode == KEY_CODE.DOWN_ARROW){
      // Your row selection code
      console.log(event);
      this.selectedMessageIndex = Math.min(this.messages.length - 1, this.selectedMessageIndex + 1);
      this.onSelect(this.messages[this.selectedMessageIndex]);
    }

    if(event.keyCode == KEY_CODE.UP_ARROW){
      // Your row selection code
      console.log(event);
      this.selectedMessageIndex = Math.max(0, this.selectedMessageIndex - 1);
      this.onSelect(this.messages[this.selectedMessageIndex]);
    }
  }

  logFormatter(messages: any[]) {
    let formattedLog = "";
    messages.forEach(element => {
      let date = new Date(element.time);
      let formattedDate = [date.getMonth(), date.getDate(), date.getFullYear()].join(":");
      let formattedmessage = [element.name, element.payload, "\n"].join(": ");
      formattedLog += [formattedDate, formattedmessage].join(" - ");
    });

    return formattedLog;
  }

  exportLog() {
    var blob = new Blob([this.logFormatter(this.messages)], {type: "text/plain;charset=utf-8"});
    let date = new Date(Date.now());
    let formattedDate = [date.getMonth(), date.getDate(), date.getFullYear(), date.getHours(), date.getMinutes()].join(".");
    saveAs(blob, `mosquitto.${formattedDate}.log`);
  }

  setFilteredItems() {
    this.filteredMessages = this.dataService.filterItems(this.messages, this.searchTerm);
  }
}

export enum KEY_CODE {
  UP_ARROW = 38,
  DOWN_ARROW = 40,
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37
};
