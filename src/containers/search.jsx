import React from 'react';
import storage from '../common/utils/storage';
import { List, message, Spin, Input, Upload, Button, Modal } from 'antd';
// import InfiniteScroll from 'react-infinite-scroller';
import API from '../common/api';

import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import VList from 'react-virtualized/dist/commonjs/List';
import InfiniteLoader from 'react-virtualized/dist/commonjs/InfiniteLoader';

import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

// const fakeDataUrl = 'https://randomuser.me/api/?results=5&inc=name,gender,email,nat&noinfo';

export default class Search extends React.Component {
	state = {
		data: [],
		skip: 0,
		take: 5,
		loading: false,
		hasMore: true,
		modalVisible: false,
		searchValue: '',
		curItem: {}
	};

	loadedRowsMap = {};

	componentDidMount() {
		console.warn('token', storage.get('TOKEN'));
		if(!storage.get('TOKEN')) {
			window.location.href= '/enter';
		}
	}

	// 邮件搜索
	onClickSearch = searchValue => {
		this.setState(
			{ searchValue },
			() => this.fetchData()
		);
		
	}

	// flush 功能，支持把 firebase 的数据同步到 elastic search 里面
	onClickFlush = () => {
		API.flush({
			headers: {
				Authorization: `Bearer ${storage.get('TOKEN')}`
			}
		}).then((res) => message.success(res.message|| 'Successfully')).catch(err => message.error(err.message || 'Failed'))
	}

	// 退出登录
	onClickLogout = () => {
		storage.remove('TOKEN');
		window.location.href= '/enter';
	}

	fetchData = callback => {
		const { searchValue, skip, take, data} = this.state
		API.search({
			data: {
				skip,
				take,
				query: searchValue,
			},
			headers: {
				Authorization: `Bearer ${storage.get('TOKEN')}`
			}
		}).then((res) => {
			console.warn('res',res);
			// callback(res)
			this.setState({
				skip: skip + 1,
				loading: false,
				data: data.concat(res),
			});
			if(res.length < take) {
				message.warning('Infinite List loaded all');
				this.setState({
					hasMore: false,
					loading: false,
				});
			}
		}).catch(err => message.error(err.message))
	};

	// 无限滚动加载
	handleInfiniteOnLoad = ({ startIndex, stopIndex }) => {
		this.setState({
			loading: true,
		});
		for (let i = startIndex; i <= stopIndex; i++) {
			this.loadedRowsMap[i] = 1;
		}
		this.fetchData();
	};

	isRowLoaded = ({ index }) => !!this.loadedRowsMap[index];

	renderItem = ({ index, key, style }) => {
		const { data } = this.state;
		const item = data[index];
		return (
			<List.Item key={item.id} onClick={item => this.showModal({name:item.name})}>
				<List.Item.Meta
					title={<a href={`mailto:${item.name}`}>{item.name}</a>}
					description={item.title}
				/>
					<div>{item.created_at}</div>
			</List.Item>
		);
	};

	handleOk = e => {
		this.setState({
			modalVisible: false,
		});
	};

	showModal = curItem => {
		console.warn('curItem',curItem);
		this.setState({ curItem }, () => {
			this.setState({
				modalVisible: true,
			});
		});
	};

	customRequest = (option)=> {
		const formData = new FormData();
		// const fileUrl = 'https://127.0.0.1:3000/upload';
		formData.append('file',option.file);

		API.upload({
			// data: formData,
			data:{file:'mails.zip'},
			headers: {
				Authorization: `Bearer ${storage.get('TOKEN')}`,
				'Content-Type': 'multipart/form-data',
			}
		}).then((res) => {
			let fileInfo = JSON.parse(res.responseText);
			if(res){
				this.setState({
					fileInfo:fileInfo,
					loading: false,
					uploading: false,
					defaultFile:false
				})
			}
		}).catch(err => message.error(err.message || 'Failed'))
		
		
	   }
	
	render() {
		// const fd = new window.FormData();
		// fd.append('token', token);
		// fd.append('file', this.file);
		const props = {
			name: 'file',
			multiple: true,
			headers: {
				Authorization: `Bearer ${storage.get('TOKEN')}`,
				'Content-Type': 'multipart/form-data',
			},
			data: file => {
				const fd = new window.FormData();
				fd.append('file', file);
				return {
					file: fd
				};
			},
			customRequest: this.customRequest,
			// action: 'https://127.0.0.1:3000/upload',
			beforeUpload(info) {
				console.warn('beforeUpload', info);
			},
			// onChange(info) {
			// 	console.warn('info', info);
			// 	const { status } = info.file;
			// 	if (status !== 'uploading') {
			// 		console.log(info.file, info.fileList);
			// 	}
			// 	if (status === 'done') {
			// 		message.success(`${info.file.name} file uploaded successfully.`);
			// 	} else if (status === 'error') {
			// 		message.error(`${info.file.name} file upload failed.`);
			// 	}
			// },
		};

		const { data } = this.state;
		const vlist = ({ height, isScrolling, onChildScroll, scrollTop, onRowsRendered, width }) => (
		<VList
			autoHeight
			height={height}
			isScrolling={isScrolling}
			onScroll={onChildScroll}
			overscanRowCount={2}
			rowCount={data.length}
			rowHeight={73}
			rowRenderer={this.renderItem}
			onRowsRendered={onRowsRendered}
			scrollTop={scrollTop}
			width={width}
		/>
		);
		const autoSize = ({ height, isScrolling, onChildScroll, scrollTop, onRowsRendered }) => (
		<AutoSizer disableHeight>
			{({ width }) =>
			vlist({
				height,
				isScrolling,
				onChildScroll,
				scrollTop,
				onRowsRendered,
				width,
			})
			}
		</AutoSizer>
		);
		const infiniteLoader = ({ height, isScrolling, onChildScroll, scrollTop }) => (
			<InfiniteLoader
				isRowLoaded={this.isRowLoaded}
				loadMoreRows={this.handleInfiniteOnLoad}
				rowCount={data.length}
			>
				{({ onRowsRendered }) =>
				autoSize({
					height,
					isScrolling,
					onChildScroll,
					scrollTop,
					onRowsRendered,
				})
				}
			</InfiniteLoader>
		);
		return (
			<div className="search-wrapper">
				<div className="buttons">
					<Button type="primary" onClick={this.onClickFlush}>Flush</Button>
					<Button style={{marginLeft: '10px', marginRight: '10px'}} onClick={this.onClickLogout}>Logout</Button>
				</div>
				<Input.Search
					className="search-input"
					placeholder="input search"
					enterButton="Search"
					size="large"
					onSearch={searchValue => this.onClickSearch(searchValue)}
				/>
				<Dragger className="dragger-box" {...props}>
					<p className="ant-upload-drag-icon">
					<InboxOutlined />
					</p>
					<p className="ant-upload-text">Click or drag file to this area to upload</p>
					<p className="ant-upload-hint">
						Support for a single or bulk upload. Strictly prohibit from uploading company data or other
						band files
					</p>
				</Dragger>
				<div className="search-list">
					<List>
						{data.length > 0 && <WindowScroller>{infiniteLoader}</WindowScroller>}
						{this.state.loading && <Spin className="demo-loading" />}
					</List>
				</div>
				<div>
					<Modal
						title={`Von: ${this.state.curItem?.name}`}
						visible={this.state.modalVisible}
						onOk={this.handleOk}
					>
						<p>{this.state.curItem?.content}</p>
					</Modal>
				</div>
			</div>
		);
	}
}

