import React, { useState, useEffect } from 'react';

import Wireworld from './Wireworld';
import logo from './logo.svg';

interface AppProps {}

function App({}: AppProps) {
  return <Wireworld column={50} row={50}/>;
}

export default App;
