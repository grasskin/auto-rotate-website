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
        }
        this.video = React.createRef();
    }

    componentDidMount() {
        this.setupCamera()
    }

    setupCamera = async () => {
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
            this.setState({ loading: false });
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
          <video id="video" ref={this.video} playsInline />
          </div>
        );
    }
}

export default App;