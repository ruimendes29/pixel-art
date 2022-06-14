import React, { Fragment, useEffect, useState } from "react";
import Input from "../../components/UI/Input";
import classes from "./NewProject.module.css";
import useInput from "../../hooks/use-input";
import useHttp, { COMMON_URL } from "../../hooks/use-http";
import Button from "../../components/UI/Button";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { canvasActions } from "../../store/redux-store";

const NewProject = () => {
  const navigate = useNavigate();
  const dispatchRedux = useDispatch();
  const [, sendRequest] = useHttp();
  const [selectedGroup, setSelectedGroup]: [undefined | number, any] =
    useState(undefined);
  const [groups, setGroups]: [any[], any] = useState([]);
  const [groupEnabled, setGroupEnabled] = useState(false);
  useEffect(() => {
    if (localStorage.getItem("token")) {
      const fetchGroups = async () => {
        const groupsFromDB = await sendRequest({
          url: `${COMMON_URL}/groups/own?key=${localStorage.getItem("token")}`,
          headers: { "Content-Type": "application/json" },
        });
        console.log(groupsFromDB);
        setSelectedGroup(
          groupsFromDB.length > 0 ? groupsFromDB[0].id : undefined
        );
        setGroups(groupsFromDB);
      };

      fetchGroups();
    }
  }, [sendRequest]);

  const sizeInput = useInput((v: number) => {
    return v >= 10 && v <= 100;
  });
  const nameInput = useInput((name: string) => name.trim() !== "");
  return (
    <form className={`${classes.form}`}>
      <Input
        invalid={nameInput.isInputInvalid}
        onChange={nameInput.valueChanged}
        value={nameInput.enteredValue}
        onBlur={nameInput.touchedHandler}
        name="Project name"
        error="Name can not be empty!"
      />
      <Input
        invalid={sizeInput.isInputInvalid}
        onChange={sizeInput.valueChanged}
        value={sizeInput.enteredValue}
        onBlur={sizeInput.touchedHandler}
        type="number"
        name="Canvas size"
        error="Canvas size must be atleast 10 and less than 100"
      />
      {localStorage.getItem("token") && (
        <Fragment>
          {!groupEnabled && (
            <Button
              onClick={(e: any) => {
                e.preventDefault();
                setGroupEnabled(true);
              }}
              secondary
            >
              Add to a group
            </Button>
          )}
          {groupEnabled && (
            <div className={`${classes["group-input"]}`}>
              <label className={`${classes["group-label"]}`} htmlFor="groups">
                Group
              </label>
              <select
                onChange={(e) => {
                  console.log(selectedGroup);
                  setSelectedGroup(+e.target.value);
                  console.log(e.target.value);
                }}
                id="groups"
                className={`${classes.groups}`}
              >
                {groups.map((g: any) => (
                  <option
                    className={`${classes.group}`}
                    key={g.id}
                    value={g.id}
                  >
                    {g.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={(e: any) => {
                  e.preventDefault();
                  setGroupEnabled(false);
                }}
                secondary
              >
                Remove Group
              </Button>
            </div>
          )}
        </Fragment>
      )}

      <Button
        onClick={async (e: any) => {
          e.preventDefault();
          if (!sizeInput.isInputInvalid && !nameInput.isInputInvalid) {
            dispatchRedux(
              canvasActions.setCanvasSize({
                canvasSize: sizeInput.enteredValue,
              })
            );
            dispatchRedux(
              canvasActions.setCanvasName({ name: nameInput.enteredValue })
            );
            if (localStorage.getItem("token")) {
              const token = localStorage.getItem("token")!;
              const s = await sendRequest({
                url: `${COMMON_URL}/art/add-project`,
                method: "POST",
                body: JSON.stringify({
                  token,
                  name: nameInput.enteredValue,
                  size: sizeInput.enteredValue,
                  description: "asoidj",
                  group: groupEnabled ? selectedGroup! : null,
                }),
                headers: { "Content-Type": "application/json" },
              });
              navigate(`/canvas/${s.id}`);
            } else navigate(`/canvas/null`);
          }
        }}
        primary
      >
        Create Project
      </Button>
    </form>
  );
};

export default NewProject;
