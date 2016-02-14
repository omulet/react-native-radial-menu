'use strict';

var React = require('react-native');
var {
  Animated,
  PanResponder,
  StyleSheet,
  View,
} = React;

function generateRadialPositions(count, radius, spread_angle, start_angle) {
	var span = spread_angle < 360 ? 1 : 0;
  var start = start_angle * Math.PI / 180;
  var rad = spread_angle * Math.PI * 2 / 360 / (count - span);
  return [...Array(count)].map((_, i) => {
    return {
      x: -Math.cos(start + rad * i) * radius,
      y: -Math.sin(start + rad * i) * radius,
    };
  });
};

var RadialMenu = React.createClass({

  RMOpening: false,

  getDefaultProps: function() {
    return {
      itemRadius: 30,
      menuRadius: 100,
      spreadAngle: 360,
      startAngle: 0
    };
  },

  getInitialState: function() {
    var children = this.childrenToArray();
    var initial_spots = generateRadialPositions(
      children.length - 1,
      this.props.menuRadius,
      this.props.spreadAngle,
      this.props.startAngle
    );
    initial_spots.unshift({x: 0, y: 0});
    return {
      item_spots: initial_spots,
      item_anims: initial_spots.map((_, i) => {
        return new Animated.ValueXY();
      }),
      selectedItem: null,
      itemPanResponder: null,
      children: children,
    };
  },

  componentWillMount: function() {
    this.setState({ itemPanResponder: this.createPanResponder() });
  },

  // React.Children.toArray is still not exposed on RN 0.20.0-rc1
  childrenToArray: function() {
    let children = [];
    React.Children.forEach(this.props.children, (child) => {
      children.push(child)
    });
    return children;
  },

  itemPanListener: function(e, gestureState) {
    var newSelected = this.computeNewSelected(gestureState);
    if (this.state.selectedItem !== newSelected) {
      if (this.state.selectedItem !== null) {
        var restSpot = this.state.item_spots[this.state.selectedItem];
        Animated.spring(this.state.item_anims[this.state.selectedItem], {
          toValue: restSpot,
        }).start();
      }
      if (newSelected !== null && newSelected !== 0) {
        Animated.spring(this.state.item_anims[newSelected], {
          toValue: this.state.item_anims[0],
        }).start();
      }
      this.state.selectedItem = newSelected;
    }
  },

  releaseItem: function() {
    this.props.onClose && this.props.onClose();

    this.state.selectedItem && !this.RMOpening &&
    this.state.children[this.state.selectedItem].props.onSelect &&
    this.state.children[this.state.selectedItem].props.onSelect();

    this.state.item_anims.forEach((item, i) => {
      Animated.spring(item, {
        toValue: {x: 0, y: 0},
        tension: 60,
        friction: 10
      }).start();
    });
  },

  createPanResponder: function() {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        this.props.onOpen && this.props.onOpen();
        this.RMOpening = true;
        Animated.stagger(40,
          this.state.item_spots.map((spot, idx) =>
            Animated.spring(this.state.item_anims[idx], {
              toValue: spot,
              friction: 6,
              tension: 80
            })
          )
        ).start(() => {this.RMOpening = false});
      },
      onPanResponderMove: Animated.event(
        [ null, {dx: this.state.item_anims[0].x, dy: this.state.item_anims[0].y} ],
        {listener: this.itemPanListener}
      ),
      onPanResponderRelease: this.releaseItem,
      onPanResponderTerminate: this.releaseItem,
    });
  },

  computeNewSelected: function(
    gestureState: Object,
  ): ?number {
    var {dx, dy} = gestureState;
    var minDist = Infinity;
    var newSelected = null;
    var pointRadius = Math.sqrt(dx * dx + dy * dy);
    if (Math.abs(this.props.menuRadius - pointRadius) < this.props.menuRadius / 2) {
      this.state.item_spots.forEach((spot, idx) => {
        var delta = {x: spot.x - dx, y: spot.y - dy};
        var dist = delta.x * delta.x + delta.y * delta.y;
        if (dist < minDist) {
          minDist = dist;
          newSelected = idx;
        }
      });
    }
    return newSelected;
  },


  render: function() {
    return (
      <View style={{
        position: 'relative',
        backgroundColor: 'transparent',
        transform: [
          {translateX: -this.props.itemRadius},
          {translateY: -this.props.itemRadius}
        ]
      }}>
        {this.state.item_anims.map((_, i) => {
          var j = this.state.item_anims.length - i - 1;
          var handlers = j > 0 ? {} : this.state.itemPanResponder.panHandlers;
          return (
            <Animated.View
              {...handlers}
              key={i}
              style={{
                transform: this.state.item_anims[j].getTranslateTransform(),
                position: 'absolute',
              }} >
              {this.state.children[j]}
            </Animated.View>
          );
        })}
      </View>
    );
  }

});

module.exports = RadialMenu;
