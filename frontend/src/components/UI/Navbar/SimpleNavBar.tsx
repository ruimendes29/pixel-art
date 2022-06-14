import React, { Fragment } from "react";
import {  useNavigate } from "react-router-dom";
import classes from "./SimpleNavBar.module.css";
import Button from "../Button";

const SimpleNavBar = () => {
  const navigate = useNavigate();
  return (
    <Fragment>
      <li className={`${classes.buttons}`}>
        <Button
          onClick={() => {
            navigate("/home/register");
          }}
          className={`${classes.btn}`}
          secondary
        >
          Register
        </Button>
        <Button
          onClick={() => {
            navigate("/home/login");
          }}
          className={`${classes.btn}`}
          primary
        >
          Login
        </Button>
      </li>
    </Fragment>
  );
};

export default SimpleNavBar;
