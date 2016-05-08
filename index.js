import React from 'react-native';
import TimerMixin from 'react-timer-mixin';

var {
  ListView,
  LayoutAnimation,
  View,
  Animated,
  Dimensions,
  PanResponder,
  TouchableWithoutFeedback
} = React;

let HEIGHT = Dimensions.get('window').height;
var Row = React.createClass({
  shouldComponentUpdate: function(props) {
    if (props.hovering !== this.props.hovering) return true;
    if (props.active !== this.props.active) return true;
    if (props.rowData.data !== this.props.rowData.data) return true;
    return false;
  },
  handleLongPress: function(e) {
    this.refs.view.measure((frameX, frameY, frameWidth, frameHeight, pageX, pageY) => {
      let layout = {frameX, frameY, frameWidth, frameHeight, pageX, pageY};
       this.props.onRowActive({
        layout: layout,
        touch: e.nativeEvent,
        rowData: this.props.rowData
      });
    });
  },
  measure: function() {
    return this.refs.view.measure.apply(this, Array.from(arguments));
  },
  render: function() {
    let layout = this.props.list.layoutMap[this.props.rowData.index];
    let activeData = this.props.list.state.active;

    let activeIndex = activeData ? Number(activeData.rowData.index) : -5;
    let shouldDisplayHovering = activeIndex !== this.props.rowData.index;
    let Row = React.cloneElement(this.props.renderRow(this.props.rowData.data, this.props.rowData.section, this.props.rowData.index, null, this.props.active), {onLongPress: this.handleLongPress, onPressOut: this.props.list.cancel});
    return <View onLayout={this.props.onRowLayout} style={this.props.active && this.props.list.state.hovering ? {height: 0, opacity: 0} : null} ref="view">
          {this.props.hovering && shouldDisplayHovering ? this.props.activeDivider : null}
          {this.props.active && this.props.list.state.hovering && this.props._legacySupport ? null : Row}
        </View>
  }
});

var SortRow = React.createClass({
  getInitialState: function() {
    let layout = this.props.list.state.active.layout;
    let wrapperLayout = this.props.list.wrapperLayout;

    return {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        opacity: .2,
        height: layout.frameHeight,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        marginTop: layout.pageY - wrapperLayout.pageY //Account for top bar spacing
      }
    }
  },
  render: function() {
     let handlers = this.props.panResponder.panHandlers;
    return <Animated.View ref="view" style={[this.state.style, this.props.list.state.pan.getLayout()]}>
      <View style={{opacity: .85, flex: 1}}>
        {this.props.renderRow(this.props.rowData.data, this.props.rowData.section, this.props.rowData.index, true)}
      </View>
      </Animated.View>
  }
});

var SortableListView = React.createClass({
  mixins: [TimerMixin],
  getInitialState:function() {

    let currentPanValue = {x: 0, y: 0};

    this.state = {
      ds: new ListView.DataSource({rowHasChanged: (r1, r2) => {
      //  if (this.props.rowHasChanged) return this.props.rowHasChanged(r1, r2);
        return false;
      }}),
      active: false,
      hovering: false,
      pan: new Animated.ValueXY(currentPanValue)
    };
    this.listener = this.state.pan.addListener(e => this.panY = e.y);
    let onPanResponderMoveCb = Animated.event([null, {
           dx: this.state.pan.x, // x,y are Animated.Value
           dy: this.state.pan.y,
      }]);

    this.state.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e) => true,
      onMoveShouldSetPanResponderCapture: (e, a) => {
        //Only capture when moving vertically, this helps for child swiper rows.
        let vy = Math.abs(a.vy);
        let vx = Math.abs(a.vx);

        return (vy ) > vx;
      },
      onPanResponderMove: (evt, gestureState) => {
        gestureState.dx = 0;
        this.moveY = gestureState.moveY;
        onPanResponderMoveCb(evt, gestureState);
       },

       onPanResponderGrant: (e, gestureState) => {
          this.moved = true;
          this.props.onMoveStart &&  this.props.onMoveStart();
          this.state.pan.setOffset(currentPanValue);
          this.state.pan.setValue(currentPanValue);
      },
      onPanResponderRelease: (e) => {
        this.moved = false;
        this.props.onMoveEnd && this.props.onMoveEnd();
        if (!this.state.active) {
          if (this.state.hovering) this.setState({hovering: false});
          return;
        }
        let itemHeight = this.state.active.layout.frameHeight;
        let fromIndex = this.order.indexOf(this.state.active.rowData.index);
        let toIndex = this.state.hovering === false ?  fromIndex : Number(this.state.hovering);
        let up = toIndex > fromIndex;
        if (up) {
          toIndex--;
        }
        if (toIndex === fromIndex) return this.setState({active: false, hovering: false});
        let args = {
          row: this.state.active.rowData,
          from: fromIndex,
          to: toIndex
        };

        this.props.onRowMoved && this.props.onRowMoved(args);
        if (this.props._legacySupport) { //rely on parent data changes to set state changes
          //LayoutAnimation.easeInEaseOut()
          this.state.active = false;
          this.state.hovering = false;
        } else {
          this.setState({
            active: false,
            hovering: false
          });
        }

        let MAX_HEIGHT = Math.max(0, this.scrollContainerHeight - HEIGHT);
        if (this.scrollValue > MAX_HEIGHT) {
          this.scrollResponder.scrollTo({y: MAX_HEIGHT});
        }

        this.state.active = false;
        this.state.hovering = false;
      }
     });

    return this.state;
  },
  cancel: function() {
    if (!this.moved) {
      this.setState({
        active: false,
        hovering: false
      });
    }
  },
  componentDidMount: function() {
    setTimeout(()=>{
      this.scrollResponder = this.refs.list.getScrollResponder();
      this.refs.wrapper.measure((frameX, frameY, frameWidth, frameHeight, pageX, pageY) => {

        let layout = {frameX, frameY, frameWidth, frameHeight, pageX, pageY};
        this.wrapperLayout = layout;
      });
    }, 1);

  },
  scrollValue: 0,
  scrollContainerHeight: HEIGHT * 1.2, //Gets calculated on scroll, but if you havent scrolled needs an initial value
  scrollAnimation: function() {
    if (this.isMounted() && this.state.active) {
      if (this.moveY == undefined) return this.requestAnimationFrame(this.scrollAnimation);

      let SCROLL_OFFSET = this.wrapperLayout.pageY;
      let moveY = this.moveY - SCROLL_OFFSET;
      let SCROLL_LOWER_BOUND = 80 + SCROLL_OFFSET;
      let SCROLL_HIGHER_BOUND = this.listLayout.height - SCROLL_LOWER_BOUND;

      let MAX_SCROLL_VALUE = this.scrollContainerHeight - HEIGHT + (this.state.active.layout.frameHeight * 2);
      let currentScrollValue = this.scrollValue;
      let newScrollValue = null;
      let SCROLL_MAX_CHANGE = 20;

      if (moveY < SCROLL_LOWER_BOUND && currentScrollValue > 0) {
        let PERCENTAGE_CHANGE = 1 - (moveY / SCROLL_LOWER_BOUND);
          newScrollValue = currentScrollValue - (PERCENTAGE_CHANGE * SCROLL_MAX_CHANGE);
          if (newScrollValue < 0) newScrollValue = 0;

      }
      if (moveY > SCROLL_HIGHER_BOUND && currentScrollValue < MAX_SCROLL_VALUE) {
        let PERCENTAGE_CHANGE = 1 - ((this.listLayout.height - moveY) / SCROLL_LOWER_BOUND);
        newScrollValue = currentScrollValue + (PERCENTAGE_CHANGE * SCROLL_MAX_CHANGE);
        if (newScrollValue > MAX_SCROLL_VALUE) newScrollValue = MAX_SCROLL_VALUE;
      }
      if (newScrollValue !== null) {
        this.scrollValue = newScrollValue;
         //this.scrollResponder.scrollWithoutAnimationTo(this.scrollValue, 0);
         this.scrollResponder.scrollTo({y: this.scrollValue, x: 0, animated: false});
      }
      this.checkTargetElement();
      this.requestAnimationFrame(this.scrollAnimation);
    }
  },
  calculateDestinationY: function(index) {
    let i = 0;
    let x = 0;
    let row;
    let order = this.order;

    for (x = 0; x < order.length; x++) {
      let key = order[x];
      row = this.layoutMap[key];
      if (x == index) return i;
      i += row.height;
    }
    return 0;
  },
  checkTargetElement() {
    let scrollValue = this.scrollValue;
    let moveY = this.moveY;
    let targetPixel = scrollValue + moveY - this.wrapperLayout.pageY;
    let i = 0;
    let x = 0;
    let row;
    let order = this.order;
    let isLast = false;
    while (i < targetPixel) {
      let key = order[x];
      row = this.layoutMap[key];
      if (!row) {
        isLast = true;
        break;
      }
      i += row.height;
      x++;
    }
    if (!isLast) x--;
    if (x != this.state.hovering) {
      LayoutAnimation.easeInEaseOut();
      this._previouslyHovering = this.state.hovering;
      this.__activeY = this.panY;
      this.setState({
        hovering: String(x)
      })
    }

  },
  layoutMap: {},
  _rowRefs: {},
  handleRowActive: function(row) {
    this.state.pan.setValue({x: 0, y: 0});
    LayoutAnimation.easeInEaseOut();
    this.setState({
      active: row
    },  this.scrollAnimation);

  },
  renderActiveDivider: function() {
    if (this.props.activeDivider) this.props.activeDivider();
    return <View style={{height: this.state.active ? this.state.active.layout.frameHeight : null}} />
  },
  renderRow: function(data, section, index, highlightfn, active) {
    let Component = active ? SortRow : Row;
    let isActiveRow = (!active && this.state.active && this.state.active.rowData.index === index);
    if (!active && isActiveRow) {
      active = {active: true};
    }
    let hoveringIndex = this.order[this.state.hovering];
    return <Component
      {...this.props}
      activeDivider={this.renderActiveDivider() }
      key={index}
      active={active}
      list={this}
      ref={view => { this._rowRefs[active ? 'ghost' : index] = view; }}
      hovering={hoveringIndex == index}
      panResponder={this.state.panResponder}
      rowData={{data, section, index}}
      onRowActive={this.handleRowActive}
      onRowLayout={layout => this.layoutMap[index] = layout.nativeEvent.layout}
      />
  },
  renderActive: function() {
    if (!this.state.active) return;
    let index = this.state.active.rowData.index;
    return this.renderRow(this.props.data[index], 's1', index, () => {}, {active: true, thumb: true});
  },
  componentWillMount: function() {
    this.setOrder(this.props);
  },
  componentWillReceiveProps: function(props) {
    this.setOrder(props);
  },
  setOrder: function(props) {
    this.order = props.order || Object.keys(props.data) || [];
  },
  getScrollResponder: function() {
    return this.scrollResponder;
  },
  render: function() {
    let dataSource = this.state.ds.cloneWithRows(this.props.data, this.props.order);
    return <View ref="wrapper" style={{flex: 1}} onLayout={()=>{}}>
      <ListView
        enableEmptySections={true}
        {...this.props}
        {...this.state.panResponder.panHandlers}
        ref="list"
        dataSource={dataSource}
        onScroll={e => {
          this.scrollValue = e.nativeEvent.contentOffset.y;
          if (!this._scrolling) {
            // Only cache the scroll container height at the beginning of the scroll.
            this._scrolling = true;
            this.scrollContainerHeight = e.nativeEvent.contentSize.height;
          }
          
          if (this.props.onScroll) this.props.onScroll(e);
        }}
        onScrollAnimationEnd={() => this._scrolling = false}
        onLayout={(e) => this.listLayout = e.nativeEvent.layout}
        scrollEnabled={!this.state.active}
        renderRow={this.renderRow}
      />
      {this.renderActive()}
    </View>
  }
});

module.exports = SortableListView;
