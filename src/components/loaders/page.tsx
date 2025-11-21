import * as React from "react";
import Skeleton from "@mui/material/Skeleton";

const DataLoader = () => {
  return (
    <React.Fragment>
      <div
        className="w-full h-full mt-2 mb-2 flex"
        // style={{ height: "70vh", width: "100%" }}
      >
        {/* For variant="text", adjust the height via font-size */}
        <div className="w-full flex justify-evenly">
          <Skeleton width={100} variant="text" sx={{ fontSize: "0.8rem" }} />
          <Skeleton width={100} variant="text" sx={{ fontSize: "0.8rem" }} />
          <Skeleton width={100} variant="text" sx={{ fontSize: "0.8rem" }} />
          <Skeleton width={100} variant="text" sx={{ fontSize: "0.8rem" }} />
          <Skeleton width={100} variant="text" sx={{ fontSize: "0.8rem" }} />
          <Skeleton width={100} variant="text" sx={{ fontSize: "0.8rem" }} />
        </div>

        <div className="flex pr-5 gap-x-1">
          {/* For other variants, adjust the size with `width` and `height` */}
          <Skeleton variant="circular" width={25} height={25} />
          <Skeleton variant="circular" width={25} height={25} />
          <Skeleton variant="circular" width={25} height={25} />
        </div>
      </div>
    </React.Fragment>
  );
};

export default DataLoader;
