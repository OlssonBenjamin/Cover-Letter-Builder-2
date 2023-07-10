// pages/api/coverLetter.ts
import { Configuration, OpenAIApi } from "openai";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  const configuration = new Configuration({
    apiKey: apiKey,
  });

  const openai = new OpenAIApi(configuration);

  const { parsedPdfText, jobApplicationText, companyValues, companyMission } =
    req.body;

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).split('/').reverse().join('-');

  const question = `I need you to create a cover letter based on my cv text here (<linebreak> refers to a line break in text).If there are company values and mission statement separate them from the "hard skills/ technical skills" and add content related to interpersonal skills if there are experiences related to the values draw on that, fit everything on one page:
          - ${parsedPdfText}
          This is the job application:
          - Job application text: ${jobApplicationText}
          ${
            companyValues.length > 0
              ? "These are the company values: " + companyValues.join(", ")
              : ""
          }
          ${
            companyMission.length > 0
              ? "this is the company's mission: " + companyMission
              : ""
          }
           generate a cover letter for a document and return it in a array of objects thats parsable to JSON.parse(), dont include <br> in any of the content ,like this [{htmlTag: "h3/h4/p" , content:"tagContent"}, {element2} , {element3}] salutations and valediction need to be the same html tag as body contents. also include the position of application at the top. Requirements: dont use h1/h2 tags, dont use subheadings, dont include company address or personal address, dont include things I have to input,. 
           Always format the cover letter as follows:
           (beginning)
           Name: Your Name
           Email: [yourname@example.com]
           Phone: [123-456-7890]
           Date: ${formattedDate}
           Subject: [Job Title]
           Dear Hiring Manager,
           ...
           [Ending salution],
           Your Name
          (end)
          Text should all be the same size and information should not be repeated. the body of the letter must be divided only by paragraph and must not use headers
           Please avoid using headers for the above information. Ensure that salutations and valedictions have the same HTML tag as the body contents. Please include the position of the application at the top. The requirements are as follows: do not use h1/h2 tags, subheadings, or include company or personal addresses, use only paragraphs to divide the body.
           The application may mention certain skills, experience or background that are needed, but the cover letter can only include such skills if they are written verbatim in the CV. Under no circumstances should the cover letter contain misinformation or embellished information about any skills and knowledge, for example programming languages or technical background.
          `;
          try {
            const result = await openai.createChatCompletion({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content:
                    "you are a cover letter writer using the users cv to help write a nice coverletter to a job application. only use the available information of the cv but highight the relvant experience and skills, dont place any information that the user has to input themselves",
                },
                {
                  role: "user",
                  content: question,
                },
              ],
            });
        
            const data = result.data.choices[0].message?.content;
            res.status(200).json({ data });
          } catch (err: any) {
            console.error(err);
        
            if (err.status === 401) {
              // Unauthorized Error
              res
                .status(401)
                .json({ error: "Unauthorized. Please check your API key." });
            } else if (err.status === 429) {
              // Too Many Requests Error
              res.status(429).json({
                error: "Rate limit exceeded. Please slow down your requests.",
              });
            } else if (err.status === 502) {
              // Bad Gateway Error
              res
                .status(502)
                .json({ error: "Bad gateway. The API server or a proxy is down." });
            } else {
              // Generic Error Response
              res.status(500).json({ error: err.message || "An error occurred." });
            }
          }
        }

