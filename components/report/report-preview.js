  
  const ReportPreview =  ({ onClose, onDownload }) => {
  const handleClose = (e) => {
    e.preventDefault();
    onClose();
  };

  const handleDownload = (e) => {
    e.preventDefault();
    if (onDownload) {
      onDownload();
    } else {
      alert("Download PDF");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative z-50 w-full max-w-md mx-4 overflow-hidden rounded-lg shadow-xl bg-white p-6 flex flex-col max-h-[90vh]">
        {/* Modal header with close button */}
        <div className="flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            &times;
          </button>
          <h1 className="mb-6 text-2xl font-bold text-center">
            Report Preview
          </h1>
        </div>
        
        {/* Scrollable content on modal preview */}
        <div className="overflow-y-auto text-center flex-grow">
          <div className="my-8 space-y-4 text-gray-700">
            <h2 className="mb-6 text-2xl font-bold text-center" >Client Info:</h2>
            <p>
             Lorem Ipsum is simply dummy text of the printing and typesetting industry.
             Lorem Ipsum has been the industry's standard dummy text ever since the 
             1500s, when an unknown printer took a galley of type and scrambled it 
             to make a type specimen book. It has survived not only five centuries.
            </p>
            <p>
             Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <h2 className="mb-6 text-2xl font-bold text-center" >Client contact Info:</h2>
            <p>
             Lorem Ipsum is simply dummy text of the printing and typesetting industry.
             Lorem Ipsum has been the industry's standard dummy text ever since the 
             1500s, when an unknown printer took a galley of type and scrambled it 
             to make a type specimen book. It has survived not only five centuries.
            </p>
            <p>
             Lorem Ipsum is simply dummy text of the printing and typesetting industry.
             Lorem Ipsum has been the industry's standard dummy text ever since the 
             1500s, when an unknown printer took a galley of type and scrambled it 
             to make a type specimen book. It has survived not only five centuries.
            </p>
            <p>
             Lorem Ipsum is simply dummy text of the printing and typesetting industry.
             Lorem Ipsum has been the industry's standard dummy text ever since the 
             1500s, when an unknown printer took a galley of type and scrambled it 
             to make a type specimen book. It has survived not only five centuries.
            </p>
            <p>
             Lorem Ipsum is simply dummy text of the printing and typesetting industry.
             Lorem Ipsum has been the industry's standard dummy text ever since the 
             1500s, when an unknown printer took a galley of type and scrambled it 
             to make a type specimen book. It has survived not only five centuries.
            </p>
          </div>
        </div>
        
        {/* Modal bottom with download button */}
        <div className="flex-shrink-0 flex justify-center mt-8">
          <button
            className="px-6 py-2 text-white transition rounded-lg bg-indigo-500 hover:bg-indigo-600"
            onClick={handleDownload}
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;


