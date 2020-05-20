import React from 'react';

///THE HEADER CLASS///
//Note: to prevent is glitch(?) where the paralax temporarily hides the sticky Navbar on small layouts,
//we have to seperate the header into a mainHeader and headerInner object
export default class Header extends React.Component {
    componentDidMount(){
        window.addEventListener('scroll', this.OnScroll);
    }

    componentWillUnmount(){
        window.removeEventListener('scroll', this.OnScroll);
    }

    OnScroll = () => {
        const scrollAmount = window.pageYOffset;
        document.getElementById("title").style.transform = `translate(0, ${scrollAmount * .75}%`;
    }

    render(){
        return(
            <header id="mainHeader">
                <div id="headerInner">
                    <h1 id="title">Modal Image Slideshow</h1>
                </div>
            </header>
        );
    }
}