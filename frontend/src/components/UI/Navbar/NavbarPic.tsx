import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useHttp, { COMMON_URL } from "../../../hooks/use-http";
import { userManagementActions } from "../../../store/redux-store";
import Button from "../Button";
import classes from "./NavbarPic.module.css";
import guestImage from "../../../assets/images/guest.png";

const NavbarPic = () => {
  const [photo, setPhoto]: [any, any] = useState(undefined);
  const [, sendHttpRequest] = useHttp();
  const [subMenuOpened, setSubMenuOpened] = useState(false);
  const navigate = useNavigate();
  const dispatchRedux = useDispatch();
  useEffect(() => {
    if (localStorage.getItem("token")) {
      const getCorrectPhoto = async () => {
        const token = localStorage.getItem("token");

        const photoFromDB = await sendHttpRequest({
          url: `${COMMON_URL}/users/photo?key=${token}`,
          method: "GET",
          headers: { "Content-Type": "image/*" },
          responseType: "blob",
        });
        setPhoto(URL.createObjectURL(photoFromDB));
      };

      getCorrectPhoto();
    } else {
      setPhoto(guestImage);
    }
  }, [sendHttpRequest]);

  return (
    <div
      onClick={() => {
        setSubMenuOpened((o) => !o);
      }}
      className={`${classes["img-holder"]}`}
    >
      <img src={photo} alt="" />
      {subMenuOpened && (
        <div className={`${classes["menu-buttons"]}`}>
          <Button
            onClick={() => {
              dispatchRedux(userManagementActions.handleLogout());
              localStorage.removeItem("token");
              navigate("/home");
            }}
            secondary
          >
            Logout
          </Button>{" "}
        </div>
      )}
    </div>
  );
};

export default NavbarPic;
