import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AvatarCropModal from "../../components/UI/AvatarCropModal";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";
import PasswordMeter from "../../components/UI/PasswordMeter";
import useHttp, { COMMON_URL } from "../../hooks/use-http";
import useField from "../../fields/use-field";
import classes from "./Register.module.css";

const Register = () => {
  const nameInput = useField("username");
  const [httpInfo, sendHttp] = useHttp();
  const passwordInput = useField("password");
  const emailInput = useField("email");
  // The API's error under the input it is about; errors with no field go under Email
  const serverError = (field: string) =>
    httpInfo.error && (httpInfo.error.field ?? "email") === field
      ? httpInfo.error.message
      : undefined;

  const navigate = useNavigate();

  const imgRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File>();
  const [pendingPhoto, setPendingPhoto] = useState<File>();
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (!photo) return;
    const url = URL.createObjectURL(photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  const isFormValid =
    nameInput.isValueValid &&
    emailInput.isValueValid &&
    passwordInput.isValueValid &&
    photo;

  const handleRegister = async () => {
    if (isFormValid) {
      const formData = new FormData();

      const f: File = photo!;
      formData.append("image", f, f.name);
      formData.set("name", nameInput.enteredValue);
      formData.set("email", emailInput.enteredValue);
      formData.set("password", passwordInput.enteredValue);

      const registered = await sendHttp({
        url: `${COMMON_URL}/users/add-user`,
        method: "POST",
        body: formData,
      });
      if (registered) navigate("/home/login");
    }
  };

  return (
    <div className={`${classes.register}`}>
      <div className={`${classes.inputs}`}>
        <Input
          className={`${classes.ipt}`}
          invalid={nameInput.isInputInvalid || !!serverError("username")}
          onChange={nameInput.valueChanged}
          value={nameInput.enteredValue}
          onBlur={nameInput.touchedHandler}
          name={nameInput.label}
          maxLength={nameInput.maxLength}
          error={serverError("username") ?? nameInput.error}
        />
        <Input
          className={`${classes.ipt}`}
          invalid={passwordInput.isInputInvalid || !!serverError("password")}
          onChange={passwordInput.valueChanged}
          value={passwordInput.enteredValue}
          onBlur={passwordInput.touchedHandler}
          name={passwordInput.label}
          maxLength={passwordInput.maxLength}
          type="password"
          error={serverError("password")}
        />
        <PasswordMeter value={passwordInput.enteredValue} />
        <Input
          className={`${classes.ipt}`}
          invalid={emailInput.isInputInvalid || !!serverError("email")}
          onChange={emailInput.valueChanged}
          value={emailInput.enteredValue}
          onBlur={emailInput.touchedHandler}
          error={serverError("email") ?? emailInput.error}
          name={emailInput.label}
          maxLength={emailInput.maxLength}
          type="email"
        />
        <Button
          onClick={handleRegister}
          disabled={!isFormValid}
          className={`${classes.btn}`}
          primary
        >
          {!httpInfo.isLoading ? (
            "Create account"
          ) : (
            <FontAwesomeIcon className="fa-spin" icon={faCircleNotch} />
          )}
        </Button>
      </div>

      <input
        className={`${classes.invisible}`}
        ref={imgRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) setPendingPhoto(e.target.files[0]);
          e.target.value = ""; // lets the same file be picked again
        }}
      />
      {pendingPhoto && (
        <AvatarCropModal
          file={pendingPhoto}
          onCancel={() => setPendingPhoto(undefined)}
          onSave={(cropped) => {
            setPhoto(cropped);
            setPendingPhoto(undefined);
          }}
        />
      )}
      <div
        onClick={() => {
          imgRef.current!.click();
        }}
        className={`${photo ? classes["has-photo"] : ""} ${
          classes["image-held"]
        }`}
      >
        {!photo && <div>Upload an Image</div>}
        {photo && <img src={photoUrl} alt="Your profile" />}
      </div>
    </div>
  );
};

export default Register;
