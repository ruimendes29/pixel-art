import React from "react";
import classes from "./Login.module.css";
import Input from "../../components/UI/Input";
import useInput from "../../hooks/use-input";
import Button from "../../components/UI/Button";
import useHttp, { COMMON_URL } from "../../hooks/use-http";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { userManagementActions } from "../../store/redux-store";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [httpInfo, sendHttpRequest] = useHttp();
  const dispatchRedux = useDispatch();
  const nameInput = useInput((el: string) => el.trim() !== "");
  const passwordInput = useInput((el: string) => {
    return true;
  });

  const handleLogin = async () => {
    const loginToken = await sendHttpRequest({
      url: `${COMMON_URL}/users/login`,
      method: "POST",
      body: JSON.stringify({
        name: nameInput.enteredValue,
        password: passwordInput.enteredValue,
      }),
      headers: { "Content-Type": "application/json" },
    });
    
    dispatchRedux(userManagementActions.handleLogin());
    localStorage.setItem("token", loginToken.token);
    navigate("/home");
  };

  return (
    <div className={`${classes.inputs}`}>
      <Input
        invalid={nameInput.isInputInvalid}
        onChange={nameInput.valueChanged}
        value={nameInput.enteredValue}
        onBlur={nameInput.touchedHandler}
        name="Username"
        error="Name can not be empty!"
      />
      <Input
        invalid={passwordInput.isInputInvalid}
        onChange={passwordInput.valueChanged}
        value={passwordInput.enteredValue}
        onBlur={passwordInput.touchedHandler}
        name="Password"
        type="password"
      />
      <Button
        onClick={() => {
          handleLogin();
        }}
        className={`${classes.btn}`}
        secondary
      >
        {httpInfo.isLoading ? (
          <FontAwesomeIcon className="fa-spin" icon={faCircleNotch} />
        ) : (
          "Login"
        )}
      </Button>
    </div>
  );
};

export default Login;
