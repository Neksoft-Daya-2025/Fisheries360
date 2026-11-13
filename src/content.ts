export const pageKeys = [
  "home",
  "platform",
  "cagenode",
  "solutions",
  "about",
  "contact",
] as const;
export type PageKey = (typeof pageKeys)[number];
export type Section = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  alt: string;
};
export type PageContent = {
  seoTitle: string;
  description: string;
  sections: Section[];
};
export type CollectionKey =
  "capabilities" | "useCases" | "stages" | "hardwareParts" | "implementation";
export type SiteContent = {
  googleSiteVerification?: string;
  menus: { label: string; href: string }[];
  pages: Record<PageKey, PageContent>;
  collections: Record<CollectionKey, string[][]>;
  links: {
    demoLabel: string;
    demoHref: string;
    platformLabel: string;
    platformHref: string;
  };
};
const section = (
  id: string,
  eyebrow: string,
  title: string,
  body: string,
  image = "",
  alt = "",
): Section => ({ id, eyebrow, title, body, image, alt });
export const initialContent: SiteContent = {
  collections: {
    capabilities: [],
    useCases: [],
    stages: [],
    hardwareParts: [],
    implementation: [],
  },
  links: {
    demoLabel: "Request a Demo",
    demoHref: "/contact",
    platformLabel: "Explore the Platform",
    platformHref: "/platform",
  },
  menus: [
    { label: "Home", href: "/" },
    { label: "Platform", href: "/platform" },
    { label: "CageNode", href: "/cagenode" },
    { label: "Solutions", href: "/solutions" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  pages: {
    home: {
      seoTitle: "Fisheries360 — Connected aquaculture & farm management",
      description:
        "Connect pond operations, proposed CageNode monitoring and fisheries business management. Connecting Aquaculture to Intelligence",
      sections: [
        section(
          "hero",
          "CONNECTED AQUACULTURE",
          "Your ponds. Your operations. One connected view.",
          "From the water to the balance sheet. Bring monitoring, everyday farm work and business decisions together with Fisheries360.",
          "",
          "",
        ),
        section(
          "ecosystem",
          "ONE CONNECTED ECOSYSTEM",
          "From a reading to a better-informed decision.",
          "Connect what is happening in the water with what needs to happen on the farm.",
        ),
        section(
          "hardware",
          "INTRODUCING CAGENODE",
          "A considered connection to the water.",
          "A proposed field monitoring node, designed around the realities of aquaculture. Explore the concept, one component at a time.",
        ),
        section(
          "capabilities",
          "THE BUSINESS OF AQUACULTURE",
          "Every pond. Every cycle. Every detail.",
          "The business management layer brings leases, production, costs and sales into one working picture.",
        ),
        section(
          "dashboard",
          "EXPLORE THE EXPERIENCE",
          "A clearer view, from wherever you work.",
          "Explore an illustrative interface across monitoring, farm operations and business performance.",
        ),
        section(
          "solutions",
          "BUILT AROUND YOUR WORK",
          "Different waters. Shared clarity.",
          "Practical workflows for the people growing an aquaculture business.",
        ),
        section(
          "implementation",
          "A PRACTICAL PATH FORWARD",
          "Configured for your operation.",
          "Start with your needs. Agree the device availability, configuration and integration scope for your engagement.",
        ),
        section(
          "about",
          "A product of Neksoft Consultancy Services B.V.",
          "Technology with the business in mind.",
          "Fisheries360 is a product of Neksoft Consultancy Services B.V., bringing practical digital tools to fisheries entrepreneurs and farm teams.",
        ),
        section(
          "contact",
          "LET’S TALK AQUACULTURE",
          "Your next chapter starts with a conversation.",
          "Tell us about your farm, your workflows and the decisions you want to make with greater clarity.",
        ),
      ],
    },
    platform: {
      seoTitle: "Fisheries360 Platform — From pond lease to profitability",
      description:
        "Manage pond leases, fish stock, feed, expenses, health, harvest, sales and payments in one fisheries business platform.",
      sections: [
        section(
          "hero",
          "THE FISHERIES360 PLATFORM",
          "Run the whole cycle. See the whole picture.",
          "Replace disconnected registers with connected records, from pond leasing and seed stocking to harvest, payment collection and profit.",
        ),
        section(
          "capabilities",
          "CONNECTED BUSINESS MANAGEMENT",
          "Built for the work between stocking and selling.",
          "Keep operational records and financial context together, pond by pond and production cycle by production cycle.",
        ),
        section(
          "dashboard",
          "PLATFORM WALKTHROUGH",
          "Move between the water, the work and the numbers.",
          "This interactive example shows how a connected workspace could look. All figures are illustrative; no live sensor is connected.",
        ),
        section(
          "records",
          "A PRACTICAL RECORD CHAIN",
          "One activity creates useful context for the next.",
          "Start with pond IDs and lease terms. Add seed, species and stocking details. Record feed, daily activities and health observations. Plan the harvest, record buyers and rates, then follow payments through to profitability.",
        ),
        section(
          "mobile",
          "MOBILE ACCESS & ALERTS",
          "Keep the farm in view when you’re away.",
          "Review active ponds, stock, expenses and pending payments on mobile. Lease expiry, feed reorder and harvest reminders help teams organise follow-through. Monitoring alerts depend on agreed sensors and integration.",
        ),
        section(
          "contact",
          "SEE YOUR WORKFLOW",
          "Let’s map your farm into Fisheries360.",
          "Bring your current registers and reporting needs. We’ll discuss a configuration around the way your team works.",
        ),
      ],
    },
    cagenode: {
      seoTitle: "CageNode — Proposed connected aquaculture monitoring",
      description:
        "Explore the Fisheries360 CageNode concept: enclosure, solar, antenna, mounting and sensor probe assembly. Configuration agreed per project.",
      sections: [
        section(
          "hero",
          "CAGENODE · HARDWARE CONCEPT",
          "Closer to the water. Connected to your decisions.",
          "CageNode is the proposed bridge between field sensors and Fisheries360. A configurable monitoring approach for operational visibility, observations and alerts.",
        ),
        section(
          "hardware",
          "EXPLORE THE ASSEMBLY",
          "Purpose in every component.",
          "Select a component to understand its intended role. This is a conceptual illustration, not a production specification.",
        ),
        section(
          "configuration",
          "CONFIGURATION, WITH CLARITY",
          "The right monitoring starts with the right questions.",
          "The reference concept depicts dissolved oxygen and temperature sensing, with pH, conductivity and depth as potential options. These are proposed capabilities. Sensor selection, power, communications, mounting and integration are confirmed during discovery.",
        ),
        section(
          "ecosystem",
          "BEYOND THE DEVICE",
          "Monitoring is useful when it reaches the workflow.",
          "Agree which measurements matter, how readings reach the platform and who follows up on an alert.",
        ),
        section(
          "scope",
          "BEFORE AN ENGAGEMENT",
          "Agree the detail before going into the field.",
          "Device availability and integration scope are agreed per engagement. No verified ingress rating, battery life, communications range, accuracy or certification is asserted. Connectivity and alert delivery depend on the chosen configuration and site conditions.",
        ),
        section(
          "contact",
          "DISCUSS YOUR SITE",
          "Let’s explore a monitoring configuration.",
          "Tell us about your water environment, existing instruments, power and connectivity. We’ll use that context to discuss the next step.",
        ),
      ],
    },
    solutions: {
      seoTitle: "Fisheries360 Solutions — Practical aquaculture workflows",
      description:
        "Discover workflows for pond operators, cage aquaculture teams, fisheries entrepreneurs and multi-location farm businesses.",
      sections: [
        section(
          "hero",
          "SOLUTIONS FOR YOUR OPERATION",
          "Built around the way you farm.",
          "Whether you manage one pond or coordinate several locations, connect the records and observations that inform your next decision.",
          "",
          "",
        ),
        section(
          "solutions",
          "FOUR WORKING PERSPECTIVES",
          "Start with the workflow that matters to you.",
          "Explore the business management workflows and proposed monitoring use cases separately, then bring them together where useful.",
        ),
        section(
          "implementation",
          "FROM DISCOVERY TO DAILY USE",
          "A practical rollout, with your team.",
          "We agree a scope around your records, people and reporting needs, including any device configuration or integrations.",
        ),
        section(
          "contact",
          "YOUR WORKFLOW, YOUR CONTEXT",
          "Tell us where the gaps are today.",
          "From lease renewals to buyer balances, let’s discuss what your operation needs to see more clearly.",
        ),
      ],
    },
    about: {
      seoTitle:
        "About Fisheries360 — A product of Neksoft Consultancy Services B.V.",
      description:
        "Fisheries360 by Neksoft Consultancy Services B.V. connects fisheries business management with a proposed IoT monitoring layer. Connecting Aquaculture to Intelligence",
      sections: [
        section(
          "hero",
          "Fisheries360 by Neksoft Consultancy Services B.V.",
          "Connecting Aquaculture to Intelligence",
          "Connected aquaculture. Intelligent farm management. Practical technology for the operational and business sides of fisheries.",
        ),
        section(
          "story",
          "THE IDEA BEHIND FISHERIES360",
          "Good records make better conversations possible.",
          "A fisheries business has many moving parts: lease terms, fish stock, feed, farm activities, harvests, buyers and collections. Fisheries360 brings those records into a connected business view, with a proposed IoT layer for field observations.",
        ),
        section(
          "neksoft",
          "OUR PRODUCT FAMILY",
          "A product of Neksoft Consultancy Services B.V.",
          "Fisheries360 is a product of Neksoft Consultancy Services B.V. The supplied company brochure describes practical digital platforms, implementation, training and support for growing operations. Learn more through the official company website.",
        ),
        section(
          "principles",
          "HOW WE APPROACH THE WORK",
          "Clarity in the product. Clarity in the engagement.",
          "Start with real workflows. Keep information usable for non-technical teams. Agree hardware and integration scope explicitly. Build from one operation toward a multi-location view.",
        ),
        section(
          "contact",
          "BUILD THE NEXT CHAPTER",
          "Let’s talk about your fisheries business.",
          "Share your operation’s priorities and explore where Fisheries360 could fit.",
        ),
      ],
    },
    contact: {
      seoTitle: "Request a Fisheries360 Demo — Contact the team",
      description:
        "Tell us about your fisheries operation and request a Fisheries360 demonstration. Discuss business management and proposed monitoring needs.",
      sections: [
        section(
          "hero",
          "REQUEST A DEMO",
          "Let’s put your operation in focus.",
          "Tell us what you manage today and what you want to connect. We’ll use your enquiry to discuss a relevant platform demonstration and project scope.",
        ),
        section(
          "contact",
          "START A CONVERSATION",
          "A little context goes a long way.",
          "Share your farm, location and requirements. Your enquiry is saved securely for the team to review.",
        ),
        section(
          "next",
          "WHAT HAPPENS NEXT",
          "A conversation grounded in your needs.",
          "We review your requirements, discuss the business workflows you need and identify any monitoring or integration questions. Device availability, implementation scope and commercial terms are agreed per engagement.",
        ),
      ],
    },
  },
};
export const capabilities = [
  [
    "Pond & lease management",
    "Pond IDs, locations, lease amounts, periods, documents and expiry reminders.",
  ],
  [
    "Fish stock & production",
    "Seed stocking, species, size, growth, survival and expected harvest records.",
  ],
  [
    "Feed & inventory",
    "Purchases, stock levels, feed usage, reorder reminders and cost per pond or batch.",
  ],
  ["Expenses", "Operating costs by category, pond and production cycle."],
  [
    "Farm activities",
    "Daily tasks, observations and team actions in a shared activity record.",
  ],
  [
    "Fish health records",
    "Health observations, treatments and mortality records for each cycle.",
  ],
  [
    "Harvest planning",
    "Plan harvest timing and record estimated yields and actual quantities.",
  ],
  [
    "Sales & buyers",
    "Buyer details, rates, quantities, invoices and dispatch records.",
  ],
  [
    "Payments & balances",
    "Received payments, collection history and outstanding buyer balances.",
  ],
  [
    "Profitability reporting",
    "Bring costs and sales together to review profit or loss per pond and cycle.",
  ],
  [
    "Mobile access & alerts",
    "Mobile overviews with lease, feed, harvest and payment reminders.",
  ],
];
export const useCases = [
  [
    "Pond operators",
    "From lease to daily log",
    "Keep lease dates, stocking details, feed usage and farm activities connected to each pond. Review health observations and plan the next harvest.",
    "Lease record → Stocking → Feed & health → Harvest",
  ],
  [
    "Cage aquaculture teams",
    "From observation to follow-up",
    "Explore a proposed CageNode configuration for site monitoring. Bring agreed readings and alerts into context alongside team observations and farm activities.",
    "Configured sensors → Visibility → Alert review → Team action",
  ],
  [
    "Fisheries entrepreneurs",
    "From sales to collections",
    "Record harvest quantities, buyers and sale rates. Follow invoices, payments and outstanding amounts, then review costs against sales for each cycle.",
    "Harvest → Buyer & sale → Collection → Profitability",
  ],
  [
    "Multi-location farm businesses",
    "From local records to oversight",
    "Organise pond and stock records across locations. Compare expenses and production cycles, review pending payments and coordinate teams with role-based access.",
    "Location records → Consolidated overview → Review → Follow-up",
  ],
];
export const stages = [
  [
    "Sensors",
    "Capture the measurements selected for your site. Sensor type and performance depend on the agreed configuration.",
  ],
  [
    "CageNode",
    "The proposed field node collects sensor information and provides a connection onward. Power and communication are configuration-dependent.",
  ],
  [
    "Connected Platform",
    "Bring agreed monitoring inputs alongside pond, stock and business records in Fisheries360.",
  ],
  [
    "Insights & Alerts",
    "Review trends and configured notifications in operational context. These examples are not live safety alerts.",
  ],
  [
    "Farm Operations",
    "Use observations and records to organise team follow-up, activities and business decisions.",
  ],
];
export const hardwareParts = [
  [
    "Enclosure",
    "A protective housing for the proposed electronics and connections. Materials, ingress protection and environmental suitability must be confirmed.",
  ],
  [
    "Solar panel",
    "The concept includes solar power as a proposed configuration. Panel capacity, storage and operating autonomy are site-dependent and unconfirmed.",
  ],
  [
    "Antenna",
    "The concept depicts a radio antenna. Communication technology, network path and coverage are agreed for the site; no range is guaranteed.",
  ],
  [
    "Mounting",
    "The reference suggests a clamp assembly for cage infrastructure. Mounting method and compatibility require a site assessment.",
  ],
  [
    "Sensor assembly",
    "The concept depicts dissolved oxygen and temperature probes; pH, conductivity and depth are potential optional inputs. All sensor capabilities remain subject to configuration.",
  ],
];
export const implementation = [
  ["Discovery", "Understand your farm, records, people and priorities."],
  ["Configuration", "Map ponds, workflows, access and reporting needs."],
  [
    "Integration",
    "Agree device availability, sensors and any data connections.",
  ],
  ["Training", "Help the team use records, dashboards and daily workflows."],
  ["Support", "Discuss ongoing assistance and a path for evolving needs."],
];
initialContent.collections = {
  capabilities,
  useCases,
  stages,
  hardwareParts,
  implementation,
};
for (const page of ["home", "cagenode"] as const) {
  initialContent.pages[page].sections[0].image = "/images/cagenode-diagram.svg";
  initialContent.pages[page].sections[0].alt =
    "CageNode concept diagram; proposed configuration, not a product photograph";
}
