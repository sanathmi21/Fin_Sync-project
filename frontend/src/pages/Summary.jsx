import React, { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import '../styles/Summary.css'; 

export default function Summary() {
  const [viewMode, setViewMode] = useState('monthly'); 
  const handleDownloadPDF = () => {
    alert(`Initiating download for ${viewMode} summary...`);
    console.log(`Downloading ${viewMode} summary...`);
  };

  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  return (
    <div className="summaryPageContainer">
      
      {/* WRAP THE TITLE AND CONTROLS IN A NEW CONTAINER */}
      <div className="summaryHeader"> 
        {/* Title Block */}
        <div className="summaryTitleBlock">
          <h1 className="summaryTitle">Summary</h1>
          <h3 className="summarySubtitle">Your Financial Overview</h3>
        </div>

        {/* Control Buttons Section (Moved inside summaryHeader) */}
        <div className="summaryControlsContainer">
          
          {/* Monthly/Yearly Toggle Buttons */}
          <div className="viewModeToggle">
            <button
              className={`toggleBtn ${viewMode === 'monthly' ? 'activeToggle' : ''}`}
              onClick={() => handleViewChange('monthly')}
            >
              Monthly
            </button>
            <button
              className={`toggleBtn ${viewMode === 'yearly' ? 'activeToggle' : ''}`}
              onClick={() => handleViewChange('yearly')}
            >
              Yearly
            </button>
          </div>

          {/* Download PDF Button */}
          <button 
            className="downloadPDFBtn" 
            onClick={handleDownloadPDF}
          >
            <FiDownload className="downloadIcon" /> Download PDF
          </button>
        </div>
      </div>
      
      {/* Content Area (Calendar or Chart) */}
      <div className="summaryContent">
        {viewMode === 'monthly' ? (
          <p>Monthly Calendar View (Placeholder)</p>
        ) : (
          <p>Yearly Chart View (Placeholder)</p>
        )}
      </div>
      
    </div>
  );
}