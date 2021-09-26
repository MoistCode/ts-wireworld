import React, { useState } from 'react';

import styles from './Cell.module.css';

export enum State {
  Empty = 'empty',
  Head = 'head',
  Tail = 'tail',
  Conductor = 'conductor',
}

let states = Object.values(State);

interface Props {
  column: Number,
  edgeType?: EdgeType,
  row: Number,
}

export enum EdgeType {
  Top = 'top',
  TopLeft = 'top-left',
  TopRight = 'top-right',
  Bottom = 'bottom',
  BottomLeft = 'bottom-left',
  BottomRight = 'bottom-right',
  Right = 'right',
  Left = 'left',
}

function Cell(props: Props) {
  let {
    column,
    edgeType,
    row,
    state = "empty"
  } = props;

  return (
    <div
      className={styles.cell}
      data-column={column}
      data-edge-type={edgeType}
      data-row={row}
      data-state={state}
    />
  );
}

export default Cell;