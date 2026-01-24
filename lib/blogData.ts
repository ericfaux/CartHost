export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  readTime: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The 'Free Amenity' Trap: Why Golf Carts Are The #1 Liability Risk",
    slug: "airbnb-golf-cart-liability-story",
    excerpt:
      "Adding a golf cart boosts bookings, but it creates a massive liability gap. Learn why paper waivers fail and how to protect your rental business.",
    date: "2026-01-24",
    readTime: "4 min read",
    content: `
      <p><em>"Golf Cart Included."</em></p>

      <p>It is one of the most profitable filters an Airbnb host can check. In beach towns and large resorts, adding a golf cart can increase your nightly rate by $50 to $100 and boost your occupancy significantly.</p>

      <p>But for many hosts, that "value-add" is actually a ticking time bomb.</p>

      <p>As software providers for fleet managers, we have analyzed the operational side of short-term rentals. We have seen a disturbing pattern: hosts treating a 1,000-pound motorized vehicle like it's a pool floatie. They leave the keys on the counter, assume their homeowner's insurance covers it, and hope for the best.</p>

      <p>Here is why that strategy is failing—and how to protect yourself without removing the amenity.</p>

      <h2>The "He Said, She Said" Nightmare</h2>

      <p>Imagine this scenario: You get a text from your guest at 11:00 PM.</p>

      <p><em>"Hey, the golf cart steering is acting funny. We hit a curb because it wouldn't turn. It's pretty scratched up."</em></p>

      <p>You rush over the next morning. The front axle is bent. The repair bill is going to be $1,200. You open a claim with Airbnb AirCover or charge the guest's deposit.</p>

      <p>The guest disputes it immediately: <em>"The cart was already damaged when we got here. The steering was loose from the start. This is a maintenance issue, not our fault."</em></p>

      <p>Without proof, you are stuck. You have no timestamped photo of the axle from before their check-in. You have no maintenance log proving the steering was inspected last week. Airbnb sides with the guest. You pay the $1,200.</p>

      <h2>The Problem with Paper Waivers</h2>

      <p>Most responsible hosts try to mitigate this with a liability waiver. They download a generic PDF, print it out, and leave it on the kitchen counter for the guest to sign.</p>

      <p>Here is the reality of paper waivers in 2026:</p>

      <p><strong>They get lost.</strong> Cleaning crews accidentally throw them away, or guests spill coffee on them.</p>

      <p><strong>They are easily disputed.</strong> A guest can claim, "I didn't sign that," or "I signed it, but I didn't know the cart had bad brakes."</p>

      <p><strong>They are disconnected from reality.</strong> A piece of paper cannot store a photo of the vehicle's condition at the exact moment of handoff.</p>

      <h2>The Solution: The "Digital Handshake"</h2>

      <p>The only way to win a dispute—and more importantly, prevent accidents—is to force the guest to acknowledge the condition of the cart before the wheels turn.</p>

      <p>This is why we built CartHost.</p>

      <p>We created a system that doesn't just ask for a signature; it creates a Forensic Timestamp.</p>

      <p><strong>Step 1:</strong> The guest scans a QR code on the steering wheel.</p>

      <p><strong>Step 2:</strong> They sign the legal waiver on their phone (verifying their identity).</p>

      <p><strong>Step 3:</strong> The app prompts them to take 4 photos of the cart.</p>

      <p>If there is a scratch on the bumper, they must photograph it now to protect themselves. If they don't, they own it.</p>

      <p>This psychology changes everything. When a guest knows the vehicle has been photographed and their ID is attached to the rental, they drive differently. They treat the asset with respect.</p>

      <h2>Don't Leave It to Chance</h2>

      <p>You don't need to stop offering golf carts. You just need to stop treating them like toys. Treat them like a rental car company would.</p>

      <p>If you aren't ready to automate your fleet yet, at least get the legal paperwork right.</p>

      <p><a href="https://www.carthost.app/tools/waiver-generator">Download our Free Golf Cart Liability Waiver Template (2026 Edition)</a></p>

      <p>It covers the basics of collision and injury liability. But remember: a waiver is only as good as the evidence backing it up.</p>
    `,
  },
  {
    id: "2",
    title: "The Ultimate Guide to Insuring Golf Carts for Short-Term Rentals",
    slug: "golf-cart-rental-insurance-guide",
    excerpt:
      "Standard homeowner's policies don't cover golf carts. AirCover excludes motorized vehicles. Here's what insurance you actually need and how to get it.",
    date: "2026-01-10",
    readTime: "12 min read",
    content: `
      <p>If you're providing a golf cart to your Airbnb or VRBO guests, you're likely underinsured. Most hosts discover this the hard way—after an incident forces them to file a claim that gets denied.</p>

      <p>This guide breaks down exactly what insurance you need, what it costs, and how to get it.</p>

      <h2>Why Standard Insurance Doesn't Work</h2>

      <h3>Homeowner's Insurance</h3>

      <p>Most homeowner's policies explicitly exclude motorized vehicles from liability coverage. Golf carts, ATVs, and similar equipment are typically carved out in the policy language. Even if your golf cart never leaves your property, it's probably not covered.</p>

      <h3>Airbnb AirCover</h3>

      <p>Airbnb's AirCover program provides up to $3 million in liability protection for hosts—but not for motorized vehicles. The terms explicitly exclude "motor vehicles, aircraft, and watercraft."</p>

      <h3>VRBO Liability Insurance</h3>

      <p>Similarly, VRBO's liability protection excludes incidents involving motorized vehicles. The policy language is clear: golf carts are not covered.</p>

      <h2>Insurance Options for Golf Cart Owners</h2>

      <h3>Option 1: Golf Cart-Specific Policy</h3>

      <p>Several insurers offer standalone golf cart policies. These typically provide:</p>

      <ul>
        <li>Liability coverage: $100,000 to $300,000</li>
        <li>Property damage coverage for the cart itself</li>
        <li>Medical payments coverage</li>
        <li>Uninsured motorist coverage (if your cart is street-legal)</li>
      </ul>

      <p><strong>Cost:</strong> $75-200 per year for recreational use. Commercial or rental use policies cost more—typically $300-600 per year.</p>

      <h3>Option 2: Commercial General Liability (CGL)</h3>

      <p>If you operate multiple properties or have several carts, a CGL policy may make more sense. These policies cover your business operations broadly, including equipment you provide to guests.</p>

      <p><strong>Cost:</strong> $500-2,000 per year depending on coverage limits and number of properties.</p>

      <h3>Option 3: Umbrella Policy</h3>

      <p>An umbrella policy provides additional liability coverage above your primary policies. However, you'll still need underlying golf cart coverage for the umbrella to apply.</p>

      <h2>What to Look for in a Policy</h2>

      <p>When shopping for golf cart insurance, ensure the policy covers:</p>

      <ul>
        <li><strong>Rental or commercial use:</strong> Recreational policies may not cover guests</li>
        <li><strong>Multiple operators:</strong> The policy should cover any authorized driver</li>
        <li><strong>Property damage:</strong> Both to the cart and to third-party property</li>
        <li><strong>Medical payments:</strong> For injuries to operators and passengers</li>
      </ul>

      <h2>Recommended Insurers</h2>

      <p>Based on our research, these insurers offer golf cart policies suitable for short-term rental use:</p>

      <ul>
        <li>Progressive</li>
        <li>State Farm</li>
        <li>Foremost Insurance Group</li>
        <li>National General</li>
      </ul>

      <p>Contact each for quotes and ensure you disclose that the cart will be used by vacation rental guests.</p>

      <h2>Insurance Is Just Part of the Solution</h2>

      <p>Even with proper insurance, you should still implement liability waivers, photo documentation, and driver verification. Insurance helps cover costs after an incident—waivers and documentation help prevent incidents and protect you in litigation.</p>
    `,
  },
  {
    id: "3",
    title: "Printable Golf Cart Maintenance Log vs. Digital Logs",
    slug: "golf-cart-maintenance-log-guide",
    excerpt:
      "Should you track golf cart maintenance with paper or software? We compare both approaches and explain when each makes sense for vacation rental hosts.",
    date: "2026-01-05",
    readTime: "6 min read",
    content: `
      <p>Regular maintenance keeps your golf cart safe and reliable for guests. But how should you track that maintenance? The answer depends on how many carts you manage and how serious you are about documentation.</p>

      <h2>The Case for Paper Logs</h2>

      <p>A printable golf cart maintenance log is simple, free, and requires no technical setup. You can keep it in a binder at your property or with your cart's documentation.</p>

      <h3>Advantages of Paper Logs</h3>

      <ul>
        <li><strong>No cost:</strong> Print and go</li>
        <li><strong>No learning curve:</strong> Anyone can fill in a form</li>
        <li><strong>Physical record:</strong> Tangible documentation for inspections</li>
        <li><strong>No internet required:</strong> Works anywhere</li>
      </ul>

      <h3>Disadvantages of Paper Logs</h3>

      <ul>
        <li><strong>Can be lost or damaged:</strong> Water, fire, and misplacement happen</li>
        <li><strong>Hard to search:</strong> Finding specific records takes time</li>
        <li><strong>No reminders:</strong> You have to remember to check it</li>
        <li><strong>No photo support:</strong> Can't attach images to entries</li>
        <li><strong>Single location:</strong> Only accessible where the paper is stored</li>
      </ul>

      <h2>The Case for Digital Logs</h2>

      <p>Digital maintenance tracking offers automation, accessibility, and integration with other systems. For hosts with multiple carts or properties, the benefits often outweigh the costs.</p>

      <h3>Advantages of Digital Logs</h3>

      <ul>
        <li><strong>Cloud storage:</strong> Access from anywhere, never lose records</li>
        <li><strong>Automatic reminders:</strong> Get notified when maintenance is due</li>
        <li><strong>Photo attachments:</strong> Document condition with images</li>
        <li><strong>Searchable history:</strong> Find any record instantly</li>
        <li><strong>Reporting:</strong> See trends and costs over time</li>
        <li><strong>Integration:</strong> Connect with guest check-in workflows</li>
      </ul>

      <h3>Disadvantages of Digital Logs</h3>

      <ul>
        <li><strong>Cost:</strong> Most solutions require a subscription</li>
        <li><strong>Learning curve:</strong> Takes time to set up and learn</li>
        <li><strong>Internet required:</strong> Need connectivity to access</li>
      </ul>

      <h2>When to Use Each Approach</h2>

      <h3>Paper Makes Sense When:</h3>

      <ul>
        <li>You have one cart at one property</li>
        <li>You perform maintenance yourself</li>
        <li>You're not concerned about long-term record keeping</li>
        <li>Budget is a primary concern</li>
      </ul>

      <h3>Digital Makes Sense When:</h3>

      <ul>
        <li>You manage multiple carts or properties</li>
        <li>You want maintenance reminders</li>
        <li>You need to prove maintenance history (for liability or resale)</li>
        <li>You want to integrate with guest check-in workflows</li>
      </ul>

      <h2>Our Recommendation</h2>

      <p>For most vacation rental hosts with golf carts, we recommend starting with a simple digital solution. The benefits of automatic reminders and cloud storage outweigh the modest cost. And if you ever face a liability claim, having timestamped, searchable maintenance records could be invaluable.</p>

      <p>CartHost includes maintenance tracking as part of its golf cart management platform, along with guest waivers and inspection photos. It's designed specifically for vacation rental hosts who want to protect themselves while providing a great guest experience.</p>
    `,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
