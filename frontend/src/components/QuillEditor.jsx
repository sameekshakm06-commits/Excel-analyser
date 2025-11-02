import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const QuillEditor = ({ value, onChange, className }) => {
  return (
    <div className={className}>
      <ReactQuill
        value={value}
        onChange={onChange}
        theme="snow"
      />
    </div>
  );
};

export default QuillEditor;
