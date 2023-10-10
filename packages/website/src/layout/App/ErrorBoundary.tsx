/* eslint-disable react/prefer-stateless-function */
import React, { Component, PropsWithChildren } from 'react';
import ErrorPage from 'common/ErrorPage';

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<
  PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError = () => {
    return { hasError: true };
  };

  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    return hasError ? <ErrorPage /> : children;
  }
}

export default ErrorBoundary;
