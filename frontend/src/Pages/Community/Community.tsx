import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Fragment, useEffect, useState } from "react";
import Chip from "../../components/UI/Chip";
import classes from "./Community.module.css";
import MultiSelect from "../../dropdown/MultiSelect";
import Posts from "./Posts/Posts";
import SearchBar from "./SearchBar";
import { toggleTag, useTagCatalog } from "./tags";

export const SEARCH_DEBOUNCE_MS = 150;

const Community = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const catalog = useTagCatalog();

  // What is typed, and what is searched: the search waits 150 ms after the last keystroke
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleSelectTag = (tag: string) => setSelectedTags((old) => toggleTag(old, tag));

  return (
    <Fragment>
      <div className={`${classes.community}`}>
        <h1 className={classes.title}>Community</h1>
        <div className={`${classes["search-header"]}`}>
          <SearchBar
            value={searchText}
            onChange={(value) => {
              setSearchText(value);
              if (!value) setSearch(""); // clearing applies at once
            }}
          />
          <div className={classes.filters}>
            {selectedTags.length > 0 && (
              <ul className={classes.tags} aria-label="Selected tags">
                {selectedTags.map((tag) => (
                  <li key={tag}>
                    <Chip onDelete={() => handleSelectTag(tag)} secondary clickable>
                      {tag}
                    </Chip>
                  </li>
                ))}
              </ul>
            )}
            {/* only tags that exist can be picked: new ones are created when sharing */}
            <MultiSelect
              label="Tags"
              icon={<FontAwesomeIcon icon={faFilter} />}
              placement="bottom-end"
              options={catalog.tags.map((t) => ({ value: t, label: t }))}
              values={selectedTags}
              onChange={setSelectedTags}
              emptyText="No tags yet"
            />
          </div>
        </div>
        <Posts selectedCategories={selectedTags} search={search} />
      </div>
    </Fragment>
  );
};

export default Community;
