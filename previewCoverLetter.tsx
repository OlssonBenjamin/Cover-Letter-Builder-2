import styles from "styles/component/coverLetter.module.scss";
import SubmitButton from "ui/buttons/submit";
import { useUser } from "contexts/userContext";
import React, { useRef, useEffect, useState } from "react";
import { useOpenAI } from "hooks/gptHooks";
import DownloadOptions from "./downloadOptions";

const PreviewCoverLetter = () => {
  const {
    apiResponse,
    parsedPdfText,
    jobApplicationText,
    companyValues,
    companyMissionStatement,
    setIsFetching,
  } = useUser();
  const { generateCoverLetter } = useOpenAI();

  const containerRef = useRef<HTMLDivElement>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const parseContent = (contentElement: {
    htmlTag: string;
    content: string;
  }): string => {
    const { htmlTag, content } = contentElement;
    return `<${htmlTag}>${content}</${htmlTag}>`;
  };

  const regenerateCoverLetter = () => {
    if (retryCount < maxRetries) {
      setIsFetching(true);
      generateCoverLetter(
        parsedPdfText,
        jobApplicationText,
        companyValues,
        companyMissionStatement
      );
      setRetryCount(retryCount + 1);
    } else {
      console.error("Maximum retries reached. Failed to regenerate cover letter.");
    }
  };

  useEffect(() => {
    if (containerRef.current && !apiResponse.error) {
      try {
        const coverLetter = JSON.parse(apiResponse);
        const parsedHTMLArray = coverLetter.map(parseContent);
        const combinedHTML = parsedHTMLArray.join("");
        containerRef.current.innerHTML = combinedHTML;
      } catch (error) {
        console.error("Error parsing cover letter JSON:", error);
        regenerateCoverLetter();
      }
    }
  }, [apiResponse]);

  if (apiResponse.error) {
    return (
      <div className={styles["preview__retry"]}>
        <p>{apiResponse.error}</p>
        <SubmitButton
          text="Retry"
          disabled={false}
          onClick={regenerateCoverLetter}
        />
      </div>
    );
  } else {
    return (
      <>
        <div className={styles["preview"]} ref={containerRef}></div>
        <div className={`${styles["preview__download"]}`}>
          <DownloadOptions text={apiResponse} textToCopy={containerRef} />
        </div>
      </>
    );
  }
};

export default PreviewCoverLetter;

