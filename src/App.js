import React from 'react';
import './css/styles.css';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import Header from './layout/Header';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';

import Intro from './classes/Intro';
import ShowPosts from './classes/ShowPosts';
import NewPost from './classes/NewPost';
import ScrollButon from './classes/ScrollButton';

function App() {
  return (
    <Router basename="/websites/reactBlog">
      <React.Fragment>
        <div id="contentContainer">
          <Switch>
            <Route path="/" exact component={Intro} />
            <Route path="/index.html/" exact component={Intro} />
            <Route path="/showposts/" component={ShowPosts}/>
            <Route path="/newpost/" component={NewPost} />
          </Switch>
        </div>
        <Header />
        <Navbar />
        <Footer />
        <ScrollButon />
      </React.Fragment>
    </Router>
  );
}

export default App;