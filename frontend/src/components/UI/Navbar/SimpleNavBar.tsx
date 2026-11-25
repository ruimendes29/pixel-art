import React, { Fragment } from "react";
import {  useNavigate } from "react-router-dom";
import classes from "./SimpleNavBar.module.css";
import Button from "../Button";
import ThemeSwitcher from "../ThemeSwitcher";

const SimpleNavBar = () => {
  const navigate = useNavigate();
  return (
    <Fragment>
      <li className={`${classes.buttons}`}>
        <ThemeSwitcher />
        <Button
          onClick={() => {
            navigate("/home/register");
          }}
          className={`${classes.btn}`}
          secondary
        >
          Create account
        </Button>
        <Button
          onClick={() => {
            navigate("/home/login");
          }}
          className={`${classes.btn}`}
          primary
        >
          Log in
        </Button>
      </li>
    </Fragment>
  );
};

export default SimpleNavBar;
