import {useQuery, type UseQueryResult} from "@tanstack/react-query";
import type {Job} from "../api/jobTypes.ts";
import {fetchJobs} from "../api/jobApi.ts";

export const useJobs = (
    dateFrom: Date,
    dateTo: Date
) : UseQueryResult<Job[]> => {
    return useQuery<Job[]>({
        queryKey: ["jobs", dateFrom, dateTo],
        queryFn: () => fetchJobs({dateFrom, dateTo}),
    });
};