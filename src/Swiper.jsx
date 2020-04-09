import React, {
    useState,
    useLayoutEffect,
    useRef,
} from "react";

const styleDot = {
    display: "inline-block",
    padding: "6px",
    margin: "4px",
    borderRadius: "6px",
    backgroundColor: "#60a3bc",
    color: "white",
    cursor: "pointer",
};

function SwipeContainer(props) {
    let containerRef = useRef(null);
    let itemRefs = useRef([]);
    const [state, setState] = useState({
        activeIndex: 0,
        gapToTop: [],
        containerWidth: 0,
        containerHeight: 0,
        useTransition: false,
    });

    let status = useRef({
        drag: false,
        isMouseDown: false,
        positionBeg: { x: 0, y: 0 },
        positionEnd: { x: 0, y: 0 },
    });

    let stateRef = useRef(state);
    const setStateRef = (data) => {
        stateRef.current = data;
        setState(data);
    };

    useLayoutEffect(() => {
        console.log("useLayoutEffect", itemRefs.current);
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
            console.log("handleMove");
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
            console.log("handleEnd", status.current, stateRef.current);
            let newIndex = stateRef.current.activeIndex;
            let boundry = props.children.length - 1;

            //處理index位置
            let moveDirection = moveDiff > 0 ? "right" : "left";
            if (moveDirection === "right") {
                if (newIndex > 0) {
                    newIndex -= 1;
                } else if (props.loop) {
                    newIndex = boundry;
                }
            } else {
                if (newIndex < boundry) {
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
        console.log("handleResize");
        if (containerRef.current) {
            let { clientWidth: containerWidth } = containerRef.current;

            setState({
                ...stateRef.current,
                useTransition: false,
                containerWidth
            });
        }
    };

    const adjustLayout = () => {
        const marginTop = window
            .getComputedStyle(itemRefs.current[0])
            .getPropertyValue("margin-top");

        const maxItemHeight = itemRefs.current.reduce((prev, curr) => {
            return Math.max(prev, curr.clientHeight);
        }, 0);

        const gapToTop = itemRefs.current.map((item) => {
            const offsetHeight =
                item.parentElement.offsetTop -
                containerRef.current.offsetTop -
                parseInt(marginTop);
            return offsetHeight;
        });

        let containerHeight = parseInt(marginTop) + maxItemHeight;
        let { clientWidth: containerWidth } = containerRef.current;

        console.log("adjust layout state", {
            ...state,
            containerWidth,
            containerHeight,
            useTransition: false,
            gapToTop,
        });

        setStateRef({
            ...stateRef.current,
            containerWidth,
            containerHeight,
            useTransition: false,
            gapToTop,
        });
    };

    const childrenWithProps = () => {
        console.log("swipe childrenWithProps");
        return React.Children.map(props.children, (child, index) => {
            let newStyle = {
                position: "relative",
                top: -state.gapToTop[index] + "px",
                left: "0px",
                transition: stateRef.current.useTransition ? 'all 0.5s' : ''
            };

            let offset = index - state.activeIndex;
            newStyle.left = (offset * state.containerWidth).toString() + "px"; //左右偏移量

            return (
                <div className="ItemWrapper" style={newStyle}>
                    {React.cloneElement(child, {
                        ref: (e) => (itemRefs.current[index] = e),
                    })}
                </div>
            );
        });
    };

    console.log("swipe render", state);
    return (
        <div className="Swiper">
            <div
                className="container"
                style={{
                    overflow: "hidden",
                    height: state.containerHeight + "px",
                }}
                ref={(e) => (containerRef.current = e)}
            >
                {childrenWithProps()}
            </div>
            <div className="Dots">
                <Dots length={props.children.length} setStateRef={setStateRef} state={stateRef.current} activeIndex={stateRef.current.activeIndex} />
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
                style={{ ...styleDot, color: activeIndex === i ? '#EB0201' : '#84E8D7' }}
                onClick={() => {
                    setStateRef({
                        ...state,
                        activeIndex: i,
                        useTransition: true,
                    })
                }
                }
            >
                {i}
            </div>
        );
    }
    return dots;
};

export default SwipeContainer;
