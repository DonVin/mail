import React from 'react';
import storage from '../common/utils/storage';
import { List, message, Spin, Input, Upload, Button, Modal, Tabs} from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import { InboxOutlined, FileSearchOutlined, CloudUploadOutlined  } from '@ant-design/icons';
import API from '../common/api';
const { Dragger } = Upload;

export default class Handle extends React.Component {
	state = {
		data: [],
		skip: 0,
		take: 10,
		loading: false,
		hasMore: true,
		modalVisible: false,
		searchValue: '',
		manager: false,
		curItem: {},
		fileList: [],
		uploadLoading: false
	};

	// loadedRowsMap = {};

	componentDidMount() {
		if(!storage.get('TOKEN')) {
			window.location.href= '/enter';
		}
		
		this.setState({manager: storage.get('MANAGER')});
	}

	// 邮件搜索
	onClickSearch = searchValue => {
		this.setState(
			{ searchValue },
			() => this.fetchData(true)
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
		storage.clear();
		window.location.href= '/enter';
	}

	fetchData = isFirst => {
		let { searchValue, skip, take, data, loading } = this.state;
		if (loading) return;
		this.setState({
			loading: true,
		});
		isFirst && (skip = 0);
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
			if (res.length < take) {
				this.setState({
					hasMore: false,
				});
			}
			const mergeData = isFirst ? res : data.concat(res);
			this.setState({
				loading: false,
				skip: mergeData.length,
				data: mergeData,
			});
			
		}).catch(err => message.error(err.message))
	};

	// 无限滚动加载
	handleInfiniteOnLoad = ({ startIndex, stopIndex }) => {
		console.warn('startIndex, stopIndex', startIndex, stopIndex);
		for (let i = startIndex; i <= stopIndex; i++) {
			this.loadedRowsMap[i] = 1;
		}
		if ((stopIndex - startIndex + 1) >= this.state.take) {
			this.fetchData();
		}
	};

	handleInfiniteOnLoad = () => this.fetchData();

	handleOk = e => {
		this.setState({
			modalVisible: false,
		});
	};

	showModal = curItem => {
		this.setState({ curItem }, () => {
			this.setState({
				modalVisible: true,
			});
		});
	};

	customRequest = (option)=> {
		console.warn('option', option);
		const formData = new FormData();
		formData.append('file', option.file);

		API.upload({
			data: formData,
			headers: {
				Authorization: `Bearer ${storage.get('TOKEN')}`,
				'Content-Type': 'multipart/form-data',
			}
		}).then((res) => {
			message.success(res.message);
			option.onSuccess();
		}).catch(err => {
			message.error(err.message || 'Failed');
			option.onError();
		})
	}

	uploadFile = () => {
		const { fileList } = this.state;
		if (fileList.length > 1) return message.error('Only one file can be uploaded!');
		const formData = new FormData();
		formData.append('file', fileList[0]);
		this.setState({ uploadLoading: true });
		API.upload({
			data: formData,
			headers: {
				Authorization: `Bearer ${storage.get('TOKEN')}`,
				'Content-Type': 'multipart/form-data',
			}
		}).then((res) => {
			message.success(res.message);
			this.setState({
				fileList: [],
				uploadLoading: false
			})
		}).catch(err => {
			message.error(err.message || 'Failed');
			this.setState({
				uploadLoading: false
			})
		})
	}
	
	render() {
		const props = {
			name: 'file',
			multiple: true,
			headers: {
				Authorization: `Bearer ${storage.get('TOKEN')}`,
				'Content-Type': 'multipart/form-data',
			},
			onRemove: file => {
				const fileList = this.state.fileList;
				let index = -1;
				fileList.forEach((e, i) => {
					if(file.uid === e.uid) {
						index = i;
					}
				})
				index > -1 && fileList.splice(index, 1);
				this.setState({
					fileList
				})
				console.warn('after', fileList);
			},
			beforeUpload: (file) => {
				this.setState({
					fileList: [...this.state.fileList, file]
				})
				return false;
			},
		};

		const { manager, fileList, uploadLoading } = this.state;

		return (
			<div className="search-wrapper">
				<div className="buttons">
					{manager && (
						<Button type="primary" onClick={this.onClickFlush}>Flush</Button>
					)}
					<Button style={{marginLeft: '10px', marginRight: '10px'}} onClick={this.onClickLogout}>Logout</Button>
				</div>
				<Tabs defaultActiveKey="2">
					<Tabs.TabPane
						tab={
							<span>
								<FileSearchOutlined />
								Search
							</span>
						}
						key="1"
					>
						<Input.Search
							className="search-input"
							placeholder="input search"
							enterButton="Search"
							size="large"
							onSearch={searchValue => this.onClickSearch(searchValue)}
						/>
						
						<div className="search-list">
							<div className="list-infinite-container">
								<InfiniteScroll
									initialLoad={false}
									pageStart={0}
									loadMore={this.handleInfiniteOnLoad}
									hasMore={!this.state.loading && this.state.hasMore}
									useWindow={false}
								>
									<List
										dataSource={this.state.data}
										renderItem={(item,index) => (
											<List.Item key={index} onClick={() => this.showModal(item)} className="list-item">
												<List.Item.Meta
													style={{textAlign: 'left'}}
													title={<a href={`mailto:${item.from}`}>{item.from}</a>}
												/>
													<div className='list-content'>
														<div style={{ flex: 1, textAlign: 'left'}}>{item.title}</div>
														<div style={{width: '300px', textAlign: 'left'}}>{item.created_at}</div>
													</div>
											</List.Item>
										)}
									>
										{this.state.loading && this.state.hasMore && (
										<div className="list-loading-container">
											<Spin />
										</div>
										)}
									</List>
								</InfiniteScroll>
							</div>
						</div>
					</Tabs.TabPane>
					{
						manager && (
							<Tabs.TabPane
								tab={
									<span>
										<CloudUploadOutlined />
										Upload
									</span>
								}
								key="2"
							>
								<div>
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
									<Button loading={uploadLoading} style={{marginTop: '20px'}} disabled={!fileList.length} type="primary" onClick={this.uploadFile}>Click Upload</Button>
								</div>
							</Tabs.TabPane>
						)
					}
			</Tabs>
			<div>
				<Modal
					title={this.state.curItem?.from}
					visible={this.state.modalVisible}
					onCancel={this.handleOk}
					footer={null}
					width={800}
				>
					<pre>{this.state.curItem?.title}</pre>
					<pre>{this.state.curItem?.created_at}</pre>
					<pre>{this.state.curItem?.content}</pre>
				</Modal>
			</div>
			</div>
		);
	}
}

