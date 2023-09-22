import { FC } from 'react';
import { NavLink } from 'react-router-dom';

import '../css/navbar.css';

import Search from './Map/Search';
import '../css/search.css';

interface NavBtnProps {
  to: string;
  name: string;
}

const NavBtn: FC<NavBtnProps> = ({ to, name }) => {
  return (
    <NavLink className="nav-tab" to={to}>
      {name}
    </NavLink>
  );
};

const Navbar: FC = () => {
  return (
    <div className="nav-wrapper">
      <div className="nav-container">
        <Search />
      </div>
    </div>
  );
};

export default Navbar;
