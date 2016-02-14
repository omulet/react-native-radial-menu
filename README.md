## React Native Radial Menu

### Installation
`npm install react-native-radial-menu`

### Usage
```javascript
var RadialMenu = require('radial-native-radial-menu');

var Application = React.createClass({
  render: function() {
    return (
      <View>
        <RadialMenu onOpen={() => {}} onClose={() => {}}>
          <Text>ROOT</Text>
          <Text onSelect={() => {}}>A</Text>
          <Text onSelect={() => {}}>B</Text>
          <Text onSelect={() => {}}>C</Text>
          <Text onSelect={() => {}}>D</Text>
        </RadialMenu>
      </View>
    )
  }
})
```

### Examples
```js
// Examples Coming soon
```

### Props
This menu can be fully customized using props.
##### Important
- `itemRadius` (Number) `30` - Menu item radius
- `menuRadius` (Number) `100`- Distance between root and items in open state.
- `spreadAngle` (Number: 0 - 360) `360` - The angle in degrees based on which menu items are spread on a circle around our root. E.g. 360 full circle, 180 half of circle and so on.
- `startAngle` (Number) `0` - Items are distributed in clockwise direction starting from startAngle. 0 is left, 90 top, and so on.

##### Menu Callbacks
- `onOpen` (Function) - Called immediately after the menu has entered the open state.
- `onClose` (Function) - Called immediately after the menu has entered the close state.

##### Menu Item Callbacks
- `onSelect` (Function) - Called when the item is selected

##### Animations
Coming soon

### Demo
* `git clone https://github.com/omulet/react-native-radial-menu.git`
* `cd react-native-radial-menu/examples/rnRadialMenu && npm install`
* Open ``./examples/rnRadialMenu/ios/rnRadialMenu.xcodeproject` in xcode
* `command+r` (in xcode)

### Credits