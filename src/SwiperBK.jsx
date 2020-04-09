// import React, {
//     Component,
//     useEffect,
//     useState,
//     useLayoutEffect,
//     useRef
//   } from 'react';
  
//   import { Dots } from 'megatron-slicing/lib/components/base/common';
  
//   /*
//     summary: 
//       put the contents that want to swipe inside the SwipeContainer component
      
//     Sample:
//       <SwipeContainer>
//         <div>content 1</div>
//         <div>content 2</div>
//       </SwipeContainer>
//   */
  
//   function SwipeContainer(props) {
//     const [containerSize, setContainerSize] = useState({
//       containerHeight: 0,
//       containerWidth: 0
//     });
  
//     const [activeIndex, setActiveIndex] = useState(0);
//     const [state, setState] = useState({
//       gapToTop: [],
//       useTransition: false
//     });
//     let status = useRef({
//       drag: false,
//       isMouseDown: false,
//       positionBeg: { x: 0, y: 0 },
//       positionEnd: { x: 0, y: 0 }
//     });
//     let containerRef = useRef(null);
//     let itemRefs = useRef([]);
//     useLayoutEffect(() => {
//       console.log('SwipeContainer useEffect[]');
//       eventListener(containerRef.current, 'add');
//       adjustLayout();
//       return () => {
//         eventListener(containerRef.current, 'remove');
//       };
//     }, []);
  
//     const adjustLayout = () => {
//       //console.log('adjust layout');
//       const marginTop = window
//         .getComputedStyle(itemRefs.current[0])
//         .getPropertyValue('margin-top');
  
//       const maxItemHeight = itemRefs.current.reduce((prev, curr) => {
//         return Math.max(prev, curr.clientHeight);
//       }, 0);
  
//       const gapToTop = itemRefs.current.map(item => {
//         const offsetHeight =
//           item.parentElement.offsetTop -
//           containerRef.current.offsetTop -
//           parseInt(marginTop);
//         //console.log('gapToTop: ', item, offsetHeight);
//         return offsetHeight;
//       });
  
//       let containerHeight = parseInt(marginTop) + maxItemHeight;
//       let { clientWidth: containerWidth } = containerRef.current;
  
//       setContainerSize({ containerWidth, containerHeight });
//       setState({
//         ...state,
//         useTransition: false,
//         gapToTop
//       });
//     };
  
//     const eventListener = (elem, type) => {
//       elem[type + 'EventListener']('mousedown', handleStart);
//       window[type + 'EventListener']('mousemove', handleMove);
//       window[type + 'EventListener']('mouseup', handleEnd);
  
//       elem[type + 'EventListener']('touchstart', handleStart);
//       window[type + 'EventListener']('touchmove', handleMove);
//       window[type + 'EventListener']('touchend', handleEnd);
  
//       window[type + 'EventListener']('resize', handleResize);
//     };
  
//     const handleResize = e => {
//       let { clientWidth: containerWidth } = containerRef.current;
//       setState({ ...state, useTransition: false });
//       setContainerSize({ ...containerSize, containerWidth });
//     };
  
//     //紀錄起始位置 MouseDown & touchstart 事件
//     const handleStart = e => {
//       let { clientX: x, clientY: y } = e.type === 'touchstart' ? e.touches[0] : e;
//       status.current.positionBeg = { x, y };
//       status.current.isMouseDown = true;
//       status.current.drag = false;
//     };
  
//     //紀錄結束位置 MouseMove & touchmove 事件
//     const handleMove = e => {
//       if (status.current.isMouseDown) {
//         let { clientX: x, clientY: y } =
//           e.type === 'touchmove' ? e.touches[0] : e;
//         status.current.positionEnd = { x, y };
//         status.current.drag = true;
//         let idx = activeIndex;
//       }
//     };
  
//     //判斷移動 MouseUp & touchEnd 事件
//     const handleEnd = e => {
//       status.current.isMouseDown = false;
//       let moveDiff = status.current.positionEnd.x - status.current.positionBeg.x;
//       if (status.current.drag && Math.abs(moveDiff) > 10) {
//         let newIndex = activeIndex;
//         let boundry = props.children.length - 1;
  
//         //處理index位置
//         let moveDirection = moveDiff > 0 ? 'right' : 'left';
//         if (moveDirection === 'right') {
//           if (newIndex > 0) {
//             newIndex -= 1;
//           } else if (props.loop) {
//             newIndex = boundry;
//           }
//         } else {
//           if (newIndex < boundry) {
//             newIndex += 1;
//           } else if (props.loop) {
//             newIndex = 0;
//           }
//         }
//         status.current.drag = false;
//         let newState = { ...state, useTransition: true };
//         setState(newState);
//         setActiveIndex(2);
//       }
//     };
  
//     const childrenWithProps = () => {
//       itemRefs.current = [];
//       return React.Children.map(props.children, (child, index) => {
//         let newStyle = {
//           position: 'relative',
//           top: -state.gapToTop[index] + 'px',
//           left: '0px',
//           transition: state.useTransition ? 'all 0.5s' : ''
//         };
  
//         let offset = index - activeIndex;
//         newStyle.left = (offset * containerSize.containerWidth).toString() + 'px'; //左右偏移量
  
//         return (
//           <div className="ItemWrapper" style={newStyle}>
//             {React.cloneElement(child, {
//               ref: e => (itemRefs.current[index] = e)
//             })}
//           </div>
//         );
//       });
//     };
  
//     const getDots = () => {
//       if (!props.children.length) {
//         return null;
//       }
  
//       let dotsListData = props.children.map((item, i) => ({
//         active: i === activeIndex
//       }));
  
//       return (
//         <Dots
//           switchDot={index => {
//             setState({ ...state, useTransition: true });
//             setActiveIndex(index);
//           }}
//           list={dotsListData}
//         />
//       );
//     };
  
//     return (
//       <>
//         <div
//           ref={e => (containerRef.current = e)}
//           style={{
//             overflow: 'hidden',
//             height: containerSize.containerHeight + 'px'
//           }}
//           className="SwipeContainer"
//         >
//           {childrenWithProps()}
//         </div>
//         {getDots()}
//       </>
//     );
//   }
  
//   export default SwipeContainer;
  