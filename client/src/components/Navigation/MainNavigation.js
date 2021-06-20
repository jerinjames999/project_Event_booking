import React from "react";
import { NavLink } from "react-router-dom";
import './MainNavigation.css'
// Navlink will be normal link, but it will catch the click and will prevent the browser reloading which happens by default. it will manually update the url(as SPA)and manually reload it.
const mainNavigation = (props) => (
  <header className="main-navigation">
    <div className="main-navigation__logo">
      <h1>EasyEvent</h1>
    </div>
    <nav className="main-navigation__items">
      <ul>
          {/* To make the link active(in nav) if we are in that corresponding page. 
            Note: that NavLink component will add a css class called 'active' automatically So we can use it for styling. 
                eg: .main-navigation__items a.active{
                    color: red; // will make the text red.
                }
          */}
        <li>
          <NavLink to="/auth">Authenticate</NavLink>
        </li>
        <li>
          <NavLink to="/events">Events</NavLink>
        </li>
        <li>
          <NavLink to="/bookings">Bookings</NavLink>
        </li>
      </ul>
    </nav>
  </header>
);

export default mainNavigation;
