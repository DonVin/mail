import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import login from '../containers/login';
import search from '../containers/search';

const Route = () => {

    const rootRoutes = [
        {
            path: '/',
            // component: Base,
            onChange: (preState, nextState, replaceState) => {},
            onEnter: nextState => {
                // pageHelpInit(nextState.location.pathname);
                // // 新开窗口或刷新页面，onChange 没有触发，但 onEnter 会触发，手动更新 sessionStorage 里的记录
                // const oldCurPath = window.sessionStorage.getItem('cur_path');
                // if (oldCurPath) {
                //     window.sessionStorage.setItem('pre_path', oldCurPath);
                //     window.sessionStorage.setItem('cur_path', nextState.location.pathname);
                // }
                // titleHandler(nextState.routes);
            },
            childRoutes:[
				{path: 'login', component: login},
				{path: 'search', component: search}
			],
        },
	];
	return (
        <BrowserRouter
		 	// history={hashHistory}
            routes={rootRoutes}
        />
    );
};

export default Route;
