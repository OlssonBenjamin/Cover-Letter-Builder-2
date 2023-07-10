// utils/useOpenAI.tsx
import { useState } from "react";
import axios from "axios";
import { useUser } from "contexts/userContext";

export const useOpenAI = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const { setApiResponse, setIsFetching } = useUser();

  const generateCoverLetter = async (
    parsedPdfText: string,
    jobApplicationText: string,
    companyValues: string[],
    companyMission: string,
  ) => {
    try {
      const response = await axios.post("/api/gptApi", {
        parsedPdfText,
        jobApplicationText,
        companyValues,
        companyMission,
        temperature: 0.0,
      });

      setData(response.data.data);
      setApiResponse(response.data.data);
      setIsFetching(false);
    } catch (err: any) {
      const errorMessage = err.message;
      setError(errorMessage);
      setApiResponse({ error: errorMessage }); // set error message in apiResponse
      setIsFetching(false);
    }
  };

  return { data, error, generateCoverLetter };
};
