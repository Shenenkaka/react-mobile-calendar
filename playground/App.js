import Calendar from "../src/Calendar";

import React, { Component } from "react";

export default class App extends Component {
  render() {
    return (
      <div>
        <Calendar
          currentDate="2021/07/06"
          onCurrentDateChange={(curDate) => console.log(curDate)}
        />
      </div>
    );
  }
}
