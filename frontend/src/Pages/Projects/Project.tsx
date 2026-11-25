import React, { useEffect, useState } from "react";
import card from "../../components/UI/ArtCard.module.css";
import noImage from "../../assets/images/no-image.png";
import useHttp, { COMMON_URL } from "../../hooks/use-http";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

const Project = (props: { id: number; name: string; onClick: Function }) => {
  const [image, setImage] = useState(noImage);
  const [httpInfo, sendHttpReq] = useHttp();

  useEffect(() => {
    const fetchImage = async () => {
      const file = await sendHttpReq({
        url: `${COMMON_URL}/art/project-image/${props.id}`,
        headers: { "Content-Type": "image/*" },
        responseType: "blob",
      });
      // no file when the project hasn't been saved yet: keep the placeholder
      if (file) setImage(URL.createObjectURL(file));
    };
    fetchImage();
  }, [sendHttpReq, props.id]);

  return (
    <button type="button" onClick={() => props.onClick()} className={card.card}>
      {httpInfo.isLoading ? (
        <span className={card.thumb}>
          <FontAwesomeIcon className="fa-spin" icon={faCircleNotch} />
        </span>
      ) : (
        <span className={card.thumb}>
          <img className={card.drawing} src={image} alt="" />
        </span>
      )}
      <span className={card.name}>{props.name}</span>
    </button>
  );
};

export default Project;
