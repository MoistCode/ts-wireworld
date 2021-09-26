import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import
  Cell,
  {
    EdgeType as CellEdgeType,
    EdgeType,
    State as CellState,
  }
from './Cell';
import styles from './Wireworld.module.css';

interface WireworldProps {
  column: Number,
  row: Number,
}

function Wireworld(props: WireworldProps) {
  let {
    column: maxColumn,
    row: maxRow,
  } = props;

  let [board, setBoard] = useState(() => {
    let grid = [];

    for (let rowNum = 1; rowNum <= maxRow; rowNum++) {
      let currentRow = [];
  
      for (let colNum = 1; colNum <= maxColumn; colNum++) {
        currentRow.push(
          <Cell
            column={colNum}
            edgeType={getEdgeType(rowNum, colNum, maxRow, maxColumn)}
            key={`row-${rowNum}-col-${colNum}`}
            row={rowNum}
          />
        );
      }

      grid.push(currentRow);
    }

    return grid;
  });
  let [cellStateSetter, setCellStateSetter] = useState(CellState.Empty);
  let [mouseHeldDown, setMouseHeldDown] = useState(false);
  let [listOfActiveCells, setListOfActiveCells] = useState(new Set([]));
  let [startSimulation, setStartSimulation] = useState(false);
  let [ticks, setTicks] = useState(1000);

  useEffect(() => {
    if (!startSimulation) {
      return;
    }

    let timer = setInterval(() => {
      let newBoard = [...board];
      let newSet = new Set([]);
      for (let activeCell of listOfActiveCells) {
        newSet.add({...activeCell});
      }

      for (let activeCell of newSet) {
        let {
          row,
          column,
          edgeType,
          cellState,
        } = activeCell;

        let nextTickState = getCellForNextTick({
          activeCells: listOfActiveCells,
          cellState,
          column,
          row,
          edgeType,
          maxColumn,
          maxRow,
        });

        newBoard[row - 1][column - 1] = (
          <Cell
            column={column}
            edgeType={edgeType}
            key={`row-${row}-col-${column}`}
            row={row}
            state={nextTickState}
          />
        );

        activeCell.cellState = nextTickState;
      }
      setListOfActiveCells(newSet);
      setBoard(newBoard);

    }, ticks);

    return () => clearInterval(timer);
  }, [board, listOfActiveCells, startSimulation, ticks]);

  let changeCellState = useCallback((type) => (e) => {
    if (mouseHeldDown || type === 'click' && e.target.dataset.row && e.target.dataset.column) {
      e.target.dataset.state = cellStateSetter;

      let newSet = new Set([...listOfActiveCells]);

      for (let el of newSet) {
        if (el.row === e.target.dataset.row && el.column === e.target.dataset.column) {
          newSet.delete(el);
        }
      }

      if (cellStateSetter !== CellState.Empty) {
        newSet.add({
          row: e.target.dataset.row,
          column: e.target.dataset.column,
          edgeType: e.target.dataset.edgeType,
          cellState: cellStateSetter,
        });
      }

      setListOfActiveCells(newSet);
    }
  }, [cellStateSetter, listOfActiveCells, mouseHeldDown]);

  return (
    <>
      <div
        className={styles.board}
        onClick={changeCellState('click')}
        onMouseMove={changeCellState()}
        onMouseDown={() => setMouseHeldDown(true)}
        onMouseUp={() => setMouseHeldDown(false)}
      >
        {board.map((currentRow, i) => (
          <div className={styles.row} key={`row-${i}`}>
            {currentRow}
          </div>
        ))}
      </div>
      <label htmlFor="cell-state">Cell State:</label>
      <select
        name="cell-state"
        onChange={(e) => {
          setCellStateSetter(e.currentTarget.value);
        }}
      >
        {Object.values(CellState).map((state) => (
          <option value={state}>{state}</option>
        ))}
      </select>
      <button onClick={() => setStartSimulation(!startSimulation)}>Toggle Sim</button>
      <label for="ticks">Time per tick (ms):</label>
      <input name="ticks" type="number" value={ticks} onChange={(e) => setTicks(Number(e.target.value))} />
    </>
  )
}

interface UseBoardProps {
  column: Number,
  row: Number,
}

export default Wireworld;

function getEdgeType(row, column, maxRow, maxColumn) {
  if (row === 1 && column === 1) {
    return EdgeType.TopLeft;
  } else if (row === 1 && column === maxColumn) {
    return EdgeType.TopRight;
  } else if (row === maxRow && column === maxColumn) {
    return EdgeType.BottomRight;
  } else if (row === maxRow && column === 1) {
    return EdgeType.BottomLeft;
  } else if (row === 1) {
    return EdgeType.Top;
  } else if (column === maxColumn) {
    return EdgeType.Right;
  } else if (row === maxRow) {
    return EdgeType.Bottom;
  } else if (column === 1) {
    return EdgeType.Left;
  } 
}

function getCellForNextTick({activeCells, cellState, column, row, edgeType, maxColumn, maxRow}) {
  row = Number(row);
  column = Number(column);

  if (cellState === CellState.Head) {
    return CellState.Tail;
  }

  if (cellState === CellState.Tail) {
    return CellState.Conductor;
  }

  let numOfHeads = 0;

  for (let activeCell of activeCells) {
    if (
      (
        Number(activeCell.row) + 1 === row ||
        Number(activeCell.row)  === row ||
        Number(activeCell.row) - 1 === row
      ) &&
      (
        Number(activeCell.column) + 1 === column ||
        Number(activeCell.column)  === column ||
        Number(activeCell.column) - 1 === column
      ) &&
      activeCell.cellState === CellState.Head
    ) {
      numOfHeads += 1;
    }
  }

  if (numOfHeads === 1 || numOfHeads === 2) {
    return CellState.Head;
  }

  return CellState.Conductor;
}