import React, { Component } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

const generateRadialPositions = (count, radius, spread_angle, start_angle) => {
	let span = spread_angle < 360 ? 1 : 0;
  let start = start_angle * Math.PI / 180;
  let rad = spread_angle * Math.PI * 2 / 360 / (count - span);
  return [...Array(count)].map((_, i) => {
    return {
      x: -Math.cos(start + rad * i) * radius,
      y: -Math.sin(start + rad * i) * radius,
    };
  });
};

export default class RadialMenu extends Component {
  constructor(props) {
    super(props);
    this.childrenToArray = this.childrenToArray.bind(this);
    this.itemPanListener = this.itemPanListener.bind(this);
    this.releaseItem = this.releaseItem.bind(this);
    this.createPanResponder = this.createPanResponder.bind(this);
    this.computeNewSelected = this.computeNewSelected.bind(this);

    let children = this.childrenToArray();
    let initial_spots = generateRadialPositions(
      children.length - 1,
      this.props.menuRadius,
      this.props.spreadAngle,
      this.props.startAngle
    );
		initial_spots.unshift({x: 0, y: 0});
    this.state = {
      item_spots: initial_spots,
      item_anims: initial_spots.map((_, i) => {
        return new Animated.ValueXY();
      }),
      selectedItem: null,
      itemPanResponder: null,
      children: children,
    };

    this.RMOpening = false;
  }

  componentWillMount() {
    this.setState({ itemPanResponder: this.createPanResponder() });
  }

  // React.Children.toArray is still not exposed on RN 0.20.0-rc1
  childrenToArray() {
    let children = [];
    React.Children.forEach(this.props.children, (child) => {
      children.push(child)
    });
    return children;
  }

  itemPanListener(e, gestureState) {
    let newSelected = null;
    if (!this.RMOpening) {
      newSelected = this.computeNewSelected(gestureState);
      if (this.state.selectedItem !== newSelected) {
        if (this.state.selectedItem !== null) {
          let restSpot = this.state.item_spots[this.state.selectedItem];
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
    }
  }

  releaseItem() {
    this.props.onClose && this.props.onClose();

    this.state.selectedItem && !this.RMOpening &&
    this.state.children[this.state.selectedItem].props.onSelect &&
    this.state.children[this.state.selectedItem].props.onSelect();

    this.state.selectedItem = null;

    this.state.item_anims.forEach((item, i) => {
      Animated.spring(item, {
        toValue: {x: 0, y: 0},
        tension: 60,
        friction: 10
      }).start();
    });
  }

  createPanResponder() {
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
        ).start();
        // Make sure all items gets to innitial position
        // before we start tracking them
        setTimeout(() => {this.RMOpening = false}, 500);
      },
      onPanResponderMove: Animated.event(
        [ null, {dx: this.state.item_anims[0].x, dy: this.state.item_anims[0].y} ],
        {listener: this.itemPanListener}
      ),
      onPanResponderRelease: this.releaseItem,
      onPanResponderTerminate: this.releaseItem,
    });
  }

  computeNewSelected(gestureState) {
    let {dx, dy} = gestureState;
    let minDist = Infinity;
    let newSelected = null;
    let pointRadius = Math.sqrt(dx * dx + dy * dy);
    if (Math.abs(this.props.menuRadius - pointRadius) < this.props.menuRadius / 2) {
      this.state.item_spots.forEach((spot, idx) => {
        let delta = {x: spot.x - dx, y: spot.y - dy};
        let dist = delta.x * delta.x + delta.y * delta.y;
        if (dist < minDist) {
          minDist = dist;
          newSelected = idx;
        }
      });
    }
    return newSelected;
  }


  render() {
    return (
      <View style={[
        { position: 'relative',
          backgroundColor: 'transparent',
          width: this.props.itemRadius * 2,
          height: this.props.itemRadius * 2,
        },
        this.props.style]}>
        {this.state.item_anims.map((_, i) => {
          let j = this.state.item_anims.length - i - 1;
          let handlers = j > 0 ? {} : this.state.itemPanResponder.panHandlers;
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
}

RadialMenu.defaultProps = {
  itemRadius: 30,
  menuRadius: 100,
  spreadAngle: 360,
  startAngle: 0
};
