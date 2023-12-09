import { ContestStanding } from "@/app/codeforcequery"

import { NextRequest } from "next/server";


export async function POST(req: NextRequest, { params }: { params: { id: string } }){
    // extract id from query parameter
    const { id } = params;
    const data = await ContestStanding(id)
    // const data = await addUser()
    console.log(data)
    return Response.json(data)
}