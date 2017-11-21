import React from 'react'
import {
  View,
  Animated,
  ListView,
  Dimensions,
  PanResponder,
  LayoutAnimation,
  InteractionManager,
} from 'react-native'

const HEIGHT = Dimensions.get('window').height

class Row extends React.Component {
  constructor(props) {
    super(props)
    this._data = {}
  }

  shouldComponentUpdate(props) {
    if (props.hovering !== this.props.hovering) return true
    if (props.active !== this.props.active) return true
    if (props.rowData.data !== this.props.rowData.data) return true
    if (props.rowHasChanged) {
      return props.rowHasChanged(props.rowData.data, this._data)
    }
    return false
  }

  handlePress = e => {
    if (!this.refs.view) return
    this.refs.view.measure(
      (frameX, frameY, frameWidth, frameHeight, pageX, pageY) => {
        const layout = { frameHeight, pageY }
        this.props.onRowActive({
          layout,
          touch: e.nativeEvent,
          rowData: this.props.rowData,
        })
      }
    )
  }

  componentDidUpdate(props) {
    // Take a shallow copy of the active data. So we can do manual comparisons of rows if needed.
    if (props.rowHasChanged) {
      this._data =
        typeof props.rowData.data === 'object'
          ? Object.assign({}, props.rowData.data)
          : props.rowData.data
    }
  }

  measure = (...args) => {
    if (!this.refs.view) return
    this.refs.view.measure(...args)
  }

  render() {
    const activeData = this.props.list.state.active

    const activeIndex = activeData ? activeData.rowData.index : -5
    const shouldDisplayHovering = activeIndex !== this.props.rowData.index
    const Row = React.cloneElement(
      this.props.renderRow(
        this.props.rowData.data,
        this.props.rowData.section,
        this.props.rowData.index,
        null,
        this.props.active
      ),
      {
        sortHandlers: {
          onLongPress: !this.props.moveOnPressIn ? this.handlePress : null,
          onPressIn: this.props.moveOnPressIn ? this.handlePress : null,
          onPressOut: this.props.list.cancel,
        },
        onLongPress: !this.props.moveOnPressIn ? this.handleLongPress : null,
        onPressIn: this.props.moveOnPressIn ? this.handlePress : null,
        onPressOut: this.props.list.cancel,
      }
    )
    return (
      <View
        onLayout={this.props.onRowLayout}
        style={[
          this.props.active && !this.props.hovering
            ? { height: 0.01, opacity: 0.0 }
            : null,
          this.props.active && this.props.hovering ? { opacity: 0.0 } : null,
        ]}
        ref="view"
      >
        {this.props.hovering && shouldDisplayHovering
          ? this.props.activeDivider
          : null}
        {Row}
      </View>
    )
  }
}

class SortRow extends React.Component {
  constructor(props) {
    super(props)
    const layout = props.list.state.active.layout
    const wrapperLayout = props.list.wrapperLayout

    this.state = {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        opacity: props.activeOpacity || 0.2,
        height: layout.frameHeight,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        marginTop: layout.pageY - wrapperLayout.pageY, // Account for top bar spacing
      },
    }
  }

  render() {
    return (
      <Animated.View
        ref="view"
        style={[
          this.state.style,
          this.props.sortRowStyle,
          this.props.list.state.pan.getLayout(),
        ]}
      >
        {this.props.renderRow(
          this.props.rowData.data,
          this.props.rowData.section,
          this.props.rowData.index,
          null,
          true
        )}
      </Animated.View>
    )
  }
}

class SortableListView extends React.Component {
  constructor(props, context) {
    super(props, context)

    const currentPanValue = { x: 0, y: 0 }

    this.state = {
      ds: new ListView.DataSource({
        rowHasChanged: (r1, r2) => {
          if (props.rowHasChanged) return props.rowHasChanged(r1, r2)
          return false
        },
      }),
      active: false,
      hovering: false,
      pan: new Animated.ValueXY(currentPanValue),
    }
    this.listener = this.state.pan.addListener(e => (this.panY = e.y))
    const onPanResponderMoveCb = Animated.event([
      null,
      {
        dx: this.state.pan.x, // x,y are Animated.Value
        dy: this.state.pan.y,
      },
    ])

    this.moved = false
    this.moveY = null
    this.dy = 0
    this.direction = 'down'
    this.state.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: (e, gestureState) => {
        // Only capture when moving vertically, this helps for child swiper rows.
        const vy = Math.abs(gestureState.vy)
        const vx = Math.abs(gestureState.vx)

        return vy > vx && this.state.active
      },
      onPanResponderMove: (e, gestureState) => {
        if (!this.state.active) return
        gestureState.dx = 0
        const layout = this.state.active.layout
        this.moveY = layout.pageY + layout.frameHeight / 2 + gestureState.dy
        this.direction = gestureState.dy >= this.dy ? 'down' : 'up'
        this.dy = gestureState.dy
        onPanResponderMoveCb(e, gestureState)
      },

      onPanResponderGrant: () => {
        if (!this.state.active) return
        this.moved = true
        this.dy = 0
        this.direction = 'down'
        props.onMoveStart && props.onMoveStart()
        this.state.pan.setOffset(currentPanValue)
        this.state.pan.setValue(currentPanValue)
      },
      onPanResponderRelease: () => {
        if (!this.state.active) return
        this.moved = false
        props.onMoveEnd && props.onMoveEnd()
        if (!this.state.active) {
          if (this.state.hovering) this.setState({ hovering: false })
          this.moveY = null
          return
        }
        const itemHeight = this.state.active.layout.frameHeight
        const fromIndex = this.order.indexOf(this.state.active.rowData.index)
        let toIndex =
          this.state.hovering === false
            ? fromIndex
            : Number(this.state.hovering)
        const up = toIndex > fromIndex
        if (up) {
          toIndex--
        }
        if (toIndex === fromIndex) {
          return this.setState({ active: false, hovering: false })
        }
        const args = {
          row: this.state.active.rowData,
          from: fromIndex,
          to: toIndex,
        }

        props.onRowMoved && props.onRowMoved(args)
        if (props._legacySupport) {
          // rely on parent data changes to set state changes
          // LayoutAnimation.easeInEaseOut()
          this.state.active = false
          this.state.hovering = false
        } else {
          this.setState({
            active: false,
            hovering: false,
          })
        }

        const MAX_HEIGHT = Math.max(
          0,
          this.scrollContainerHeight - this.listLayout.height + itemHeight
        )
        if (this.scrollValue > MAX_HEIGHT) {
          this.scrollTo({ y: MAX_HEIGHT })
        }

        this.state.active = false
        this.state.hovering = false
        this.moveY = null
      },
    })

    this.scrollValue = 0
    // Gets calculated on scroll, but if you havent scrolled needs an initial value
    this.scrollContainerHeight = HEIGHT * 1.2

    this.firstRowY = undefined
    this.layoutMap = {}
    this._rowRefs = {}
  }

  cancel = () => {
    if (!this.moved) {
      this.state.active && this.props.onMoveCancel && this.props.onMoveCancel()
      this.setState({
        active: false,
        hovering: false,
      })
    }
  }

  measureWrapper = () => {
    if (!this.refs.wrapper) return
    this.refs.wrapper.measure(
      (frameX, frameY, frameWidth, frameHeight, pageX, pageY) => {
        const layout = {
          frameX,
          frameY,
          frameWidth,
          frameHeight,
          pageX,
          pageY,
        }
        this.wrapperLayout = layout
      }
    )
  }

  handleListLayout = e => {
    this.listLayout = e.nativeEvent.layout
  }

  handleScroll = e => {
    this.scrollValue = e.nativeEvent.contentOffset.y
    if (this.props.onScroll) this.props.onScroll(e)
  }

  handleContentSizeChange = (width, height) => {
    this.scrollContainerHeight = height
  }

  scrollAnimation = () => {
    if (this.state.active) {
      if (this.moveY === undefined) {
        return requestAnimationFrame(this.scrollAnimation)
      }

      const SCROLL_OFFSET = this.wrapperLayout.pageY
      const moveY = this.moveY - SCROLL_OFFSET
      const SCROLL_LOWER_BOUND = 80
      const SCROLL_HIGHER_BOUND = this.listLayout.height - SCROLL_LOWER_BOUND
      const NORMAL_SCROLL_MAX =
        this.scrollContainerHeight - this.listLayout.height
      const MAX_SCROLL_VALUE =
        NORMAL_SCROLL_MAX + this.state.active.layout.frameHeight * 2
      const currentScrollValue = this.scrollValue
      let newScrollValue = null
      const SCROLL_MAX_CHANGE = 20

      if (moveY < SCROLL_LOWER_BOUND && currentScrollValue > 0) {
        const PERCENTAGE_CHANGE = 1 - moveY / SCROLL_LOWER_BOUND
        newScrollValue =
          currentScrollValue - PERCENTAGE_CHANGE * SCROLL_MAX_CHANGE
        if (newScrollValue < 0) newScrollValue = 0
      }
      if (
        moveY > SCROLL_HIGHER_BOUND &&
        currentScrollValue < MAX_SCROLL_VALUE
      ) {
        const PERCENTAGE_CHANGE =
          1 - (this.listLayout.height - moveY) / SCROLL_LOWER_BOUND
        newScrollValue =
          currentScrollValue + PERCENTAGE_CHANGE * SCROLL_MAX_CHANGE
        if (newScrollValue > MAX_SCROLL_VALUE) newScrollValue = MAX_SCROLL_VALUE
      }
      if (newScrollValue !== null && !this.props.limitScrolling) {
        this.scrollValue = newScrollValue
        this.scrollTo({ y: this.scrollValue, animated: !this.props.disableAnimatedScrolling })
      }
      this.moved && this.checkTargetElement()
      requestAnimationFrame(this.scrollAnimation)
    }
  }

  checkTargetElement = () => {
    const itemHeight = this.state.active.layout.frameHeight
    const SLOP = this.direction === 'down' ? itemHeight : 0
    const scrollValue = this.scrollValue

    const moveY = this.moveY - this.wrapperLayout.pageY

    const activeRowY = scrollValue + moveY - this.firstRowY

    let indexHeight = 0.0
    let i = 0
    let row
    const order = this.order
    let isLast = false
    while (indexHeight < activeRowY + SLOP) {
      const key = order[i]
      row = this.layoutMap[key]
      if (!row) {
        isLast = true
        break
      }
      indexHeight += row.height
      i++
    }
    if (!isLast) i--

    if (String(i) !== this.state.hovering && i >= 0) {
      LayoutAnimation.easeInEaseOut()
      this._previouslyHovering = this.state.hovering
      this.__activeY = this.panY
      this.setState({
        hovering: String(i),
      })
    }
  }

  handleRowActive = row => {
    if (this.props.disableSorting) return
    this.state.pan.setValue({ x: 0, y: 0 })
    LayoutAnimation.easeInEaseOut()
    this.moveY = row.layout.pageY + row.layout.frameHeight / 2
    this.setState(
      {
        active: row,
        hovering: row.rowData.index,
      },
      this.scrollAnimation
    )
    this.props.onRowActive && this.props.onRowActive(row)
  }

  renderActiveDivider = () => {
    const height = this.state.active
      ? this.state.active.layout.frameHeight
      : null
    if (this.props.renderActiveDivider) {
      return this.props.renderActiveDivider(height)
    }
    return <View style={{ height }} />
  }

  renderRow = (data, section, index, highlightfn, active) => {
    const Component = active ? SortRow : Row
    const isActiveRow =
      !active && this.state.active && this.state.active.rowData.index === index

    const hoveringIndex = this.order[this.state.hovering] || this.state.hovering
    return (
      <Component
        {...this.props}
        activeDivider={this.renderActiveDivider()}
        key={index}
        active={active || isActiveRow}
        list={this}
        ref={view => {
          this._rowRefs[active ? 'ghost' : index] = view
        }}
        hovering={hoveringIndex === index}
        panResponder={this.state.panResponder}
        rowData={{ data, section, index }}
        onRowActive={this.handleRowActive}
        onRowLayout={this._updateLayoutMap(index)}
      />
    )
  }

  _updateLayoutMap = index => e => {
    const layout = e.nativeEvent.layout
    if (this.firstRowY === undefined || layout.y < this.firstRowY) {
      this.firstRowY = layout.y
    }
    this.layoutMap[index] = layout
  }

  renderActive = () => {
    if (!this.state.active) return
    const index = this.state.active.rowData.index
    return this.renderRow(this.props.data[index], 's1', index, () => {}, {
      active: true,
      thumb: true,
    })
  }

  componentWillMount() {
    this.setOrder(this.props)
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.timer = setTimeout(() => this && this.measureWrapper(), 0)
    })
  }

  componentWillReceiveProps(props) {
    this.setOrder(props)
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer)
    this.state.pan.removeListener(this.listener)
  }

  setOrder = props => {
    this.order = props.order || Object.keys(props.data) || []
  }

  render() {
    const dataSource = this.state.ds.cloneWithRows(
      this.props.data,
      this.props.order
    )
    const scrollEnabled =
      !this.state.active && this.props.scrollEnabled !== false

    const ListViewComponent = this.props.ListViewComponent || ListView

    return (
      <View ref="wrapper" style={{ flex: 1 }} collapsable={false}>
        <ListViewComponent
          enableEmptySections
          {...this.props}
          {...this.state.panResponder.panHandlers}
          ref="list"
          dataSource={dataSource}
          onScroll={this.handleScroll}
          onContentSizeChange={this.handleContentSizeChange}
          onLayout={this.handleListLayout}
          scrollEnabled={scrollEnabled}
          renderRow={this.renderRow}
        />
        {this.renderActive()}
      </View>
    )
  }

  scrollTo = (...args) => {
    if (!this.refs.list) return;
    this.refs.list.scrollTo(...args)
  }

  getScrollResponder = () => {
    if (!this.refs.list) return;
    this.refs.list.getScrollResponder()
  }
}

module.exports = SortableListView
