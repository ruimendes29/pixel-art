import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Fragment, useRef, useState } from "react";
import ReactDOM from "react-dom";
import Button from "../../components/UI/Button";
import Modal from "../../components/UI/Modal";

import classes from "./FilterModal.module.css";

const tags: Map<string, string[]> = new Map();
tags.set("Anime", ["Naruto", "Pokemon", "Death Note", "Doraemon"]);
tags.set("Soccer", ["Ronaldo", "Messi", "Aubameyang"]);
tags.set("Animals", ["Dogs", "Cats", "Horses"]);
tags.set("Cities", ["London", "Porto", "Milan"]);
tags.set("Custom", []);

const FilterModal = (props: any) => {
  const textRef = useRef(null);
  const [choseTags, setChoseTags] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    Array.from(tags)[0][0]
  );
  return (
    <Fragment>
      {ReactDOM.createPortal(
        <Modal className={`${classes.modal}`} onClose={props.onClose}>
          <div>
            {props.toShare
              ? choseTags
                ? "Enter a Description"
                : "Select Categories for this PixelArt"
              : "Categories"}
          </div>
          <div className={`${classes.panel}`}>
            {!choseTags && (
              <Fragment>
                <div className={`${classes["left-panel"]}`}>
                  {Array.from(tags).map(([el]) => (
                    <div
                      key={el}
                      onClick={() => {
                        setSelectedCategory(el);
                      }}
                      className={`${classes.category}`}
                    >
                      <div className={`${classes.text}`}>{el}</div>
                      <FontAwesomeIcon icon={faArrowRight} />
                    </div>
                  ))}
                </div>
                <div className={`${classes["right-panel"]}`}>
                  {selectedCategory !== "Custom" && (
                    <Fragment>
                      <Button
                        onClick={() => {
                          tags
                            .get(selectedCategory)!
                            .filter((el) => !props.selectedTags.includes(el))
                            .forEach((el) => props.onSelectTag(el));
                        }}
                        className={`${classes["add-all"]}`}
                        primary
                      >
                        Add all
                      </Button>
                      <Button
                        onClick={() => {
                          tags
                            .get(selectedCategory)!
                            .filter((el) => props.selectedTags.includes(el))
                            .forEach((el) => props.onSelectTag(el));
                        }}
                        className={`${classes["remove-all"]}`}
                        primary
                      >
                        Remove all
                      </Button>
                      <div className={`${classes.categories}`}>
                        {tags.get(selectedCategory)!.map((el) => (
                          <Button
                            key={el}
                            onClick={() => {
                              props.onSelectTag(el);
                            }}
                            className={`${classes.tag}`}
                            primary={props.selectedTags.includes(el)}
                            secondary={!props.selectedTags.includes(el)}
                          >
                            {el}
                          </Button>
                        ))}
                      </div>
                    </Fragment>
                  )}
                </div>
              </Fragment>
            )}
            {choseTags && (
              <textarea ref={textRef} className={`${classes.textarea}`} />
            )}
          </div>
          {props.toShare && (
            <Button
              onClick={() => {
                if (!choseTags) setChoseTags(true);
                else {
                  const textEl: HTMLTextAreaElement = textRef.current!;
                  props.onShare(textEl.value);
                }
              }}
              primary
            >
              {choseTags ? "Share" : "Next"}
            </Button>
          )}
        </Modal>,
        document.getElementById("filter-modal")!
      )}
    </Fragment>
  );
};

export default FilterModal;
