import { Button, Result } from 'antd';
import React from 'react';
import Link from 'next/link';

function NotFound() {
  window.document.title = 'LuxeStay — Error';

  return (
    <div className='h-screen flex flex-col items-center justify-center'>
      <Result
        className='font-text-font font-medium'
        status='404'
        title='404 - Error Page!'
        subTitle='Sorry, the page you visited does not exist.'
        extra={(
          <Link href='/'>
            <Button
              type='primary'
              shape='round'
              size='large'
            >
              Back to Home
            </Button>
          </Link>
        )}
      />
    </div>
  );
}

export default NotFound;
