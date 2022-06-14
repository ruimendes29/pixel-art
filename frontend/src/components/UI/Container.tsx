import React from 'react'
import classes from './Container.module.css'

const Container = (props:{children:any}) => {
  return (
    <div className={`${classes.cont}`}>{props.children}</div>
  )
}

export default Container