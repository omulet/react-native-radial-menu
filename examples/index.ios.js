/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View
} from 'react-native';

var RadialMenu = require('react-native-radial-menu');

class rnRadialMenu extends Component {

  renderItems() {
    return [...Array(5)].map((_, i) => {
      return (
        <View style={styles.item} key={i}>
          <Text onSelect={() => {console.log("onSelect #{i}")}}>{i}</Text>
        </View>
      );
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <RadialMenu
          onOpen={() => {console.log("on menu open");}}
          onClose={() => {console.log("on menu close");}} >

          <View style={[styles.item, styles.root]}>
            <Text>MENU</Text>
          </View>
          { this.renderItems() }
        </RadialMenu>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  item: {
    height: 60,
    width: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DDD'
  },
  root: {
    backgroundColor: '#FFCC00'
  }
});

AppRegistry.registerComponent('rnRadialMenu', () => rnRadialMenu);
