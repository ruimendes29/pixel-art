import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Fragment, useRef, useState } from "react";
import ReactDOM from "react-dom";
import Button from "../../components/UI/Button";
import Modal from "../../components/UI/Modal";

import { field } from "../../fields/validate";
import classes from "./FilterModal.module.css";
import {
  CUSTOM_CATEGORY,
  hasTag,
  isPresetTag,
  MAX_TAG_LENGTH,
  normalizeTag,
  PRESET_TAGS,
} from "./tags";

const tags = new Map<string, string[]>([...PRESET_TAGS, [CUSTOM_CATEGORY, []]]);

const FilterModal = (props: any) => {
  const textRef = useRef(null);
  const [choseTags, setChoseTags] = useState(false);
  const [newTag, setNewTag] = useState("");
  const customTags: string[] = props.selectedTags.filter((t: string) => !isPresetTag(t));

  const addCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = normalizeTag(newTag);
    if (tag && !hasTag(props.selectedTags, tag)) props.onSelectTag(tag);
    setNewTag("");
  };
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
                      role="button"
                      tabIndex={0}
                      aria-pressed={selectedCategory === el}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setSelectedCategory(el);
                      }}
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
                  {selectedCategory === CUSTOM_CATEGORY && (
                    <div className={classes.custom}>
                      <form className={classes["custom-form"]} onSubmit={addCustomTag}>
                        <input
                          aria-label="New tag"
                          placeholder="Type a tag, like Retro games"
                          maxLength={MAX_TAG_LENGTH}
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                        />
                        <Button primary disabled={!normalizeTag(newTag)}>
                          Add tag
                        </Button>
                      </form>
                      {customTags.length === 0 ? (
                        <p className={classes.hint}>Tags you add show up here. Click one to remove it.</p>
                      ) : (
                        <div className={classes.categories}>
                          {customTags.map((el) => (
                            <Button
                              key={el}
                              onClick={() => props.onSelectTag(el)}
                              className={`${classes.tag}`}
                              primary
                            >
                              {el}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {selectedCategory !== CUSTOM_CATEGORY && (
                    <Fragment>
                      <Button
                        onClick={() => {
                          tags
                            .get(selectedCategory)!
                            .filter((el) => !hasTag(props.selectedTags, el))
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
                            .filter((el) => hasTag(props.selectedTags, el))
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
                            primary={hasTag(props.selectedTags, el)}
                            secondary={!hasTag(props.selectedTags, el)}
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
              <textarea
                ref={textRef}
                className={`${classes.textarea}`}
                aria-label={field("description").label}
                maxLength={field("description").maxLength}
              />
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
