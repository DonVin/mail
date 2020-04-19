import React from 'react';
import { BrowserRouter,Route } from 'react-router-dom';
import Enter from './containers/enter';
import Search from './containers/search';

import './App.css';

function App() {
  return (
    <div className="App">
		 <BrowserRouter>
		 	<Route path={`/enter`} component={Enter} />
		 	<Route path={`/search`} component={Search} />
		 </BrowserRouter>
    </div>
  );
}

export default App;
