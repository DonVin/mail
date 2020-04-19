import axios from 'axios';

let baseURL; 
if(process.env.NODE_ENV === 'development'){
	console.warn('process.env.NODE_ENV',process.env.NODE_ENV);
  	baseURL = '//127.0.0.1:3000';
}else{
  	baseURL = '//62.171.183.92:8000';
}

export default class Request {
	axios(url, params, method = 'post'){
			return new Promise((resolve, reject) => {
			if(typeof params !== 'object') params = {};
			const headers = {
				'Content-Type': 'application/json',
				...params.headers || {}
			}
			axios.request({
				method,
				url,
				baseURL: baseURL,
				timeout: 30000,
				data: null,
				withCredentials: true, //是否携带cookies发起请求
				...params,
				headers,
			}).then(res => {
				resolve(typeof res.data === 'object' ? res.data : JSON.parse(res.data))
			},error => {
				if(error.response){
					reject(error.response.data)
				}else{
					reject(error)
				}
			})
		})
	}
}
