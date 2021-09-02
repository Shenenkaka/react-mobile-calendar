import React, { Component } from "react";
import { isEqual } from "lodash";

import "./Calendar.less";

export default class Calendar extends Component {
  constructor(props) {
    super(props);
    this.calendarRef = React.createRef();
  }

  state = {
    weekArr: ["日", "一", "二", "三", "四", "五", "六"], // 星期数组
    dataArr: [], // 当前可视区域数据
    allDataArr: [], // 轮播数组
    weekDataArr: [], // 周轮播数组
    selectData: {}, // 选中日期信息 -> year, month, day
    currentDate: new Date(),
    translateIndex: 0, // 轮播所在位置
    transitionDuration: 0.3, // 动画持续时间
    needAnimation: true, // 左右滑动是否需要动画
    isTouching: false, // 是否为touch状态
    touchStartPositionX: null, // 初始滑动 X的值
    touchStartPositionY: null, // 初始滑动 Y的值
    touch: {
      // 本次touch事件，横向，纵向滑动的距离
      x: 0,
      y: 0,
    },
    isWeekView: false, // 周视图还是月视图
    itemHeight: 50, // 子元素行高
    needHeightAnimation: false, // 高度变化是否需要动画
    offsetY: 0, // 周视图 Y轴偏移量
    lineNum: 0, // 当前视图总行数
    lastWeek: [], // 周视图 前一周数据
    nextWeek: [], // 周视图 后一周数据
    immediate: true, // 是否延迟 (动画结束在处理数据)
    touchAreaHeight: 40, // 底部区域高度
    touchAreaPadding: 10, // 底部区域padding
  };

  componentDidMount() {
    this.checkoutCurrentDate();
  }

  render() {
    const {
      selectData,
      weekArr,
      isWeekView,
      itemHeight,
      touchAreaHeight,
      needAnimation,
      needHeightAnimation,
      transitionDuration,
      translateIndex,
      isTouching,
      offsetY,
      touchAreaPadding,
      lineNum,
      allDataArr,
      weekDataArr,
      touch,
    } = this.state;
    return (
      <div className="calendar" ref={this.calendarRef}>
        <section className="header">
          {`${selectData.year || ""}年${selectData.month || ""}月`}
        </section>
        <ul className="week-area">
          {(weekArr || []).map((item, index) => {
            return (
              <li className="week-item" key={index}>
                <span className="week-font calendar-item">{item}</span>
              </li>
            );
          })}
        </ul>
        <section
          ref="calendar"
          className="data-container"
          style={{
            height: isWeekView
              ? `${itemHeight + touchAreaHeight}px`
              : `${lineNum * itemHeight + touchAreaHeight}px`,
            transitionDuration: `${
              needHeightAnimation ? transitionDuration : 0
            }s`,
          }}
          onTouchStart={this.touchStart}
          onTouchMove={this.touchMove}
          onTouchEnd={this.touchEnd}
        >
          <section
            className="month-area"
            style={{
              transform: `translateX(${-(translateIndex + 1) * 100}%)`,
              transitionDuration: `${needAnimation ? transitionDuration : 0}s`,
            }}
          >
            <div
              className="banner-area"
              style={{
                transform: `translateY(${offsetY}px)`,
                transitionDuration: `${
                  needHeightAnimation ? transitionDuration : 0
                }s`,
              }}
            >
              {(isWeekView ? weekDataArr : allDataArr).map(
                (monthItem, monthIndex) => {
                  return (
                    <ul
                      key={monthIndex}
                      className="data-area"
                      style={{
                        transform: `translateX(${
                          (translateIndex + isTouching ? touch.x : 0) * 100
                        }%)`,
                        transitionDuration: `${
                          isTouching ? 0 : transitionDuration
                        }s`,
                      }}
                    >
                      {(monthItem || []).map((mItem, index) => {
                        return (
                          <li
                            key={index}
                            className={`data-item ${
                              this.dateIsSelected(mItem) ? "selected" : ""
                            } ${
                              mItem.type !== "normal" && !isWeekView
                                ? "other-item"
                                : ""
                            }`}
                            style={{ height: `${itemHeight}px` }}
                            onClick={() => this.checkoutDate(mItem)}
                          >
                            <span className="data-font calendar-item">
                              {mItem.day}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  );
                }
              )}
            </div>
          </section>
          <section
            className="touch-area"
            style={{
              height: `${touchAreaHeight}px`,
              paddingTop: `${touchAreaPadding}px`,
            }}
          >
            <div
              className="touch-container"
              style={{ height: `${touchAreaHeight - touchAreaPadding}px` }}
            >
              <div className="touch-item"></div>
            </div>
          </section>
        </section>
      </div>
    );
  }

  // 更新轮播数组
  changeAllData(val, selectData) {
    const { immediate, transitionDuration } = this.state;

    const preDate = this.getPreMonth(selectData);
    const preDataArr = this.getMonthData(preDate, true);
    const nextDate = this.getNextMonth(selectData);
    const nextDataArr = this.getMonthData(nextDate, true);

    const delayHandle = (delay) => {
      this.setState({
        allDataArr: [preDataArr, val, nextDataArr],
        needAnimation: false,
        translateIndex: 0,
      });
      if (delay) {
        this.setState({
          immediate: false,
        });
      }
    };

    if (immediate) {
      delayHandle(immediate);
      return;
    }

    setTimeout(() => delayHandle(), transitionDuration * 1000);
  }
  // 获取当前日期
  getCurrentDateData(date) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }
  // 获取指定月份数据
  getMonthData(date, unSelected = false) {
    const { year, month, day } = date;
    let dataArr = [];
    let daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      daysInMonth[1] = 29;
    }

    const monthStartWeekDay = new Date(year, month - 1, 1).getDay();
    const monthEndWeekDay = new Date(year, month, 1).getDay() || 7;

    const preInfo = this.getPreMonth(date);
    const nextInfo = this.getNextMonth();

    for (let i = 0; i < monthStartWeekDay; i++) {
      let preObj = {
        type: "pre",
        day: daysInMonth[preInfo.month - 1] - (monthStartWeekDay - i - 1),
        month: preInfo.month,
        year: preInfo.year,
      };
      dataArr.push(preObj);
    }

    for (let i = 0; i < daysInMonth[month - 1]; i++) {
      let itemObj = {
        type: "normal",
        day: i + 1,
        month,
        year,
        isSelected: day === i + 1 && !unSelected,
      };
      dataArr.push(itemObj);
    }

    for (let i = 0; i < 7 - monthEndWeekDay; i++) {
      let nextObj = {
        type: "next",
        day: i + 1,
        month: nextInfo.month,
        year: nextInfo.year,
      };
      dataArr.push(nextObj);
    }

    return dataArr;
  }

  dateIsSelected(item) {
    const { currentDate } = this.state;
    return (
      item.type === "normal" &&
      item.year === currentDate.getFullYear() &&
      item.month === currentDate.getMonth() + 1 &&
      item.day === currentDate.getDate()
    );
  }

  // 点选切换日期
  checkoutDate = (selectData) => {
    // 不是当月不能被选择
    if (selectData.type !== "normal") {
      return;
    }

    const { allDataArr } = this.state;
    const { onCurrentDateChange } = this.props;

    const newDataArr = allDataArr[1].map((item) => {
      if (item.isSelected && item.type === "normal") {
        return {
          ...item,
          isSelected: false,
        };
      }
      if (item.day === selectData.day && item.type === "normal") {
        return {
          ...item,
          isSelected: true,
        };
      }
      return item;
    });

    const currentDate = new Date(
      `${selectData.year}/${selectData.month}/${selectData.day}`
    );

    this.setState({
      selectData,
      currentDate,
      dataArr: newDataArr,
      allDataArr: [allDataArr[0], newDataArr, allDataArr[2]],
    });

    onCurrentDateChange && onCurrentDateChange(currentDate);
  };

  // 获取前(后)一个月的年月日信息
  getPreMonth(date, appointDay = 1) {
    let { year, month } = date || this.state.selectData;
    if (month === 1) {
      year -= 1;
      month = 12;
    } else {
      month -= 1;
    }

    return { year, month, day: appointDay };
  }
  getNextMonth(date, appointDay = 1) {
    let { year, month } = date || this.state.selectData;
    if (month === 12) {
      year += 1;
      month = 1;
    } else {
      month += 1;
    }

    return { year, month, day: appointDay };
  }
  // 切换上(下)一月
  handlePreMonth() {
    this.dealMonthData("PRE_MONTH");
  }
  handleNextMonth() {
    this.dealMonthData("NEXT_MONTH");
  }
  // 处理月数据
  dealMonthData(type, selectData) {
    const { dataArr: currentDataArr } = this.state;
    switch (type) {
      case "PRE_MONTH":
        selectData = this.getPreMonth("");
        break;
      case "NEXT_MONTH":
        selectData = this.getNextMonth("");
        break;
      default:
        break;
    }
    const newSelectData = selectData;
    const newDataArr = this.getMonthData(newSelectData);

    if (!isEqual(newDataArr, currentDataArr)) {
      this.changeAllData(newDataArr, newSelectData);
    }

    this.setState({
      selectData: newSelectData,
      dataArr: newDataArr,
      lineNum: Math.ceil(newDataArr.length / 7),
    });
  }
  // 今日
  checkoutCurrentDate() {
    const currentDate = new Date(this.props.currentDate || new Date());
    const currentDateData = this.getCurrentDateData(currentDate);
    this.setState({
      currentDate,
      selectData: currentDateData,
    });
    this.dealMonthData("", currentDateData);
  }
  // touch事件
  touchStart = (event) => {
    this.setState({
      isTouching: true,
      needAnimation: true,
      touchStartPositionX: event.touches[0].clientX,
      touchStartPositionY: event.touches[0].clientY,
      touch: {
        x: 0,
      },
    });
  };

  touchMove = (event) => {
    const { touchStartPositionX, touchStartPositionY } = this.state;
    const moveX = event.touches[0].clientX - touchStartPositionX;
    const moveY = event.touches[0].clientY - touchStartPositionY;
    const { offsetWidth, offsetHeight } = this.calendarRef.current;

    if (Math.abs(moveX) > Math.abs(moveY)) {
      // 左右
      this.setState({
        needHeightAnimation: false,
        touch: {
          x: moveX / offsetWidth,
          y: 0,
        },
      });
    } else {
      // 上下
      this.setState({
        needHeightAnimation: true,
        touch: {
          x: 0,
          y: moveY / offsetHeight,
        },
      });
    }
  };

  touchEnd = () => {
    const { touch, translateIndex, isWeekView, dataArr } = this.state;
    this.setState({
      isTouching: false,
    });
    const { x, y } = touch;

    // 月视图
    if (Math.abs(x) > Math.abs(y) && Math.abs(x) > 0.3) {
      if (x > 0) {
        // 左
        this.setState({
          translateIndex: translateIndex - 1,
        });
        isWeekView ? this.handlePreWeek() : this.handlePreMonth();
      } else if (x < 0) {
        // 右
        this.setState({
          translateIndex: translateIndex + 1,
        });
        isWeekView ? this.handleNextWeek() : this.handleNextMonth();
      }
    }

    // 周视图
    if (
      Math.abs(y) > Math.abs(x) &&
      Math.abs(y * this.calendarRef.current.offsetHeight) > 50
    ) {
      if (y > 0) {
        // 下
        this.setState({
          isWeekView: false,
          offsetY: 0,
        });
      } else if (y < 0) {
        // 上
        this.setState({
          isWeekView: true,
        });

        const { lastWeek, nextWeek, sliceStart } =
          this.dealWeekViewSliceStart(dataArr);
        this.setState({
          weekDataArr: [
            lastWeek,
            dataArr.slice(sliceStart, sliceStart + 7),
            nextWeek,
          ],
        });
      }
    }
    this.setState({
      touch: {
        x: 0,
        y: 0,
      },
    });
  };
  // 周视图的位置信息
  getInfoOfWeekView(selectedIndex, length) {
    const indexOfLine = Math.ceil((selectedIndex + 1) / 7);
    const totalLine = Math.ceil(length / 7);
    const sliceStart = (indexOfLine - 1) * 7;
    const sliceEnd = sliceStart + 7;

    return { indexOfLine, totalLine, sliceStart, sliceEnd };
  }
  // 生成前(后)一周数据
  dealWeekViewSliceStart(dataArr) {
    const selectedIndex = dataArr.findIndex((item) => item.isSelected);

    const { indexOfLine, totalLine, sliceStart, sliceEnd } =
      this.getInfoOfWeekView(selectedIndex, dataArr.length);
    let lastWeek, nextWeek;
    // 前一周数据
    if (indexOfLine === 1) {
      const preInfo = this.getPreMonth();
      const preDataArr = this.getMonthData(preInfo, true);
      const preDay =
        dataArr[0].day - 1 || preDataArr[preDataArr.length - 1].day;
      const preIndex = preDataArr.findIndex(
        (item) => item.day === preDay && item.type === "normal"
      );
      const { sliceStart: preSliceStart, sliceEnd: preSliceEnd } =
        this.getInfoOfWeekView(preIndex, preDataArr.length);
      lastWeek = preDataArr.slice(preSliceStart, preSliceEnd);
    } else {
      lastWeek = dataArr.slice(sliceStart - 7, sliceEnd - 7);
    }

    // 后一周数据
    if (indexOfLine >= totalLine) {
      const nextInfo = this.getNextMonth();
      const nextDataArr = this.getMonthData(nextInfo, true);
      const nextDay =
        dataArr[dataArr.length - 1].type === "normal"
          ? 1
          : dataArr[dataArr.length - 1].day + 1;
      const nextIndex = nextDataArr.findIndex((item) => item.day === nextDay);
      const { sliceStart: nextSliceStart, sliceEnd: nextSliceEnd } =
        this.getInfoOfWeekView(nextIndex, nextDataArr.length);
      nextWeek = nextDataArr.slice(nextSliceStart, nextSliceEnd);
    } else {
      nextWeek = dataArr.slice(sliceStart + 7, sliceEnd + 7);
    }
    this.setState({ lastWeek, nextWeek });
    return { sliceStart, lastWeek, nextWeek };
  }
  // 切换上(下)一周
  handlePreWeek() {
    this.dealWeekData("PRE_WEEK");
  }
  handleNextWeek() {
    this.dealWeekData("NEXT_WEEK");
  }
  // 处理周数据
  dealWeekData(type) {
    const { weekDataArr, transitionDuration } = this.state;
    const lastWeek = weekDataArr[0];
    const nextWeek = weekDataArr[2];
    const { year, month, day } =
      type === "PRE_WEEK"
        ? lastWeek.find((item) => item.type === "normal")
        : nextWeek[0];
    const newSelectData = { year, month, day };
    const newDataArr = this.getMonthData(newSelectData);
    this.setState({
      selectData: newSelectData,
      dataArr: newDataArr,
      lineNum: Math.ceil(newDataArr.length / 7),
    });

    const delayHandle = () => {
      const { lastWeek: newLastWeek, nextWeek: newNextWeek } =
        this.dealWeekViewSliceStart(newDataArr);
      this.setState({
        weekDataArr:
          type === "PRE_WEEK"
            ? [newLastWeek, weekDataArr[0], weekDataArr[1]]
            : [weekDataArr[1], weekDataArr[2], newNextWeek],
        needAnimation: false,
        translateIndex: 0,
      });
    };
    setTimeout(() => {
      delayHandle();
    }, transitionDuration * 1000);
  }
}
