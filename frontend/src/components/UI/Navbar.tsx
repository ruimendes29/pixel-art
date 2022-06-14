import React from "react";
import logo from "../../assets/images/logo.png";
import { Link} from "react-router-dom";
import { useSelector } from "react-redux";
import classes from "./Navbar.module.css";
import LoggedNavBar from "./Navbar/LoggedNavBar";
import SimpleNavBar from "./Navbar/SimpleNavBar";

const Navbar = (props: { tabs: string[] }) => {
  const logged = useSelector((state: any) => state.userManagement.logged);
  return (
    <nav className={`${classes.nav}`}>
      <ul className={`${classes["nav-items"]}`}>
        <li className={`${classes.logo}`}>
          <Link to="/home">
            <img className={`${classes["logo-img"]}`} src={logo} alt="logo" />
          </Link>
        </li>
        {logged && <LoggedNavBar tabs={props.tabs} />}
        {!logged && <SimpleNavBar />}
      </ul>
    </nav>
  );
};

export default Navbar;
