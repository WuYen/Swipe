import React, { useState, useLayoutEffect, useRef } from "react";
import { useEffect } from "react";
import { useMemo } from "react";

const styleDot = {
  display: "inline-block",
  padding: "6px",
  margin: "4px",
  borderRadius: "6px",
  backgroundColor: "#E2E8D1",
  color: "white",
  cursor: "pointer",
};

function SwipeContainer(props) {
  let containerRef = useRef(null);
  let itemRefs = useRef([]);
  let itemContainerRefs = useRef([]);
  let boundryRef = useRef(props.children.length);

  const status = useRef({
    drag: false,
    isMouseDown: false,
    positionBeg: { x: 0, y: 0 },
    positionEnd: { x: 0, y: 0 },
  });

  const [_state, _setState] = useState({
    activeIndex: 0,
    containerWidth: 0,
    containerHeight: 0,
    useTransition: false,
  });
  const stateRef = useRef(_state);
  const setStateRef = (data) => {
    stateRef.current = data;
    _setState(data);
  };

  useEffect(() => {
    boundryRef.current = props.children.length - 1;
  }, [props.children.length]);

  useLayoutEffect(() => {
    adjustLayout();
    eventListener(containerRef.current, "add");
    return () => {
      eventListener(containerRef.current, "remove");
    };
  }, []);

  useLayoutEffect(() => {
    setStateRef({
      ...stateRef.current,
      activeIndex: 0,
    });
  }, [props.children.length]);

  useLayoutEffect(() => {
    let { clientWidth: containerWidth } = containerRef.current;

    const marginTop = parseInt(
      window
        .getComputedStyle(itemRefs.current[0])
        .getPropertyValue("margin-top")
    );

    itemRefs.current.forEach((item, index) => {
      if (itemContainerRefs && item) {
        itemContainerRefs.current[index].style.position = `relative`;

        if (item.parentElement.offsetTop !== marginTop) {
          //下面item往上提
          const offsetHeight =
            item.parentElement.offsetTop -
            containerRef.current.offsetTop -
            parseInt(marginTop);

          itemContainerRefs.current[index].style.top = `${-offsetHeight}px`;
        }

        //左右偏移量
        let offset = index - stateRef.current.activeIndex;
        itemContainerRefs.current[index].style.left = `${(
          offset * containerWidth
        ).toString()}px`;
      }
    });
  });

  const eventListener = (elem, type) => {
    elem[type + "EventListener"]("mousedown", handleStart);
    window[type + "EventListener"]("mousemove", handleMove);
    window[type + "EventListener"]("mouseup", handleEnd);

    elem[type + "EventListener"]("touchstart", handleStart);
    window[type + "EventListener"]("touchmove", handleMove);
    window[type + "EventListener"]("touchend", handleEnd);

    window[type + "EventListener"]("resize", handleResize);
  };

  const handleStart = (e) => {
    let { clientX: x, clientY: y } = e.type === "touchstart" ? e.touches[0] : e;
    status.current.positionBeg = { x, y };
    status.current.isMouseDown = true;
    status.current.drag = false;
  };

  const handleMove = (e) => {
    if (status.current.isMouseDown) {
      let { clientX: x, clientY: y } =
        e.type === "touchmove" ? e.touches[0] : e;
      status.current.positionEnd = { x, y };
      status.current.drag = true;
    }
  };

  //判斷移動 MouseUp & touchEnd 事件
  const handleEnd = (e) => {
    status.current.isMouseDown = false;
    let moveDiff = status.current.positionEnd.x - status.current.positionBeg.x;
    if (status.current.drag && Math.abs(moveDiff) > 10) {
      let newIndex = stateRef.current.activeIndex;

      //處理index位置
      let moveDirection = moveDiff > 0 ? "right" : "left";
      if (moveDirection === "right") {
        if (newIndex > 0) {
          newIndex -= 1;
        } else if (props.loop) {
          newIndex = boundryRef.current;
        }
      } else {
        if (newIndex < boundryRef.current) {
          newIndex += 1;
        } else if (props.loop) {
          newIndex = 0;
        }
      }
      status.current.drag = false;
      setStateRef({
        ...stateRef.current,
        useTransition: true,
        activeIndex: newIndex,
      });
    }
  };

  const handleResize = (e) => {
    if (containerRef.current) {
      adjustLayout();
    }
  };

  const adjustLayout = () => {
    const marginTop = window
      .getComputedStyle(itemRefs.current[0])
      .getPropertyValue("margin-top");

    const maxItemHeight = itemRefs.current.reduce((prev, curr) => {
      if (curr) {
        return Math.max(prev, curr.clientHeight);
      }
    }, 0);

    let containerHeight = parseInt(marginTop) + maxItemHeight;
    let { clientWidth: containerWidth } = containerRef.current;

    const newState = {
      ...stateRef.current,
      containerWidth,
      containerHeight,
      useTransition: false,
    };

    setStateRef(newState);
  };

  const childrenWithProps = useMemo(() => {
    itemRefs.current = [];
    itemContainerRefs.current = [];
    return React.Children.map(props.children, (child, index) => {
      return (
        <div
          className="ItemWrapper"
          ref={(e) => (itemContainerRefs.current[index] = e)}
        >
          {React.cloneElement(child, {
            ref: (e) => (itemRefs.current[index] = e),
          })}
        </div>
      );
    });
  }, [props.children]);

  return (
    <div className="Swiper">
      <div
        className="container"
        style={{
          overflow: "hidden",
          height: stateRef.current.containerHeight + "px",
        }}
        ref={(e) => (containerRef.current = e)}
      >
        {childrenWithProps}
      </div>
      <div className="Dots">
        <Dots
          length={props.children.length}
          setStateRef={setStateRef}
          state={stateRef.current}
          activeIndex={stateRef.current.activeIndex}
        />
      </div>
    </div>
  );
}

const Dots = ({ length, setStateRef, state, activeIndex }) => {
  let dots = [];
  for (let i = 0; i < length; i++) {
    dots.push(
      <div
        key={i}
        style={{
          ...styleDot,
          color: activeIndex === i ? "#EB0201" : "#84E8D7",
        }}
        onClick={() => {
          setStateRef({
            ...state,
            activeIndex: i,
            useTransition: true,
          });
        }}
      >
        {i}
      </div>
    );
  }
  return dots;
};

export default SwipeContainer;
