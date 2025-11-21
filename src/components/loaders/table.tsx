/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";


const paginatedCorporates = [1, 2, 3, 4, 5, 6];

export default function TableLoader({header}: {header: string[]}) {
  return (
    <div className="font-inter border border-gray-200 rounded-xl overflow-hidden shadow mobile:w-full">
      <table className="font-inter min-w-full mobile:w-full mobile:min-w-[unset] divide-y divide-gray-200 table-fixed">
        <thead className="w-full">
          <tr className="bg-[#F9FAFB] w-full">
            {header.map((head, index) => (
              <th
                key={index}
                scope="col"
                className="py-3.5 px-4 text-left text-xs/5 font-bold text-[#9B9B9B]"
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {paginatedCorporates?.map((corporate: any, index: number) => (
            <tr
              key={index}
              className={`cursor-pointer ${
                index % 2 == 1 ? "bg-[#F9FAFB]" : "bg-white"
              }`}
            >
              <td className="whitespace-nowrap px-4 py-3 text-xs">
                <div className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden"></div>
                  <div>
                    <p className="w-full truncate text-[#323232]">
                      <div className="h-4 w-40 bg-slate-200 rounded"></div>
                      <div className="h-2.5 w-40 bg-slate-200 rounded mt-2"></div>
                    </p>
                  </div>
                </div>
              </td>

              <td className="whitespace-nowrap px-4 py-3 text-xs">
                <div className="animate-pulse flex flex-col gap-1 w-[16rem]">
                  <p className="w-full truncate max-w-[90%] text-[#323232]">
                    <div className="h-5 bg-slate-200 rounded"></div>
                  </p>
                </div>
              </td>

              <td className="whitespace-nowrap py-3 pl-4 pr-3 text-xs">
                <div className="animate-pulse flex flex-col gap-1 w-[16rem]">
                  <p className="w-full truncate max-w-[90%] text-[#323232]">
                    <div className="h-5 bg-slate-200 rounded"></div>
                  </p>
                </div>
              </td>

              <td className="whitespace-nowrap py-3 pl-4 pr-3 text-xs">
                <div className="animate-pulse flex flex-col gap-1 w-[6rem]">
                  <p className="w-full truncate max-w-[90%] text-[#323232]">
                    <div className="h-5 bg-slate-200 rounded"></div>
                  </p>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
