let SortableListView = require('react-native-sortable-listview');
let React = require('react');
let {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} = require('react-native');



let list1 = { 
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
let shortlist = { 
  hello: {text: 'world'},
  how: {text: 'are you'},
  test: {text: 123},
  this: {text: 'is'},
}
let list3 = { 
  hello:  'world',
  how:  'are you',
  test:  123,
  these:  'is',
  a:  'a',
  real:  'real',
  drag:  'drag and drop',
  bb:  'bb',
  cc:  'cc',
  dd:  'dd',
  ee:  'ee',
  ff:  'ff',
  gg:  'gg',
  hh:  'hh',
  ii:  'ii',
  jj:  'jj',
  kk:  'kk'
}

let list4 = {
  v0: 0,
  v1: 1,
  v2: 2,
  v3: 3,
  v4: 4,
  v5: 5,
  v6: 6,
  v7: 7,
  v8: 8,
  v9: 9,
  v10: 10,
  v11: 11,
  v12: 12,
  v13: 13,
  v14: 14,
  v15: 15,
  v16: 16,
}

let data = list3;

let order = Object.keys(data); //Array of keys

let RowComponent = React.createClass({
  render: function() {
    return <TouchableHighlight underlayColor={'#eee'} style={{padding: 25, backgroundColor: "#F8F8F8", borderBottomWidth:1, borderColor: '#eee'}} {...this.props.sortHandlers}>
        <Text style={{fontSize: 20}}>{data === list3 || data === list4? this.props.data: this.props.data.text}</Text>
      </TouchableHighlight>
  }
})

let MyComponent = React.createClass({
  render: function() {
    return (
      <View style={styles.container}>
         <View style={{height: 64, backgroundColor: 'lightblue'} /* fake nav bar */} >
           <Text style={styles.welcome} > Sortable </Text>
         </View>
      <SortableListView
          style={{flex: 1, marginBottom: 0}}
          data={data}
          order={order}
          onRowMoved={e => {
            order.splice(e.to, 0, order.splice(e.from, 1)[0]);
            this.forceUpdate();
          }}
          renderRow={row => <RowComponent data={row} />}
      />
      </View> );

  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
module.exports = MyComponent;
