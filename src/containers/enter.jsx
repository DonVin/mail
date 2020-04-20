import React from 'react';
import { Form, Input, Button, message} from 'antd';
import API from '../common/api';
import storage from '../common/utils/storage';
import './index.css'



export default class Enter extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
			username:'', 
			password:''
        };
	}
	
	toSearch = () => {
		const {username, password} = this.state;
		API.login({
			data: {
				username,
				password
				// username: "tm-de",
				// password: "archiv14"
			}
		}).then((res) => {
			console.warn('res',res);
			if(res.token) {
				storage.set('TOKEN', res.token);
				storage.set('MANAGER', res.manager);
				window.location.href= '/search';
			}
		}).catch(err => message.error(err.message))
	};

	onValuesChange = e => this.setState(e);

	render() {
		return (
			<div className="login-wrapper">
				<Form
					name="basic"
					onValuesChange={this.onValuesChange}
					>
					<Form.Item
						label="Username"
						name="username"
						rules={[{ required: true, message: 'Please input your username!' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label="Password"
						name="password"
						rules={[{ required: true, message: 'Please input your password!' }]}
					>
						<Input.Password />
					</Form.Item>

					<Form.Item>
						<Button type="primary" htmlType="submit" onClick={this.toSearch} style={{marginRight: '10px'}}>Login</Button>
						<Button type="primary" htmlType="submit">Reset</Button>
					</Form.Item>
					</Form>
			</div>

		);
	}
}