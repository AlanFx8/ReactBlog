import React from 'react';
import ScrollController from './ScrollController';

///THE SCROLL BUTTON CLASS///
export default class ScrollButton extends React.Component {
    IsAutoScrolling = false;
    SCROLL_SPEED = 30;
    scrollController = new ScrollController();

    componentDidMount(){
        window.addEventListener('scroll', this.OnScroll);
    }

    componentWillUnmount(){
        window.removeEventListener('scroll', this.OnScroll);
        this.scrollController.DisableScrolling();
    }

    OnScroll = () => {
        let scrollBTN = document.getElementById("scrollButton");
        if (window.pageYOffset === 0){
            scrollBTN.classList.remove("active");
        }
        else {
            scrollBTN.classList.add("active");
        }
    }

    OnClick = () => {
        if (this.IsAutoScrolling)
        return;

        var scrollUpRequestWrapper;
        var scrollUp = ()=>{
            if (window.pageYOffset === 0){
                cancelAnimationFrame(scrollUpRequestWrapper);
                this.scrollController.EnableScrolling();
                this.IsAutoScrolling = false;
            }
            else {
                window.scrollBy(0, -this.SCROLL_SPEED);
                scrollUpRequestWrapper = requestAnimationFrame(scrollUp);
            }
        }
        this.scrollController.DisableScrolling();
        scrollUpRequestWrapper = requestAnimationFrame(scrollUp);
        this.IsAutoScrolling = true;
    }

    render(){
        return (
            <div id="scrollButton" onClick={this.OnClick}>
                <div></div>
            </div>
        );
    }
}