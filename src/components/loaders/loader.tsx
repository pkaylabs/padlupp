import * as React from "react";
import RingLoader from "react-spinners/PuffLoader";

const DataLoader = () => {
  return (
    <React.Fragment>
      <RingLoader size={20} color={"#F04444"} />
    </React.Fragment>
  );
};

export default DataLoader;
