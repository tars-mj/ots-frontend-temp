import React from 'react';
import Button from './moleculs/Button';
import Router from 'next/router';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.log({ error, errorInfo });
  }

  refreshPage() {
    Router.push('/');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-primary-blue-500 h-screen flex overflow-hidde justify-center items-center">
          <div className="flex gap-4 flex-col">
            <h2 className="text-lg font-medium text-white mb-4">Oops, wystąpił jakiś problem!</h2>
            <div className="flex gap-4">
              <Button type="button" onClick={this.refreshPage} typeBtn="submit">
                Wróć
              </Button>
              <Button
                type="button"
                onClick={() => this.setState({ hasError: false })}
                typeBtn="isActive">
                Spróbować jeszcze raz?
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
