import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { notification } from 'antd';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { getIntl, getLocale, history } from 'umi';
import type { RequestOptionsInit, ResponseError } from 'umi-request';
import ErrorBoundary from './components/ErrorBoundary';
import { OIDCBounder } from './components/OIDCBounder';
import { unCheckPermissionPaths } from './components/OIDCBounder/constant';
import OneSignalBounder from './components/OneSignalBounder';
import TechnicalSupportBounder from './components/TechnicalSupportBounder';
import NotAccessible from './pages/exception/403';
import NotFoundContent from './pages/exception/404';
import type { IInitialState } from './services/base/typing';
import './styles/global.less';
import { currentRole } from './utils/ip';

export const initialStateConfig = {
	loading: <></>,
};

export async function getInitialState(): Promise<IInitialState> {
	return {
		permissionLoading: true,
	};
}

const authHeaderInterceptor = (_url: string, _options: RequestOptionsInit) => ({});

export const request: RequestConfig = {
	errorHandler: (error: ResponseError) => {
		const { messages } = getIntl(getLocale());
		const { response } = error;

		if (response && response.status) {
			const { status, statusText, url } = response;
			const requestErrorMessage = messages['app.request.error'];
			const errorMessage = `${requestErrorMessage} ${status}: ${url}`;
			const errorDescription = messages[`app.request.${status}`] || statusText;

			notification.error({
				message: errorMessage,
				description: errorDescription,
			});
		}

		if (!response) {
			notification.error({
				description: 'Yêu cầu gặp lỗi',
				message: 'Bạn hãy thử lại sau',
			});
		}

		throw error;
	},
	requestInterceptors: [authHeaderInterceptor],
};

const ONE_SIGNAL_ALLOWED_ORIGIN = 'https://sinhvien.hvpnvn.edu.vn';

const canUseOneSignal = () => {
	if (typeof window === 'undefined') return false;
	return window.location.origin === ONE_SIGNAL_ALLOWED_ORIGIN;
};

const normalizeMenuData = (menuData: any[] = [], parentKey = 'menu'): any[] => {
	return menuData.reduce((result: any[], item: any, index: number) => {
		if (!item) return result;
		if (item.hideInMenu || item.redirect) return result;

		const rawChildren = Array.isArray(item.children) ? item.children : Array.isArray(item.routes) ? item.routes : [];

		const children = normalizeMenuData(rawChildren, `${parentKey}-${index}`);
		const key = item.path || item.name || `${parentKey}-${index}`;

		const nextItem: any = {
			...item,
			key,
		};

		if (children.length > 0) {
			nextItem.children = children;
		} else {
			delete nextItem.children;
		}

		result.push(nextItem);
		return result;
	}, []);
};

export const layout: RunTimeLayoutConfig = ({ initialState }) => {
	return {
		unAccessible: (
			<OIDCBounder>
				<TechnicalSupportBounder>
					<NotAccessible />
				</TechnicalSupportBounder>
			</OIDCBounder>
		),

		noFound: <NotFoundContent />,
		rightContentRender: () => <RightContent />,
		disableContentMargin: false,
		footerRender: () => <Footer />,

		onPageChange: () => {
			if (initialState?.currentUser) {
				const { location } = history;
				const isUncheckPath = unCheckPermissionPaths.some((path) => window.location.pathname.includes(path));

				if (location.pathname === '/') {
					history.replace('/dashboard');
				} else if (
					!isUncheckPath &&
					currentRole &&
					initialState?.authorizedPermissions?.length &&
					!initialState?.authorizedPermissions?.find((item) => item.rsname === currentRole)
				) {
					history.replace('/403');
				}
			}
		},

		menuDataRender: (menuData) => normalizeMenuData(menuData as any[]),

		childrenRender: (dom) => (
			<OIDCBounder>
				<ErrorBoundary>{canUseOneSignal() ? <OneSignalBounder>{dom}</OneSignalBounder> : dom}</ErrorBoundary>
			</OIDCBounder>
		),

		menuHeaderRender: undefined,
		...initialState?.settings,
	};
};
