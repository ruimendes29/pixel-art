import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { Link, Route, Routes } from "react-router-dom";
import Button from "../../components/UI/Button";
import useHttp, { COMMON_URL } from "../../hooks/use-http";
import { userManagementActions } from "../../store/redux-store";
import classes from "./Home.module.css";
import Login from "./Login";
import PracticeGrid from "./PracticeGrid";
import Register from "./Register";

const Home = () => {
  const dispatchRedux = useDispatch();
  const [, sendHttpRequest] = useHttp();
  const [name, setName] = useState("Guest");
  const logged = useSelector((state: any) => state.userManagement.logged);

  useEffect(() => {
    if (logged && localStorage.getItem("token")) {
      const getUserName = async () => {
        const res = await sendHttpRequest({
          url: `${COMMON_URL}/users/name?key=${localStorage.getItem("token")}`,
          headers: { "Content-Type": "application/json" },
        });
        
        setName(res.username);
      };
      getUserName();
    } if (!logged)
    {
      setName('Guest');
    }
  }, [logged, sendHttpRequest]);

  return (
    <Routes>
      <Route
        path={""}
        element={
          <section className={classes.hero}>
            <div className={classes.intro}>
              {!logged ? (
                <Fragment>
                  <h1 className={classes.title}>Draw pixel art in your browser</h1>
                  <p className={classes.lead}>
                    Free, with nothing to install. Paint on the grid to try it,
                    then open the editor for a full drawing.
                  </p>
                  <div className={classes.btns}>
                    <Button
                      onClick={() => dispatchRedux(userManagementActions.handleGuest())}
                      className={classes.btn}
                      primary
                    >
                      Enter as guest
                    </Button>
                    <Link to="login">
                      <Button className={classes.btn} secondary>
                        Log in
                      </Button>
                    </Link>
                    <Link to="register">
                      <Button className={classes.btn} secondary>
                        Create account
                      </Button>
                    </Link>
                  </div>
                  <p className={classes.note}>
                    Guests can draw and download. Create an account to save your
                    drawings and share them with the community.
                  </p>
                </Fragment>
              ) : (
                <Fragment>
                  <h1 className={classes.title}>
                    Hi, {name || <FontAwesomeIcon className="fa-spin" icon={faCircleNotch} />}
                  </h1>
                  <p className={classes.lead}>
                    Start a new drawing in Projects, or see what others have
                    shared in the Community.
                  </p>
                  <div className={classes.btns}>
                    <Link to="/projects/null">
                      <Button className={classes.btn} primary>
                        Projects
                      </Button>
                    </Link>
                    <Link to="/community">
                      <Button className={classes.btn} secondary>
                        Community
                      </Button>
                    </Link>
                  </div>
                </Fragment>
              )}
            </div>
            <PracticeGrid />
          </section>
        }
      />
      <Route
        path={"login"}
        element={
          <div className={classes.form}>
            <h1 className={classes["form-title"]}>Log in</h1>
            <Login />
          </div>
        }
      />
      <Route
        path={"register"}
        element={
          <div className={classes.form}>
            <h1 className={classes["form-title"]}>Create account</h1>
            <Register />
          </div>
        }
      />
    </Routes>
  );
};

export default Home;
