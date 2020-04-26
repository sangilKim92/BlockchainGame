import React from 'react';
import {Router, Route, browserHistory, IndexRoute} from 'react-router';

import './components/Header.css';
import './App.css';
import Avatar from './Avatar';
import Tetris from './Tetris';
import Menuitem from './components/Menuitem';
import Home from './Home';

//import Tetris from './components/Tetris';

class App extends React.Component{
  constructor(props){
    super(props);

  }

  Header(e){
    return(
        <div className="menu">
            <Menuitem to={'/Home'}>홈</Menuitem>
            <Menuitem to={'/Tetris'} >테트리스</Menuitem>
            <Menuitem to={'/Avatar'} >아바타</Menuitem>
        </div>      
    );
};
  render(){
    return (<div className="App">
        <Router history={browserHistory}>
          <Route path="/" component={this.Header}>
          </Route>
          <Route path="Home" component={Home}/>
          <Route path="Tetris" component={Tetris}/>
          <Route path="Avatar" component={Avatar}/>  
        </Router>
    </div>); 
  }
}

export default App;