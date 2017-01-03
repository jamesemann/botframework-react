import React, { Component } from 'react';
import './App.css';
import 'whatwg-fetch';
import DirectLineClient from './DirectLineClient'
import _ from 'underscore';

function MessageList(props) {
  const messages = props.messages;
  const listItems = messages.map((message) =>
    // {message.channelData && message.channelData.localId} checks for null channeldata before displaying localid!
    <li key={message.id}>{message.from.id}: {message.text} </li>
  );
  return (
    <ul>{listItems}</ul>
  );
}

class BotClientComponent extends Component {
  constructor() {
    super();

    var self = this;
    this.state = {
      messages: [],
      message: ''
    };

    this.handleChange = this.handleChange.bind(this);

    this.directLineClient = new DirectLineClient('5gLTB7o1bAE.cwA.MGE.WqNsSzNhOhGXcxlJmmb60HcKKC5Yey-QBxRMeFfckrc');
    this.directLineClient.getMessages(function (streamData) {
      var arrayvar = self.state.messages.slice();
      var newActivities = streamData.activities;
      _.each(newActivities, function (newActivity) {
        // find in existing arrayvar, and replace
        var replaced = false;
        if (newActivity.channelData) {
          var existing = _.find(arrayvar, function (a) {
            return a.channelData && a.channelData.localId === newActivity.channelData.localId;
          });
          if (existing) {
            _.extend(existing, newActivity);
            replaced = true;
          }
        }
        // else just add it 
          if (!replaced) {
            arrayvar.push(newActivity);
          }
      });

      var sorted = _.sortBy(arrayvar, 'id');
      self.setState({ messages: sorted });
      //console.log(sorted);
    }); // start streaming
  }

  handleChange(event) {
    this.setState({ message: event.target.value });
  }

  postMessage() {
    var self = this;
    var localId = new Date().getTime();
    // note - id will be regenerated by bot framework
    // this is ok because we store the localid in channelData which is persisted between invocations
    var activity = { id: localId, type: 'message', text: this.state.message, from: { id: 'james' }, channelData: { localId: localId } };

    var arrayvar = self.state.messages.slice();
    arrayvar.push(activity);
    self.setState({ messages: arrayvar });

    this.directLineClient.postMessage(activity);
  }

  render() {
    return (
      <div>
        <MessageList messages={this.state.messages} />
        <input type='text' value={this.state.message} onChange={this.handleChange} />
        <button onClick={this.postMessage.bind(this)}  >Send message</button>
      </div>
    );
  }
}

export default BotClientComponent;
