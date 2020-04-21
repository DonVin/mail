import React from 'react';
import { BrowserRouter,Route } from 'react-router-dom';
import Enter from './containers/enter';
import Handle from './containers/handle';

import './App.css';

function App() {
  return (
    <div className="App">
		 <BrowserRouter>
		 	<Route path={`/enter`} component={Enter} />
		 	<Route path={`/handle`} component={Handle} />
		 </BrowserRouter>
    </div>
  );
}

export default App;
