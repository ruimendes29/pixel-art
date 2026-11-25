import React, { FormEvent, useRef, useState } from "react";
import Button from "../../components/UI/Button";
import Modal from "../../components/UI/Modal";
import MultiSelect from "../../dropdown/MultiSelect";
import { field, validateField } from "../../fields/validate";
import { useTagCatalog } from "../Community/tags";
import classes from "./ShareModal.module.css";

// Share a drawing to the community: pick tags from the shared catalog (or create
// one for everybody, up to the per-user limit) and write a description.
const ShareModal = (props: {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  onShare: (description: string) => void;
  onClose: () => void;
}) => {
  const catalog = useTagCatalog();
  const [newTag, setNewTag] = useState("");
  const [description, setDescription] = useState("");
  const newTagRef = useRef<HTMLInputElement>(null);

  const limitReached = catalog.createdByMe >= catalog.maxPerUser;
  const tagError = newTag.trim() ? validateField("newTag", newTag) : null;
  const canCreate = !limitReached && !!newTag.trim() && !tagError && !catalog.creating;
  const left = catalog.maxPerUser - catalog.createdByMe;

  const createTag = async (e: FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;
    const name = await catalog.create(newTag.trim().replace(/\s+/g, " "));
    if (name) {
      props.onChange([...props.selectedTags, name]);
      setNewTag("");
    }
    // back to the field (the button lost focus while it worked), ready for another
    // tag; keeps the dropdown's keys like Escape working
    newTagRef.current?.focus();
  };

  const hint =
    tagError ??
    catalog.createError ??
    (limitReached
      ? `You've created ${catalog.maxPerUser} tags, the most allowed.`
      : `New tags are available to everyone. You can create ${left} more.`);

  return (
    <Modal className={classes.modal} onClose={props.onClose}>
      <h2 className={classes.title}>Share to community</h2>
      <MultiSelect
        label="Tags"
        options={catalog.tags.map((t) => ({ value: t, label: t }))}
        values={props.selectedTags}
        onChange={props.onChange}
        emptyText="No tags yet: create the first one below"
        footer={
          <form className={classes.create} onSubmit={createTag}>
            <div className={classes.row}>
              <input
                ref={newTagRef}
                aria-label="New tag"
                placeholder="New tag"
                value={newTag}
                maxLength={field("newTag").maxLength}
                disabled={limitReached}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <button type="submit" className={classes.add} disabled={!canCreate}>
                Create tag
              </button>
            </div>
            <p
              className={`${classes.hint} ${tagError || catalog.createError ? classes.error : ""}`}
              aria-live="polite"
            >
              {hint}
            </p>
          </form>
        }
      />
      <label className={classes.label} htmlFor="share-description">
        {field("description").label}
      </label>
      <textarea
        id="share-description"
        className={classes.textarea}
        maxLength={field("description").maxLength}
        placeholder="What did you draw?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button onClick={() => props.onShare(description)} primary>
        Share
      </Button>
    </Modal>
  );
};

export default ShareModal;
