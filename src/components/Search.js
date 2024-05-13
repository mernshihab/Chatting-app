import React from "react";
import { FiSearch } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";

const Search = () => {
  return (
    <div className="relative">
      <input
        className="w-full rounded-3xl py-5 pl-16 shadow-xl border border-solid border-black border-opacity-5"
        type="text"
        placeholder="Search"
      />
      <FiSearch className="text-lg absolute top-[25px] left-[23px]" />
      <BsThreeDotsVertical className="text-lg text-primary absolute top-[25px] right-[23px]" />
    </div>
  );
};

export default Search;
