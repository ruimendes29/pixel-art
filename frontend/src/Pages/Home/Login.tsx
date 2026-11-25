import React from "react";
import classes from "./Login.module.css";
import Input from "../../components/UI/Input";
import useField from "../../fields/use-field";
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
  const nameInput = useField("username");
  const passwordInput = useField("loginPassword");

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
    // request failed: the error is shown under the password field
    if (!loginToken) return;

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
        name={nameInput.label}
        maxLength={nameInput.maxLength}
        error={nameInput.error}
      />
      <Input
        invalid={passwordInput.isInputInvalid || httpInfo.error}
        onChange={passwordInput.valueChanged}
        value={passwordInput.enteredValue}
        onBlur={passwordInput.touchedHandler}
        name={passwordInput.label}
        maxLength={passwordInput.maxLength}
        type="password"
        error={httpInfo.error ? httpInfo.error.message : passwordInput.error}
      />
      <Button
        onClick={() => {
          handleLogin();
        }}
        className={`${classes.btn}`}
        primary
      >
        {httpInfo.isLoading ? (
          <FontAwesomeIcon className="fa-spin" icon={faCircleNotch} />
        ) : (
          "Log in"
        )}
      </Button>
    </div>
  );
};

export default Login;
