import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { notification } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';

dayjs.locale('vi');
import { getIntl, getLocale, history } from 'umi';
import type { RequestOptionsInit, ResponseError } from 'umi-request';
import ErrorBoundary from './components/ErrorBoundary';
// import LoadingPage from './components/Loading';
import { OIDCBounder } from './components/OIDCBounder';
import { unCheckPermissionPaths } from './components/OIDCBounder/constant';
import OneSignalBounder from './components/OneSignalBounder';
import TechnicalSupportBounder from './components/TechnicalSupportBounder';
import NotAccessible from './pages/exception/403';
import NotFoundContent from './pages/exception/404';
import type { IInitialState } from './services/base/typing';
import './styles/global.less';
import { currentRole } from './utils/ip';

/** loading */
export const initialStateConfig = {
  loading: <></>,
};

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-initial-state
 */
export async function getInitialState(): Promise<IInitialState> {
  return {
    permissionLoading: true,
  } as IInitialState;
}

const authHeaderInterceptor = (url: string, options: RequestOptionsInit) => {
  return {
    url,
    options: {
      ...options,
      headers: {
        ...(options.headers || {}),
      },
    },
  };
};

/**
 * @see https://beta-pro.ant.design/docs/request-cn
 */
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
        message: 'Bạn hãy thử lại sau',
        description: 'Yêu cầu gặp lỗi',
      });
    }

    throw error;
  },
  requestInterceptors: [authHeaderInterceptor],
};

// ProLayout: https://procomponents.ant.design/components/layout
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
        const isUncheckPath = unCheckPermissionPaths.some((path) =>
          window.location.pathname.includes(path),
        );

        if (location.pathname === '/') {
          history.replace('/dashboard');
        } else if (
          !isUncheckPath &&
          currentRole &&
          initialState?.authorizedPermissions?.length &&
          !initialState.authorizedPermissions.find(
            (item: any) => item.rsname === currentRole,
          )
        ) {
          history.replace('/403');
        }
      }
    },

    menuItemRender: (item: any, dom: any) => (
      <a
        className="not-underline"
        key={item?.path}
        href={item?.path}
        onClick={(e) => {
          e.preventDefault();
          history.push(item?.path || '/');
        }}
        style={{ display: 'block' }}
      >
        {dom}
      </a>
    ),

    childrenRender: (dom) => (
      <OIDCBounder>
        <ErrorBoundary>
          <OneSignalBounder>{dom}</OneSignalBounder>
        </ErrorBoundary>
      </OIDCBounder>
    ),

    menuHeaderRender: undefined,
    ...initialState?.settings,
  };
};