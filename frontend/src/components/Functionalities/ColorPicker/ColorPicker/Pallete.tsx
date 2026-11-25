import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classes from "./Pallete.module.css";

const Pallete = (props: {
  colors: string[];
  onClickedColor: any;
  onAddColor: any;
}) => {
  return (
    <div className={`${classes.pallete}`}>
      {[...Array(9).keys()].map((index) => {
        const color = props.colors[index];
        return (
          <button
            key={index}
            disabled={!color}
            aria-label={color ? `Use colour ${color}` : "Empty palette slot"}
            onClick={() => props.onClickedColor(color)}
            style={{ backgroundColor: color || "var(--surface)" }}
            className={`${classes["color-holder"]}`}
          />
        );
      })}
      <button
        aria-label="Save colour to palette"
        title="Save colour to palette"
        onClick={() => props.onAddColor()}
        className={`${classes["color-holder"]} ${classes.add}`}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </div>
  );
};

export default Pallete;
