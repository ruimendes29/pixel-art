import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownItem } from "../../../dropdown/Dropdown";
import useHttp, { COMMON_URL } from "../../../hooks/use-http";
import { userManagementActions } from "../../../store/redux-store";
import classes from "./NavbarPic.module.css";
import guestImage from "../../../assets/images/guest.png";

// Avatar in the navbar; clicking it opens the account menu
const NavbarPic = () => {
  const [photo, setPhoto]: [any, any] = useState(undefined);
  const [, sendHttpRequest] = useHttp();
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
    <Dropdown
      label="Account menu"
      placement="bottom-end"
      triggerClassName={classes["img-holder"]}
      trigger={<img src={photo} alt="" />}
    >
      <DropdownItem
        icon={faRightFromBracket}
        onSelect={() => {
          dispatchRedux(userManagementActions.handleLogout());
          localStorage.removeItem("token");
          navigate("/home");
        }}
      >
        Logout
      </DropdownItem>
    </Dropdown>
  );
};

export default NavbarPic;
