import React from 'react';
import './Header.css';
import Menuitem from './Menuitem';

const Header=()=>{
    return(
        <div className="menu">
            <Menuitem to={'/Home'}>홈</Menuitem>
            <Menuitem to={'/Tetris'} >테트리스</Menuitem>
            <Menuitem to={'/Avatar'} >아바타</Menuitem>
        </div>      
    );
}

export default Header;