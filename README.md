# react-native-sortable-listview
Drag drop capable wrapper of ListView for React Native. Allows for dragging and dropping of rows with automatic scrolling while dragging.

Note that this quite raw still, and is not recommended for production use. BREAKING CHANGE IN 0.0.8, due to react being separated out from the react native project, 0.0.8+ will only work on React Native 0.26+.

## Add it to your project

1. Run `npm install react-native-sortable-listview --save`
2. `var SortableListView = require('react-native-sortable-listview');`

## Demo

<a href="https://raw.githubusercontent.com/deanmcpherson/react-native-sortable-listview/master/demo.gif"><img src="https://raw.githubusercontent.com/deanmcpherson/react-native-sortable-listview/master/demo.gif" width="350"></a>

## Basic usage

```javascript

let SortableListView = require('react-native-sortable-listview');
let React = require('react-native');
let {
  View,
  Text,
  TouchableHighlight
} = React;


let data = { 
  hello: {text: 'world'},
  how: {text: 'are you'},
  test: {text: 123},
  this: {text: 'is'},
  a: {text: 'a'},
  real: {text: 'real'},
  drag: {text: 'drag and drop'},
  bb: {text: 'bb'},
  cc: {text: 'cc'},
  dd: {text: 'dd'},
  ee: {text: 'ee'},
  ff: {text: 'ff'},
  gg: {text: 'gg'},
  hh: {text: 'hh'},
  ii: {text: 'ii'},
  jj: {text: 'jj'},
  kk: {text: 'kk'}
}

let order = Object.keys(data); //Array of keys

let RowComponent = React.createClass({
  render: function() {
    return <TouchableHighlight underlayColor={'#eee'} style={{padding: 25, backgroundColor: "#F8F8F8", borderBottomWidth:1, borderColor: '#eee'}} onLongPress={this.props.onLongPress} onPressOut={this.props.onPressOut}>
        <Text>{this.props.data.text}</Text>
      </TouchableHighlight>
  }
})

let MyComponent = React.createClass({
  render: function() {
    return <SortableListView
          style={{flex: 1}}
          data={data}
          order={order}
          onRowMoved={e => {
            order.splice(e.to, 0, order.splice(e.from, 1)[0]);
            this.forceUpdate();
          }}
          renderRow={row => <RowComponent data={row} />}
        />
  }
});

module.exports = MyComponent;

```
## Example

See
[example.js](https://github.com/deanmcpherson/react-native-sortable-listview/tree/master/example.js).


## Props

SortableListView passes through all the standard ListView properties to ListView, except for dataSource. The renderRow method must render a component that forwards onLongPress and onPressOut methods. Calling the onLongPress method will enable the drag and drop on the row and onPressOut will cancel it.

 - **`onRowMoved`** _(Function)_ - should return a function that is passed a single object when a row is dropped. The object contains three properties `from`, `to`, and `row`. `from` and `to` are the order indexes being requested to move. `row` is all the info available about the row being dropped.
 - **`data`** _(Object)_ - Takes an object.
 - **`order`** _(Array)_  (optional) - Expects an array of keys to determine the current order of rows.

---

###Contributions welcome!

---

**MIT Licensed**
