import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { skill, location, type } = await req.json()

        const query = `${skill} ${type} in ${location}`
        const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&num_pages=1`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || 'a25cc1fdefmshe048a76534615c9p17b4e4jsn7d0a064392db',
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        })

        if (!response.ok) {
            throw new Error(`RapidAPI responded with ${response.status}`)
        }

        const data = await response.json()

        // Simplify the response
        const jobs = data.data?.map((job: any) => ({
            title: job.job_title,
            company: job.employer_name,
            location: `${job.job_city || ''} ${job.job_country || ''}`,
            type: job.job_employment_type,
            apply_url: job.job_apply_link
        })) || []

        return NextResponse.json({ jobs })
    } catch (error) {
        console.error('Career API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }
}
