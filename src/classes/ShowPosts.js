import React from 'react';
import axios from 'axios';
import ImageModal from './ImageModal';
import ScrollController from './ScrollController';

//MAIN VARIABLES
const BlogPosts = [];
const ImageDataSetsMin = [];
const ImageDataSetsFull = [];

var IsLoadingPosts;
var NoMoreResults;
var SkipAmount = 0;
const TEXT_TYPE = 0;

//MODAL RELATED
var TargetImageDataSet; //Use the Min set or Full set?
var TargetImageGroup = -1;
var TargetImageNumber = -1;
var IsModalOpen;

//PHP PATHS
const BACKEND_URL = `http://alanfx8.co.uk/react-blog-backend/get/`;
const GET_MULTIPLE = `${BACKEND_URL}get_post_data.php`;
const GET_IMAGE_DATA = `${BACKEND_URL}get_image_data.php`;

//OTHER CLASSES
const scrollController = new ScrollController();

///////////////////////////
///THE SHOW POSTS CLASS///
/////////////////////////
export default class ShowPosts extends React.Component {
    constructor (props) {
        super(props);
        this.state = {blogs: BlogPosts};
    }

    componentDidMount(){
        window.addEventListener('scroll', () => this.OnScrollCheck());
        this.GetInitialPosts();
    }

    componentWillUnmount(){
        window.removeEventListener('scroll', () => this.OnScrollCheck());
        scrollController.EnableScrolling();
    }

    ///GETTER METHODS///
    GetInitialPosts = async () => {
        if (NoMoreResults)
            return;
        const initialAmount = 2;
        IsLoadingPosts = true;
        fetch(`${GET_MULTIPLE}?skip=${SkipAmount}&amount=${initialAmount}`)
        .then(response => response.json())
        .then(data => {
            SkipAmount += initialAmount;
            this.setState({blogs: BlogPosts});
            this.ProcessInitialPosts(0, data);
        });
    }

    GetNewPost = async () => {
        IsLoadingPosts = true;
        fetch(`${GET_MULTIPLE}?skip=${SkipAmount}&amount=${1}`)
        .then(response => response.json())
        .then(data => {
            //Check for no more results
            if (data === null || data.length === 0){
                IsLoadingPosts = false;
                NoMoreResults = true;
                window.removeEventListener('scroll', ()=> this.OnScrollCheck());
                this.setState({blogs: BlogPosts});
                return;
            }

            SkipAmount ++;
            this.setState({blogs: BlogPosts});
            this.ProcessInitialPosts(0, data);
        });
    }

    ///POST BUILING METHODS///
    ProcessInitialPosts = async (index, rawPostData) => {
        const targetPost = rawPostData[index];
        const postContent = [];
        var imageSet = null;

        for (let x = 0; x < targetPost.length; x++){
            const value = targetPost[x].value;
            if (targetPost[x].type === TEXT_TYPE){
                postContent.push({
                    type: "TEXT",
                    value: value.content
                });
            }
            else { //IMAGE
                if (imageSet === null){
                    ImageDataSetsMin.push([]);
                    imageSet = ImageDataSetsMin.length-1;
                }

                ImageDataSetsMin[imageSet].push({
                    fileName: value.file_name,
                    imageData: value.image_data,
                    id: value.id
                });

                var imageNo = ImageDataSetsMin[imageSet].length-1;

                postContent.push({
                    type: "IMAGE",
                    value: {
                        imageSet: imageSet,
                        imageSubSet: imageNo
                    }
                });
            }
        }

        BlogPosts.push({
            index: BlogPosts.length+1,
            content: postContent
        });

        if (index !== rawPostData.length-1){
            index++;
            this.ProcessInitialPosts(index, rawPostData);
        }
        else {
            IsLoadingPosts = false;
            this.setState({blogs: BlogPosts});
        }
    }

    ///IMAGE GETTER METHODS///
    BuildFullImageSet = async imageSet => {
        const target = ImageDataSetsMin[imageSet];
        const formData = new FormData();
        const imageIDs = [];
        for (let x = 0; x < target.length; x++){
            imageIDs.push(target[x].id);
        }
        formData.append('imageIDs', JSON.stringify(imageIDs));
        axios.post(GET_IMAGE_DATA, formData, {headers: {'content-type':'multipart/form-data'}})
        .then(res => res.data)
        .then(data => {
            for (let x = 0; x < data.length; x++){
                ImageDataSetsFull[imageSet].push({
                    fileName: data[x].file_name,
                    imageData: data[x].image_data
                });
            }

            //Done
            if (IsModalOpen){
                IsModalOpen = false;
                this.setState({blogs: BlogPosts});
                this.OpenModal();
            }
        });
    }

    ///OTHER METHODS///
    OnScrollCheck = () => {
        if (NoMoreResults || IsLoadingPosts)
            return;

        if ((window.innerHeight + document.documentElement.scrollTop) >= document.body.offsetHeight) {
            console.log("Calling new post request");
            this.GetNewPost();
        }
    }

    OpenModal = () => {
        if (ImageDataSetsFull[TargetImageGroup] === undefined){
            ImageDataSetsFull[TargetImageGroup] = [];
            this.BuildFullImageSet(TargetImageGroup);
            TargetImageDataSet = ImageDataSetsMin;
        }
        else {
            TargetImageDataSet = ImageDataSetsFull;
        }
        IsModalOpen = true;
        scrollController.DisableScrolling();
        this.setState({blogs: BlogPosts});
    }

    CloseModal = (e) => {
        if (e.target.nodeName.toLocaleLowerCase() === "img")
            return;
        IsModalOpen = false;
        scrollController.EnableScrolling();
        this.setState({blogs: BlogPosts});
    }

    SetCurrentSlide = index => {
        TargetImageNumber = index;
    }

    ///RENDER///
    render(){
        return(
            <>
                <BlogPostCollection openModal={()=> this.OpenModal()} />
                
                {IsModalOpen && <ImageModal
                imageSet={TargetImageDataSet[TargetImageGroup]}
                imageIndex={TargetImageNumber}
                closeModal={this.CloseModal}
                setCurrentSlide={this.SetCurrentSlide}/>}
                
                {IsLoadingPosts && LoadingMessage}
                {NoMoreResults && NoResultsMessage}
            </>
        );
    }
}

////////////////////////////////////
///THE BLOGPOST COLLECTION CLASS///
//////////////////////////////////
class BlogPostCollection extends React.Component {
    render(){
        const items = BlogPosts.map((item, index) => {
            return(
                <BlogPostItem key={index} index={index}
                data={item.content} openModal={()=> this.props.openModal()} />
            );
        });

        //Render
        return(
            <React.Fragment>
                {items}
            </React.Fragment>
        );
    }
}

//////////////////////////////
///THE BLOGPOST ITEM CLASS///
////////////////////////////
class BlogPostItem extends React.Component {
    BuildText = text => {
        const result = text.split('\\r\\n\\r\\n').map((item, key)=>{
            return <p key={key}>{item}</p>
        });
       return result;
    }

    render(){
        const items = this.props.data.map((item, index) => {
            if (item.type === "TEXT"){
                return(<div key={index}>{this.BuildText(item.value)}</div>);
            }
            else {
                let imageSet = item.value.imageSet;
                let imageSubSet = item.value.imageSubSet;

                let _name = ImageDataSetsMin[imageSet][imageSubSet].fileName;
                let _img = 'data:image/png;base64, '+ ImageDataSetsMin[imageSet][imageSubSet].imageData;

                let onClick = () =>{
                    TargetImageGroup = imageSet;
                    TargetImageNumber = imageSubSet;
                    this.props.openModal();
                }

                return(<div key={index} className="postImageLink">
                    <img src={_img} title={_name} alt={_name}
                    className="postImage" onClick={onClick} />
                </div>);
            }
        });

        return(<div className="blogPost">{items}</div>);
    }
}

//////////////////////
///MESSAGE OBJECTS///
////////////////////
const LoadingMessage = <div id="loadingMessage">Loading posts...</div>;
const NoResultsMessage = <div id="noResultsMessage">Sorry, there are no more posts</div>;