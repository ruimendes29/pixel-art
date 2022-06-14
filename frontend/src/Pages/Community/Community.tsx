import {
  faCaretLeft,
  faCaretRight,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import React, { Fragment, useState } from "react";
import Button from "../../components/UI/Button";
import Chip from "../../components/UI/Chip";
import IconButton from "../../components/UI/IconButton";
import useInput from "../../hooks/use-input";
import classes from "./Community.module.css";
import FilterModal from "./FilterModal";
import Posts from "./Posts/Posts";
import SearchBar from "./SearchBar";

const Community = () => {
  const [selectedCategories, setSelectedCategories]: [string[], any] = useState(
    []
  );
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const searchInput = useInput((el: string) => {
    return el.length < 30;
  });

  const handleChipDelete = (el: string) => {
    setSelectedCategories((categories: any[]) =>
      categories.filter((element) => element !== el)
    );
    setCategoryIndex((p) => {
      if (p > 0) return p - 1;
      else return p;
    });
  };

  const handleSelectTag = (el: string) => {
    if (selectedCategories.includes(el)) {
      setSelectedCategories((oldCategories: any[]) =>
        oldCategories.filter((category) => category !== el)
      );
    } else
      setSelectedCategories((oldCategories: any) => [...oldCategories, el]);
  };

  const handleLeftPress = () => {
    setCategoryIndex((p) => {
      if (categoryIndex - 1 >= 0) return p - 1;
      else return p;
    });
  };

  const handleRightPress = () => {
    setCategoryIndex((p) => {
      if (categoryIndex + 2 < selectedCategories.length) return p + 1;
      else return p;
    });
  };

  return (
    <Fragment>
      <div className={`${classes.community}`}>
        <div className={`${classes["search-header"]}`}>
          <SearchBar searchInput={searchInput} />
          {selectedCategories.length > 0 && (
            <div className={`${classes.categories}`}>
              <IconButton
                className={`${categoryIndex - 1 >= 0 ? "" : classes.invalid}`}
                onClick={handleLeftPress}
                icon={faCaretLeft}
              />
              {selectedCategories
                .slice(categoryIndex, categoryIndex + 2)
                .map((el) => (
                  <Chip
                    key={el}
                    onDelete={() => {
                      handleChipDelete(el);
                    }}
                    className={`${classes.chip}`}
                    secondary
                    clickable
                  >
                    {el}
                  </Chip>
                ))}
              <IconButton
                className={`${
                  categoryIndex + 2 < selectedCategories.length
                    ? ""
                    : classes.invalid
                } `}
                onClick={handleRightPress}
                icon={faCaretRight}
              />
            </div>
          )}
          {selectedCategories.length === 0 && (
            <Button
              onClick={() => {
                setShowModal((sm) => !sm);
              }}
              className={`${classes["no-tags"]}`}
              secondary
            >
              No tag selected
            </Button>
          )}
          <IconButton
            style={{ justifySelf: "end" }}
            icon={faFilter}
            onClick={() => {
              setShowModal((sm) => !sm);
            }}
          />
        </div>
        <Posts selectedCategories={selectedCategories} />
      </div>
      {showModal && (
        <FilterModal
          onSelectTag={handleSelectTag}
          selectedTags={selectedCategories}
          onClose={() => setShowModal(false)}
        />
      )}
    </Fragment>
  );
};

export default Community;
