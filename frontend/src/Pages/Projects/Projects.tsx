import React, { Fragment, useCallback, useEffect, useState } from "react";
import card from "../../components/UI/ArtCard.module.css";
import classes from "./Projects.module.css";
import Button from "../../components/UI/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router-dom";
import useField from "../../fields/use-field";
import Modal from "../../components/UI/Modal";
import ReactDOM from "react-dom";
import NewProject from "./NewProject";
import Input from "../../components/UI/Input";
import useHttp, { COMMON_URL } from "../../hooks/use-http";
import Project from "./Project";
import { paintedSquares } from "../../components/Canvas/CanvasOperations/canvas-stored";
import Group from "./Group";
import { useDispatch } from "react-redux";
import { canvasActions } from "../../store/redux-store";

const Projects = () => {
  paintedSquares.clear();
  const params = useParams();
  const groupInput = useField("groupName");
  const [openProject, setOpenProject] = useState(false);
  const [openGroup, setOpenGroup] = useState(false);
  const navigate = useNavigate();
  const dispatchRedux = useDispatch();

  const [arts, setArts]: [
    {
      author: number;
      description: string;
      group: number | null;
      id: number;
      image: number;
      name: string;
      shared: boolean;
      size: number;
    }[],
    any,
  ] = useState([]);

  const [groups, setGroups] = useState([]);

  const [httpInfo, sendHttpRequest] = useHttp();

  useEffect(() => {
    dispatchRedux(canvasActions.addBackground({ background: "" }));
  }, [dispatchRedux]);

  const fetchGroups = useCallback(async () => {
    if (params.group === "null") {
      const grupos = await sendHttpRequest({
        url: `${COMMON_URL}/groups/own?key=${localStorage.getItem("token")}`,
        headers: { "Content-Type": "application/json" },
        method: "GET",
      });
      setGroups(grupos);
    }
  }, [params.group, sendHttpRequest]);

  const handleCreateGroup = async () => {
    if (!groupInput.isValueValid) return groupInput.touchedHandler();
    await sendHttpRequest({
      url: `${COMMON_URL}/users/add-group/${encodeURIComponent(groupInput.enteredValue.trim())}`,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: localStorage.getItem("token") }),
      method: "POST",
    });
    await fetchGroups();
    setOpenGroup(false);
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      const fetchProjects = async () => {
        const projects = await sendHttpRequest({
          url: `${COMMON_URL}/art/projects?key=${localStorage.getItem(
            "token",
          )}&group=${params.group}`,
          headers: { "Content-Type": "application/json" },
          method: "GET",
        });
        console.log(projects);
        setArts(projects);
      };

      fetchGroups();
      fetchProjects();
    }
  }, [sendHttpRequest, params.group, fetchGroups]);

  const handleGroupClicked = (id: number) => {
    setGroups([]);
    navigate(`/projects/${id}`);
  };

  return (
    <Fragment>
      <div className={`${classes.projects}`}>
        <div className={classes.header}>
          <h1 className={classes.title}>
            {params.group === "null" ? "Your projects" : "Group"}
          </h1>
          <div className={`${classes.buttons}`}>
            <Button
              onClick={() => {
                setOpenProject((o) => !o);
              }}
              className={`${classes.btn}`}
              primary
            >
              New Project
              <FontAwesomeIcon className={`${classes.icon}`} icon={faPlus} />
            </Button>
            {localStorage.getItem("token") && (
              <Button
                onClick={() => {
                  setOpenGroup((o) => !o);
                }}
                className={`${classes.btn}`}
                secondary
              >
                New Group
                <FontAwesomeIcon className={`${classes.icon}`} icon={faPlus} />
              </Button>
            )}
          </div>
        </div>

        <div className={card.grid}>
          {groups.length > 0 &&
            groups.map((grupo: { id: number; name: string; owner: number }) => (
              <Group
                onClick={() => {
                  handleGroupClicked(grupo.id);
                }}
                name={grupo.name}
                key={grupo.id}
              />
            ))}
          {arts.length > 0 &&
            arts.map((pixelArt) => {
              return (
                <Project
                  onClick={() => {
                    navigate(`/canvas/${pixelArt.id}`);
                  }}
                  id={pixelArt.id}
                  name={pixelArt.name}
                  key={pixelArt.id}
                />
              );
            })}

          {arts.length === 0 && groups.length === 0 && (
            <div className={card.empty}>
              {localStorage.getItem("token") ? (
                <Fragment>
                  <h2>No projects yet</h2>
                  <p>Choose New Project to start your first drawing.</p>
                </Fragment>
              ) : (
                <Fragment>
                  <h2>Guest drawings are not saved</h2>
                  <p>
                    Choose New Project to draw, then download it as PNG or SVG.
                    Create an account to keep your projects and share them.
                  </p>
                </Fragment>
              )}
            </div>
          )}
        </div>
      </div>
      {openProject &&
        ReactDOM.createPortal(
          <Modal
            onClose={() => {
              setOpenProject(false);
            }}
          >
            <NewProject />
          </Modal>,
          document.getElementById("new-project-modal")!,
        )}
      {openGroup &&
        ReactDOM.createPortal(
          <Modal
            onClose={() => {
              setOpenGroup(false);
            }}
          >
            <Input
              invalid={groupInput.isInputInvalid}
              onChange={groupInput.valueChanged}
              value={groupInput.enteredValue}
              onBlur={groupInput.touchedHandler}
              name={groupInput.label}
              maxLength={groupInput.maxLength}
              error={groupInput.error}
            />
            <Button
              onClick={handleCreateGroup}
              className={`${classes["group-button"]}`}
              primary
            >
              {httpInfo.isLoading ? (
                <FontAwesomeIcon className="fa-spin" icon={faCircleNotch} />
              ) : (
                "Create Group"
              )}
            </Button>
          </Modal>,
          document.getElementById("new-project-modal")!,
        )}
    </Fragment>
  );
};

export default Projects;
