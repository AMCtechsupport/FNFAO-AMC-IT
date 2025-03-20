import React from "react";

const LogModal = ({ log, onClose }) => {
  const formatDescription = (description) => {
    return description.split("\n").map((line, index) => (
      <div key={index} className="mb-2">
        {line}
      </div>
    ));
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-1/3 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Log Description</h2>
        <div className="space-y-2">{formatDescription(log.description)}</div>
        <button
          onClick={onClose}
          className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LogModal;
