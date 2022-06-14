import React, { Fragment, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/UI/Navbar";
import CanvasPage from "./Pages/Canvas/CanvasPage";
import Community from "./Pages/Community/Community";
import Home from "./Pages/Home/Home";
import Projects from "./Pages/Projects/Projects";
import classes from "./App.module.css";
import { userManagementActions } from "./store/redux-store";

const tabs = ["Community", "Projects"];

function App() {
  const logged = useSelector((state: any) => state.userManagement.logged);
  const dispatchRedux = useDispatch();
  useEffect(() => {
    if (localStorage.getItem("token")) {
      dispatchRedux(userManagementActions.handleLogin());
    }
  }, [dispatchRedux]);
  return (
    <React.Fragment>
      <Navbar tabs={tabs} />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route path="/home/*" element={<Home />} />
        {logged && (
          <Fragment>
            <Route path="/community" element={<Community />} />
            <Route path="/projects/:group" element={<Projects />} />
            <Route path="/canvas/:id" element={<CanvasPage />} />
          </Fragment>
        )}
        <Route
          path="/*"
          element={
            <Fragment>
              {!logged && (
                <div className={`${classes["not-logged"]}`}>
                  You must be logged to view this page
                </div>
              )}
            </Fragment>
          }
        />
      </Routes>
    </React.Fragment>
  );
}

export default App;
