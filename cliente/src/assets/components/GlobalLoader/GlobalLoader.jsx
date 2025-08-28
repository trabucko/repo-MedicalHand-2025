// src/assets/components/GlobalLoader.jsx
import React from "react";
import styled from "styled-components";
import { useLoading } from "../../context/LoadingContext.jsx"; // Import the hook

const Loader = () => {
  const { isLoading } = useLoading(); // Get the global loading state

  if (!isLoading) {
    return null; // Don't render anything if not loading
  }

  // Your existing JSX for the loader goes here
  return (
    <StyledWrapper>
      <div className="loading">
        <svg width="64px" height="48px">
          <polyline
            points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
            id="back"
          />
          <polyline
            points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
            id="front"
          />
        </svg>
      </div>
    </StyledWrapper>
  );
};
const StyledWrapper = styled.div`
  /* Full-screen overlay styles */
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(
    255,
    255,
    255,
    0.8
  ); /* Semi-transparent white overlay */
  z-index: 9999; /* Ensure it's on top of all content */

  /* Your existing loader styles */
  .loading svg polyline {
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .loading svg polyline#back {
    fill: none;
    stroke: #4d8bff33;
  }

  .loading svg polyline#front {
    fill: none;
    stroke: #014ad2ff;
    stroke-dasharray: 48, 144;
    stroke-dashoffset: 192;
    animation: dash_682 1.4s linear infinite;
  }

  @keyframes dash_682 {
    72.5% {
      opacity: 0;
    }

    to {
      stroke-dashoffset: 0;
    }
  }
`;

export default Loader;
