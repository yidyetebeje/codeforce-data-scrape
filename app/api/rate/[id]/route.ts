import { ContestStanding } from "@/app/codeforcequery"
import { NextApiRequest, NextApiResponse } from "next";


export async function POST(req: NextApiRequest, { params }: { params: { id: string } }){
    // extract id from query parameter
    const { id } = params;
    const data = await ContestStanding(id)
    // const data = await addUser()
    console.log(data)
    return Response.json(data)
}