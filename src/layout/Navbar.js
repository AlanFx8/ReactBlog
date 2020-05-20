import React from 'react';
import {withRouter, Link} from 'react-router-dom';

var IsNavSticky;

class Navbar extends React.Component {
    componentDidMount(){
        window.addEventListener('scroll', this.OnScroll);
        window.addEventListener('resize', this.OnResize);
    }

    componentWillUnmount(){
        window.removeEventListener('scroll', this.OnScroll);
        window.removeEventListener('resize', this.OnResize);
    }

    OnScroll = () => {
        const header = document.getElementById("mainHeader");
        const navbar = document.getElementById("mainNav");
        if (window.pageYOffset >= header.offsetTop + header.scrollHeight){
            if (!IsNavSticky){
                header.style.marginBottom = navbar.clientHeight+"px";
                this.ResizeStickyNav();
                IsNavSticky = true;
                this.setState({navSticky: IsNavSticky});
            }
        }
        else {
            if (IsNavSticky){
                header.style.marginBottom = 0;
                navbar.style.width = "auto";
                IsNavSticky = false;
                this.setState({navSticky: IsNavSticky});
            }
        }
    }

    OnResize = () => {
        if (!IsNavSticky)
            return;
        this.ResizeStickyNav();
    }

    OnSmallNavChange = e => {
        const nav = e.target;
        if (nav.selectedIndex === 0)
            return;

        this.props.history.push(`${nav.options[nav.selectedIndex].value}`);
    }

    ResizeStickyNav = () => {
        const navbar = document.getElementById("mainNav");
        navbar.style.width = "100%";
    }

    render(){
        return(
                <nav id="mainNav" className={IsNavSticky?"sticky":""}>
                    <select name="urlName" id="mainNav-bar-small" onChange={this.OnSmallNavChange}>
                        <option value="">-Select-</option>
                        <option value="/">About</option>
                        <option value="/showposts">Show Posts</option>
                        <option value="/newpost">New Post</option>
                    </select>
                    <ul id="mainNav-bar-med">
                        <li><Link to="/">About</Link></li>
                        <li><Link to="/showposts">Show Posts</Link></li>
                        <li><Link to="/newpost">New Post</Link></li>
                    </ul>
                </nav>
        );
    }
}

export default withRouter(Navbar);