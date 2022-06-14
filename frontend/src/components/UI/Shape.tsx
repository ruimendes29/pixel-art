import React from 'react'
import classes from './Shape.module.css'

const Shape = () => {
  return (
    <div className={`${classes.shape}`}>
        <div className={`${classes.square}`}></div>
        <div className={`${classes.square}`}></div>
        <div className={`${classes.square}`}></div>
        <div className={`${classes.square}`}></div>
    </div>
  )
}

export default Shape