import {
  Battery,
  BookOpen,
  Calendar,
  ExternalLink,
  Fuel,
  Users,
  Wrench,
} from "lucide-react";

const electricGuides = [
  {
    title: "Daily",
    items: [
      "Charge batteries after every use.",
      "Visually inspect tires.",
    ],
  },
  {
    title: "Weekly",
    items: [
      "Check battery electrolyte levels (add distilled water after charging).",
      "Check tire pressure.",
    ],
  },
  {
    title: "Monthly",
    items: [
      "Clean battery terminals (baking soda/water).",
      "Inspect lights and mirrors.",
      "Lubricate steering grease fittings.",
    ],
  },
  {
    title: "Yearly",
    items: [
      "Professional brake inspection.",
      "Check suspension bushings.",
    ],
  },
];

const gasGuides = [
  {
    title: "Weekly",
    items: [
      "Check fuel gauge operation.",
      "Clean fuel cap area.",
      "Check tire pressure.",
    ],
  },
  {
    title: "Monthly",
    items: [
      "Check engine oil level.",
      "Inspect drive belts for fraying.",
      "Check lights and mirrors.",
    ],
  },
  {
    title: "6 Months",
    items: [
      "Change engine oil and oil filter.",
      "Inspect air intake.",
    ],
  },
  {
    title: "Yearly",
    items: [
      "Replace spark plugs and fuel filters.",
      "Check starter belt tension.",
      "Professional brake service.",
    ],
  },
];

const externalResources = [
  {
    category: "Official Owner's Manuals",
    icon: BookOpen,
    links: [
      {
        label: "Club Car Manuals",
        url: "https://www.clubcar.com/en-us/resources/owners-manuals",
      },
      {
        label: "E-Z-GO Manuals",
        url: "https://ezgo.txtsv.com/owners/owners-manuals",
      },
      {
        label: "Yamaha Owner's Manuals",
        url: "https://www.yamahagolfcars.com/owners-manuals/",
      },
    ],
  },
  {
    category: "Troubleshooting & Community",
    icon: Users,
    links: [
      { label: "Buggies Gone Wild Forum", url: "https://www.buggiesgonewild.com/" },
      {
        label: "Trojan Battery Maintenance Guide",
        url: "https://www.trojanbattery.com/tech-support/battery-maintenance/",
      },
      { label: "Golf Cart Garage Blog", url: "https://www.golfcartgarage.com/blog/" },
    ],
  },
  {
    category: "Trusted Parts Suppliers",
    icon: Wrench,
    links: [
      { label: "Buggies Unlimited", url: "https://www.buggiesunlimited.com/" },
      { label: "Golf Cart King", url: "https://www.golfcartking.com/" },
      { label: "Everything Carts", url: "https://www.everythingcarts.com/" },
    ],
  },
];

function MaintenanceSection({
  title,
  description,
  icon: Icon,
  theme,
  guides,
}: {
  title: string;
  description: string;
  icon: typeof Battery;
  theme: "blue" | "orange";
  guides: { title: string; items: string[] }[];
}) {
  const themeColor = theme === "blue" ? "text-blue-600" : "text-orange-600";

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm ${themeColor}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className={`text-xl font-semibold text-gray-900 ${themeColor}`}>
            {title}
          </h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {guides.map((guide) => (
          <div
            key={guide.title}
            className="flex h-full flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Calendar className={`h-5 w-5 ${themeColor}`} />
              <h3 className="text-base font-semibold text-gray-900">
                {guide.title}
              </h3>
            </div>
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
              {guide.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DocumentationPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Maintenance Best Practices
        </h1>
        <p className="text-sm text-gray-500">
          Keep your golf carts reliable with these quick reference checklists.
        </p>
      </div>

      <MaintenanceSection
        title="Electric Golf Cart"
        description="Battery-focused care to maximize runtime and component life."
        icon={Battery}
        theme="blue"
        guides={electricGuides}
      />

      <MaintenanceSection
        title="Gas Golf Cart"
        description="Fuel and engine essentials to keep combustion carts performing."
        icon={Fuel}
        theme="orange"
        guides={gasGuides}
      />

      <hr className="border-gray-200" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Resource Library</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {externalResources.map((resource) => (
            <div
              key={resource.category}
              className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <resource.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {resource.category}
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                {resource.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center justify-between gap-2 rounded-lg px-2 py-2 transition hover:bg-blue-50"
                    >
                      <span className="text-blue-700 group-hover:text-blue-800">{link.label}</span>
                      <ExternalLink className="h-4 w-4 text-blue-600 transition group-hover:text-blue-700" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
