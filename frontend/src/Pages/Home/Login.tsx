import React, { useEffect, useState } from "react";
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
  // The API's answer to the last attempt, shown under the input it is about
  // until that input changes. No field (e.g. server down): under the password.
  const [failed, setFailed] = useState<{ field: string; message: string } | null>(null);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (!httpInfo.error) return;
    setFailed({ field: httpInfo.error.field ?? "loginPassword", message: httpInfo.error.message });
    setShaking(true);
    navigator.vibrate?.(150); // phones that support it also buzz
  }, [httpInfo.error]);

  const serverError = (field: string) => (failed?.field === field ? failed.message : undefined);
  const clearFailed = (field: string, onChange: (e: any) => void) => (e: any) => {
    if (failed?.field === field) setFailed(null);
    onChange(e);
  };

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
    if (!loginToken) return; // failed: see the effect above

    dispatchRedux(userManagementActions.handleLogin());
    localStorage.setItem("token", loginToken.token);
    navigate("/home");
  };

  return (
    <div className={`${classes.inputs}`}>
      <Input
        invalid={nameInput.isInputInvalid || !!serverError("username")}
        onChange={clearFailed("username", nameInput.valueChanged)}
        value={nameInput.enteredValue}
        onBlur={nameInput.touchedHandler}
        name={nameInput.label}
        maxLength={nameInput.maxLength}
        error={serverError("username") ?? nameInput.error}
      />
      <Input
        invalid={passwordInput.isInputInvalid || !!serverError("loginPassword")}
        onChange={clearFailed("loginPassword", passwordInput.valueChanged)}
        value={passwordInput.enteredValue}
        onBlur={passwordInput.touchedHandler}
        name={passwordInput.label}
        maxLength={passwordInput.maxLength}
        type="password"
        error={serverError("loginPassword") ?? passwordInput.error}
      />
      <div
        className={shaking ? classes.shake : undefined}
        onAnimationEnd={() => setShaking(false)}
      >
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
    </div>
  );
};

export default Login;
