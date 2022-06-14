import React, { Fragment, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Modal from "../../../components/UI/Modal";
import LikeCounter from "./LikeCounter";
import classes from "./Post.module.css";
import noImage from "../../../assets/images/no-image.png";
import useHttp, { COMMON_URL } from "../../../hooks/use-http";

const Post = (props: {
  authorId: number;
  postId: number;
  postName: string;
  postLikes: number;
  postDescription: string;
}) => {
  const [showPost, setShowPost] = useState(false);
  const [userInfo, setUserInfo]: [
    { image: any; name: undefined | string },
    Function
  ] = useState({ image: noImage, name: undefined });
  const [postImage, setPostImage] = useState(noImage);
  const [, sendHttpRequest] = useHttp();
  const [likesInfo, setLikesInfo] = useState({
    liked: false,
    numberOfLikes: 0,
  });

  useEffect(() => {
    const fetchPostImage = async () => {
      const file = await sendHttpRequest({
        url: `${COMMON_URL}/art/project-image/${props.postId}`,
        headers: { "Content-Type": "image/*" },
        responseType: "blob",
      });
      setPostImage(URL.createObjectURL(file));
    };
    const fetchUserInfo = async () => {
      const photoFromDB = await sendHttpRequest({
        url: `${COMMON_URL}/users/photo/${props.authorId}`,
        method: "GET",
        headers: { "Content-Type": "image/*" },
        responseType: "blob",
      });
      const { username } = await sendHttpRequest({
        url: `${COMMON_URL}/users/name/${props.authorId}`,
        headers: { "Content-Type": "application/json" },
      });
      setUserInfo({ image: URL.createObjectURL(photoFromDB), name: username });
    };
    const fetchLikeInfo = async () => {
      const { likes } = await sendHttpRequest({
        url: `${COMMON_URL}/likes/number/${props.postId}`,
        headers: { "Content-Type": "application/json" },
      });
      if (localStorage.getItem("token")) {
        const { liked } = await sendHttpRequest({
          url: `${COMMON_URL}/likes/liked/${
            props.postId
          }?key=${localStorage.getItem("token")}`,
          headers: { "Content-Type": "application/json" },
        });
        setLikesInfo({ liked, numberOfLikes: likes });
      } else {
        setLikesInfo({ liked: false, numberOfLikes: likes });
      }
    };
    fetchPostImage();
    fetchUserInfo();
    fetchLikeInfo();
  }, [sendHttpRequest, props.postId, props.authorId]);

  const handleLikePressed = async () => {
    if (likesInfo.liked) {
      await sendHttpRequest({
        url: `${COMMON_URL}/likes/${props.postId}?key=${localStorage.getItem(
          "token"
        )}`,
        method: "DELETE",
      });
      setLikesInfo((oldInfo) => {
        return { liked: false, numberOfLikes: oldInfo.numberOfLikes - 1 };
      });
    } else {
      await sendHttpRequest({
        url: `${COMMON_URL}/likes/like`,
        body: JSON.stringify({
          token: localStorage.getItem("token"),
          projectId: props.postId,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      setLikesInfo((oldInfo) => {
        return { liked: true, numberOfLikes: oldInfo.numberOfLikes + 1 };
      });
    }
  };

  return (
    <Fragment>
      <div
        onClick={() => setShowPost(true)}
        className={`${classes["post-holder"]}`}
      >
        <img
          className={`${classes.img}`}
          src={postImage}
          alt={props.postDescription}
        />
        <p>{props.postName}</p>
      </div>
      {showPost &&
        ReactDOM.createPortal(
          <Modal
            className={`${classes.modal}`}
            onClose={() => setShowPost(false)}
          >
            <div className={`${classes.left}`}>
              <img
                className={`${classes["modal-img"]}`}
                src={postImage}
                alt={props.postDescription}
              />
              <LikeCounter
                likable={localStorage.getItem("token")?true:false}
                liked={likesInfo.liked}
                onLike={() => {
                  if (localStorage.getItem("token")) handleLikePressed();
                }}
                likes={likesInfo.numberOfLikes}
              />
              {!localStorage.getItem("token") && (
                <div className={`${classes["guest-like"]}`}>
                  As a guest, you can't like posts
                </div>
              )}
            </div>
            <div className={`${classes.right}`}>
              <div className={`${classes.author}`}>
                <div className={`${classes["author-img"]}`}>
                  <img src={userInfo.image} alt={userInfo.name} />
                </div>
              </div>
              <div className={`${classes["author-name"]}`}>{userInfo.name}</div>
              <div className={`${classes.description}`}>
                {props.postDescription}
              </div>
            </div>
          </Modal>,
          document.getElementById("post-modal")!
        )}
    </Fragment>
  );
};

export default Post;
