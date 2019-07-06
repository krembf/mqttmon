import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { IonContent, IonList } from '@ionic/angular';

import * as _ from "lodash";
import * as mqtt from 'mqtt';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  @ViewChild(IonContent) contentArea: IonContent;
  @ViewChild(IonList, { read: ElementRef }) mqttList: ElementRef;
  private mutationObserver: MutationObserver;


  selectedMessageIndex = 0;
  messages = [];
  payload = "";

  constructor() {
    console.log("Hello from the home page");
    console.log(_.padStart("Hello TypeScript!", 30, " "));

    var client = mqtt.connect({
      servers: [{
        host: "localhost",
        port: 1889,
        protocol: "ws",
      }],
      host: "localhost",
      port: 1889,
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
          icon: topic.endsWith("ACK")? "arrow-round-back" : "arrow-round-forward"
        });
        // client.end()
      })
    })
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

  onClickMe() {
    this.messages = [];
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
}

export enum KEY_CODE {
  UP_ARROW = 38,
  DOWN_ARROW = 40,
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37
};
