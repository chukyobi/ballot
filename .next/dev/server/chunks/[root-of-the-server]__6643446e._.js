module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
/**
 * lib/db.ts
 * Global Prisma Client singleton — safe for Next.js dev hot-reload.
 * In production a single instance is created once.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$prisma$2b$client$40$5$2e$22$2e$0_prisma$40$5$2e$22$2e$0$2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const db = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$prisma$2b$client$40$5$2e$22$2e$0_prisma$40$5$2e$22$2e$0$2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: ("TURBOPACK compile-time truthy", 1) ? [
        "query",
        "error",
        "warn"
    ] : "TURBOPACK unreachable"
});
if ("TURBOPACK compile-time truthy", 1) {
    globalForPrisma.prisma = db;
}
}),
"[project]/app/api/seed/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
/**
 * POST /api/seed
 * Seeds the database with the default election, positions, and candidates.
 * Only runs if no elections exist yet — safe to call multiple times.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
async function POST() {
    try {
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].election.findFirst();
        if (existing) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: "Database already seeded.",
                electionId: existing.id
            });
        }
        const election = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].election.create({
            data: {
                title: "Student Union Government Election 2026",
                description: "Annual election for the Student Union Government leadership positions. Cast your vote for the candidates of your choice.",
                status: "ACTIVE",
                startDate: new Date("2026-03-01"),
                endDate: new Date("2026-03-15"),
                accreditationFields: {
                    create: [
                        {
                            label: "Full Name",
                            type: "TEXT",
                            required: true,
                            placeholder: "Enter your full name",
                            order: 1
                        },
                        {
                            label: "Email Address",
                            type: "EMAIL",
                            required: true,
                            placeholder: "Enter your email address",
                            order: 2
                        },
                        {
                            label: "National ID Number",
                            type: "TEXT",
                            required: true,
                            placeholder: "Enter your national ID",
                            order: 3
                        },
                        {
                            label: "Date of Birth",
                            type: "DATE",
                            required: true,
                            placeholder: "",
                            order: 4
                        },
                        {
                            label: "State of Origin",
                            type: "SELECT",
                            required: true,
                            placeholder: "Select your state",
                            options: [
                                "Lagos",
                                "Abuja",
                                "Kano",
                                "Rivers",
                                "Oyo",
                                "Kaduna",
                                "Enugu",
                                "Delta",
                                "Imo",
                                "Anambra"
                            ],
                            order: 5
                        }
                    ]
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
                                    {
                                        name: "Amara Okafor",
                                        party: "Progressive Alliance",
                                        bio: "A 400-level Law student passionate about student welfare and campus development. Has served as class representative for 3 years.",
                                        image: "/images/candidates/candidate-1.jpg",
                                        order: 1
                                    },
                                    {
                                        name: "Kwame Mensah",
                                        party: "Unity Front",
                                        bio: "Engineering student and former sports director. Advocates for improved facilities and academic excellence.",
                                        image: "/images/candidates/candidate-2.jpg",
                                        order: 2
                                    },
                                    {
                                        name: "Fatima Bello",
                                        party: "Reform Movement",
                                        bio: "Medical student with a vision for transparent governance and inclusive policies for all students.",
                                        image: "/images/candidates/candidate-3.jpg",
                                        order: 3
                                    }
                                ]
                            }
                        },
                        {
                            title: "Vice President",
                            description: "The Vice President assists the President and presides over the Student Senate.",
                            votingType: "SINGLE",
                            maxVotes: 1,
                            order: 2,
                            candidates: {
                                create: [
                                    {
                                        name: "Chiamaka Eze",
                                        party: "Progressive Alliance",
                                        bio: "A dedicated 300-level Political Science student with leadership experience in community service.",
                                        image: "/images/candidates/candidate-4.jpg",
                                        order: 1
                                    },
                                    {
                                        name: "Yusuf Ibrahim",
                                        party: "Unity Front",
                                        bio: "Computer Science student focused on digital transformation of student services and communication.",
                                        image: "/images/candidates/candidate-5.jpg",
                                        order: 2
                                    }
                                ]
                            }
                        },
                        {
                            title: "General Secretary",
                            description: "The General Secretary manages all official communications and documentation.",
                            votingType: "SINGLE",
                            maxVotes: 1,
                            order: 3,
                            candidates: {
                                create: [
                                    {
                                        name: "Ngozi Adeyemi",
                                        party: "Progressive Alliance",
                                        bio: "Mass Communication student known for excellent organizational skills and attention to detail.",
                                        image: "/images/candidates/candidate-6.jpg",
                                        order: 1
                                    },
                                    {
                                        name: "Emeka Chukwu",
                                        party: "Reform Movement",
                                        bio: "Business Administration student with experience in event coordination and public relations.",
                                        image: "/images/candidates/candidate-7.jpg",
                                        order: 2
                                    }
                                ]
                            }
                        },
                        {
                            title: "Welfare Director",
                            description: "The Welfare Director oversees student welfare, health, and accommodation matters.",
                            votingType: "SINGLE",
                            maxVotes: 1,
                            order: 4,
                            candidates: {
                                create: [
                                    {
                                        name: "Aisha Mohammed",
                                        party: "Unity Front",
                                        bio: "Nursing student committed to improving healthcare access and mental health support on campus.",
                                        image: "/images/candidates/candidate-8.jpg",
                                        order: 1
                                    },
                                    {
                                        name: "Oluwaseun Adeola",
                                        party: "Progressive Alliance",
                                        bio: "Social Work student dedicated to creating support systems for vulnerable students.",
                                        image: "/images/candidates/candidate-9.jpg",
                                        order: 2
                                    },
                                    {
                                        name: "Chidi Nnamdi",
                                        party: "Reform Movement",
                                        bio: "Psychology student advocating for comprehensive wellness programs and student safety.",
                                        image: "/images/candidates/candidate-10.jpg",
                                        order: 3
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Database seeded successfully.",
            electionId: election.id
        });
    } catch (err) {
        console.error("[POST /api/seed]", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Seed failed."
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6643446e._.js.map