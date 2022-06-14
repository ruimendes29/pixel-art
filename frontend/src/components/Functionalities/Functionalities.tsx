import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Button from "../UI/Button";
import Container from "../UI/Container";
import ChangeMouse from "./ChangeMouse/ChangeMouse";
import ColorPicker from "./ColorPicker/ColorPicker/ColorPicker";
import classes from "./Functionalities.module.css";
import LoadImage from "./LoadImage/LoadImage";

const Functionalities = (props: any) => {
  const isRegistered = localStorage.getItem("token");

  return (
    <div className={`${classes.funct}`}>
      <div className={`${classes.buttons}`}>
        {isRegistered && (
          <Button
            onClick={() => {
              props.onSave();
            }}
            primary
          >
            {props.saving ? (
              <FontAwesomeIcon className="fa-spin" icon={faCircleNotch} />
            ) : (
              "Save"
            )}
          </Button>
        )}
        <Button
          onClick={() => {
            props.onDownload();
          }}
          secondary
        >
          {props.saving ? (
            <FontAwesomeIcon className="fa-spin" icon={faCircleNotch} />
          ) : (
            "Download as PNG"
          )}
        </Button>
        {isRegistered && (
          <Button
            disabled={props.shared}
            onClick={async () => {
              if (!props.shared) props.onShare();
            }}
            secondary
          >
            {props.saving ? (
              <FontAwesomeIcon className="fa-spin" icon={faCircleNotch} />
            ) : props.shared ? (
              "Already Shared"
            ) : (
              "Share"
            )}
          </Button>
        )}
      </div>
      <Container>
        <ColorPicker />
      </Container>
      <Container>
        <ChangeMouse />
      </Container>
      <Container>
        <LoadImage />
      </Container>
    </div>
  );
};

export default Functionalities;
