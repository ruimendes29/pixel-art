import React, { Fragment, useState } from "react";
import { NavLink} from "react-router-dom";
import classes from "./LoggedNavBar.module.css";
import NavbarPic from "./NavbarPic";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import IconButton from "../IconButton";

const LoggedNavBar = (props: { tabs: string[] }) => {
  const [open, setOpen] = useState(false);
  return (
    <Fragment>
      <li className={`${classes.tabs} ${open ? classes.open : ""}`}>
        {props.tabs.map((el: string) => {
          return (
            <NavLink
              className={(navData) => (navData.isActive ? classes.active : "")}
              key={el}
              to={`/${el.toLowerCase()}${
                el.toLowerCase() === "projects" ? "/null" : ""
              }`}
            >
              {el}
            </NavLink>
          );
        })}
      </li>
      <li className={`${classes["nav-pic"]}`}>
        <NavbarPic />
        <IconButton
          className={`${classes.burguer} ${open ? classes.open : ""}`}
          icon={faBars}
          onClick={() => {
            setOpen((o) => !o);
          }}
        />
      </li>
    </Fragment>
  );
};

export default LoggedNavBar;
