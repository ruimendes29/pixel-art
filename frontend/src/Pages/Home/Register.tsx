import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";
import useHttp, { COMMON_URL } from "../../hooks/use-http";
import useInput from "../../hooks/use-input";
import classes from "./Register.module.css";

const Register = () => {
  const nameInput = useInput((el: string) => el.trim() !== "");
  const [httpInfo, sendHttp] = useHttp();
  const passwordInput = useInput((el: string) => {
    return (
      /[0-9]/.test(el) &&
      /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(el) &&
      /[A-Z]/.test(el) &&
      /[a-z]/.test(el)
    );
  });
  const emailInput = useInput((el: string) => {
    return el.includes("@");
  });

  const navigate = useNavigate();

  const imgRef = useRef(null);
  const [photo, setPhoto]: [File | undefined, any] = useState(undefined);
  const isFormValid =
    nameInput.isValueValid &&
    emailInput.isValueValid &&
    passwordInput.isValueValid &&
    photo;

  const handleRegister = async () => {
    if (
      nameInput.isValueValid &&
      emailInput.isValueValid &&
      passwordInput.isValueValid
    ) {
      const formData = new FormData();

      const f: File = photo!;
      formData.append("image", f, f.name);
      formData.set("name", nameInput.enteredValue);
      formData.set("email", emailInput.enteredValue);
      formData.set("password", passwordInput.enteredValue);

      await sendHttp({
        url: `${COMMON_URL}/users/add-user`,
        method: "POST",
        body: formData,
      });
      navigate("/home/login");
    }
  };

  return (
    <div className={`${classes.register}`}>
      <div className={`${classes.inputs}`}>
        <Input
          className={`${classes.ipt}`}
          invalid={nameInput.isInputInvalid}
          onChange={nameInput.valueChanged}
          value={nameInput.enteredValue}
          onBlur={nameInput.touchedHandler}
          name="Username"
          error="Name can not be empty!"
        />
        <Input
          className={`${classes.ipt}`}
          invalid={passwordInput.isInputInvalid}
          onChange={passwordInput.valueChanged}
          value={passwordInput.enteredValue}
          onBlur={passwordInput.touchedHandler}
          error="Password must contain one upper case, one lower case, one number and one special character"
          name="Password"
          type="password"
        />
        <Input
          className={`${classes.ipt}`}
          invalid={emailInput.isInputInvalid || httpInfo.error}
          onChange={emailInput.valueChanged}
          value={emailInput.enteredValue}
          onBlur={emailInput.touchedHandler}
          error={
            httpInfo.error ? httpInfo.error.message : `Email must contain a @`
          }
          name="Email"
          type="email"
        />
        <Button
          onClick={handleRegister}
          disabled={!isFormValid}
          className={`${classes.btn}`}
          secondary
        >
          {!httpInfo.isLoading ? (
            "Register"
          ) : (
            <FontAwesomeIcon className="fa-spin" icon={faCircleNotch} />
          )}
        </Button>
      </div>

      <input
        className={`${classes.invisible}`}
        ref={imgRef}
        type="file"
        onChange={(e) => {
          setPhoto(e.target!.files![0]);
        }}
      />
      <div
        onClick={() => {
          const input: HTMLInputElement = imgRef.current!;
          input.click();
        }}
        className={`${photo ? classes["has-photo"] : ""} ${
          classes["image-held"]
        }`}
      >
        {!photo && <div>Upload an Image</div>}
        {photo && (
          <img src={URL.createObjectURL(photo)} alt="uploaded profile" />
        )}
      </div>
    </div>
  );
};

export default Register;
