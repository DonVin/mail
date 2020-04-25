import React from 'react';
import storage from '../common/utils/storage';
import { List, message, Spin, Input, Upload, Button, Modal } from 'antd';
// import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller';
// import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
// import VList from 'react-virtualized/dist/commonjs/List';
// import InfiniteLoader from 'react-virtualized/dist/commonjs/InfiniteLoader';
import InfiniteScroll from 'react-infinite-scroller';
import { InboxOutlined } from '@ant-design/icons';
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

	// isRowLoaded = ({ index }) => !!this.loadedRowsMap[index];

	// renderItem = ({ index, key, style }) => {
	// 	const { data } = this.state;
	// 	const item = data[index];
	// 	return (
	// 		<List.Item key={index} onClick={() => this.showModal(item)} className="list-item">
	// 			<List.Item.Meta
	// 				style={{marginLeft: '50px',textAlign: 'left'}}
	// 				title={<a href={`mailto:${item.from}`}>{item.from}</a>}
	// 			/>
	// 				<div className='list-content'>
	// 					<div style={{marginRight: '50px'}}>{item.title}</div>
	// 					<div>{item.created_at}</div>
	// 				</div>
	// 		</List.Item>
	// 	);
	// };

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
	
	render() {
		const props = {
			name: 'file',
			multiple: true,
			headers: {
				Authorization: `Bearer ${storage.get('TOKEN')}`,
				'Content-Type': 'multipart/form-data',
			},
			onChange: (info) => {
				console.warn('change' ,info);
			},
			beforeUpload(file, fileList) {
				console.log(file, fileList);
				return new Promise((resolve, reject) => {
					console.log('start check');
					setTimeout(() => {
						console.log('check finshed');
						reject(file);
					}, 3000);
				});
			},
			customRequest: this.customRequest,
		};

		const { data, manager } = this.state;
		// const vlist = ({ height, isScrolling, onChildScroll, scrollTop, onRowsRendered, width }) => (
		// 	<VList
		// 		autoHeight
		// 		height={height}
		// 		isScrolling={isScrolling}
		// 		onScroll={onChildScroll}
		// 		overscanRowCount={2}
		// 		rowCount={data.length}
		// 		rowHeight={73}
		// 		rowRenderer={this.renderItem}
		// 		onRowsRendered={onRowsRendered}
		// 		scrollTop={scrollTop}
		// 		width={width}
		// 	/>
		// );
		// const autoSize = ({ height, isScrolling, onChildScroll, scrollTop, onRowsRendered }) => (
		// 	<AutoSizer disableHeight>
		// 		{({ width }) =>
		// 			vlist({
		// 				height,
		// 				isScrolling,
		// 				onChildScroll,
		// 				scrollTop,
		// 				onRowsRendered,
		// 				width,
		// 			})
		// 		}
		// 	</AutoSizer>
		// );
		// const infiniteLoader = ({ height, isScrolling, onChildScroll, scrollTop }) => (
		// 	<InfiniteLoader
		// 		isRowLoaded={this.isRowLoaded}
		// 		loadMoreRows={this.handleInfiniteOnLoad}
		// 		rowCount={data.length}
		// 	>
		// 		{({ onRowsRendered }) =>
		// 			autoSize({
		// 				height,
		// 				isScrolling,
		// 				onChildScroll,
		// 				scrollTop,
		// 				onRowsRendered,
		// 			})
		// 		}
		// 	</InfiniteLoader>
		// );
		return (
			<div className="search-wrapper">
				<div className="buttons">
					{manager && (
						<Button type="primary" onClick={this.onClickFlush}>Flush</Button>
					)}
					<Button style={{marginLeft: '10px', marginRight: '10px'}} onClick={this.onClickLogout}>Logout</Button>
				</div>
				<Input.Search
					className="search-input"
					placeholder="input search"
					enterButton="Search"
					size="large"
					onSearch={searchValue => this.onClickSearch(searchValue)}
				/>
				{
					manager && (
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
					)
				}
				<div className="search-list">
					{/* <List>
						{data.length > 0 && <WindowScroller>{infiniteLoader}</WindowScroller>}
						{this.state.loading && <Spin className="demo-loading" />}
					</List> */}
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
												<div style={{ flex: 1}}>{item.title}</div>
												<div style={{width: '300px', textAlign: 'right'}}>{item.created_at}</div>
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
				<div>
					<Modal
						title={this.state.curItem?.from}
						visible={this.state.modalVisible}
						onCancel={this.handleOk}
						footer={null}
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

