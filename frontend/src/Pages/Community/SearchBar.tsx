import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import IconButton from '../../components/UI/IconButton'
import classes from './SearchBar.module.css'

const SearchBar = (props:any) => {
  return (
    <div className={`${classes["search-bar"]}`}>
            <input
              value={props.searchInput.enteredValue}
              onChange={props.searchInput.valueChanged}
              onBlur={props.searchInput.touchedHandler}
              type="text"
            />
            <IconButton onClick={() => {}} icon={faMagnifyingGlass} />
          </div>
  )
}

export default SearchBar