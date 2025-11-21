import * as React from 'react';
import RingLoader from 'react-spinners/PuffLoader';

const CenterLoader = () => {
  return (
    <React.Fragment>
      <div className={'w-full h-full flex justify-center items-center'}>
        <RingLoader size={40} color={'#02733e'} />
      </div>
    </React.Fragment>
  );
};

export default CenterLoader;
