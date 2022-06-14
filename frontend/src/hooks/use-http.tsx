import { useReducer, useCallback } from "react";

const START_LOADING = "START_LOADING";
const END_LOADING = "END_LOADING";
const ERROR = "ERROR";

export const COMMON_URL = "http://35.238.193.85:8080/api";

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case START_LOADING: {
      return { error: state.error, isLoading: true };
    }
    case END_LOADING: {
      return { error: state.error, isLoading: false };
    }
    case ERROR: {
      return { error: action.error, isLoading: false };
    }
    default: {
      return state;
    }
  }
};

const useHttp = () => {
  const [reqInfo, dispatch] = useReducer(reducer, {
    error: null,
    isLoading: false,
  });

  const sendHttpRequest = useCallback(
    async (requestConfig: {
      url: any;
      method?: any;
      headers?: any;
      body?: any;
      responseType?: string;
    }) => {
      dispatch({ type: ERROR, error: null });
      dispatch({ type: START_LOADING });
      try {
        const rawResponse = await fetch(requestConfig.url, {
          method: requestConfig.method ? requestConfig.method : "GET",
          headers: requestConfig.headers ? requestConfig.headers : {},
          body: requestConfig.body ? requestConfig.body : null,
        });

        if (!rawResponse.ok) {
          const content = await rawResponse.json();
          throw new Error(content.error);
        }
        let content;
        if (
          requestConfig.responseType &&
          requestConfig.responseType === "blob"
        ) {
          content = await rawResponse.blob();
        } else content = await rawResponse.json();

        dispatch({ type: END_LOADING });
        return content;
      } catch (error) {
        dispatch({ type: ERROR, error });
      }
    },
    []
  );

  return [reqInfo, sendHttpRequest];
};

export default useHttp;
