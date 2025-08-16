import { z } from "zod";

import {type GetAllJobsResponse, type Job, JobSchema} from "./jobTypes.ts";
import {jobApiClient} from "../../../lib/axios.ts";

interface fetchJobQuery {
    dateFrom: Date,
    dateTo: Date
}
export const fetchJobs =
    async (query: fetchJobQuery): Promise<Job[]> => {
    const response = await jobApiClient.get<GetAllJobsResponse>(
        "/jobs",
        {
            params: {
                dateFrom: query.dateFrom.toJSON(),
                dateTo: query.dateTo.toJSON()
            },
            paramsSerializer: (params) => {
                return new URLSearchParams(params).toString();
            }
        }
    );
    if(response.data.data == undefined){
        return []
    }

    return z.array(JobSchema).parse(response.data.data);
};
