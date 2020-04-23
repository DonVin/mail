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
			}
		}).then((res) => {
			console.warn('res',res);
			if(res.token) {
				storage.set('TOKEN', res.token);
				storage.set('MANAGER', res.manager);
				window.location.href= '/handle';
			}
		}).catch(err => message.error(err.message))
	};

	onValuesChange = e => this.setState(e);

	onReset = () => this.setState({
		username:'', 
		password:''
	});

	render() {
		return (
			<div className="login-wrapper">
				<Form
					name="basic"
					onValuesChange={this.onValuesChange}
					>
					<div className="flex-layout">
						<span className='flex-span'>Username: </span>
						<Form.Item
							className="flex-form"
							name="username"
							rules={[{ required: true, message: 'Please input your username!' }]}
						>
							<Input />
						</Form.Item>
					</div>
					<div className="flex-layout">
						<span className='flex-span'>Password: </span>
						<Form.Item
							className="flex-form"
							name="password"
							rules={[{ required: true, message: 'Please input your password!' }]}
						>
							<Input.Password />
						</Form.Item>
					</div>

					<Form.Item>
						<Button type="primary" htmlType="submit" onClick={this.toSearch}>Login</Button>
						{/* <Button type="primary" htmlType="submit" style={{marginLeft: '10px'}} onClick={this.onReset} >Reset</Button> */}
					</Form.Item>
					</Form>
			</div>

		);
	}
}