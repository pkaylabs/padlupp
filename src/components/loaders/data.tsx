import * as React from 'react';
import { RingLoader } from 'react-spinners';

const DataLoader = () => {
  return (
    <React.Fragment>
      <div className='h-full w-full justify-center items-center'>
        <RingLoader size={60} color={'#02733e'} />
      </div>
    </React.Fragment>
  );
};

export default DataLoader;
