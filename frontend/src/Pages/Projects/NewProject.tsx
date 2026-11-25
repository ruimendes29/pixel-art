import React, { Fragment, useEffect, useState } from "react";
import Input from "../../components/UI/Input";
import classes from "./NewProject.module.css";
import useField from "../../fields/use-field";
import useHttp, { COMMON_URL } from "../../hooks/use-http";
import Button from "../../components/UI/Button";
import Select from "../../dropdown/Select";
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
          groupsFromDB.length > 0 ? groupsFromDB[0].id : undefined,
        );
        setGroups(groupsFromDB);
      };

      fetchGroups();
    }
  }, [sendRequest]);

  const sizeInput = useField("canvasSize");
  const nameInput = useField("projectName");
  return (
    <form className={`${classes.form}`}>
      <Input
        invalid={nameInput.isInputInvalid}
        onChange={nameInput.valueChanged}
        value={nameInput.enteredValue}
        onBlur={nameInput.touchedHandler}
        name={nameInput.label}
        maxLength={nameInput.maxLength}
        error={nameInput.error}
      />
      <Input
        invalid={sizeInput.isInputInvalid}
        onChange={sizeInput.valueChanged}
        value={sizeInput.enteredValue}
        onBlur={sizeInput.touchedHandler}
        type="number"
        name={sizeInput.label}
        error={sizeInput.error}
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
              <Select
                label="Group"
                labelClassName={classes["group-label"]}
                value={selectedGroup}
                options={groups.map((g: any) => ({
                  value: g.id as number,
                  label: g.name,
                }))}
                onChange={(id: number) => setSelectedGroup(id)}
              />
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
          // untouched fields count too: show their messages instead of creating
          if (!sizeInput.isValueValid || !nameInput.isValueValid) {
            sizeInput.touchedHandler();
            nameInput.touchedHandler();
            return;
          }
          const name = nameInput.enteredValue.trim();
          const size = Number(sizeInput.enteredValue);
          dispatchRedux(canvasActions.setCanvasSize({ canvasSize: size }));
          dispatchRedux(canvasActions.setCanvasName({ name }));
          if (localStorage.getItem("token")) {
            const token = localStorage.getItem("token")!;
            const s = await sendRequest({
              url: `${COMMON_URL}/art/add-project`,
              method: "POST",
              body: JSON.stringify({
                token,
                name,
                size,
                description: "",
                group: groupEnabled ? selectedGroup! : null,
              }),
              headers: { "Content-Type": "application/json" },
            });
            navigate(`/canvas/${s.id}`);
          } else navigate(`/canvas/null`);
        }}
        primary
      >
        Create Project
      </Button>
    </form>
  );
};

export default NewProject;
