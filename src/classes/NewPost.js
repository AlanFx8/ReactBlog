import React from 'react';
import axios from 'axios';

const url = `http://alanfx8.co.uk/react-blog-backend/add/newPost.php`;
var PostItems = [];
var textboxCounter = 1;
var imageCounter = 1;
var buildingNewItem;

var sumbittedPost = false;
var responseStatus = 0; //0 = blank, 1 = success, 2 = failure
var responseMsg;

///THE NEW POST CLASS///
export default class NewPost extends React.Component {
    //Button methods
    OnTextButton = e => {
        e.preventDefault();
        if (buildingNewItem)
            return;

        //Make new textbox
        buildingNewItem = true;
        var newIndex = PostItems.length + 1;
        PostItems.push({
            index: newIndex,
            type: "text",
            id: `textbox${textboxCounter}`,
            value: ``
        });

        //Finish
        textboxCounter++;
        this.setState({postItems: PostItems});
        buildingNewItem = false;
    }

    OnImageButton = e => {
        e.preventDefault();
        if (buildingNewItem)
            return;

        //Make new immage
        buildingNewItem = true;
        var newIndex = PostItems.length + 1;
        PostItems.push({
            index: newIndex,
            type: "image",
            id: `image${imageCounter}`,
            value: ``
        });

        //Finish
        imageCounter++;
        this.setState({postItems: PostItems});
        buildingNewItem = false;
    }

    //Textbox methods
    OnUpdateTextbox = (index, value) => {
        PostItems[index].value = value;
        this.setState({postItems: PostItems});
    }

    //Image methods
    OnUpdateImage = (index, value) => {
        PostItems[index].value = value;
        this.setState({postItems: PostItems});
    }

    //Edit methods
    OnDeleteItem = index => {
        PostItems.splice(index, 1);
        this.setState({postItems: PostItems});
    }

    OnMoveUp = index => {
        if (index === 0)
            return;
        const newIndex = index-1;
        PostItems.splice(newIndex, 0, PostItems.splice(index, 1)[0]);
        this.setState({postItems: PostItems});
    }

    OnMoveDown = index => {
        if (index === PostItems.length-1)
            return;
        const newIndex = index+1;
        PostItems.splice(newIndex, 0, PostItems.splice(index, 1)[0]);
        this.setState({postItems: PostItems});
    }

    //Submit
    OnSubmit = e => {
        e.preventDefault();

        if (sumbittedPost)
            return;

        if (!window.confirm("Are you sure you want to submit post?"))
            return;

        if (PostItems.length === 0){
            responseStatus = 2;
            responseMsg = "No items have been added";
            this.setState({postItems: PostItems});
            return;
        }

        sumbittedPost = true; //Stop multiple submissions
        this.setState({postItems: PostItems});

        var formData = new FormData();
        var postContent = [];

        for (let x = 0; x < PostItems.length; x++){
            postContent.push([PostItems[x].type, PostItems[x].id]);
            formData.append(PostItems[x].id, PostItems[x].value);
        }
        formData.append('postContent', JSON.stringify(postContent));

        axios.post(url, formData, {headers: {'content-type':'multipart/form-data'}})
        .then(res => res.data)
        .then(data => {
            responseStatus = 0; //Reset response
            if (data.status === 'success'){
                responseStatus = 1;
                responseMsg = data.message;
            }
            else if (data.status === 'failure'){
                responseStatus = 2;
                responseMsg = data.message;
                sumbittedPost = false;
            }
            else {
                responseStatus = 2;
                responseMsg = "Unknown error";
                sumbittedPost = false;
            }
            console.log(data);
            this.setState({postItems: PostItems});
        });
    }

    //Render
    render(){
        return(
            <div id="mainContent">
                {responseStatus === 1 && <SuccessMessage />}
                {responseStatus === 2 && <FailMessage />}
                <FormBuilder
                onText={this.OnTextButton}
                onImg={this.OnImageButton}
                textUpdate={this.OnUpdateTextbox}
                imageUpdate={this.OnUpdateImage}
                onDeleteItem={this.OnDeleteItem}
                onMoveUp={this.OnMoveUp}
                onMoveDown={this.OnMoveDown}
                onSubmit={this.OnSubmit} />
            </div>
        );
    }
}

///FORM BUILDER CLASS///
class FormBuilder extends React.Component {
    render(){
        return(
            <form id="postGeneratorForm" name="postGeneratorForm" onSubmit={this.props.onSubmit}>
                <FormButtonsBuilder onText={this.props.onText} onImg={this.props.onImg} />
                <FormContent
                textUpdate={this.props.textUpdate}
                imageUpdate={this.props.imageUpdate}
                onDeleteItem={this.props.onDeleteItem}
                onMoveUp={this.props.onMoveUp}
                onMoveDown={this.props.onMoveDown} />
                <div id="submitWrapper">
                    <button type="submit" className="formBTN" disabled={sumbittedPost}>SUBMIT POST</button>
                </div>
            </form>
        );
    }
}

//FORM CONTENT CLASSES//
class FormContent extends React.Component {
    render(){
        const renderedItems = PostItems.map((item, index) => {
            return(
                <ItemBuilder key={index} index={index} item={item}
                textUpdate={this.props.textUpdate}
                imageUpdate={this.props.imageUpdate}
                onDeleteItem={this.props.onDeleteItem}
                onMoveUp={this.props.onMoveUp}
                onMoveDown={this.props.onMoveDown} />
            );
        });

        return(
            <div id="formContent">
                <div id="formIntro">
                    <p>Please use this space to add textboxes and images to create your blog post.</p>
                </div>
                {renderedItems}
            </div>
        );
    }
}

class ItemBuilder extends React.Component {
    onTextChange = e => {
        var index = parseInt(this.props.index);
        var value = e.target.value;
        this.props.textUpdate(index, value);
    }

    onImageChange = e => {
        var index = parseInt(this.props.index);
        var value = e.target.files[0];
        console.log(e.target.files[0].name);
        this.props.imageUpdate(index, value);
    }

    onDeleteItem = () => {
        var index = parseInt(this.props.index);
        this.props.onDeleteItem(index);
    }

    onMoveUp = () => {
        var index = parseInt(this.props.index);
        this.props.onMoveUp(index);
    }

    onMoveDown = () => {
        var index = parseInt(this.props.index);
        this.props.onMoveDown(index);
    }

    render(){
        if (this.props.item.type === "text"){
            return(
                <div className="textboxWrapper">
                    <p>{this.props.item.id}: Please insert you text in this box</p>
                    <textarea
                    id={this.props.item.id}
                    name={this.props.item.id}
                    value={this.props.item.value}
                    wrap="soft"
                    onChange={this.onTextChange} placeholder="Please insert text here..." />
                    
                    <button type="button" className="deleteBTN" onClick={this.onDeleteItem}>
                        &times;
                    </button>
                    <div className="editButtonsWrapper">
                        <button type="button" onClick={this.onMoveUp}>MOVE UP</button>
                        <button type="button" onClick={this.onMoveDown}>MOVE DOWN</button>
                    </div>
                </div>
            );
        }
        else {
            return(
                <div className="imageWrapper">
                    <p>{this.props.item.id}: Please insert you image</p>
                    <input type="file"
                    id={this.props.item.id}
                    name={this.props.item.id}
                    onChange={ this.onImageChange } />

                    <div className="imgFileWrapper">
                        <label for={this.props.item.id}>Click to Upload</label>
                        <div>FILE: {this.props.item.value.name}</div>
                    </div>
                    
                    <button type="button" className="deleteBTN" onClick={this.onDeleteItem}>
                        &times;
                    </button>
                    <div className="editButtonsWrapper">
                        <button type="button" onClick={this.onMoveUp}>MOVE UP</button>
                        <button type="button" onClick={this.onMoveDown}>MOVE DOWN</button>
                    </div>
                </div>
            );
        }
    }
}

//FORM BUTTON CASSSES//
class FormButtonsBuilder extends React.Component {
    render(){
        return(
            <div id="formButtonWrapper">
                <button type="button" className="formBTN" onClick={this.props.onText} >
                    ADD TEXT
                </button>

                <button type="button" className="formBTN" onClick={this.props.onImg} >
                    ADD IMAGE
                </button>
            </div>
        );
    }
}

//MESSAGES///
const SuccessMessage = () => {
    return (<div id="successMsg">{responseMsg}</div>);
}

const FailMessage = () => {
    return (<div id="failMsg">{responseMsg}</div>);
}