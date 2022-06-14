import React, { Fragment, useEffect, useState } from "react";
import classes from "./Project.module.css";
import noImage from "../../assets/images/no-image.png";
import useHttp, { COMMON_URL } from "../../hooks/use-http";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

const Project = (props: { id: number; name: string; onClick:Function }) => {
  const [image, setImage] = useState(noImage);
  const [httpInfo, sendHttpReq] = useHttp();

  useEffect(() => {
    const fetchImage = async () => {
      const file = await sendHttpReq({
        url: `${COMMON_URL}/art/project-image/${props.id}`,
        headers: { "Content-Type": "image/*" },
        responseType: "blob",
      });
      setImage(URL.createObjectURL(file));
    };
    fetchImage();
  }, [sendHttpReq, props.id]);

  return (
    <div onClick={()=>props.onClick()} className={`${classes.project}`}>
      {httpInfo.isLoading && (
        <div className={`${classes.overlay}`}>
          <FontAwesomeIcon className="fa-spin" icon={faCircleNotch} />{" "}
        </div>
      )}
      {!httpInfo.isLoading && (
        <Fragment>
          {" "}
          <img src={image} alt="" />
          <p>{props.name}</p>
        </Fragment>
      )}
    </div>
  );
};

export default Project;
