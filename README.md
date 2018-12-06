# react-native-sortable-listview
Drag drop capable wrapper of ListView for React Native. Allows for dragging and dropping of rows with automatic scrolling while dragging.

## Add it to your project

1. Run `npm install react-native-sortable-listview --save`
2. `import SortableListView from 'react-native-sortable-listview'`

## Demo

<a href="https://raw.githubusercontent.com/deanmcpherson/react-native-sortable-listview/master/demo.gif"><img src="https://raw.githubusercontent.com/deanmcpherson/react-native-sortable-listview/master/demo.gif" width="350"></a>

## Basic usage

See [example](example.js).

## Example

See [Sortable](Sortable).


## Props

SortableListView passes through all the [standard ListView properties](https://facebook.github.io/react-native/docs/listview#props) to ListView, except for dataSource. The renderRow method must render a component that forwards onLongPress and onPressOut methods to a Touchable* child component.  Calling the onLongPress method will enable the drag and drop on the row and onPressOut will cancel it. You can also apply the default behaviour by spreading the sortHandlers prop (e.g. `<TouchableHightlight {...this.props.sortHandlers} >..`)

Property |Type |Description
:--- |:--- |:---
**`onRowMoved`** | Function | should return a function that is passed a single object when a row is dropped. The object contains three properties `from`, `to`, and `row`. `from` and `to` are the order indexes being requested to move. `row` is all the info available about the row being dropped.
**`data`** | Object | Takes an object.
**`rowHasChanged`** | Function | Takes an function that is called to compare row data. It is passed the new row data and a shallow copy of the previous row data. **This is necessary to define if row data is not immutible for row changes to correctly propagate, if your row data is immutable DO NOT DEFINE, see #28 for reasons why**.
**`order`** | Array (Optional) | Expects an array of keys to determine the current order of rows.
**`sortRowStyle`** | Object (Optional) | Expects a `style` object, which is to be applied on the rows when they're being dragged.
**`disableSorting`** | Boolean (Optional) | When set to true, all sorting will be disabled, which will effectively make the SortableListView act like a normal ListView.
**`onMoveStart`** | Function (Optional) | Register a handler to be called when drag start.
**`onMoveEnd`** | Function (Optional) | Register a handler to be called when move is completed.
**`onRowActive`** | Function (Optional) | Register a handler to be called when row is activated, return a object contains three properties `rowData`, `touch` and `layout`. `rowData` is the data info of activated row, `layout` is the layout info of the activated row, `touch` is the `nativeEvent` of long press
**`onMoveCancel`** | Function (Optional) | Register a handler to be called when move is canceled, that is the row is activated on long press and then released without any move.
**`activeOpacity`** | Number (Optional) | Sets opacity of an active element. Default value: `0.2`.
**`limitScrolling`** | Boolean (Optional) | When set to true, scrolling will be disabled when a row is active (sorting). Default is `false`.
**`moveOnPressIn`** | Boolean (Optional) | When set to true, longPress delay is eliminated. Default is `false`.
**`ListViewComponent`** | _(Function) (Optional) | A custom ListView component to be used instead of React-Native's ListView.
**`disableAnimatedScrolling`** | Boolean (Optional) | When set to true, scrolling will no longer animate. Default is `false`. **Strongly recommend set it to `true`.**, see #97 for more context.


## Methods

Name | Description
:--- | :---
**`scrollTo(...args)`** | Scrolls to a given x, y offset, either immediately or with a smooth animation. [See ScrollView's scrollTo method](https://facebook.github.io/react-native/docs/scrollview#scrollto).

---

### Contributing

Before submitting a PR, please:

1. Format your code by running `npm run prettier`.
2. Test by running `npm run test`. (Currently this produces 2 warnings, no errors).
3. Build the [Sortable](Sortable) example app and test fully for regressions on both iOS and android.
4. Describe your change in the `Unreleased` section of the [Changelog](CHANGELOG.md).

---

**MIT Licensed**
