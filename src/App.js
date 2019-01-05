import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import * as posenet from '@tensorflow-models/posenet';

const imageScaleFactor = 0.5;
const outputStride = 16;
const flipHorizontal = false;
const maxPoseDetections = 2;

const videoWidth = 600;
const videoHeight = 500;

/*
async function estimateMultiplePosesOnImage(imageElement) {
    const net = await posenet.load();

    // estimate poses
    const poses = await net.estimateMultiplePoses(imageElement,
        imageScaleFactor, flipHorizontal, outputStride, maxPoseDetections);

    return poses;
}

const imageElement = document.getElementById('people');

const poses = estimateMultiplePosesOnImage(imageElement);

console.log(poses);
*/

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            angle: 0,
            height: window.innerHeight,
        }
        this.video = React.createRef();
        this.red = React.createRef();
    }

    componentDidMount() {
        this.setupCameraModel()
    }
    componentWillUnmount() {
      clearInterval(this.interval);
    }

    setupCameraModel = async () => {
        this.net = await posenet.load();
        this.video.current.width = videoWidth;
        this.video.current.height = videoHeight;

        let stream = await navigator.mediaDevices.getUserMedia({
            'audio': false,
            'video': {
                facingMode: 'user',
                width: videoWidth,
                height: videoHeight,
            },
        });
        console.log(stream)
        try {
            this.video.current.srcObject = stream;
            console.log('yq')
        } catch (error) {
            this.video.current.src = URL.createObjectURL(stream);
        }

        this.video.current.onloadedmetadata = () => {
            this.video.current.play();
            this.setState({ loading: false }, () => this.interval = setInterval(this.getAngle, 500));
        }
    }

    getAngle = async () => {
      try {
        const poses = await this.net.estimateMultiplePoses(this.video.current, imageScaleFactor, flipHorizontal, outputStride, maxPoseDetections);
        const lEye = poses[0].keypoints[1] // left eye
        const rEye = poses[0].keypoints[2] // right eye
        let y = lEye.position.y - rEye.position.y;
        let x = rEye.position.x - lEye.position.x;
        let newAngle = Math.atan(y/x);
        let newAngleDeg = Math.atan(y/x) * 180 / Math.PI;;
        console.log(newAngle);
        let height = ((window.innerHeight/Math.cos(newAngle)) - ((Math.sin(newAngle)*window.innerWidth)/Math.pow(Math.cos(newAngle),2)))/(1-Math.pow(Math.tan(newAngle), 2))
        console.log('H', Math.round(height));
        if(Math.abs(this.state.angle - newAngleDeg) > 20){
          this.setState({angle: newAngle, height: height});
        }
        console.log(this.state);
      } catch (e) {
        console.log(e.message);
      }
    }

    render() {
        let page;
        if (this.state.loading) {
            page = (<div className="App-header">
                Auto-rotate videos
              </div>);
        }
        return (
            <div className="App">
          {page}
          <video id="video" ref={this.video} style={{transform: 'rotate('+this.state.angle+'deg)'}} playsInline />
          <div ref={this.red} style={{'background': 'red', 'width': '500px', 'height': this.state.height +'px'}} />
          </div>
        );
    }
}

export default App;