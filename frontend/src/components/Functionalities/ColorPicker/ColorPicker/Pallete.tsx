import { faPlus } from "@fortawesome/free-solid-svg-icons";
import IconButton from "../../../UI/IconButton";
import classes from "./Pallete.module.css";

const Pallete = (props: {
  colors: string[];
  onClickedColor: any;
  onAddColor: any;
}) => {
  return (
    <div className={`${classes.pallete}`}>
      {[...Array(9).keys()].map((index) => {
        return (
          <div
            key={index}
            onClick={() => {
              if (index < props.colors.length) {
                props.onClickedColor(props.colors[index]);
              }
            }}
            style={{
              backgroundColor: `${
                index < props.colors.length ? props.colors[index] : "white"
              }`,
            }}
            className={`${classes["color-holder"]}`}
          ></div>
        );
      })}
      <IconButton
        className={`${classes["color-holder"]}`}
        icon={faPlus}
        onClick={() => {
          props.onAddColor();
        }}
      />
    </div>
  );
};

export default Pallete;
