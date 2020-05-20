import React from 'react';

const ImageCount = 3;
var ModalImageObjects = [];
var ImageDataSets = [];
var LastImage;
var CurrentImage;

const SecondLayoutQuery = "(min-width: 40em)";
var InSecondLayout;

var startTouchX, startTouchY;

///THE IMAGE MODAL CLASS///
export default class ImageModal extends React.Component {
    //Constructor
    constructor(props){
        super(props);

        //Media Query
        var secondLayoutMatcher = window.matchMedia(SecondLayoutQuery);
        secondLayoutTester();
        secondLayoutMatcher.addListener(secondLayoutTester);
        function secondLayoutTester(){
            if (secondLayoutMatcher.matches){
                InSecondLayout = true;
            }
            else {
                InSecondLayout = false;
            }
        }

        //Set the three images and their initial data sets
        ImageDataSets = this.props.imageSet;
        LastImage = ImageDataSets.length - 1;
        CurrentImage = this.props.imageIndex;
        const screenHalfWidth = window.innerWidth * .5;
        var imageData = [];
        this.DecreaseCurrentImage();

        for (let x = 0; x < ImageCount; x++){
            const width = (InSecondLayout)?window.innerWidth * .4:window.innerWidth * .6;
            const height = window.innerHeight * .6;
            const left = (0 - (width * .5) + (screenHalfWidth * x));
            const top = window.innerHeight * .5 - (height * .5);

            imageData.push({
                width: width,
                height: height,
                left: left,
                top: top,
                imageIndex: CurrentImage
            });

            ModalImageObjects[x] = imageData[x];
            this.IncreaseCurrentImage();
        }

        //Update state
        this.state={
            imageData: ModalImageObjects,
            onClick: this.props.closeModal
        };
    }

    //Mounting
    componentDidMount(){
        window.addEventListener('resize', this.OnResize, false);
        window.addEventListener('keyup', this.OnKeyInput, false);
        window.addEventListener('touchstart', this.OnTouchStart, false);
        window.addEventListener('touchend', this.OnTouchEnd, false);
    }

    componentWillUnmount(){
        window.removeEventListener('resize', this.OnResize, false);
        window.removeEventListener('keyup', this.OnKeyInput, false);
        window.removeEventListener('touchstart', this.OnTouchStart, false);
        window.removeEventListener('touchend', this.OnTouchEnd, false);
    }

    //Event Functions//
    OnResize = () => {
        const screenHalfWidth = window.innerWidth * .5;
        for (let x = 0; x < ImageCount; x++){
            const width = (InSecondLayout)?window.innerWidth * .4:window.innerWidth * .6;
            const height = window.innerHeight * .6;
            const left = (0 - (width * .5) + (screenHalfWidth * x));
            const top = window.innerHeight * .5 - (height * .5);

            ModalImageObjects[x].width = width;
            ModalImageObjects[x].height = height;
            ModalImageObjects[x].left = left;
            ModalImageObjects[x].top = top;
        }

        this.setState({imageData: ModalImageObjects});
    }

    OnKeyInput = e => {
        if (e.keyCode === 39){
            this.NextSlide();
        }
        else if (e.keyCode === 37){
            this.PrevSlide();
        }
        else if (e.keyCode === 27){
            this.state.onClick(e);
        }
    }

    OnTouchStart = e => {
        startTouchX = e.touches[0].clientX;
        startTouchY = e.touches[0].clientY;
    }

    OnTouchEnd = e => {
        if (!startTouchX || startTouchY)
        return;

        let endTouchX = e.touches[0].clientX;
        let endTouchY = e.touches[0].clientY;
        let xDiff = startTouchX - endTouchX;
        var yDiff = startTouchY - endTouchY;

        if (Math.abs(xDiff) > Math.abs(yDiff)){ //Horizontal swipe
            if (xDiff > 0) {
                this.PrevSlide(); 
            }
            else {
                this.NextSlide();
            }
        }

        startTouchX = startTouchY = null;
    }

    //Main Functions//
    NextSlide = () => {
        if (LastImage === 0)
            return;

        CurrentImage = ModalImageObjects[0].imageIndex;
        this.IncreaseCurrentImage();
        for (let x = 0; x < ImageCount; x++){
            ModalImageObjects[x].imageIndex = CurrentImage;
            this.IncreaseCurrentImage();
        }
        this.props.setCurrentSlide(ModalImageObjects[1].imageIndex);
        this.setState({imageData: ModalImageObjects});
    }

    PrevSlide = () => {
        if (LastImage === 0)
            return;
        
        CurrentImage = ModalImageObjects[0].imageIndex;
        this.DecreaseCurrentImage();
        for (let x = 0; x < ImageCount; x++){
            ModalImageObjects[x].imageIndex = CurrentImage;
            this.IncreaseCurrentImage();
        }
        this.props.setCurrentSlide(ModalImageObjects[1].imageIndex);
        this.setState({imageData: ModalImageObjects});
    }

    //Helper Functions
    IncreaseCurrentImage = () => {
        CurrentImage = (CurrentImage===LastImage)?0:CurrentImage+1;
    }

    DecreaseCurrentImage = () => {
        CurrentImage = (CurrentImage===0)?LastImage:CurrentImage-1;
    }

    //Render
    render(){
        return(
            <div id="slideShowOb" onClick={this.state.onClick}>
                <ModalImageBuilder imageData={this.state.imageData}
                nextSlide={this.NextSlide} prevSlide={this.PrevSlide} />
            </div>
        );
    }
}

///THE MODAL IMAGE BUILDER CLASS///
class ModalImageBuilder extends React.Component {
    render(){
        const items = this.props.imageData.map((data, index) =>{
            if ((!InSecondLayout || LastImage === 0) && index !== 1)
                return null;
            
            if (LastImage === 1 && index === 0)
                return null;

            return(<ModalImageObject key={index} index={index} data={data}
                onClick={index===0?this.props.prevSlide:this.props.nextSlide} />);
        });
        
        return(
            <React.Fragment>
                {items}
            </React.Fragment>
        );
    }
}

///THE MODAL IMAGE OBJECT CLASS///
class ModalImageObject extends React.Component {
    render(){
        const data = this.props.data;
        const _style = {
            width: data.width+"px",
            height: data.height+"px",
            left: data.left+"px",
            top: data.top+"px"
        }

        let _name = ImageDataSets[data.imageIndex].fileName;
        let _img = 'data:image/png;base64, ' + ImageDataSets[data.imageIndex].imageData;

        return(<img src={_img} alt={_name} title={_name}
            className="slideShowImage" style={_style} onClick={this.props.onClick} />);
    }
}