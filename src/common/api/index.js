import Request from './request';

class API extends Request {
	/**
	 *  登录
	 *  @return {promise}
	 */
	async login(params = {}) {
		try {
			let result = await this.axios('/login', params);
			if (result?.message) {
				throw result.message;
			} else {
				return result;
			}
		} catch (err) {
			throw err;
		}
	}

	async flush(params = {}) {
		try {
			let result = await this.axios('/flush', params, 'get');
			return result;
		} catch (err) {
			throw err;
		}
	}
	/**
	 *  刷新 token
	 *  @return {promise}
	 */
	async refresh(params = {}) {
		try {
			let result = await this.axios('/refresh', params);
			if (result?.message) {
				throw result.message;
			} else {
				return result;
			}
		} catch (err) {
			throw err;
		}
	}
	/**
	 *  上传 zip 文件
	 *  @return {promise}
	 */
	async upload(params = {}) {
		try {
			let result = await this.axios('/upload', params);
			return result;
		} catch (err) {
			throw err;
		}
	}
	/**
	 *  查询邮件
	 *  @return {promise}
	 */
	async search(params = {}) {
		try {
			let result = await this.axios('/search', params);
			if (result?.message) {
				throw result.message;
			} else {
				return result;
			}
		} catch (err) {
			throw err;
		}
	}
}

export default new API();