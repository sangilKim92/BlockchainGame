import React from 'react';
import {Link} from 'react-router';
import './Header.css';

const Menuitem=({children,to})=>(
    <Link to={to} className="menu-item">
        {children}
    </Link>
)

export default Menuitem;