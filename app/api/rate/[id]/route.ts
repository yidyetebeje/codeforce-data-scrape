import { ContestStanding } from "@/app/codeforcequery"
import next from "next";
import { revalidatePath } from "next/cache";

import { NextRequest } from "next/server";


export async function POST(req: NextRequest, { params }: { params: { id: string } }){
    // extract id from query parameter

    const { id } = params;
    const data = await ContestStanding(id)
    // const data = await addUser()
    revalidatePath(`/api/rate`)
    console.log(data)
    return Response.json(data)
}