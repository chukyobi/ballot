/**
 * POST /api/seed
 * Seeds the database with the default election, positions, and candidates.
 * Only runs if no elections exist yet — safe to call multiple times.
 */
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST() {
    try {
        const existing = await db.election.findFirst()
        if (existing) {
            return NextResponse.json({
                message: "Database already seeded.",
                electionId: existing.id,
            })
        }

        const election = await db.election.create({
            data: {
                title: "Student Union Government Election 2026",
                description:
                    "Annual election for the Student Union Government leadership positions. Cast your vote for the candidates of your choice.",
                status: "ACTIVE",
                startDate: new Date("2026-03-01"),
                endDate: new Date("2026-03-15"),

                accreditationFields: {
                    create: [
                        { label: "Full Name", type: "TEXT", required: true, placeholder: "Enter your full name", order: 1 },
                        { label: "Email Address", type: "EMAIL", required: true, placeholder: "Enter your email address", order: 2 },
                        { label: "National ID Number", type: "TEXT", required: true, placeholder: "Enter your national ID", order: 3 },
                        { label: "Date of Birth", type: "DATE", required: true, placeholder: "", order: 4 },
                        {
                            label: "State of Origin",
                            type: "SELECT",
                            required: true,
                            placeholder: "Select your state",
                            options: ["Lagos", "Abuja", "Kano", "Rivers", "Oyo", "Kaduna", "Enugu", "Delta", "Imo", "Anambra"],
                            order: 5,
                        },
                    ],
                },

                positions: {
                    create: [
                        {
                            title: "President",
                            description: "The President serves as the chief executive and representative of the student body.",
                            votingType: "SINGLE",
                            maxVotes: 1,
                            order: 1,
                            candidates: {
                                create: [
                                    { name: "Amara Okafor", party: "Progressive Alliance", bio: "A 400-level Law student passionate about student welfare and campus development. Has served as class representative for 3 years.", image: "/images/candidates/candidate-1.jpg", order: 1 },
                                    { name: "Kwame Mensah", party: "Unity Front", bio: "Engineering student and former sports director. Advocates for improved facilities and academic excellence.", image: "/images/candidates/candidate-2.jpg", order: 2 },
                                    { name: "Fatima Bello", party: "Reform Movement", bio: "Medical student with a vision for transparent governance and inclusive policies for all students.", image: "/images/candidates/candidate-3.jpg", order: 3 },
                                ],
                            },
                        },
                        {
                            title: "Vice President",
                            description: "The Vice President assists the President and presides over the Student Senate.",
                            votingType: "SINGLE",
                            maxVotes: 1,
                            order: 2,
                            candidates: {
                                create: [
                                    { name: "Chiamaka Eze", party: "Progressive Alliance", bio: "A dedicated 300-level Political Science student with leadership experience in community service.", image: "/images/candidates/candidate-4.jpg", order: 1 },
                                    { name: "Yusuf Ibrahim", party: "Unity Front", bio: "Computer Science student focused on digital transformation of student services and communication.", image: "/images/candidates/candidate-5.jpg", order: 2 },
                                ],
                            },
                        },
                        {
                            title: "General Secretary",
                            description: "The General Secretary manages all official communications and documentation.",
                            votingType: "SINGLE",
                            maxVotes: 1,
                            order: 3,
                            candidates: {
                                create: [
                                    { name: "Ngozi Adeyemi", party: "Progressive Alliance", bio: "Mass Communication student known for excellent organizational skills and attention to detail.", image: "/images/candidates/candidate-6.jpg", order: 1 },
                                    { name: "Emeka Chukwu", party: "Reform Movement", bio: "Business Administration student with experience in event coordination and public relations.", image: "/images/candidates/candidate-7.jpg", order: 2 },
                                ],
                            },
                        },
                        {
                            title: "Welfare Director",
                            description: "The Welfare Director oversees student welfare, health, and accommodation matters.",
                            votingType: "SINGLE",
                            maxVotes: 1,
                            order: 4,
                            candidates: {
                                create: [
                                    { name: "Aisha Mohammed", party: "Unity Front", bio: "Nursing student committed to improving healthcare access and mental health support on campus.", image: "/images/candidates/candidate-8.jpg", order: 1 },
                                    { name: "Oluwaseun Adeola", party: "Progressive Alliance", bio: "Social Work student dedicated to creating support systems for vulnerable students.", image: "/images/candidates/candidate-9.jpg", order: 2 },
                                    { name: "Chidi Nnamdi", party: "Reform Movement", bio: "Psychology student advocating for comprehensive wellness programs and student safety.", image: "/images/candidates/candidate-10.jpg", order: 3 },
                                ],
                            },
                        },
                    ],
                },
            },
        })

        return NextResponse.json({
            message: "Database seeded successfully.",
            electionId: election.id,
        })
    } catch (err) {
        console.error("[POST /api/seed]", err)
        return NextResponse.json({ error: "Seed failed." }, { status: 500 })
    }
}
