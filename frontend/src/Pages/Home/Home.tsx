import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { Link, Route, Routes } from "react-router-dom";
import Button from "../../components/UI/Button";
import Shape from "../../components/UI/Shape";
import useHttp, { COMMON_URL } from "../../hooks/use-http";
import { userManagementActions } from "../../store/redux-store";
import classes from "./Home.module.css";
import Login from "./Login";
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
    <div className={`${classes.home}`}>
      <Shape />

      <Routes>
        <Route
          path={""}
          element={
            <Fragment>
              {!logged && (
                <Fragment>
                  <div className={`${classes["info-text"]}`}>
                    Create pixel art online for free and intuitively
                  </div>
                  <div className={`${classes.btns}`}>
                    <Link to="login">
                      <Button className={`${classes.btn}`} primary>
                        Login
                      </Button>
                    </Link>
                    <Link to={"register"}>
                      <Button className={`${classes.btn}`} secondary>
                        Register
                      </Button>
                    </Link>
                    <Button
                      onClick={() => {
                        dispatchRedux(userManagementActions.handleGuest());
                      }}
                      className={`${classes.btn}`}
                      secondary
                    >
                      Enter as guest
                    </Button>
                  </div>
                </Fragment>
              )}
              {logged && (
                <Fragment>
                  <div className={`${classes["info-text"]}`}>
                    Welcome,{" "}
                    {name ? (
                      name
                    ) : (
                      <FontAwesomeIcon
                        className="fa-spin"
                        icon={faCircleNotch}
                      />
                    )}
                    !
                  </div>
                  <div className={`${classes.btns}`}>
                    <Link to="/community">
                      <Button className={`${classes.btn}`} primary>
                        Community
                      </Button>
                    </Link>
                    <Link to={"/projects/null"}>
                      <Button className={`${classes.btn}`} secondary>
                        Projects
                      </Button>
                    </Link>
                  </div>
                </Fragment>
              )}
            </Fragment>
          }
        />
        <Route path={"login"} element={<Login />} />
        <Route path={"register"} element={<Register />} />
      </Routes>
    </div>
  );
};

export default Home;
