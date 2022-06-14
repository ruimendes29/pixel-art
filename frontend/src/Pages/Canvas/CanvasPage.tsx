import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Canvas from "../../components/Canvas/Canvas";
import { paintedSquares } from "../../components/Canvas/CanvasOperations/canvas-stored";
import {
  adjustcanvasWindowSize,
  drawGrid,
  paintStoredSquares,
  rgbToHex,
} from "../../components/Canvas/CanvasOperations/canvas-utils";
import Functionalities from "../../components/Functionalities/Functionalities";
import useHttp, { COMMON_URL } from "../../hooks/use-http";
import { canvasActions } from "../../store/redux-store";
import FilterModal from "../Community/FilterModal";
import classes from "./CanvasPage.module.css";

function dataURItoBlob(dataURI: string) {
  var byteStr;
  if (dataURI.split(",")[0].indexOf("base64") >= 0)
    byteStr = atob(dataURI.split(",")[1]);
  else byteStr = unescape(dataURI.split(",")[1]);

  var mimeStr = dataURI.split(",")[0].split(":")[1].split(";")[0];

  var arr = new Uint8Array(byteStr.length);
  for (var i = 0; i < byteStr.length; i++) {
    arr[i] = byteStr.charCodeAt(i);
  }

  return new Blob([arr], { type: mimeStr });
}

const CanvasPage = () => {
  const dispatchRedux = useDispatch();
  const canvasSize = useSelector((state: any) => state.canvas.canvasSize);
  const canvasName = useSelector((state: any) => state.canvas.name);
  const logged = useSelector((state: any) => state.userManagement.logged);
  const params = useParams();
  const canvasRef = useRef(null);
  const [openedShareModal, setOpenedShareModal] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [httpInfo, sendHttpReq] = useHttp();

  const [tags, setTags]: [string[], any] = useState([]);

  const [isOwner, setIsOwner] = useState(false);

  const checkIfOwner = useCallback(async () => {
    if (logged && localStorage.getItem("token")) {
      const projectId = params.id!;

      const project = await sendHttpReq({
        url: `${COMMON_URL}/art/project-owner/${projectId}`,
        headers: { "Content-Type": "application/json" },
      });

      const user = await sendHttpReq({
        url: `${COMMON_URL}/users/id?key=${localStorage.getItem("token")}`,
        headers: { "Content-Type": "application/json" },
      });
      console.log(project.author + " " + user.id);
      if (project.author === user.id) {
        setIsOwner(true);
        return true;
      }
      return false;
    }
    else{
      setIsOwner(params.id==="null");
      return params.id==="null";
    } 
  }, [logged, params.id, sendHttpReq]);

  const handleDownloadCanvas = () => {
    const canvas: HTMLCanvasElement = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const previousCanvasURL = canvas.toDataURL("image/png");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paintStoredSquares(
      {
        cols: canvasSize,
        rows: canvasSize,
        squareSize: adjustcanvasWindowSize() / canvasSize,
        startCol: 0,
        startRow: 0,
        zoom: 1,
      },
      ctx
    );
    var img = canvas.toDataURL("image/png");
    var element = document.createElement("a");
    element.setAttribute("href", img);
    element.setAttribute("download", "project.png");
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var previousImage = new Image();
    previousImage.onload = function () {
      ctx.drawImage(previousImage, 0, 0); // Or at whatever offset you like
    };
    previousImage.src = previousCanvasURL;
  };

  const checkShared = useCallback(async () => {
    const shared = await sendHttpReq({
      url: `${COMMON_URL}/art/is-shared/${params.id}`,
      headers: { "Content-Type": "application/json" },
    });
    if (shared.shared === 0) setIsShared(false);
    else setIsShared(true);
  }, [params.id, sendHttpReq]);

  const handleShareCanvas = async (description: string) => {
    await sendHttpReq({
      url: `${COMMON_URL}/art/share-project`,
      body: JSON.stringify({
        token: localStorage.getItem("token"),
        id: params.id!,
        description: description,
        tags: tags,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    await checkShared();
    setOpenedShareModal(false);
  };

  const handleSaveCanvas = useCallback(async () => {
    const formData = new FormData();
    const canvas: HTMLCanvasElement = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const previousCanvasURL = canvas.toDataURL("image/png");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(
      {
        cols: canvasSize,
        rows: canvasSize,
        squareSize: adjustcanvasWindowSize() / canvasSize,
        startCol: 0,
        startRow: 0,
        zoom: 1,
      },
      ctx
    );
    var img = canvas.toDataURL("image/png");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var previousImage = new Image();
    previousImage.onload = function () {
      ctx.drawImage(previousImage, 0, 0); // Or at whatever offset you like
    };
    previousImage.src = previousCanvasURL;
    formData.append("image", dataURItoBlob(img), canvasName);
    //TODO project id needs to come from route
    formData.set("projectId", params.id!);
    sendHttpReq({
      url: `${COMMON_URL}/art/add-image`,
      method: "POST",
      body: formData,
      headers: { Authorization: `${localStorage.getItem("token")!}` },
    });
  }, [sendHttpReq, canvasSize, canvasName, params.id]);

  //Load canvas from DB or set empty image if not yet present
  useEffect(() => {
    const updateOrCreateCanvas = async () => {
      const isOwner = await checkIfOwner();
      if (isOwner && localStorage.getItem("token")) {
        const file = await sendHttpReq({
          url: `${COMMON_URL}/art/project-image/${params.id!}`,
          headers: { "Content-Type": "image/*" },
          responseType: "blob",
        });
        if (file) {
          const canvas: HTMLCanvasElement = canvasRef.current!;
          const ctx = canvas.getContext("2d")!;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          var previousImage = new Image();
          const canvasInfo = await sendHttpReq({
            url: `${COMMON_URL}/art/project-canvas/${params.id!}`,
            headers: { "Content-Type": "application/json" },
          });
          previousImage.onload = function () {
            ctx.drawImage(previousImage, 0, 0, canvas.width, canvas.height);
            const squareSize = canvas.width / canvasInfo.size;
            const size = canvasInfo.size;
            for (let c = 0; c < size; c++) {
              for (let r = 0; r < size; r++) {
                const color = ctx.getImageData(
                  (c + 0.5) * squareSize,
                  (r + 0.5) * squareSize,
                  1,
                  1
                );
                const colors = new Uint8Array(color.data.buffer);
                if (colors[3] > 0) {
                  const colorInImage = rgbToHex(
                    colors[0],
                    colors[1],
                    colors[2]
                  );
                  if (!paintedSquares.has(r)) {
                    paintedSquares.set(r, new Map());
                  }
                  paintedSquares.get(r)!.set(c, colorInImage);
                }
              }
            }
          };
          previousImage.src = URL.createObjectURL(file);

          dispatchRedux(
            canvasActions.setCanvasSize({ canvasSize: canvasInfo.size })
          );
          dispatchRedux(canvasActions.setCanvasName({ name: canvasInfo.name }));
        }
        handleSaveCanvas();
        checkShared();
      }
    };

    updateOrCreateCanvas();
  }, [
    handleSaveCanvas,
    sendHttpReq,
    params.id,
    dispatchRedux,
    checkShared,
    checkIfOwner,
  ]);

  return (
    <Fragment>
      <div className={`${classes.under}`}>
        {isOwner && (
          <Fragment>
            <div className={`${classes.c}`}>
              <Canvas ref={canvasRef} />
            </div>
            <div className={`${classes.f}`}>
              <Functionalities
                id={params.id!}
                saving={httpInfo.isLoading}
                shared={isShared}
                onDownload={() => {
                  handleDownloadCanvas();
                }}
                onSave={() => {
                  handleSaveCanvas();
                }}
                onShare={() => {
                  setOpenedShareModal(true);
                }}
              />
            </div>
          </Fragment>
        )}
        {!isOwner && httpInfo.isLoading && (
          <FontAwesomeIcon
            className={`fa-spin ${classes.loading}`}
            icon={faCircleNotch}
          />
        )}
        {!isOwner && !httpInfo.isLoading && (
          <div className={`${classes["not-owner"]}`}>
            You do not have authorization to view this page!
          </div>
        )}
      </div>
      {openedShareModal && (
        <FilterModal
          toShare
          onShare={(description: string) => {
            handleShareCanvas(description);
          }}
          onClose={() => setOpenedShareModal(false)}
          selectedTags={tags}
          onSelectTag={(tag: string) => {
            setTags((oldTags: string[]) => {
              if (oldTags.includes(tag))
                return [...oldTags].filter((el) => el !== tag);
              else return [...oldTags, tag];
            });
          }}
        />
      )}
    </Fragment>
  );
};

export default CanvasPage;
